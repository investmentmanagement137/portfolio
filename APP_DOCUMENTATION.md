# Portfolio Analyzer Application Documentation

## Overview

The **Portfolio Analyzer** is a secure, client-side focused web application designed to provide comprehensive insights into your Nepal Stock Exchange (NEPSE) portfolio. It combines detailed dividend analysis (powered by a backend webhook) with real-time portfolio valuation (using live market data).

The application features a modern, dark-themed dashboard inspired by the Gemini CLI interface, ensuring a professional and focused user experience.

## Key Features

*   **Dual-Source Analysis**: Integrates historical dividend data from backend analysis with real-time market value calculations.
*   **Live Market Data**: Fetches the latest stock prices (LTP) instantly to calculate your current portfolio value.
*   **Privacy-Focused**: Your sensitive portfolio files are processed securely. Key data is persisted in your browser's `localStorage` for convenience but is never stored permanently on our servers beyond the immediate analysis session.
*   **Interactive Visualizations**:
    *   **Asset Distribution**: Pie chart showing your top holdings by value.
    *   **Historical Dividends**: Bar chart visualizing cash flow over time.
*   **Detailed Reporting**:
    *   **My Portfolio**: A granular table of your current assets, including WACC, Investment, Current Value, and Profit/Loss.
    *   **Dividend History**: A searchable, sortable database of every cash dividend received, with detailed breakdowns.

## System Architecture

The application operates on a **Hybrid Data Model**:

1.  **Client-Side (React)**: Handles UI, file parsing, state management, and real-time calculations.
2.  **Analysis Engine (n8n Webhook)**: Processes complex CSV data to generate dividend summaries and historical reports.
3.  **Market Data Feed (External)**: Fetches live Last Traded Prices (LTP) from a maintained JSON source.

### Data Flow

1.  **User Upload**: User uploads `WACC Report.csv`, `Transaction History.csv`, and optionally `Holdings.json`.
2.  **Local Parsing**: The app immediately parses these files in the browser to extract holding quantities and costs.
3.  **Remote Analysis**: The CSV files are sent to the secure n8n webhook.
4.  **Live Sync**: The app fetches the current stock prices from the Market Data Feed.
5.  **Synthesis**:
    *   *Holdings* come from the Webhook response (highest priority) OR User Uploads.
    *   *Prices* come from the Live Feed.
    *   *Dividends* come from the Webhook Analysis.
    *   *Calculations* (Total Value, P/L) happen instantly in the browser.

## Data Sources & Logic

### 1. Portfolio Holdings Priority
The application determines your current stock holdings based on the following priority order to ensure accuracy:

1.  **Webhook Data (Highest Priority)**: If the backend analysis returns a "Current Holdings" object (derived from your transaction history), this is used as the single source of truth.
2.  **JSON Upload (Secondary)**: If provided, the `Holdings.json` file (exported from Meroshare) is used.
3.  **WACC CSV (Fallback)**: If neither of the above is available, holdings are estimated from the `WACC Report.csv`.

### 2. Real-Time Valuation
*   **Source**: `https://raw.githubusercontent.com/investmentmanagement137/jsons/main/ss_companylist.json`
*   **Update Frequency**: Fetched once per session load or page refresh.
*   **Logic**: `Current Value = Quantity * Live LTP`

### 3. Dividend Analysis
*   **Source**: n8n Webhook (`https://n8np.puribijay.com.np/webhook/...`)
*   **Input**: `WACC Report.csv` + `Transaction History.csv`
*   **Output**:
    *   Yearly Summary
    *   Scrip-wise Summary
    *   Detailed Event Log (Book closure dates, amounts, etc.)

## User Guide

### 1. Initial Setup
1.  Open the application.
2.  You will see three upload areas:
    *   **WACC Report (CSV)**: Required. Export from Meroshare > My Purchase Source.
    *   **History (CSV)**: Required. Export from Meroshare > Transaction History.
    *   **Holdings (JSON)**: Optional. Use if you want to override calculated holdings with a specific Meroshare JSON export.
3.  Click **"Compute Portfolio"**.

### 2. The Dashboard
Once analyzed, you are presented with the main dashboard:
*   **Summary Cards**: Top-level metrics for Net Capital, Market Value, and Overall Performance (Green/Red indicators).
*   **My Portfolio Table**: List of all your stocks.
    *   *Badge*: A "REMOTE_SYNC" or "JSON Source" badge indicates where the data came from.
*   **Asset Distribution**: A breakdown of your top 10 assets by value.
    *   *Legend*: Shows the exact value and percentage allocation of each asset.
*   **Historical Cash Dividend**: A bar chart showing your dividend income trend over the years.
*   **Cash Dividend Breakdown**: A quick summary table of total dividends per stock.

### 3. Detailed Dividend View
1.  Scroll to the "Cash Dividend Breakdown" section.
2.  Click the **"View Full History"** button.
3.  **Search**: Use the search bar to filter by Script (e.g., type "NABIL").
4.  **Sort**: Click any column header (Date, Scrip, Amount, etc.) to sort the data Ascending or Descending.
5.  **Total**: View the "Total Cash Dividend Received" summary card, which updates based on your current search/filter.

### 4. Data Management
*   **Persistence**: Your data is saved to your browser's `localStorage`. If you close the tab and return later, your portfolio will reload instantly (refreshing live prices automatically).
*   **Clear Data**: To analyze a different portfolio or reset the app, click the **"Flush Session"** button in the top right corner.

## Technical Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS (Custom Dark Theme)
*   **Visualization**: Recharts
*   **State/Storage**: React Hooks, LocalStorage
*   **Data Parsing**: PapaParse (CSV), Axios (HTTP)
*   **Icons**: Lucide React
*   **Deployment**: GitHub Pages

---
*Generated for Portfolio Analyzer v1.0*
