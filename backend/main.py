# backend/main.py
import os
os.environ.pop("REQUESTS_CA_BUNDLE", None)  # 👈 clears any leftover setting
os.environ["AZURE_CLI_DISABLE_CONNECTION_VERIFICATION"] = "1"

import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Routers and utilities
from auth.routes import router as auth_router
from utils.azure_ocr import AzureOCR
from utils.azure_openai import (
    generate_taxonomy,
    generate_ontology,
    generate_semantics,
    generate_rules
)
from utils.merge_utils import merge_results

# -----------------------
# Load environment
# -----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# If you have a corporate CA PEM file, set it here
# os.environ["REQUESTS_CA_BUNDLE"] = r"C:\certs\corp_rootCA.pem"

# -----------------------
# Initialize FastAPI
# -----------------------
app = FastAPI(title="Agentic AI - Azure Guideline Ingestion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory for output YAML files
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Include authentication routes
app.include_router(auth_router)

# -----------------------
# Root health endpoint
# -----------------------
@app.get("/")
def root():
    return {"message": "FastAPI + Azure OCR/OpenAI backend is running 🚀"}


# -----------------------
# PDF guideline processing endpoint
# -----------------------
@app.post("/process-guideline")
async def process_guideline(file: UploadFile = File(...)):
    """
    Upload PDF → OCR → Azure OpenAI (taxonomy, ontology, semantics, rules) → Merge YAML
    """
    # Save PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(await file.read())
        pdf_path = tmp_pdf.name

    try:
        # Step 1️⃣ Extract text using Azure Document Intelligence
        ocr_client = AzureOCR()
        print("OCR Client Initialized")
        extracted_text = ocr_client.analyze_doc(pdf_path)
        print("Extracted Completed : ",len(extracted_text))
        # Step 2️⃣ Generate structured knowledge with Azure OpenAI
        taxonomy = generate_taxonomy(extracted_text)
        print("taxonomy Completed : ",len(taxonomy))
        ontology = generate_ontology(extracted_text)
        print("ontology Completed : ",len(ontology))
        semantics = generate_semantics(extracted_text)
        print("semantics Completed : ",len(semantics))
        rules = generate_rules(extracted_text)
        print("rules Completed : ",len(rules))

        # Step 3️⃣ Merge into unified YAML
        final_yaml = merge_results(taxonomy, ontology, semantics, rules)
        print("Merging Completed : ",final_yaml)
        # Save YAML output
        output_file = os.path.join(OUTPUT_DIR, f"{file.filename}_ingested.yaml")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(final_yaml)

        return {
            "status": "success",
            "message": "Guideline processed successfully",
            "output_file": output_file,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        # Cleanup temporary file
        if os.path.exists(pdf_path):
            os.remove(pdf_path)


# -----------------------
# Optional: Environment check endpoint
# -----------------------
@app.get("/test-env")
def test_env():
    return {
        "openai_key_loaded": bool(os.getenv("AZURE_OPENAI_API_KEY")),
        "ocr_key_loaded": bool(os.getenv("DI_key")),
        "ocr_endpoint": os.getenv("DI_endpoint"),
    }
