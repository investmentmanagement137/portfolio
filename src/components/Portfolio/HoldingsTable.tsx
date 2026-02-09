import { useState, useMemo } from 'react';
import { ArrowUpDown, Briefcase, Search } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Holding } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';
import { ImportData } from '../Import';
import { DataSourceModal } from '../ui/DataSourceModal';
import { getDataSourceUrl } from '../../lib/data-sources';

type SortKey = keyof Holding;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

interface HoldingsTableProps {
    onSelectScrip: (scrip: string) => void;
}

export function HoldingsTable({ onSelectScrip }: HoldingsTableProps) {
    const { state, state: { holdings, portfolioSummary } } = usePortfolio();
    const { investment, value, pl, plPercent, activeDividendTotal, scripCount, plWithCashflow, plWithCashflowPercent } = portfolioSummary;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'currentValue', direction: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    const sortedHoldings = useMemo(() => {
        const { key, direction } = sortConfig;

        // Filter first
        const filtered = holdings.filter(item =>
            item.scrip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.companyName && item.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return [...filtered].sort((a, b) => {
            const valA = a[key] ?? 0;
            const valB = b[key] ?? 0;

            if (typeof valA === 'string' && typeof valB === 'string') {
                return direction === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [holdings, sortConfig, searchQuery]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split(':') as [SortKey, SortDirection];
        setSortConfig({ key, direction });
    };

    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

    const handleSymbolClick = (symbol: string) => {
        if (state.preferredDataSource && state.preferredDataSource !== 'ask') {
            const url = getDataSourceUrl(state.preferredDataSource, symbol);
            if (url) {
                window.open(url, '_blank');
                return;
            }
        }
        setSelectedSymbol(symbol);
    };

    if (holdings.length === 0) return (
        <ImportData />
    );


    const isCashflowProfit = plWithCashflow >= 0;

    // Determine current P/L to display based on setting
    const displayPl = state.plViewMode === 'adjusted' ? plWithCashflow : pl;
    const displayPlPercent = state.plViewMode === 'adjusted' ? plWithCashflowPercent : plPercent;
    const isDisplayProfit = displayPl >= 0;

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                <CardHeader className="justify-center border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Profit Loss Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 border-border/40">
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Portfolio Cost</span>
                            <div className="text-lg font-mono font-bold text-foreground whitespace-nowrap">रु {formatCurrency(investment)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Value</span>
                            <div className="text-lg font-mono font-bold text-foreground whitespace-nowrap">रु {formatCurrency(value)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                {state.plViewMode === 'adjusted' ? 'Profit/Loss (Adj.)' : 'Profit/Loss'}
                            </span>
                            <div className={cn("text-lg font-mono font-bold whitespace-nowrap", isDisplayProfit ? "text-green-500" : "text-red-500")}>
                                रु {isDisplayProfit ? '+' : '-'}{formatCurrency(Math.abs(displayPl))}
                                <div className="text-[10px] opacity-70 font-bold">
                                    {displayPlPercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Cash Dividends</span>
                            <div className="text-lg font-mono font-bold text-amber-500 whitespace-nowrap">रु {formatCurrency(activeDividendTotal)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-primary/5 bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Returns + Cashflow</span>
                            <div className={cn("text-lg font-mono font-bold whitespace-nowrap", isCashflowProfit ? "text-green-500" : "text-red-500")}>
                                रु {isCashflowProfit ? '+' : '-'}{formatCurrency(Math.abs(plWithCashflow))}
                                <div className="text-[10px] opacity-70 font-bold">{plWithCashflowPercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                    <Briefcase className="w-5 h-5 text-primary" />
                    My Holdings ({scripCount})
                </h3>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search company or scrip..."
                            className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 w-full sm:w-64 placeholder:text-muted-foreground/50 transition-all focus:w-full sm:focus:w-72 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <select
                            className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-primary/5 transition-colors shadow-sm [&>option]:bg-card [&>option]:text-foreground"
                            onChange={handleSortChange}
                            value={`${sortConfig.key}:${sortConfig.direction}`}
                        >
                            <option value="currentValue:desc">Value (High to Low)</option>
                            <option value="currentValue:asc">Value (Low to High)</option>
                            <option value="pl:desc">P/L (High to Low)</option>
                            <option value="pl:asc">P/L (Low to High)</option>
                            <option value="ltp:desc">LTP (High to Low)</option>
                            <option value="ltp:asc">LTP (Low to High)</option>
                            <option value="scrip:asc">Scrip (A-Z)</option>
                            <option value="companyName:asc">Company Name (A-Z)</option>
                            <option value="sector:asc">Sector (A-Z)</option>
                            <option value="quantity:desc">Quantity</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedHoldings.map((item, idx) => (
                    <Card key={idx} className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group/card">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x border-border/40">
                                {/* Scrip Info */}
                                <div
                                    className="p-5 flex-grow flex items-center gap-4 transition-colors group-hover/card:bg-primary/5 min-w-0 cursor-pointer hover:bg-primary/10"
                                    onClick={() => handleSymbolClick(item.scrip)}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-0.5">
                                            <h4
                                                className="font-bold text-lg text-foreground tracking-tight transition-colors truncate pr-2 group-hover/card:text-primary"
                                                title={item.companyName}
                                            >
                                                {item.companyName}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                    {item.scrip}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <Briefcase className="w-3 h-3 text-primary/70" />
                                                    {item.quantity} Units
                                                </div>
                                            </div>
                                        </div>

                                        {state.dailyChanges[item.scrip] !== undefined && state.dailyChanges[item.scrip] !== 0 && (
                                            <div className={cn("mt-2 text-[11px] font-black flex items-center gap-1.5", state.dailyChanges[item.scrip] > 0 ? "text-green-500" : "text-red-500")}>
                                                Today: रु {state.dailyChanges[item.scrip] > 0 ? '+' : '-'}{formatCurrency(Math.abs(state.dailyChanges[item.scrip] * item.quantity))}
                                                <span className="opacity-70 text-[9px] bg-muted/50 px-1.5 py-0.5 rounded border border-current/20">
                                                    {((state.dailyChanges[item.scrip] / (item.ltp - state.dailyChanges[item.scrip])) * 100).toFixed(2)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Purchase Price (Investment) */}
                                <div
                                    className="p-5 sm:w-48 flex flex-col justify-center sm:items-end transition-colors group-hover/card:bg-primary/5 cursor-pointer hover:bg-primary/10"
                                    onClick={() => onSelectScrip(item.scrip)}
                                >
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-70">Investment</div>
                                    <div className="font-mono font-black text-foreground text-xl tracking-tighter">
                                        रु {formatCurrency(item.investment)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                                        WACC: <span className="text-foreground">{formatNumber(item.wacc)}</span>
                                    </div>
                                </div>

                                {/* LTP & Value info */}
                                <div
                                    className="p-5 sm:w-48 flex flex-col justify-center sm:items-end transition-colors group-hover/card:bg-primary/5 cursor-pointer hover:bg-primary/10"
                                    onClick={() => onSelectScrip(item.scrip)}
                                >
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-70">Current Value</div>
                                    <div className="font-mono font-black text-foreground text-xl tracking-tighter">
                                        रु {formatCurrency(item.currentValue)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                                        LTP: <span className="text-primary">{formatNumber(item.ltp)}</span>
                                    </div>
                                </div>

                                {/* Profit/Loss */}
                                <div
                                    className={cn("p-5 sm:w-56 flex flex-col justify-center sm:items-end transition-colors sm:bg-primary/5 cursor-pointer hover:opacity-80", (state.plViewMode === 'adjusted' ? (item.plWithCashflow ?? item.pl) : item.pl) >= 0 ? "text-green-500 bg-green-500/5" : "text-red-500 bg-red-500/5")}
                                    onClick={() => onSelectScrip(item.scrip)}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                                        {state.plViewMode === 'adjusted' ? 'Profit/Loss (Adj.)' : 'Profit/Loss'}
                                    </div>
                                    <div className="font-mono font-black text-xl tracking-tighter flex items-center gap-1">
                                        रु {(state.plViewMode === 'adjusted' ? (item.plWithCashflow ?? item.pl) : item.pl) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(state.plViewMode === 'adjusted' ? (item.plWithCashflow ?? item.pl) : item.pl))}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-wider mt-1 bg-background/50 px-2 py-0.5 rounded border border-current/20">
                                        {(state.plViewMode === 'adjusted' ? (item.plWithCashflowPercent ?? item.plPercent) : item.plPercent).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <DataSourceModal
                isOpen={!!selectedSymbol}
                onClose={() => setSelectedSymbol(null)}
                symbol={selectedSymbol || ''}
            />
        </div>
    );
}
