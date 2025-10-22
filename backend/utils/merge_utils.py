def merge_results_json(taxonomy: dict, ontology: dict, semantics: dict, rules: dict) -> dict:
    """
    Merge multiple JSON dictionaries into one unified dictionary.
    """
    merged = {
        "guideline_ingestion": {
            "taxonomy": taxonomy,
            "ontology": ontology,
            "semantics": semantics,
            "rules": rules
        }
    }
    return merged
