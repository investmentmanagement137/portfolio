export interface Holding {
    scrip: string;
    sector: string;
    quantity: number;
    wacc: number;
    investment: number;
    ltp: number;
    currentValue: number;
    pl: number;
    plPercent: number;
}

export interface PortfolioState {
    rawAnalysisData: any;
    ltpData: Record<string, number>;
    holdings: Holding[];
    loading: boolean;
    error: string | null;
}

export interface PortfolioContextValue {
    state: PortfolioState;
    refreshLtp: () => Promise<void>;
}
