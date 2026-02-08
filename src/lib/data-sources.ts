export type DataSourceKey = 'merolagani' | 'sharesansar' | 'nepsealpha' | 'nepalipaisa' | 'ask';

export interface DataSource {
    key: DataSourceKey;
    name: string;
    url: (symbol: string) => string;
}

export const DATA_SOURCES: DataSource[] = [
    {
        key: 'merolagani',
        name: 'Merolagani',
        url: (symbol) => `https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}#0`
    },
    {
        key: 'sharesansar',
        name: 'ShareSansar',
        url: (symbol) => `https://www.sharesansar.com/company/${symbol}`
    },
    {
        key: 'nepsealpha',
        name: 'NepseAlpha',
        url: (symbol) => `https://nepsealpha.com/search?q=${symbol}`
    },
    {
        key: 'nepalipaisa',
        name: 'NepaliPaisa',
        url: (symbol) => `https://nepalipaisa.com/company/${symbol}`
    }
];

export const getDataSourceUrl = (key: DataSourceKey, symbol: string): string | null => {
    const source = DATA_SOURCES.find(s => s.key === key);
    return source ? source.url(symbol) : null;
};
