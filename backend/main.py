import os
import json
import uvicorn
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor, as_completed

# Local imports
from auth.routes import router as auth_router
from utils.azure_ocr import AzureOCR
# from utils.azure_openai import generate_all_structures
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
    allow_origins=["*"],  # Adjust for your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)


# -----------------------
# Health Check Endpoint
# -----------------------
@app.get("/")
def root():
    return {"message": "✅ FastAPI + Azure OCR/OpenAI backend running successfully!"}


# -----------------------
# PDF Processing Endpoint
# -----------------------

@app.post("/process-guideline")
async def process_guideline(file: UploadFile = File(...)):
    print("📥 File upload received:", file.filename)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(await file.read())
        pdf_path = tmp_pdf.name

    try:
        print("🔍 Step 1: Starting OCR extraction...")
        ocr_client = AzureOCR()
        extracted_text = ocr_client.analyze_doc(pdf_path)
        print("✅ OCR completed — text length:", len(extracted_text))

        from utils.azure_openai import split_text_into_chunks
        chunks = split_text_into_chunks(extracted_text)
        print(f"🧩 Text split into {len(chunks)} chunks for model processing")

        from utils.azure_openai import (
            generate_taxonomy,
            generate_ontology,
            generate_semantics,
            generate_rules,
        )

        print("🧠 Step 3: Generating structured knowledge in parallel...")

        results = {}
        funcs = {
            "taxonomy": generate_taxonomy,
            "ontology": generate_ontology,
            "semantics": generate_semantics,
            "rules": generate_rules,
        }

        # Run all functions concurrently
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_name = {executor.submit(func, chunks): name for name, func in funcs.items()}
            for future in as_completed(future_to_name):
                name = future_to_name[future]
                try:
                    results[name] = future.result()
                    print(f"✅ {name} generated")
                except Exception as e:
                    print(f"❌ Error generating {name}: {e}")
                    results[name] = {}

        from utils.merge_utils import merge_results_json
        final_json = merge_results_json(
            results["taxonomy"],
            results["ontology"],
            results["semantics"],
            results["rules"]
        )

        return {
            "status": "success",
            "message": "Guideline processed successfully!",
            "output_file": final_json,
        }

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print("🧹 Temporary file cleaned up")


# ======================================
#  Entrypoint
# ======================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
