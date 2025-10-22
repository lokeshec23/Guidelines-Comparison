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
# Utility to clean GPT output
# -----------------------
def clean_yaml_output(text: str) -> str:
    """
    Remove markdown fences and ensure valid YAML text.
    """
    if not text:
        return ""
    # Remove ```yaml, ```json, ``` or ```text fences
    cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", text.strip())
    cleaned = re.sub(r"```$", "", cleaned.strip())
    return cleaned.strip()


# -----------------------
# Azure OpenAI Prompt Functions
# -----------------------
def generate_taxonomy(extracted_text: str) -> str:
    prompt = f"""
You are an AI that extracts hierarchical Taxonomy information from a guideline.
Output YAML ONLY — no explanations or markdown.
Example:
taxonomy:
  - category: Loan Eligibility
    subcategories:
      - Income Verification
      - Credit History

Extract the taxonomy from this text:
{extracted_text}
"""
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return clean_yaml_output(response.choices[0].message.content)


def generate_ontology(extracted_text: str) -> str:
    prompt = f"""
You are an AI that generates Ontology (relationships between entities) from a guideline.
Output strictly YAML only.
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

Extract ontology from this text:
{extracted_text}
"""
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return clean_yaml_output(response.choices[0].message.content)


def generate_semantics(extracted_text: str) -> str:
    prompt = f"""
You are an AI that identifies semantic meanings (key terms, definitions, and context).
Return YAML only, with structure:

semantics:
  Term:
    definition: ...
    context: ...

Extract from this text:
{extracted_text}
"""
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return clean_yaml_output(response.choices[0].message.content)


# def generate_rules(extracted_text: str) -> str:
#     prompt = f"""
# You are an AI that extracts business rules and conditions from guidelines.
# Output valid YAML only, example:

# rules:
#   - condition: Borrower income must exceed 50,000
#     action: Eligible for loan
#   - condition: Credit score below 600
#     action: Reject application

# Extract rules from this text:
# {extracted_text}
# """
#     response = client.chat.completions.create(
#         model=AZURE_OPENAI_DEPLOYMENT_NAME,
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.2,
#     )
#     return clean_yaml_output(response.choices[0].message.content)



def split_text_into_chunks(text: str, max_tokens: int = 7000) -> List[str]:
    """Split extracted text into chunks based on token count to fit model limits."""
    encoding = tiktoken.encoding_for_model("gpt-4o")  # adjust if your Azure model differs
    tokens = encoding.encode(text)
    
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk = encoding.decode(tokens[i:i + max_tokens])
        chunks.append(chunk)
    return chunks


def generate_rules(extracted_text: str) -> str:
    prompt_template = """
You are an expert U.S. mortgage underwriting analyst. 
You will be given text from a mortgage guideline document (e.g., Non-QM, DSCR, Conventional, etc.).
Your job is to extract and structure it into clean, hierarchical JSON.

### INSTRUCTIONS
1. Identify major sections and subsections based on titles, numbering, or formatting.
2. For each **major section**:
   - Add a "summary" (2–3 lines) describing what this section mainly covers.
3. For each **subsection** inside it:
   - Provide only the **rules, conditions, or requirements** summarized in 2–3 lines.
   - Do NOT include a `"summary"` key for subsections.
4. Keep headings exactly as written in the text (e.g., "301. Non-U.S. Citizen Eligibility").
5. Maintain hierarchy and section order.
6. Do not hallucinate or infer beyond what’s in the text.

### OUTPUT FORMAT
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

    # Split extracted text into smaller chunks
    chunks = split_text_into_chunks(extracted_text)
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
            # Try to clean invalid JSON responses
            cleaned = response.choices[0].message.content.strip("```json").strip("```").strip()
            chunk_result = json.loads(cleaned)

        # Merge JSON outputs
        for key, value in chunk_result.items():
            if key not in final_result:
                final_result[key] = value
            else:
                # Merge nested subsections if same major section appears across chunks
                final_result[key].update(value)

    # Convert back to JSON string
    final_json = json.dumps(final_result, indent=2)
    return parse_and_save_json(final_json)



