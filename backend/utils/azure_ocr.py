import os
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.pipeline.transport import RequestsTransport

# Load environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

class AzureOCR:
    """
    Wrapper for Azure Document Intelligence OCR with auto SSL handling.
    """

    def __init__(self, endpoint=None, key=None):
        self.endpoint = endpoint or os.getenv("DI_endpoint")
        self.key = key or os.getenv("DI_key")

        # if not self.endpoint or not self.key:
        #     raise ValueError("Missing DI_endpoint or DI_key in .env")

        # # 👇 Disable SSL verification if no CA bundle is provided
        # ca_path = os.getenv("REQUESTS_CA_BUNDLE")
        # if ca_path and os.path.exists(ca_path):
        #     verify_flag = ca_path
        # else:
        #     print("⚠️ No corporate CA found. Disabling SSL verification (local mode).")
        #     verify_flag = False  # disables HTTPS verification safely

        # Azure client setup
        self.client = DocumentAnalysisClient(
            endpoint=self.endpoint,
            credential=AzureKeyCredential(self.key),
        )

    def analyze_doc(self, path, model="prebuilt-document"):
        """
        Extract text from a PDF using Azure OCR.
        """
        try:
            with open(path, "rb") as f:
                poller = self.client.begin_analyze_document(model, f)
                result = poller.result()

            # Combine all extracted text
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

            return "\n\n".join(all_text)

        except Exception as e:
            raise Exception(f"Azure OCR failed: {e}")
