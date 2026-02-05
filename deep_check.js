const fs = require('fs');
const content = fs.readFileSync('webhook_response.json', 'utf8');
try {
    const data = JSON.parse(content);
    console.log('Parsed successfully. Type:', typeof data, 'isArray:', Array.isArray(data));

    function findKeys(obj, path = '') {
        if (!obj || typeof obj !== 'object') return;

        const keys = Object.keys(obj);
        console.log(`Path [${path}] Keys:`, keys.join(', '));

        keys.forEach(key => {
            if (key === 'tradingHistory' || key === 'analysis') {
                console.log(`🎯 FOUND ${key} at root level of path [${path}]`);
            }
            // Dive into arrays to check first element
            if (Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] === 'object') {
                // To avoid too much output, only log if it's the transactional history key we saw earlier
                if (key === 'meroshare detailed tansaction history') {
                    console.log(`Checking nested keys in ${key}...`);
                    const nestedKeys = Object.keys(obj[key][0]);
                    console.log(`Nested keys in ${key}[0]:`, nestedKeys.join(', '));
                    if (nestedKeys.includes('tradingHistory')) console.log('🎯 tradingHistory found inside meroshare history!');
                }
            }
        });
    }

    if (Array.isArray(data)) {
        data.forEach((item, i) => findKeys(item, `index_${i}`));
    } else {
        findKeys(data);
    }
} catch (e) {
    console.error('Error:', e.message);
}
