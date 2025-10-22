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

# Output folder for YAML results
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
    Upload PDF → Run Azure OCR (parallel chunks)
    → Generate Taxonomy, Ontology, Semantics, Rules
    → Merge YAML → Return Output Path
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

        # Step 2️⃣ Generate Taxonomy / Ontology / Semantics / Rules
        print("🧠 Step 2: Generating structured knowledge using Azure OpenAI...")
        taxonomy =  ""  #generate_taxonomy(extracted_text)
        print("✅ Taxonomy generated (length:", len(taxonomy), ")")
        ontology = "" #generate_ontology(extracted_text)
        print("✅ Ontology generated (length:", len(ontology), ")")
        semantics = "" #generate_semantics(extracted_text)
        print("✅ Semantics generated (length:", len(semantics), ")")
        rules = generate_rules(extracted_text)
        print("✅ Rules generated (length:", len(rules), ")")

        # Step 3️⃣ Merge into unified YAML
        print("🧩 Step 3: Merging all results into a single YAML file...")
        final_json = merge_results_json(taxonomy, ontology, semantics, rules)


        # Save YAML output
        # output_file = os.path.join(OUTPUT_DIR, f"{file.filename}_ingested.yaml")
        # with open(output_file, "w", encoding="utf-8") as f:
        #     f.write(final_json)

        # print("🎉 All steps completed successfully!")
        # print(f"📦 Output saved at: {output_file}")

        return {
            "status": "success",
            "message": "Guideline processed successfully!",
            "output_file": final_json,
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
#  Entrypoint
# ======================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)