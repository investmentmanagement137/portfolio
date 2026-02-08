const LTP_URL = 'https://raw.githubusercontent.com/investmentmanagement137/jsons/main/recentltp.json';

interface NepseEntry {
    Script: string;
    Price: number | string;
    "change in value": number;
    "Ltp change percent": number;
    "Traded _date": string;
}

async function fetchNepseData(): Promise<NepseEntry | null> {
    try {
        const response = await fetch(LTP_URL);
        const json = await response.json();
        const data = json["all recent price"] || [];

        for (const item of data) {
            if (item.Script === "NEPSE Index") {
                return item as NepseEntry;
            }
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch NEPSE data:", error);
        return null;
    }
}

function getMarketStatus(): string {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour + minute / 60;

    const isMarketDay = day >= 0 && day <= 4; // Sunday to Thursday
    const isMarketTime = time >= 11 && time < 15; // 11:00 AM to 3:00 PM

    return (isMarketDay && isMarketTime) ? "Market Open" : "Market Closed";
}

function formatPrice(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    return num.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateDOM(nepseData: NepseEntry): void {
    const indexValueEl = document.getElementById('index-value');
    const changeValueEl = document.getElementById('change-value');
    const changePercentEl = document.getElementById('change-percent');
    const changeContainerEl = document.getElementById('change-container');
    const updatedAtEl = document.getElementById('updated-at');
    const marketStatusEl = document.getElementById('market-status');
    const structuredDataScript = document.getElementById('structured-data');

    const price = typeof nepseData.Price === 'string'
        ? parseFloat(nepseData.Price.replace(/,/g, ''))
        : nepseData.Price;
    const change = nepseData["change in value"];
    const changePercent = nepseData["Ltp change percent"];
    const isPositive = change >= 0;

    if (indexValueEl) indexValueEl.textContent = formatPrice(price);
    if (changeValueEl) changeValueEl.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)}`;
    if (changePercentEl) changePercentEl.textContent = `(${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`;

    if (changeContainerEl) {
        changeContainerEl.classList.remove('positive', 'negative');
        changeContainerEl.classList.add(isPositive ? 'positive' : 'negative');
    }

    const tradedDate = new Date(nepseData["Traded _date"]);
    if (updatedAtEl) {
        updatedAtEl.setAttribute('datetime', tradedDate.toISOString());
        updatedAtEl.textContent = `Last updated: ${tradedDate.toLocaleString('en-NP', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })}`;
    }

    const status = getMarketStatus();
    if (marketStatusEl) {
        marketStatusEl.textContent = status;
        marketStatusEl.classList.remove('open', 'closed');
        marketStatusEl.classList.add(status === 'Market Open' ? 'open' : 'closed');
    }

    // Update JSON-LD for LLMs
    if (structuredDataScript) {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "FinancialQuote",
            "name": "NEPSE Index",
            "description": "The primary stock market index of the Nepal Stock Exchange (NEPSE).",
            "price": {
                "@type": "MonetaryAmount",
                "currency": "NPR",
                "value": price.toFixed(2)
            },
            "priceChange": change.toFixed(2),
            "priceChangePercent": `${changePercent.toFixed(2)}%`,
            "marketStatus": status,
            "datePosted": tradedDate.toISOString()
        };
        structuredDataScript.textContent = JSON.stringify(structuredData);
    }
}

function getMillisecondsUntilNextRefresh(): number {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    // Target times are :01, :16, :31, :46 (1 minute after each quarter hour)
    const targets = [1, 16, 31, 46];

    let nextTarget = targets.find(t => t > minutes);
    let minutesToWait: number;

    if (nextTarget !== undefined) {
        minutesToWait = nextTarget - minutes;
    } else {
        // Next target is :01 in the next hour
        minutesToWait = (60 - minutes) + 1;
    }

    const delay = (minutesToWait * 60 * 1000) - (seconds * 1000) - ms;
    return delay > 0 ? delay : 60000; // Fallback to 1 minute if calculation is negative
}

async function init(): Promise<void> {
    const nepseData = await fetchNepseData();
    if (nepseData) {
        updateDOM(nepseData);
    }

    // Schedule next refresh at the next 15-minute mark
    const delay = getMillisecondsUntilNextRefresh();
    console.log(`Next refresh in ${Math.round(delay / 1000 / 60)} minutes.`);
    setTimeout(init, delay);
}

document.addEventListener('DOMContentLoaded', init);
