import os
import re
from dotenv import load_dotenv
from openai import AzureOpenAI

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


def generate_rules(extracted_text: str) -> str:
    prompt = f"""
You are an AI that extracts business rules and conditions from guidelines.
Output valid YAML only, example:

rules:
  - condition: Borrower income must exceed 50,000
    action: Eligible for loan
  - condition: Credit score below 600
    action: Reject application

Extract rules from this text:
{extracted_text}
"""
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return clean_yaml_output(response.choices[0].message.content)
