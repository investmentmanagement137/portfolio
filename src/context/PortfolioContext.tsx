import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import type { PortfolioContextValue, PortfolioState, Holding, WebhookHolding } from '../types';

const WEBHOOK_URL = 'https://n8np.puribijay.com.np/webhook/51bef67d-e017-4fc8-92ca-896d8b6c329aa';
const LTP_URL = 'https://raw.githubusercontent.com/investmentmanagement137/jsons/main/recentltp.json';

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};

// Add this interface locally if not in types
// interface FundamentalMap { [key: string]: any } // Removed unused

const FUNDAMENTALS_URL = 'https://investmentmanagement137.github.io/jsons/fundamentals.json';

interface PortfolioProviderProps {
    children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
    const [state, setState] = useState<PortfolioState>({
        holdings: [],
        dividendSummary: [],
        dividendDetails: [],
        activeDividends: [],
        portfolioSummary: { investment: 0, value: 0, pl: 0, plPercent: 0, dailyGain: 0, activeDividendTotal: 0, scripCount: 0, plWithCashflow: 0, plWithCashflowPercent: 0 },
        ltpData: {},
        dailyChanges: {},
        nepseData: null,
        loading: false,
        error: null,
        lastUpdated: null,
        rawAnalysisData: null,
        tradingHistory: null,
        transactionHistory: null,
        brokerNo: null,
        plViewMode: 'unadjusted',
        preferredDataSource: 'ask', // Default
        fundamentalAnalysis: undefined,
    });

    const [fundamentalsMap, setFundamentalsMap] = useState<Record<string, any>>({});

