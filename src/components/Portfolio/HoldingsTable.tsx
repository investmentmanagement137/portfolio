import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Briefcase, LayoutDashboard } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Holding } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

type SortKey = keyof Holding;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

export function HoldingsTable() {
    const { state: { holdings, portfolioSummary } } = usePortfolio();
    const { investment, value, pl, plPercent, activeDividendTotal, scripCount, plWithCashflow, plWithCashflowPercent } = portfolioSummary;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'currentValue', direction: 'desc' });

    const sortedHoldings = useMemo(() => {
        const { key, direction } = sortConfig;

        return [...holdings].sort((a, b) => {
            const valA = a[key] ?? 0;
            const valB = b[key] ?? 0;
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [holdings, sortConfig]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split(':') as [SortKey, SortDirection];
        setSortConfig({ key, direction });
    };

    if (holdings.length === 0) return (
        <div className="text-center p-8 text-muted-foreground bg-card rounded-2xl border border-border">
            No holdings data available. Please import your portfolio.
        </div>
    );

    const isProfit = pl >= 0;
    const isCashflowProfit = plWithCashflow >= 0;

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl">
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 border-border/50">
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-muted/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Portfolio Cost</span>
                            <div className="text-xl font-mono font-bold text-foreground">{formatCurrency(investment)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-muted/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Value</span>
                            <div className="text-xl font-mono font-bold text-foreground">{formatCurrency(value)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-muted/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Cash Dividends</span>
                            <div className="text-xl font-mono font-bold text-amber-500">{formatCurrency(activeDividendTotal)}</div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-muted/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Returns</span>
                            <div className={cn("text-xl font-mono font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                {isProfit ? '+' : ''}{formatCurrency(pl)}
                                <div className="text-[10px] opacity-70 font-bold">{plPercent.toFixed(2)}%</div>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col justify-center transition-colors hover:bg-muted/30 bg-primary/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Returns + Cashflow</span>
                            <div className={cn("text-xl font-mono font-bold", isCashflowProfit ? "text-green-500" : "text-red-500")}>
                                {isCashflowProfit ? '+' : ''}{formatCurrency(plWithCashflow)}
                                <div className="text-[10px] opacity-70 font-bold">{plWithCashflowPercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    My Portfolio ({scripCount})
                </h3>

                <div className="relative">
                    <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <select
                        className="bg-card border border-border rounded-lg pl-9 pr-6 py-2 text-xs text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
                        onChange={handleSortChange}
                        value={`${sortConfig.key}:${sortConfig.direction}`}
                    >
                        <option value="currentValue:desc">Value (High to Low)</option>
                        <option value="currentValue:asc">Value (Low to High)</option>
                        <option value="pl:desc">P/L (High to Low)</option>
                        <option value="pl:asc">P/L (Low to High)</option>
                        <option value="scrip:asc">Scrip (A-Z)</option>
                        <option value="quantity:desc">Quantity</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {sortedHoldings.map((item, idx) => (
                    <Card key={idx} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold">
                                        {item.scrip.substring(0, 3)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base text-primary">{item.scrip}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Briefcase className="w-3 h-3" />
                                            {item.quantity} units @ {item.wacc.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-foreground">
                                        Rs. {formatCurrency(item.currentValue)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        LTP: {formatNumber(item.ltp)}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Profit/Loss</span>
                                <div className={cn("font-mono font-bold text-sm flex items-center gap-1", item.pl >= 0 ? 'text-green-500' : 'text-red-500')}>
                                    {item.pl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {formatCurrency(Math.abs(item.pl))}
                                    <span className="opacity-70 text-xs">({item.plPercent.toFixed(1)}%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
