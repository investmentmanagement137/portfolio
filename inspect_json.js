const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'webhook_validation_result.json');

try {
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    const data = JSON.parse(content);

    console.log('Is Array:', Array.isArray(data));
    console.log('Length:', data.length);

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            console.log(`\nItem ${index} Keys:`, Object.keys(item));
            if (item.tradingHistory) {
                console.log(`✅ Found tradingHistory in Item ${index}`);
                console.log('Structure:', JSON.stringify(item.tradingHistory.slice(0, 2), null, 2));
            }
            if (item.analysis) {
                console.log(`✅ Found analysis in Item ${index}`);
            }
        });
    } else {
        console.log('Top level Keys:', Object.keys(data));
    }
} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