    const [waccRawData, setWaccRawData] = useState<any[]>([]);
    const [holdingsRawData, setHoldingsRawData] = useState<any[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        try {
            const storedAnalysis = localStorage.getItem('portfolioAnalysis');
            const storedWacc = localStorage.getItem('portfolioWaccRaw');
            const storedHoldings = localStorage.getItem('portfolioHoldingsRaw');
            const storedLastUpdated = localStorage.getItem('portfolioLastUpdated');
            const storedBrokerNo = localStorage.getItem('portfolioBrokerNo');
            const storedTradingHistory = localStorage.getItem('portfolioTradingHistory');
            const storedDataSource = localStorage.getItem('portfolioPreferredDataSource');
            const storedLtpData = localStorage.getItem('portfolioLtpData');
            const storedDailyChanges = localStorage.getItem('portfolioDailyChanges');
            const storedNepseData = localStorage.getItem('portfolioNepseData');
            const storedFundamentals = localStorage.getItem('portfolioFundamentals');

            if (storedAnalysis) {
                const data = JSON.parse(storedAnalysis);
                setState(prev => ({ ...prev, rawAnalysisData: data }));
            }
            if (storedTradingHistory) {
                setState(prev => ({ ...prev, tradingHistory: JSON.parse(storedTradingHistory) }));
            }
            if (storedWacc) setWaccRawData(JSON.parse(storedWacc));
            if (storedHoldings) setHoldingsRawData(JSON.parse(storedHoldings));
            if (storedLastUpdated) setState(prev => ({ ...prev, lastUpdated: new Date(storedLastUpdated) }));
            if (storedBrokerNo) setState(prev => ({ ...prev, brokerNo: parseInt(storedBrokerNo) }));
            if (storedBrokerNo) setState(prev => ({ ...prev, brokerNo: parseInt(storedBrokerNo) }));
            const storedPlViewMode = localStorage.getItem('portfolioPlViewMode');
            if (storedPlViewMode === 'unadjusted' || storedPlViewMode === 'adjusted') {
                setState(prev => ({ ...prev, plViewMode: storedPlViewMode }));
            }
            if (storedDataSource) {
                setState(prev => ({ ...prev, preferredDataSource: storedDataSource as any }));
            }
            if (storedLtpData) setState(prev => ({ ...prev, ltpData: JSON.parse(storedLtpData) }));
            if (storedDailyChanges) setState(prev => ({ ...prev, dailyChanges: JSON.parse(storedDailyChanges) }));
            if (storedNepseData) setState(prev => ({ ...prev, nepseData: JSON.parse(storedNepseData) }));
            if (storedFundamentals) setFundamentalsMap(JSON.parse(storedFundamentals));
        } catch (e) {
            console.error("Failed to load local storage data", e);
        }
    }, []);

    const refreshLtp = useCallback(async () => {
        if (!navigator.onLine) {
            console.log("Offline: Skipping LTP refresh, using cached data.");
            return;
        }
        setState(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.get(LTP_URL);
            const map: Record<string, number> = {};
            const changesMap: Record<string, number> = {};
            const data = res.data["all recent price"] || [];

            let nepseEntry: any = null;
            data.forEach((item: any) => {
                if (item.Script === "NEPSE Index") {
                    nepseEntry = item;
                }
                const price = typeof item.Price === 'string'
                    ? parseFloat(item.Price.replace(/,/g, ''))
                    : item.Price;

                const prevClose = typeof item["previous close"] === 'string'
                    ? parseFloat(item["previous close"].replace(/,/g, ''))
                    : (typeof item["previous close"] === 'number' ? item["previous close"] : null);

                let change = 0;
                if (!isNaN(price) && prevClose !== null && prevClose > 0) {
                    change = price - prevClose;
                } else {
                    change = typeof item["change in value"] === 'number' ? item["change in value"] : 0;
                }

                map[item.Script] = isNaN(price) ? 0 : price;
                changesMap[item.Script] = change;
            });
            setState(prev => ({ ...prev, ltpData: map, dailyChanges: changesMap, nepseData: nepseEntry, loading: false }));

            // Persist to local storage
            localStorage.setItem('portfolioLtpData', JSON.stringify(map));
            localStorage.setItem('portfolioDailyChanges', JSON.stringify(changesMap));
            if (nepseEntry) localStorage.setItem('portfolioNepseData', JSON.stringify(nepseEntry));
        } catch (error) {
            console.error("Failed to fetch LTP", error);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const fetchFundamentals = useCallback(async () => {
        if (!navigator.onLine) {
            console.log("Offline: Skipping fundamentals fetch, using cached data.");
            return;
        }
        try {
            const res = await axios.get(FUNDAMENTALS_URL);
            // Actual JSON has root key "Fundamental ratios"
            const data = res.data["Fundamental ratios"] || (Array.isArray(res.data) ? res.data : []);
            const map: Record<string, any> = {};
            data.forEach((item: any) => {
                // Keys are lowercase in JSON
                const sym = item.symbol || item.Symbol;
                if (sym) {
                    map[sym] = item;
                }
            });
            setFundamentalsMap(map);
            localStorage.setItem('portfolioFundamentals', JSON.stringify(map));
        } catch (error) {
            console.error("Failed to fetch Fundamentals", error);
        }
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        refreshLtp();
        fetchFundamentals();
    }, [refreshLtp, fetchFundamentals]);

    // Recalculate Holdings when data changes
    useEffect(() => {
        if (Object.keys(state.ltpData).length === 0) return;

        let calculatedHoldings: Holding[] = [];
        let totalInv = 0;
        let totalVal = 0;

        // Helper to find data by key in any index of the rawAnalysisData array
        const findDataByKey = (key: string) => {
            if (!state.rawAnalysisData || !Array.isArray(state.rawAnalysisData)) return null;
            for (const item of state.rawAnalysisData) {
                if (item && item[key]) return item[key];
            }
            return null;
        };

        const activeDividendsRaw = findDataByKey("current holdings in dividents") || [];
        const activeDividends = activeDividendsRaw.map((item: any) => ({
            ...item,
            Holdings: item.Holdings || item["Eligible Holdings"] || 0
        }));

        const dividendMap: Record<string, number> = {};
        activeDividends.forEach((d: any) => {
            if (d.Scrip) {
                dividendMap[d.Scrip] = (dividendMap[d.Scrip] || 0) + (d["Dividend Amount"] || 0);
            }
        });

        const webhookHoldings = findDataByKey("current holdings in meroshare");

        if (webhookHoldings && Array.isArray(webhookHoldings)) {
            webhookHoldings.forEach((item: WebhookHolding) => {
                const scrip = item.Scrip;
                const companyName = item["Company Name"] || scrip;
                const qty = item["Current Balance"];
                const wacc = item.WACC;
                const sector = item.Sector || "Unknown";
                const ltp = state.ltpData[scrip] || item.LTP || 0;
                const investment = item["Total Investment"] || (qty * wacc);
                const currentValue = qty * ltp;
                const pl = currentValue - investment;
                const cashDividends = dividendMap[scrip] || 0;
                const plWithCashflow = pl + cashDividends;

                totalInv += investment;
                totalVal += currentValue;

                calculatedHoldings.push({
                    scrip,
                    companyName,
                    sector,
                    quantity: qty,
                    wacc,
                    investment,
                    ltp,
                    currentValue,
                    pl,
                    plPercent: investment > 0 ? (pl / investment) * 100 : 0,
                    plWithCashflow,
                    plWithCashflowPercent: investment > 0 ? (plWithCashflow / investment) * 100 : 0
                });
            });
        }
        else if (holdingsRawData.length > 0) {
            const list = Array.isArray(holdingsRawData) ? holdingsRawData :
                (holdingsRawData as any).meroShareMyPortfolio || [];

            list.forEach((item: any) => {
                const scrip = item.script || item.scrip || item.symbol;
                const companyName = item.companyName || scrip;
                const qty = parseFloat(item.currentBalance || item.balance || item.quantity);
                const wacc = parseFloat(item.wacc || item.cost || item.purchasePrice || 0);
                const sector = item.sector || "Unknown";

                if (scrip && !isNaN(qty) && qty > 0) {
                    const ltp = state.ltpData[scrip] || parseFloat(item.lastTransactionPrice) || 0;
                    const investment = qty * wacc;
                    const currentValue = qty * ltp;
                    const pl = currentValue - investment;
                    const cashDividends = dividendMap[scrip] || 0;
                    const plWithCashflow = pl + cashDividends;

                    totalInv += investment;
                    totalVal += currentValue;

                    calculatedHoldings.push({
                        scrip,
                        companyName,
                        sector,
                        quantity: qty,
                        wacc,
                        investment,
                        ltp,
                        currentValue,
                        pl,
                        plPercent: investment > 0 ? (pl / investment) * 100 : 0,
                        plWithCashflow,
                        plWithCashflowPercent: investment > 0 ? (plWithCashflow / investment) * 100 : 0
                    });
                }
            });
        } else if (waccRawData.length > 0) {
            waccRawData.forEach((row: any) => {
                const scrip = row["Scrip Name"];
                const companyName = row["Company Name"] || scrip;
                const qty = parseFloat(row["WACC Calculated Quantity"]);
                const wacc = parseFloat(row["WACC Rate"]);
                const sector = row["Sector"] || "Unknown";

                if (scrip && !isNaN(qty) && !isNaN(wacc) && qty > 0) {
                    const ltp = state.ltpData[scrip] || 0;
                    const investment = qty * wacc;
                    const currentValue = qty * ltp;
                    const pl = currentValue - investment;
                    const cashDividends = dividendMap[scrip] || 0;
                    const plWithCashflow = pl + cashDividends;

                    totalInv += investment;
                    totalVal += currentValue;

                    calculatedHoldings.push({
                        scrip,
                        companyName,
                        sector,
                        quantity: qty,
                        wacc,
                        investment,
                        ltp,
                        currentValue,
                        pl,
                        plPercent: investment > 0 ? (pl / investment) * 100 : 0,
                        plWithCashflow,
                        plWithCashflowPercent: investment > 0 ? (plWithCashflow / investment) * 100 : 0
                    });
                }
            });
        }

        calculatedHoldings.sort((a, b) => b.currentValue - a.currentValue);

        const dividendSummary = findDataByKey("Divident Summary") || [];
        const dividendDetails = findDataByKey("Divident Calculation") || [];
        const tradingHistory = findDataByKey("tradingHistory") || state.tradingHistory;
        const transactionHistory = findDataByKey("reconciled transaction history");

        // activeDividends already calculated above
        const activeDividendTotal = activeDividends.reduce((sum: number, item: any) => sum + (item["Dividend Amount"] || 0), 0);

        // Calculate Daily Gain
        const dailyGain = calculatedHoldings.reduce((sum, h) => {
            const change = state.dailyChanges[h.scrip] || 0;
            return sum + (change * h.quantity);
        }, 0);

        // Initialize fundamental aggregators
        let totalValueForPE = 0;
        let totalEarnings = 0;
        let totalInvestmentForPE = 0;

        let totalValueForPB = 0;
        let totalBookValue = 0;
        let totalInvestmentForPB = 0;

        calculatedHoldings.forEach(h => {
            // ... existing logic ...
            const fun = fundamentalsMap[h.scrip];
            if (fun) {
                // Try to resolve EPS (lowercase keys in actual JSON)
                let eps = typeof fun["eps"] === 'number' ? fun["eps"] :
                    typeof fun["Earnings Per Share"] === 'number' ? fun["Earnings Per Share"] : null;

                // Try to resolve BV (lowercase keys in actual JSON)
                let bv = typeof fun["book value"] === 'number' ? fun["book value"] :
                    typeof fun["book value"] === 'string' ? fun["book value"] : // The JSON has "book value": "171" (string)
                        typeof fun["Book Value"] === 'number' ? fun["Book Value"] : null;

                // Clean logic: string parsing if needed
                if (typeof eps === 'string') eps = parseFloat((eps as string).replace(/,/g, ''));
                if (typeof bv === 'string') bv = parseFloat((bv as string).replace(/,/g, ''));

                // PE Calculation Accumulation
                if (eps !== null && !isNaN(eps) && eps !== 0) {
                    totalValueForPE += h.currentValue;
                    totalInvestmentForPE += h.investment;
                    totalEarnings += (h.quantity * eps);
                }

                // PB Calculation Accumulation
                if (bv !== null && !isNaN(bv) && bv !== 0) {
                    totalValueForPB += h.currentValue;
                    totalInvestmentForPB += h.investment;
                    totalBookValue += (h.quantity * bv);
                }
            }
        });

        const weightedPE = totalEarnings !== 0 ? totalValueForPE / totalEarnings : 0;
        const weightedPE_WACC = totalEarnings !== 0 ? totalInvestmentForPE / totalEarnings : 0;

        const weightedPB = totalBookValue !== 0 ? totalValueForPB / totalBookValue : 0;
        const weightedPB_WACC = totalBookValue !== 0 ? totalInvestmentForPB / totalBookValue : 0;

        const fundamentalAnalysis = {
            weightedPE,
            weightedPB,
            weightedPE_WACC,
            weightedPB_WACC,
            peDetails: { totalValue: totalValueForPE, totalInvestment: totalInvestmentForPE, totalEarnings },
            pbDetails: { totalValue: totalValueForPB, totalInvestment: totalInvestmentForPB, totalBookValue }
        };

        setState(prev => ({
            ...prev,
            holdings: calculatedHoldings,
            dividendSummary,
            dividendDetails,
            activeDividends,
            tradingHistory,
            transactionHistory,
            portfolioSummary: {
                investment: totalInv,
                value: totalVal,
                pl: totalVal - totalInv,
                plPercent: totalInv > 0 ? ((totalVal - totalInv) / totalInv) * 100 : 0,
                dailyGain: dailyGain,
                activeDividendTotal,
                scripCount: calculatedHoldings.length,
                plWithCashflow: (totalVal - totalInv) + activeDividendTotal,
                plWithCashflowPercent: totalInv > 0 ? (((totalVal - totalInv) + activeDividendTotal) / totalInv) * 100 : 0
            },
            fundamentalAnalysis
        }));

    }, [state.rawAnalysisData, state.ltpData, waccRawData, holdingsRawData, fundamentalsMap]);


    const uploadData = async (waccFile: File, historyFile: File, holdingsFile?: File, tradeBookFile?: File) => {
        if (!navigator.onLine) {
            setState(prev => ({ ...prev, error: "You are offline. Cannot analyze portfolio." }));
            throw new Error("You are offline. Cannot analyze portfolio.");
        }
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            Papa.parse(waccFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setWaccRawData(results.data);
                    localStorage.setItem('portfolioWaccRaw', JSON.stringify(results.data));
                }
            });

            if (holdingsFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target?.result as string);
                        setHoldingsRawData(json);
                        localStorage.setItem('portfolioHoldingsRaw', JSON.stringify(json));
                    } catch (err) { console.error("Invalid JSON file"); }
                };
                reader.readAsText(holdingsFile);
            }

            // Save raw CSVs for re-analysis
            const waccReader = new FileReader();
            waccReader.onload = (e) => {
                if (e.target?.result) localStorage.setItem('portfolioWaccCSV', e.target.result as string);
            };
            waccReader.readAsText(waccFile);

            const historyReader = new FileReader();
            historyReader.onload = (e) => {
                if (e.target?.result) localStorage.setItem('portfolioHistoryCSV', e.target.result as string);
            };
            historyReader.readAsText(historyFile);

            const formData = new FormData();
            formData.append('wacc_report', waccFile);
            formData.append('transaction_history', historyFile);
            if (tradeBookFile) {
                formData.append('trade_book_details', tradeBookFile);
            }

            const response = await axios.post(WEBHOOK_URL, formData);
            // Handle both legacy array response and new object response with tradingHistory
            let result = [];
            let tradingHistory = null;

            if (response.data) {
                const data = response.data;
                // If it's an array of 1 object, use that object as the root for extraction
                const root = Array.isArray(data) && data.length === 1 ? data[0] : data;

                if (!Array.isArray(root)) {
                    // It's a single object (unified response)
                    result = Array.isArray(data) ? data : [data];
                    tradingHistory = root.tradingHistory || null;
                } else {
                    // It's a standard multi-object array
                    result = data;
                }
            }

            localStorage.setItem('portfolioAnalysis', JSON.stringify(result));
            if (tradingHistory) {
                localStorage.setItem('portfolioTradingHistory', JSON.stringify(tradingHistory));
            }
            localStorage.setItem('portfolioLastUpdated', new Date().toISOString());

            setState(prev => ({
                ...prev,
                rawAnalysisData: result,
                tradingHistory: tradingHistory || prev.tradingHistory,
                lastUpdated: new Date(),
                loading: false
            }));

        } catch (err) {
            console.error(err);
            setState(prev => ({ ...prev, loading: false, error: "Failed to analyze portfolio. Please try again." }));
            throw err;
        }
    };

    const reanalysePortfolio = async () => {
        const waccCsv = localStorage.getItem('portfolioWaccCSV');
        const historyCsv = localStorage.getItem('portfolioHistoryCSV');

        if (!waccCsv || !historyCsv) {
            throw new Error("No cached data found. Please import your portfolio again to enable re-analysis.");
        }

        const waccFile = new File([waccCsv], "wacc.csv", { type: "text/csv" });
        const historyFile = new File([historyCsv], "history.csv", { type: "text/csv" });

        await uploadData(waccFile, historyFile);
    };

    const updateBrokerNo = (no: number | null) => {
        if (no === null) {
            localStorage.removeItem('portfolioBrokerNo');
        } else {
            localStorage.setItem('portfolioBrokerNo', no.toString());
        }
        setState(prev => ({ ...prev, brokerNo: no }));
    };

    const updatePlViewMode = (mode: 'unadjusted' | 'adjusted') => {
        localStorage.setItem('portfolioPlViewMode', mode);
        setState(prev => ({ ...prev, plViewMode: mode }));
    };

    const updatePreferredDataSource = (source: 'ask' | 'merolagani' | 'sharesansar' | 'nepsealpha' | 'nepalipaisa' | 'moneymitra') => {
        localStorage.setItem('portfolioPreferredDataSource', source);
        setState(prev => ({ ...prev, preferredDataSource: source }));
    };

    const clearData = () => {
        localStorage.removeItem('portfolioAnalysis');
        localStorage.removeItem('portfolioWaccRaw');
        localStorage.removeItem('portfolioHoldingsRaw');
        localStorage.removeItem('portfolioLastUpdated');
        localStorage.removeItem('portfolioWaccCSV');
        localStorage.removeItem('portfolioHistoryCSV');
        localStorage.removeItem('portfolioPreferredDataSource');
        localStorage.removeItem('portfolioLtpData');
        localStorage.removeItem('portfolioDailyChanges');
        localStorage.removeItem('portfolioNepseData');
        localStorage.removeItem('portfolioFundamentals');

        setState({
            holdings: [],
            dividendSummary: [],
            dividendDetails: [],
            activeDividends: [],
            portfolioSummary: { investment: 0, value: 0, pl: 0, plPercent: 0, dailyGain: 0, activeDividendTotal: 0, scripCount: 0, plWithCashflow: 0, plWithCashflowPercent: 0 },
            ltpData: state.ltpData,
            dailyChanges: state.dailyChanges,
            nepseData: state.nepseData,
            loading: false,
            error: null,
            lastUpdated: null,
            rawAnalysisData: null,
            tradingHistory: null,
            transactionHistory: null,
            brokerNo: null,
            plViewMode: 'unadjusted',
            preferredDataSource: 'ask',
        });
        setWaccRawData([]);
        setHoldingsRawData([]);
    };

    return (
        <PortfolioContext.Provider value={{ state, actions: { uploadData, reanalysePortfolio, clearData, refreshLtp, updateBrokerNo, updatePlViewMode, updatePreferredDataSource } }}>
            {children}
        </PortfolioContext.Provider>
    );
};
