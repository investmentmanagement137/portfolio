export interface DividendEvent {
    Scrip: string;
    "Book Closure Date": string;
    Holdings?: number;
    "Eligible Holdings"?: number;
    "Current Balance"?: number;
    "Historical Balance"?: number;
    "Cash %": number;
    "Face Value": number;
    "Dividend Per Share"?: number;
    "Dividend Amount": number;
}

export interface WebhookHolding {
    Scrip: string;
    Sector: string;
    WACC: number;
    "Current Balance": number;
    "Total Investment": number;
    LTP: number;
    "Current Valuation": number;
    "Profit/Loss": number;
    Status: string;
}

export interface LtpData {
    Symbol: string;
    LTP: string;
    [key: string]: any;
}

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

export interface PortfolioSummary {
    investment: number;
    value: number;
    pl: number;
    plPercent: number;
    activeDividendTotal: number;
    scripCount: number;
    plWithCashflow: number;
    plWithCashflowPercent: number;
}

export interface PortfolioState {
    holdings: Holding[];
    dividendSummary: any[];
    dividendDetails: DividendEvent[];
    activeDividends: DividendEvent[];
    portfolioSummary: PortfolioSummary;
    ltpData: Record<string, number>;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    rawAnalysisData: any[] | null;
    brokerNo: number | null;
    roiType: 'simple' | 'annualized';
}

export interface PortfolioActions {
    uploadData: (waccFile: File, historyFile: File, holdingsFile?: File) => Promise<void>;
    reanalysePortfolio: () => Promise<void>;
    clearData: () => void;
    refreshLtp: () => Promise<void>;
    updateBrokerNo: (no: number | null) => void;
    updateRoiType: (type: 'simple' | 'annualized') => void;
}

export interface PortfolioContextValue {
    state: PortfolioState;
    actions: PortfolioActions;
}
