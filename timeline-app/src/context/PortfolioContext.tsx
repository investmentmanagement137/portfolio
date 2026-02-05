import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import type { PortfolioContextValue, PortfolioState, Holding } from '../types';

const LTP_URL = 'https://raw.githubusercontent.com/investmentmanagement137/jsons/main/recentltp.json';
const DATA_URL = '/data.json'; // Local file in public folder

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
        rawAnalysisData: null,
        ltpData: {},
        holdings: [],
        loading: false,
        error: null,
    });

    const refreshLtp = useCallback(async () => {
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
            setState(prev => ({ ...prev, ltpData: map }));
        } catch (error) {
            console.error("Failed to fetch LTP", error);
        }
    }, []);

    // Initial Data Load
    useEffect(() => {
        const loadDtata = async () => {
            setState(prev => ({ ...prev, loading: true }));
            try {
                await refreshLtp();
                const res = await axios.get(DATA_URL);
                const result = Array.isArray(res.data) ? res.data : [res.data];

                setState(prev => ({ ...prev, rawAnalysisData: result, loading: false }));
            } catch (err) {
                console.error("Failed to load data", err);
                setState(prev => ({ ...prev, loading: false, error: "Failed to load data" }));
            }
        };
        loadDtata();
    }, [refreshLtp]);


    // Recalculate Holdings
    useEffect(() => {
        if (!state.rawAnalysisData || Object.keys(state.ltpData).length === 0) return;

        let calculatedHoldings: Holding[] = [];

        // Simplified Logic: Extract current holdings either from webhook response or WACC/Holdings sections
        // We will try to find "current holdings in meroshare" or similar structure
        const webhookHoldings = state.rawAnalysisData?.[3]?.["current holdings in meroshare"];

        if (webhookHoldings && Array.isArray(webhookHoldings)) {
            webhookHoldings.forEach((item: any) => {
                const scrip = item.Scrip;
                const qty = item["Current Balance"];
                const wacc = item.WACC;
                const sector = item.Sector || "Unknown";
                const ltp = state.ltpData[scrip] || item.LTP || 0;
                const investment = item["Total Investment"] || (qty * wacc);
                const currentValue = qty * ltp;

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
        // Fallback or other structures omitted for brevity as webhook logic is primary

        setState(prev => ({ ...prev, holdings: calculatedHoldings }));

    }, [state.rawAnalysisData, state.ltpData]);

    return (
        <PortfolioContext.Provider value={{ state, refreshLtp }}>
            {children}
        </PortfolioContext.Provider>
    );
};
