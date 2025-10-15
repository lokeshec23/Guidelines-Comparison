import yaml

def merge_results(taxonomy, ontology, semantics, rules) -> str:
    """
    Merge multiple YAML strings into one unified YAML.
    """
    merged = {
        "guideline_ingestion": {
            "taxonomy": yaml.safe_load(taxonomy).get("taxonomy", taxonomy),
            "ontology": yaml.safe_load(ontology).get("ontology", ontology),
            "semantics": yaml.safe_load(semantics).get("semantics", semantics),
            "rules": yaml.safe_load(rules).get("rules", rules)
        }
    }
    return yaml.dump(merged, sort_keys=False, allow_unicode=True)
