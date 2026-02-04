# Portfolio Analyzer - Comprehensive Documentation

## 🌟 Overview
The **Portfolio Analyzer** is a powerful, privacy-focused web application designed for Nepali stock market (NEPSE) investors. It transforms raw data exported from **Meroshare** into a rich, interactive dashboard featuring live valuations, deep dividend analytics, and asset allocation insights.

The app uses a **client-side first** approach, ensuring that your sensitive financial data stays in your browser's local storage and is never stored on a permanent server.

---

## 🚀 Key Features

### 1. Advanced Dashboard
*   **Executive Summary**: Instant visibility into your **Net Capital**, **Market Value**, and overall **Profit/Loss**.
*   **Asset Allocation**: A dedicated donut chart showing your portfolio concentration by scrip.
*   **Sector Distribution**: Visualize your exposure across different market sectors (Banking, Hydro, Finance, etc.).
*   **Live Indicators**: A visual "Blinking" status indicator showing when your prices were last synced with the market.

### 2. Deep Portfolio Analytics
*   **Real-time Valuation**: Automatically fetches the latest **Last Traded Prices (LTP)** to show your current portfolio value.
*   **Smart Search**: Instantly filter your holdings by scrip name or sector.
*   **Advanced Sorting**: Sort your portfolio by any metric—Value, Units, WACC, or P/L %.
*   **Profit/Loss Tracking**: Visual color-coding (Green/Red) and percentage/absolute values for every holding.

### 3. Lifetime Dividend Engine
*   **Cash Dividend Tracking**: Automatically reconstructs your entire history of cash dividends received from your transaction logs.
*   **Growth Visualization**: Bar charts showing your dividend income trends over the years.
*   **Full History Search**: A dedicated view to search, filter, and sort every single dividend payment you've ever received.
*   **Automatic Reconciliation**: Matches historical holdings with current units to ensure accuracy.

### 4. Global Theme & Personalization
*   **Dual Modes**: Seamlessly switch between a premium **Dark Mode** (OLED optimized) and a crisp **Light Mode**.
*   **Persistence**: Your theme choice is saved in your browser and applied automatically every time you return.

---

## 🛠️ How It Works (The Data Flow)

### Step 1: Data Ingestion
You provide two key files exported from Meroshare:
1.  **WACC Report (CSV)**: Used for your purchase prices.
2.  **Transaction History (CSV)**: Used to calculate dividends and verify current holding units.

### Step 2: Analysis (The "Brain")
The app processes these files in two ways:
*   **Local Processing**: Immediate extraction of scrips and units for the dashboard.
*   **Deep Analysis (Webhook)**: The app sends the CSV data to a secure **Analysis Webhook**. This "Brain" performs the complex math required to calculate historical dividends and reconcile your trade history.

### Step 3: Live Market Sync
The app connects to a live market data feed to fetch the latest LTP for all NEPSE scrips. This data is combined with your holding units to calculate your **Real-time Market Value**.

### Step 4: Storage & Privacy
*   **Zero Database**: We do not store your data on our servers.
*   **LocalStorage**: Highly optimized JSON versions of your portfolio and the raw CSV strings are stored in your browser's `localStorage`.
*   **Encryption of Intent**: Everything happens in your browser session. Clearing your browser data "factory resets" the app.

---

## ⚙️ Settings & Data Management

The **Settings** page is the control center of the app, organized for clarity:

### 📥 Import Data
-   **Import Data from Meroshare**: Upload fresh WACC and History files to update your entire portfolio.

### ⚡ Quick Actions
-   **Reanalyse Portfolio**: A powerful feature that allows you to re-run the deep analysis using the **cached CSVs** in your browser. No need to look for your files again.
-   **Sync Live Prices**: Manually trigger a refresh of the latest market prices.

### 🎨 Appearance
-   **Theme Toggle**: Switch between Light and Dark modes.

### 🛡️ Privacy & Terms
-   **Privacy Policy**: Transparent details on how your local data is handled.
-   **Danger Zone**: A one-click "Clear Application Data" button to wipe everything from the browser.

---

## 💻 Tech Stack
-   **Frontend**: React 18, TypeScript, Vite.
-   **Styling**: Vanilla CSS + Tailwind CSS (V4).
-   **State Management**: React Context API (Portfolio & Theme).
-   **Charts**: Recharts (Responsive & Interactive).
-   **Icons**: Lucide-React.
-   **API**: Axios for async data fetching.

---

## 📘 Quick Start Guide
1.  Export **WACC Report** and **Transaction History** as CSV from Meroshare.
2.  Open the App and go to **Settings > Import Data from Meroshare**.
3.  Upload your files.
4.  Wait for the "Analysing..." process to finish.
5.  Head to the **Home** tab to see your new financial dashboard!

---
*Documentation updated: February 4, 2026*
