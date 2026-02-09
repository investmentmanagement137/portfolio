import json
import os

FILENAME = 'webhook_response.json'

def verify_json():
    print(f"--- Verifying {FILENAME} ---")
    if not os.path.exists(FILENAME):
        print(f"Error: {FILENAME} not found.")
        return

    try:
        with open(FILENAME, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Parsed successfully. Type: {type(data)}")
        
        # In this project, the response is often a list containing one or more objects
        root = data[0] if isinstance(data, list) and len(data) > 0 else data
        
        if isinstance(root, dict):
            keys = root.keys()
            print(f"Top level keys: {list(keys)}")
            
            # Check for specific keys expected by the frontend
            expected_keys = ["Divident Summary", "Divident Calculation", "meroshare detailed tansaction history", "current holdings in meroshare"]
            for key in expected_keys:
                if key in root:
                    print(f"✅ Found key: {key}")
                else:
                    print(f"❌ Missing key: {key}")
            
            if "meroshare detailed tansaction history" in root:
                history = root["meroshare detailed tansaction history"]
                print(f"Transaction History Count: {len(history)}")
                if len(history) > 0:
                    print(f"First Transaction Sample: {history[0]}")
        else:
            print(f"Unexpected root type: {type(root)}")

    except Exception as e:
        print(f"Error during verification: {str(e)}")

if __name__ == "__main__":
    verify_json()
