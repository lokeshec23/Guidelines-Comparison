# utils/merge_utils.py
import json

def merge_results_json(taxonomy: str, ontology: str, semantics: str, rules: str) -> dict:
    """
    Merge all outputs into a single JSON dictionary with all components as arrays.

    Args:
        taxonomy: JSON string from generate_taxonomy
        ontology: JSON string from generate_ontology
        semantics: JSON string from generate_semantics
        rules: JSON string from generate_rules

    Returns:
        Merged dictionary with all components as arrays
    """
    merged = {}

    try:
        taxonomy_data = json.loads(taxonomy) if taxonomy else {}
        # Extract taxonomy as array
        if isinstance(taxonomy_data, dict) and "taxonomy" in taxonomy_data:
            merged["taxonomy"] = taxonomy_data["taxonomy"] if isinstance(taxonomy_data["taxonomy"], list) else [taxonomy_data["taxonomy"]]
        elif isinstance(taxonomy_data, list):
            merged["taxonomy"] = taxonomy_data
        else:
            merged["taxonomy"] = [taxonomy_data] if taxonomy_data else []
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse taxonomy JSON: {e}")
        merged["taxonomy"] = []

    try:
        ontology_data = json.loads(ontology) if ontology else {}
        # Convert ontology to array format
        if isinstance(ontology_data, dict) and "ontology" in ontology_data:
            ontology_content = ontology_data["ontology"]
            if isinstance(ontology_content, list):
                merged["ontology"] = ontology_content
            else:
                # Convert object to array of key-value pairs or just wrap in array
                merged["ontology"] = [ontology_content]
        elif isinstance(ontology_data, list):
            merged["ontology"] = ontology_data
        else:
            merged["ontology"] = [ontology_data] if ontology_data else []
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse ontology JSON: {e}")
        merged["ontology"] = []

    try:
        semantics_data = json.loads(semantics) if semantics else {}
        # Convert semantics to array format
        if isinstance(semantics_data, dict) and "semantics" in semantics_data:
            semantics_content = semantics_data["semantics"]
            if isinstance(semantics_content, list):
                merged["semantics"] = semantics_content
            else:
                merged["semantics"] = [semantics_content]
        elif isinstance(semantics_data, list):
            merged["semantics"] = semantics_data
        else:
            merged["semantics"] = [semantics_data] if semantics_data else []
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse semantics JSON: {e}")
        merged["semantics"] = []

    try:
        rules_data = json.loads(rules) if rules else {}
        # Convert rules to array format
        if isinstance(rules_data, dict) and "rules" in rules_data:
            rules_content = rules_data["rules"]
            if isinstance(rules_content, list):
                merged["rules"] = rules_content
            else:
                merged["rules"] = [rules_content]
        elif isinstance(rules_data, list):
            merged["rules"] = rules_data
        else:
            merged["rules"] = [rules_data] if rules_data else []
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse rules JSON: {e}")
        merged["rules"] = []

    return merged