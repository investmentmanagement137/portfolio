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

interface PortfolioProviderProps {
    children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
    const [state, setState] = useState<PortfolioState>({
        holdings: [],
        dividendSummary: [],
        dividendDetails: [],
        activeDividends: [],
        portfolioSummary: { investment: 0, value: 0, pl: 0, plPercent: 0, activeDividendTotal: 0, scripCount: 0, plWithCashflow: 0, plWithCashflowPercent: 0 },
        ltpData: {},
        loading: false,
        error: null,
        lastUpdated: null,
        rawAnalysisData: null,
    });

    const [waccRawData, setWaccRawData] = useState<any[]>([]);
    const [holdingsRawData, setHoldingsRawData] = useState<any[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        try {
            const storedAnalysis = localStorage.getItem('portfolioAnalysis');
            const storedWacc = localStorage.getItem('portfolioWaccRaw');
            const storedHoldings = localStorage.getItem('portfolioHoldingsRaw');
            const storedLastUpdated = localStorage.getItem('portfolioLastUpdated');

            if (storedAnalysis) {
                const data = JSON.parse(storedAnalysis);
                setState(prev => ({ ...prev, rawAnalysisData: data }));
            }
            if (storedWacc) setWaccRawData(JSON.parse(storedWacc));
            if (storedHoldings) setHoldingsRawData(JSON.parse(storedHoldings));
            if (storedLastUpdated) setState(prev => ({ ...prev, lastUpdated: new Date(storedLastUpdated) }));
        } catch (e) {
            console.error("Failed to load local storage data", e);
        }
    }, []);

    const refreshLtp = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.get(LTP_URL);
            const map: Record<string, number> = {};
            const data = res.data["all recent price"] || [];

            data.forEach((item: any) => {
                const price = typeof item.Price === 'string'
                    ? parseFloat(item.Price.replace(/,/g, ''))
                    : item.Price;
                map[item.Script] = isNaN(price) ? 0 : price;
            });
            setState(prev => ({ ...prev, ltpData: map, loading: false }));
        } catch (error) {
            console.error("Failed to fetch LTP", error);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    // Initial LTP Fetch
    useEffect(() => {
        refreshLtp();
    }, [refreshLtp]);

    // Recalculate Holdings when data changes
    useEffect(() => {
        if (Object.keys(state.ltpData).length === 0) return;

        let calculatedHoldings: Holding[] = [];
        let totalInv = 0;
        let totalVal = 0;

        const webhookHoldings = state.rawAnalysisData?.[3]?.["current holdings in meroshare"];

        if (webhookHoldings && Array.isArray(webhookHoldings)) {
            webhookHoldings.forEach((item: WebhookHolding) => {
                const scrip = item.Scrip;
                const qty = item["Current Balance"];
                const wacc = item.WACC;
                const sector = item.Sector || "Unknown";
                const ltp = state.ltpData[scrip] || item.LTP || 0;
                const investment = item["Total Investment"] || (qty * wacc);
                const currentValue = qty * ltp;

                totalInv += investment;
                totalVal += currentValue;

                calculatedHoldings.push({
                    scrip,
                    sector,
                    quantity: qty,
                    wacc,
                    investment,
                    ltp,
                    currentValue,
                    pl: currentValue - investment,
                    plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
                });
            });
        }
        else if (holdingsRawData.length > 0) {
            const list = Array.isArray(holdingsRawData) ? holdingsRawData :
                (holdingsRawData as any).meroShareMyPortfolio || [];

            list.forEach((item: any) => {
                const scrip = item.script || item.scrip || item.symbol;
                const qty = parseFloat(item.currentBalance || item.balance || item.quantity);
                const wacc = parseFloat(item.wacc || item.cost || item.purchasePrice || 0);
                const sector = item.sector || "Unknown";

                if (scrip && !isNaN(qty) && qty > 0) {
                    const ltp = state.ltpData[scrip] || parseFloat(item.lastTransactionPrice) || 0;
                    const investment = qty * wacc;
                    const currentValue = qty * ltp;

                    totalInv += investment;
                    totalVal += currentValue;

                    calculatedHoldings.push({
                        scrip,
                        sector,
                        quantity: qty,
                        wacc,
                        investment,
                        ltp,
                        currentValue,
                        pl: currentValue - investment,
                        plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
                    });
                }
            });
        } else if (waccRawData.length > 0) {
            waccRawData.forEach((row: any) => {
                const scrip = row["Scrip Name"];
                const qty = parseFloat(row["WACC Calculated Quantity"]);
                const wacc = parseFloat(row["WACC Rate"]);
                const sector = row["Sector"] || "Unknown";

                if (scrip && !isNaN(qty) && !isNaN(wacc) && qty > 0) {
                    const ltp = state.ltpData[scrip] || 0;
                    const investment = qty * wacc;
                    const currentValue = qty * ltp;

                    totalInv += investment;
                    totalVal += currentValue;

                    calculatedHoldings.push({
                        scrip,
                        sector,
                        quantity: qty,
                        wacc,
                        investment,
                        ltp,
                        currentValue,
                        pl: currentValue - investment,
                        plPercent: investment > 0 ? ((currentValue - investment) / investment) * 100 : 0
                    });
                }
            });
        }

        calculatedHoldings.sort((a, b) => b.currentValue - a.currentValue);

        const dividendSummary = state.rawAnalysisData?.[0]?.["Divident Summary"] || [];
        const dividendDetails = state.rawAnalysisData?.[1]?.["Divident Calculation"] || [];
        const activeDividendsRaw = state.rawAnalysisData?.[4]?.["current holdings in dividents"] || [];

        const activeDividends = activeDividendsRaw.map((item: any) => ({
            ...item,
            Holdings: item.Holdings || item["Eligible Holdings"] || 0
        }));

        const activeDividendTotal = activeDividends.reduce((sum: number, item: any) => sum + (item["Dividend Amount"] || 0), 0);

        setState(prev => ({
            ...prev,
            holdings: calculatedHoldings,
            dividendSummary,
            dividendDetails,
            activeDividends,
            portfolioSummary: {
                investment: totalInv,
                value: totalVal,
                pl: totalVal - totalInv,
                plPercent: totalInv > 0 ? ((totalVal - totalInv) / totalInv) * 100 : 0,
                activeDividendTotal,
                scripCount: calculatedHoldings.length,
                plWithCashflow: (totalVal - totalInv) + activeDividendTotal,
                plWithCashflowPercent: totalInv > 0 ? (((totalVal - totalInv) + activeDividendTotal) / totalInv) * 100 : 0
            }
        }));

    }, [state.rawAnalysisData, state.ltpData, waccRawData, holdingsRawData]);


    const uploadData = async (waccFile: File, historyFile: File, holdingsFile?: File) => {
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

            const response = await axios.post(WEBHOOK_URL, formData);
            const result = Array.isArray(response.data) ? response.data : [response.data];

            localStorage.setItem('portfolioAnalysis', JSON.stringify(result));
            localStorage.setItem('portfolioLastUpdated', new Date().toISOString());

            setState(prev => ({
                ...prev,
                rawAnalysisData: result,
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

    const clearData = () => {
        localStorage.removeItem('portfolioAnalysis');
        localStorage.removeItem('portfolioWaccRaw');
        localStorage.removeItem('portfolioHoldingsRaw');
        localStorage.removeItem('portfolioLastUpdated');
        localStorage.removeItem('portfolioWaccCSV');
        localStorage.removeItem('portfolioHistoryCSV');

        setState({
            holdings: [],
            dividendSummary: [],
            dividendDetails: [],
            activeDividends: [],
            portfolioSummary: { investment: 0, value: 0, pl: 0, plPercent: 0, activeDividendTotal: 0, scripCount: 0, plWithCashflow: 0, plWithCashflowPercent: 0 },
            ltpData: state.ltpData,
            loading: false,
            error: null,
            lastUpdated: null,
            rawAnalysisData: null,
        });
        setWaccRawData([]);
        setHoldingsRawData([]);
    };

    return (
        <PortfolioContext.Provider value={{ state, actions: { uploadData, reanalysePortfolio, clearData, refreshLtp } }}>
            {children}
        </PortfolioContext.Provider>
    );
};
