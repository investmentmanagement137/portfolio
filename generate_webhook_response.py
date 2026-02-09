import requests
import os
import json

WEBHOOK_URL = 'https://n8np.puribijay.com.np/webhook/51bef67d-e017-4fc8-92ca-896d8b6c329aa'
WACC_FILE = 'My Wacc Report.csv'
HISTORY_FILE = 'Transaction History.csv'
OUTPUT_FILE = 'webhook_response.json'

def generate_response():
    print("--- Starting Webhook Request (Python) ---")
    
    if not os.path.exists(WACC_FILE) or not os.path.exists(HISTORY_FILE):
        print(f"Error: Required CSV files ({WACC_FILE} or {HISTORY_FILE}) not found in root.")
        return

    print(f"Preparing to send files to: {WEBHOOK_URL}")
    
    try:
        with open(WACC_FILE, 'rb') as wacc_f, open(HISTORY_FILE, 'rb') as history_f:
            files = {
                'wacc_report': (WACC_FILE, wacc_f, 'text/csv'),
                'transaction_history': (HISTORY_FILE, history_f, 'text/csv')
            }
            
            response = requests.post(WEBHOOK_URL, files=files)
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as out_f:
                json.dump(data, out_f, indent=2)
            print(f"Successfully saved response to {OUTPUT_FILE}")
        else:
            print(f"Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    generate_response()
