import os
import uvicorn
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Local imports
from auth.routes import router as auth_router
from utils.azure_ocr import AzureOCR
from utils.azure_openai import (
    split_text_into_chunks,
    generate_taxonomy,
    generate_ontology,
    generate_semantics,
    generate_rules,
)
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

# Output folder for results
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
    """
    Upload PDF → Run Azure OCR → Generate JSON outputs
    → Merge into single JSON → Return as response
    """
    print("📥 File upload received:", file.filename)

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(await file.read())
        pdf_path = tmp_pdf.name

    try:
        # Step 1️⃣ Run Azure OCR
        print("🔍 Step 1: Starting OCR extraction...")
        ocr_client = AzureOCR()
        extracted_text = ocr_client.analyze_doc(pdf_path)
        print("✅ Step 1 completed — text length:", len(extracted_text))

        # Step 2️⃣ Split text once for all generators
        chunks = split_text_into_chunks(extracted_text)
        print(f"🧩 Split text into {len(chunks)} chunk(s) for model processing")

        print("🧠 Step 2: Generating structured knowledge using Azure OpenAI...")

        taxonomy = generate_taxonomy(chunks)
        print("✅ Taxonomy generated")

        ontology = generate_ontology(chunks)
        print("✅ Ontology generated")

        semantics = generate_semantics(chunks)
        print("✅ Semantics generated")

        rules = generate_rules(chunks)
        print("✅ Rules generated")

        # Step 3️⃣ Merge into unified JSON
        merged_json = merge_results_json(taxonomy, ontology, semantics, rules)
        print("✅ All outputs merged into JSON")

        return {
            "status": "success",
            "message": "Guideline processed successfully!",
            "output_file": merged_json,
        }

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return {"status": "error", "message": str(e)}

    finally:
        # Always remove the temporary uploaded file
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print("🧹 Cleaned up temporary file.")


# ======================================
# Entrypoint
# ======================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
