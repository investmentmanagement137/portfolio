const fs = require('fs');
const content = fs.readFileSync('webhook_response.json', 'utf8');
try {
    const data = JSON.parse(content);
    const root = Array.isArray(data) ? data[0] : data;
    console.log('Top level keys:', Object.keys(root));
    if (root.tradingHistory) {
        console.log('✅ tradingHistory found!');
        console.log('Count:', root.tradingHistory.length);
        console.log('First Item:', root.tradingHistory[0]);
    } else {
        console.log('❌ tradingHistory NOT found at root level of item 0');
    }
} catch (e) {
    console.error('Error:', e.message);
}
