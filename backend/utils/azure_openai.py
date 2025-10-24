import os
import re
import json
import tiktoken
from typing import List
from dotenv import load_dotenv
from openai import AzureOpenAI
from utils.parse_and_save_json import parse_and_save_json

# -----------------------
# Load environment variables
# -----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT:
    raise ValueError("Missing Azure OpenAI credentials in .env")

# -----------------------
# Initialize Azure OpenAI Client
# -----------------------
client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
    api_version="2024-02-01"
)

# -----------------------
# Utility Functions
# -----------------------
def split_text_into_chunks(text: str, max_tokens: int = 7000) -> List[str]:
    """Split extracted text into chunks based on token count to fit model limits."""
    encoding = tiktoken.encoding_for_model("gpt-4o")
    tokens = encoding.encode(text)
    
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk = encoding.decode(tokens[i:i + max_tokens])
        chunks.append(chunk)
    return chunks


def clean_json_response(content: str) -> str:
    """Remove markdown fences and clean JSON response."""
    if not content:
        return "{}"
    
    cleaned = content.strip()
    cleaned = re.sub(r'^```json\s*', '', cleaned)
    cleaned = re.sub(r'^```\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    return cleaned.strip()


def process_chunks(chunks: List[str], prompt_template: str) -> dict:
    """
    Generic processing function: runs each chunk through a prompt and merges results.
    """
    final_result = {}

    for idx, chunk in enumerate(chunks):
        print(f"Processing chunk {idx+1}/{len(chunks)}...")
        prompt = prompt_template.format(text=chunk)

        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )

        try:
            chunk_result = json.loads(response.choices[0].message.content)
        except Exception:
            cleaned = clean_json_response(response.choices[0].message.content)
            chunk_result = json.loads(cleaned)

        # Merge JSON outputs
        for key, value in chunk_result.items():
            if key not in final_result:
                final_result[key] = value
            else:
                if isinstance(value, dict) and isinstance(final_result[key], dict):
                    final_result[key].update(value)
                elif isinstance(value, list) and isinstance(final_result[key], list):
                    final_result[key].extend(value)
                else:
                    final_result[key] = value

    return final_result


# -----------------------
# Generation Functions
# -----------------------
def generate_taxonomy(chunks: List[str]) -> str:
    prompt_template = """
You are an expert mortgage guideline analyst specializing in document taxonomy extraction.
You are an AI that extracts hierarchical Taxonomy information from a guideline.
Output JSON ONLY — no explanations or markdown.

### INSTRUCTIONS
1. Analyze the mortgage guideline text and identify the hierarchical structure
2. Extract main categories and their subcategories
3. Focus on logical groupings like: Eligibility, Documentation, Property Types, Income Verification, etc.
4. Keep category names clear and consistent with industry terminology
5. Do NOT hallucinate or infer beyond what's explicitly in the text

### OUTPUT FORMAT (JSON ONLY)
Example:
taxonomy:
  - category: Loan Eligibility
    subcategories:
      - Income Verification
      - Credit History

### TEXT TO PROCESS
{text}
"""
    result = process_chunks(chunks, prompt_template)
    return json.dumps(result, indent=2)


def generate_ontology(chunks: List[str]) -> str:
    prompt_template = """
You are an AI that generates Ontology (relationships between entities) from a guideline.
Output strictly JSON only.

### INSTRUCTIONS
1. Identify key entities in the mortgage guideline (e.g., Loan, Borrower, Property, Lender)
2. Map relationships between entities (relates_to, requires, depends_on)
3. Extract attributes for each entity
4. Use standard mortgage industry terminology
5. Do NOT add information not present in the text

### OUTPUT FORMAT (JSON ONLY)
Example:
ontology:
  Loan:
    relates_to:
      - Borrower
      - Collateral
  Borrower:
    attributes:
      - Name
      - CreditScore

### TEXT TO PROCESS
{text}
"""
    result = process_chunks(chunks, prompt_template)
    return json.dumps(result, indent=2)


def generate_semantics(chunks: List[str]) -> str:
    prompt_template = """
You are an AI that identifies semantic meanings (key terms, definitions, and context).
Return JSON only, with structure:

### INSTRUCTIONS
1. Identify key mortgage terms and their definitions from the text
2. Provide context for how each term is used in the guideline
3. Include industry-standard abbreviations and their meanings
4. Group related terms logically
5. Only extract terms explicitly defined or explained in the text

### OUTPUT FORMAT (JSON ONLY)
semantics:
  Term:
    definition: ...
    context: ...

### TEXT TO PROCESS
{text}
"""
    result = process_chunks(chunks, prompt_template)
    return json.dumps(result, indent=2)


def generate_rules(chunks: List[str]) -> str:
    prompt_template = """
You are an expert U.S. mortgage underwriting analyst.You will be given text from a mortgage guideline document (e.g., Non-QM, DSCR, Conventional, etc.).
Your job is to extract and structure it into clean, hierarchical JSON.

### INSTRUCTIONS
1. Identify major sections and subsections based on titles, numbering, or formatting
2. For each **major section**:
   - Add a "summary" (2-3 lines) describing what this section mainly covers
3. For each **subsection** inside it:
   - Provide only the **rules, conditions, or requirements** summarized in 2-3 lines
   - Do NOT include a "summary" key for subsections
4. Keep headings exactly as written in the text (e.g., "301. Non-U.S. Citizen Eligibility")
5. Maintain hierarchy and section order
6. Do NOT hallucinate or infer beyond what's in the text

### OUTPUT FORMAT (JSON ONLY)
{{
  "Major Section Title": {{
    "summary": "Short description of what this section covers.",
    "Subsection Title": "Condensed key rules, eligibility, or conditions under that subsection."
  }},
  "Next Major Section": {{
    ...
  }}
}}

### TEXT TO PROCESS
{text}
"""
    result = process_chunks(chunks, prompt_template)
    return json.dumps(result, indent=2)
