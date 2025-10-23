# utils/merge_utils.py
import json

def merge_results_json(taxonomy: str, ontology: str, semantics: str, rules: str) -> dict:
    """
    Merge all outputs into a single JSON dictionary.

    Args:
        taxonomy: JSON string from generate_taxonomy
        ontology: JSON string from generate_ontology
        semantics: JSON string from generate_semantics
        rules: JSON string from generate_rules

    Returns:
        Merged dictionary
    """
    merged = {}

    try:
        merged["taxonomy"] = json.loads(taxonomy) if taxonomy else {}
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse taxonomy JSON: {e}")
        merged["taxonomy"] = {}

    try:
        merged["ontology"] = json.loads(ontology) if ontology else {}
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse ontology JSON: {e}")
        merged["ontology"] = {}

    try:
        merged["semantics"] = json.loads(semantics) if semantics else {}
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse semantics JSON: {e}")
        merged["semantics"] = {}

    try:
        merged["rules"] = json.loads(rules) if rules else {}
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse rules JSON: {e}")
        merged["rules"] = {}

    return merged
