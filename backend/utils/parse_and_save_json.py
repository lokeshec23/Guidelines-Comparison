import json
import re
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime

def parse_and_save_json(
    content: str, 
    output_path: Optional[str] = None,
    filename: Optional[str] = None
) -> dict:
    """
    Parse LLM response, extract JSON, and save to local file.
    
    Args:
        content: Raw response from LLM
        output_path: Directory to save JSON (default: current directory)
        filename: Custom filename (default: timestamped filename)
    
    Returns:
        Parsed JSON as dictionary
    """
    try:
        # Remove markdown code blocks if present
        cleaned_content = content.strip()
        cleaned_content = re.sub(r'^```json\s*', '', cleaned_content)
        cleaned_content = re.sub(r'^```\s*', '', cleaned_content)
        cleaned_content = re.sub(r'\s*```$', '', cleaned_content)
        cleaned_content = cleaned_content.strip()
        
        # Parse JSON
        parsed_json = json.loads(cleaned_content)
        
        # Set up output path
        if output_path is None:
            output_path = Path.cwd()
        else:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
        
        # Generate filename if not provided
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"mortgage_rules_{timestamp}.json"
        
        # Ensure .json extension
        if not filename.endswith('.json'):
            filename += '.json'
        
        # Full file path
        file_path = output_path / filename
        
        # Save to file with pretty printing
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(parsed_json, f, indent=2, ensure_ascii=False)
        
        print(f"✓ JSON successfully saved to: {file_path}")
        print(f"✓ Total sections extracted: {len(parsed_json)}")
        print(f"✓ Total rules extracted: {sum(len(v) for v in parsed_json.values() if isinstance(v, list))}")
        
        return parsed_json
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON parsing error: {e}")
        print(f"✗ Problematic content:\n{content[:500]}...")
        
        # Save raw content for debugging
        error_path = Path(output_path) / f"error_response_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(error_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Raw response saved to: {error_path}")
        
        raise
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        raise

