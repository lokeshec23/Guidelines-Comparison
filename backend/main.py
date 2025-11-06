import os
import json
import uuid
import asyncio
import uvicorn
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import AsyncGenerator
import threading

# Local imports
from auth.routes import router as auth_router
from utils.azure_ocr import AzureOCR
from utils.merge_utils import merge_results_json

# -----------------------
# Setup Environment
# -----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

os.environ.pop("REQUESTS_CA_BUNDLE", None)
os.environ["AZURE_CLI_DISABLE_CONNECTION_VERIFICATION"] = "1"

# -----------------------
# Initialize FastAPI
# -----------------------
app = FastAPI(title="Agentic AI - Azure Guideline Ingestion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

# Store progress and results for each session
progress_store = {}
results_store = {}  # ✅ NEW: Store final results
progress_lock = threading.Lock()


# -----------------------
# Health Check Endpoint
# -----------------------
@app.get("/")
def root():
    return {"message": "✅ FastAPI + Azure OCR/OpenAI backend running successfully!"}


# -----------------------
# Progress Update Helper
# -----------------------
def update_progress(session_id: str, progress: int, message: str):
    """Update progress for a specific session (thread-safe)"""
    with progress_lock:
        progress_store[session_id] = {
            "progress": min(progress, 100),
            "message": message,
        }
        print(f"📊 Progress Update [{session_id[:8]}]: {progress}% - {message}")


# -----------------------
# SSE Progress Stream Endpoint
# -----------------------
@app.get("/progress/{session_id}")
async def progress_stream(session_id: str):
    """Stream progress updates to the client"""
    async def event_generator() -> AsyncGenerator[str, None]:
        last_progress = -1
        retry_count = 0
        max_retries = 600  # 600 * 0.5s = 5 minutes timeout
        
        print(f"🔌 SSE Client connected for session: {session_id[:8]}")
        
        while retry_count < max_retries:
            with progress_lock:
                if session_id in progress_store:
                    data = progress_store[session_id]
                    current_progress = data["progress"]
                    
                    # Send update if progress changed
                    if current_progress != last_progress:
                        last_progress = current_progress
                        yield f"data: {json.dumps({'progress': data['progress'], 'message': data['message']})}\n\n"
                        print(f"📡 SSE Sent: {current_progress}% - {data['message']}")
                        retry_count = 0
                    
                    # If complete, close connection
                    if current_progress >= 100:
                        await asyncio.sleep(0.5)
                        print(f"✅ SSE Complete for session: {session_id[:8]}")
                        break
            
            await asyncio.sleep(0.5)  # Poll every 500ms
            retry_count += 1
        
        # Cleanup
        with progress_lock:
            if session_id in progress_store:
                del progress_store[session_id]
        
        print(f"🔌 SSE Connection closed for session: {session_id[:8]}")
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# -----------------------
# Background Processing Function
# -----------------------
def process_pdf_background(session_id: str, pdf_path: str, filename: str):
    """Background task for processing PDF"""
    try:
        print(f"\n{'='*60}")
        print(f"🔄 Background processing started for session: {session_id[:8]}")
        print(f"📄 File: {filename}")
        print(f"{'='*60}\n")

        # STEP 1: OCR Extraction (0% → 25%)
        update_progress(session_id, 2, "Starting OCR extraction...")
        ocr_client = AzureOCR()
        
        update_progress(session_id, 5, "Reading PDF pages...")
        extracted_text = ocr_client.analyze_doc(pdf_path)
        
        text_length = len(extracted_text)
        update_progress(session_id, 25, f"✅ OCR completed - {text_length:,} characters extracted")
        print(f"✅ OCR completed: {text_length:,} characters\n")

        # STEP 2: Text Chunking (25% → 30%)
        update_progress(session_id, 27, "Splitting text into processing chunks...")
        from utils.azure_openai import split_text_into_chunks
        chunks = split_text_into_chunks(extracted_text)
        
        num_chunks = len(chunks)
        update_progress(session_id, 30, f"✅ Text split into {num_chunks} chunks")
        print(f"✅ Text chunked: {num_chunks} chunks\n")

        # STEP 3: AI Processing (30% → 95%)
        from utils.azure_openai import (
            generate_taxonomy,
            generate_ontology,
            generate_semantics,
            generate_rules,
        )

        print("Starting AI processing with 4 parallel tasks...\n")
        
        results = {}
        completed_tasks = 0
        total_tasks = 4
        
        funcs = {
            "taxonomy": {
                "func": generate_taxonomy,
                "start_msg": "Generating taxonomy structure...",
                "end_msg": "✅ Taxonomy generated"
            },
            "ontology": {
                "func": generate_ontology,
                "start_msg": "Generating ontology relationships...",
                "end_msg": "✅ Ontology generated"
            },
            "semantics": {
                "func": generate_semantics,
                "start_msg": "Extracting semantic definitions...",
                "end_msg": "✅ Semantics extracted"
            },
            "rules": {
                "func": generate_rules,
                "start_msg": "Extracting rules and conditions...",
                "end_msg": "✅ Rules extracted"
            }
        }

        task_status = {name: "pending" for name in funcs.keys()}
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_name = {
                executor.submit(funcs[name]["func"], chunks): name
                for name in funcs.keys()
            }

            update_progress(session_id, 32, "Processing all the chunks...")

            for future in as_completed(future_to_name):
                name = future_to_name[future]
                
                try:
                    if task_status[name] == "pending":
                        task_status[name] = "running"
                        update_progress(
                            session_id,
                            30 + int((completed_tasks / total_tasks) * 65),
                            funcs[name]["start_msg"]
                        )
                    
                    results[name] = future.result()
                    completed_tasks += 1
                    task_status[name] = "completed"
                    
                    progress = 30 + int((completed_tasks / total_tasks) * 65)
                    status_msg = f"{funcs[name]['end_msg']} ({completed_tasks}/{total_tasks} tasks done)"
                    
                    update_progress(session_id, progress, status_msg)
                    print(f"✅ {name.capitalize()} completed ({completed_tasks}/{total_tasks})")
                    
                except Exception as e:
                    print(f"❌ Error generating {name}: {e}")
                    completed_tasks += 1
                    task_status[name] = "failed"
                    
                    progress = 30 + int((completed_tasks / total_tasks) * 65)
                    update_progress(
                        session_id,
                        progress,
                        f"⚠️ {name.capitalize()} failed ({completed_tasks}/{total_tasks} tasks processed)"
                    )
                    results[name] = {}

        print(f"\n✅ All AI processing completed\n")

        # STEP 4: Merge Results (95% → 100%)
        update_progress(session_id, 96, "Merging all results into final structure...")
        final_json = merge_results_json(
            results.get("taxonomy", {}),
            results.get("ontology", {}),
            results.get("semantics", {}),
            results.get("rules", {})
        )
        
        update_progress(session_id, 98, "Finalizing output...")
        
        output_size = len(json.dumps(final_json))
        update_progress(session_id, 100, f"✅ Processing complete! Generated {output_size:,} bytes")
        
        # Store final result
        with progress_lock:
            results_store[session_id] = {
                "status": "success",
                "message": "Guideline processed successfully!",
                "output_file": final_json,
                "stats": {
                    "text_length": text_length,
                    "chunks": num_chunks,
                    "output_size": output_size
                }
            }
        
        print(f"{'='*60}")
        print(f"✅ PROCESSING COMPLETE")
        print(f"📊 Output size: {output_size:,} bytes")
        print(f"{'='*60}\n")

    except Exception as e:
        error_msg = str(e)
        print(f"\n{'='*60}")
        print(f"❌ ERROR DURING PROCESSING")
        print(f"Error: {error_msg}")
        print(f"{'='*60}\n")
        
        update_progress(session_id, 0, f"❌ Error: {error_msg}")
        
        with progress_lock:
            results_store[session_id] = {
                "status": "error",
                "message": error_msg
            }

    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print("🧹 Temporary file cleaned up\n")


# -----------------------
# PDF Processing Endpoint (NOW ASYNC!)
# -----------------------
@app.post("/process-guideline")
async def process_guideline(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    
    print(f"\n{'='*60}")
    print(f"📥 File upload received: {file.filename}")
    print(f"🆔 Session ID: {session_id}")
    print(f"{'='*60}\n")
    
    # Initialize progress
    update_progress(session_id, 0, "Initializing upload...")

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        content = await file.read()
        tmp_pdf.write(content)
        pdf_path = tmp_pdf.name
        file_size_mb = len(content) / (1024 * 1024)
        print(f"📄 File saved temporarily: {file_size_mb:.2f} MB")

    update_progress(session_id, 1, "File uploaded, starting processing...")

    # ✅ Start background processing
    background_tasks.add_task(process_pdf_background, session_id, pdf_path, file.filename)
    
    # ✅ IMMEDIATELY return session_id
    return {
        "status": "processing",
        "message": "Processing started",
        "session_id": session_id
    }


# -----------------------
# Get Results Endpoint
# -----------------------
@app.get("/result/{session_id}")
def get_result(session_id: str):
    """Get the final result for a completed session"""
    with progress_lock:
        if session_id in results_store:
            result = results_store[session_id]
            # Clean up after retrieval
            del results_store[session_id]
            return result
        else:
            return {
                "status": "processing",
                "message": "Still processing..."
            }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)