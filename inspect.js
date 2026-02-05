const fs = require('fs');
const content = fs.readFileSync('webhook_validation_result.json', 'utf8');
try {
    const data = JSON.parse(content);
    console.log('Array length:', data.length);
    data.forEach((item, i) => {
        console.log(`Index ${i} keys:`, Object.keys(item).join(', '));
        if (item.tradingHistory) {
            console.log(`  - Found tradingHistory at index ${i}`);
        }
    });
} catch (e) {
    console.error('JSON Parse error:', e.message);
}
