const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const WEBHOOK_URL = 'https://n8np.puribijay.com.np/webhook/51bef67d-e017-4fc8-92ca-896d8b6c329aa';
const WACC_FILE = path.join(__dirname, 'My Wacc Report.csv');
const HISTORY_FILE = path.join(__dirname, 'Transaction History.csv');

async function validate() {
    console.log('--- Starting Webhook Validation ---');

    if (!fs.existsSync(WACC_FILE) || !fs.existsSync(HISTORY_FILE)) {
        console.error('Error: Required CSV files not found in root.');
        process.exit(1);
    }

    const form = new FormData();
    form.append('wacc_report', fs.createReadStream(WACC_FILE));
    form.append('transaction_history', fs.createReadStream(HISTORY_FILE));

    console.log(`Sending request to: ${WEBHOOK_URL}...`);

    try {
        const response = await axios.post(WEBHOOK_URL, form, {
            headers: form.getHeaders()
        });

        console.log('\n--- Response Received ---');
        console.log('Status:', response.status);

        const data = response.data;

        if (typeof data === 'object' && data !== null) {
            console.log('Response Keys:', Object.keys(data));

            if (data.tradingHistory) {
                console.log('✅ Found tradingHistory array!');
                console.log('Sample tradingHistory item:', JSON.stringify(data.tradingHistory[0], null, 2));
            } else {
                console.log('❌ tradingHistory NOT found in response.');
            }

            if (data.analysis) {
                console.log('✅ Found analysis field.');
            } else if (Array.isArray(data)) {
                console.log('ℹ️ Response is a legacy array format.');
            }
        } else {
            console.log('Unexpected response type:', typeof data);
        }

        // Save current response for reference
        fs.writeFileSync(path.join(__dirname, 'latest_webhook_response.json'), JSON.stringify(data, null, 2));
        console.log('\nSaved full response to latest_webhook_response.json');

    } catch (error) {
        console.error('Error during validation:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

validate();
