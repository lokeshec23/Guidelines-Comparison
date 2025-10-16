import os
import tempfile
import concurrent.futures
from dotenv import load_dotenv
from PyPDF2 import PdfReader, PdfWriter
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient


# Load environment from parent directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))


class AzureOCR:
    """
    Azure Document Intelligence OCR Wrapper
    Handles:
        - SSL automatically
        - Chunked PDF processing for large files
        - Parallel OCR execution
    """

    def __init__(self, endpoint=None, key=None):
        self.endpoint = endpoint or os.getenv("DI_endpoint")
        self.key = key or os.getenv("DI_key")

        if not self.endpoint or not self.key:
            raise ValueError("❌ Missing DI_endpoint or DI_key in .env")

        # Initialize Azure Document Intelligence client
        self.client = DocumentAnalysisClient(
            endpoint=self.endpoint,
            credential=AzureKeyCredential(self.key),
        )

        print("✅ AzureOCR client initialized")

    # -----------------------------------------------------
    # Split PDF into smaller chunks (default 30 pages each)
    # -----------------------------------------------------
    def split_pdf(self, pdf_path, pages_per_chunk=30):
        print(f"📄 Splitting PDF into chunks of {pages_per_chunk} pages each...")
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        chunks = []

        for i in range(0, total_pages, pages_per_chunk):
            writer = PdfWriter()
            for j in range(i, min(i + pages_per_chunk, total_pages)):
                writer.add_page(reader.pages[j])

            tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
            with open(tmp_path, "wb") as f:
                writer.write(f)
            chunks.append(tmp_path)
            print(f"🧩 Created chunk: {tmp_path} (Pages {i+1}-{min(i+pages_per_chunk, total_pages)})")

        print(f"✅ Total chunks created: {len(chunks)}")
        return chunks

    # -----------------------------------------------------
    # Run Azure OCR on one chunk
    # -----------------------------------------------------
    def analyze_chunk(self, chunk_path, model="prebuilt-layout"):
        try:
            with open(chunk_path, "rb") as f:
                poller = self.client.begin_analyze_document(model, f)
                result = poller.result()

            # Collect all text from this chunk
            all_text = []
            for page in result.pages:
                page_num = page.page_number
                page_text = "\n".join(
                    para.content
                    for para in result.paragraphs
                    if para.bounding_regions
                    and para.bounding_regions[0].page_number == page_num
                )
                all_text.append(page_text)

            print(f"✅ OCR completed for chunk: {os.path.basename(chunk_path)} ({len(all_text)} pages)")
            return "\n\n".join(all_text)

        except Exception as e:
            print(f"❌ OCR failed for chunk {chunk_path}: {e}")
            return ""

    # -----------------------------------------------------
    # Parallel OCR for all chunks
    # -----------------------------------------------------
    def analyze_doc(self, pdf_path):
        print("🚀 Starting OCR pipeline...")
        chunks = self.split_pdf(pdf_path, pages_per_chunk=30)
        results = []

        # Use ThreadPoolExecutor to run chunks in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_chunk = {
                executor.submit(self.analyze_chunk, chunk): chunk for chunk in chunks
            }

            for future in concurrent.futures.as_completed(future_to_chunk):
                chunk_path = future_to_chunk[future]
                try:
                    text = future.result()
                    results.append(text)
                except Exception as e:
                    print(f"❌ Error while processing chunk {chunk_path}: {e}")

        # Cleanup temporary chunk files
        for c in chunks:
            os.remove(c)

        combined_text = "\n\n".join(results)
        print(f"🧾 OCR extraction completed! Total text length: {len(combined_text)} characters")
        return combined_text
