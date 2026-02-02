# Portfolio Analyzer Application Documentation

## Overview

The **Portfolio Analyzer** is a secure, client-side focused web application designed to provide comprehensive insights into your Nepal Stock Exchange (NEPSE) portfolio. It acts as a bridge between your raw financial data (Meroshare exports) and actionable intelligence, combining detailed backend analysis with real-time market valuations.

The application features a modern, mobile-first design with a dark, terminal-inspired aesthetic ("Gemini Theme"), ensuring a professional experience across all devices.

## Key Features

*   **Mobile-First Design**: Optimized for smartphones with a bottom navigation bar, while offering a responsive sidebar/layout for desktops.
*   **Dual-Source Intelligence**:
    *   **Dividend Engine**: Uses a secure webhook to process transaction history and calculate lifetime dividend income.
    *   **Live Valuation**: Fetches real-time Last Traded Prices (LTP) to calculate your portfolio's current market value.
*   **Privacy-First**: Sensitive data is processed securely. Results are persisted locally in your browser (`localStorage`) for quick access but are not stored permanently on the server.
*   **Deep Analytics**:
    *   **Asset Allocation**: Interactive pie chart with detailed breakdown of your top holdings.
    *   **Performance Tracking**: Instant view of Investment vs. Current Value vs. Profit/Loss.
    *   **Dividend History**: Comprehensive searchable and sortable database of every cash dividend received.

## System Architecture

The application operates on a **Hybrid Data Model**:

1.  **Frontend (React + Vite)**: Handles the user interface, file parsing, state management, and real-time math.
2.  **Analysis Backend (n8n Webhook)**: A dedicated microservice that parses complex CSV transaction logs to reconstruct dividend history and validate holdings.
3.  **Market Feed (External JSON)**: A maintained data source providing the latest stock prices.

### Data Flow

1.  **Input**: User uploads `WACC Report.csv`, `Transaction History.csv`, and optionally `Holdings.json` via the **Import** tab.
2.  **Processing**:
    *   Files are parsed locally for immediate feedback.
    *   CSVs are sent to the n8n webhook for deep historical analysis.
3.  **Live Sync**: The app fetches live stock prices (LTP) from the external feed.
4.  **Synthesis**:
    *   **Holdings**: Derived from Webhook data (primary) or local files (fallback).
    *   **Valuation**: `Holdings * Live LTP`.
    *   **Dividends**: From Webhook analysis.

## Application Structure

The app is organized into four main tabs for easy navigation:

### 1. Home
*   **Executive Summary**: Three key cards showing **Net Capital** (Total Investment), **Market Value**, and **Performance** (Profit/Loss).
*   **Status Indicators**: Shows live market sync status.
*   **Call to Action**: Prompts users to import data if the portfolio is empty or stale.

### 2. Portfolio
*   **Asset Distribution**: A pie chart visualizing your top 10 holdings by value, complete with a detailed legend showing exact amounts and percentage allocation.
*   **My Portfolio Table**: A comprehensive, sortable table of all your assets.
    *   **Columns**: Asset, Units, WACC, LTP, Valuation, and P/L %.
    *   **Sorting**: Click any column header to sort Ascending/Descending.

### 3. Dividends
*   **Historical Chart**: A bar chart visualizing your cash dividend income trend year over year.
*   **Breakdown Summary**: A quick table of total dividends received per scrip.
*   **Detailed History**: A dedicated sub-view (accessible via "View Full History") that offers:
    *   **Search**: Filter dividends by company name.
    *   **Sorting**: Sort by Date, Scrip, Holdings, Cash %, or Amount.
    *   **Dynamic Totals**: Shows the total cash received based on your current filter.

### 4. Import
*   **File Management**: Dedicated interface for uploading your Meroshare files.
*   **Reset**: Option to "Flush Session" and clear all local data.

## Data Logic & Priority

To ensure the highest accuracy, the app uses a strict priority system for determining your current holdings:

1.  **Webhook Analysis (Highest Priority)**: If the backend analysis successfully reconstructs your current portfolio from the transaction logs, this data is used.
2.  **JSON Export (Secondary)**: If you upload a `Holdings.json` file from Meroshare, it overrides local CSV parsing.
3.  **WACC Report (Fallback)**: If no other source is available, holdings are estimated from the WACC report.

## Technical Stack

*   **Core**: React 18, TypeScript, Vite
*   **UI/Styling**: Tailwind CSS (Custom "Gemini" Dark Theme)
*   **Charts**: Recharts
*   **Data Handling**: PapaParse (CSV), Axios (HTTP)
*   **Icons**: Lucide React
*   **Deployment**: GitHub Pages (Automated via CI/CD)

---
*Documentation for Portfolio Analyzer v2.0*