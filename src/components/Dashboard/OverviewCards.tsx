import { TrendingUp, TrendingDown, Wallet, BarChart3, CircleDollarSign } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent } from '../ui/Card';
import { cn, formatCurrency } from '../../lib/utils';

export function OverviewCards() {
    const { state: { portfolioSummary, roiType } } = usePortfolio();
    const { investment, value, pl, plPercent, activeDividendTotal, plWithCashflow, plWithCashflowPercent } = portfolioSummary;

    const isProfit = pl >= 0;
    const isCashflowProfit = plWithCashflow >= 0;

    return (
        <Card className="mb-8 overflow-hidden border-none bg-gradient-to-br from-muted/50 via-card to-muted/30 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />

            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x border-border/50">
                    <div className="p-6 transition-colors hover:bg-muted/30">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Net Capital</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl lg:text-2xl font-mono text-foreground font-bold tracking-tight">
                                Rs. {formatCurrency(investment)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Invested Amount</div>
                        </div>
                    </div>

                    <div className="p-6 transition-colors hover:bg-muted/30">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Market Value</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl lg:text-2xl font-mono text-foreground font-bold tracking-tight">
                                Rs. {formatCurrency(value)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Current Worth</div>
                        </div>
                    </div>

                    <div className="p-6 transition-colors hover:bg-muted/30">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            {isProfit ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                                {roiType === 'annualized' ? 'Ann. Performance' : 'Performance'}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className={cn("text-xl lg:text-2xl font-mono font-bold tracking-tight flex items-baseline gap-2", isProfit ? "text-green-500" : "text-red-500")}>
                                {isProfit ? '+' : ''}{formatCurrency(pl)}
                                <span className="text-xs opacity-80 font-bold">
                                    ({plPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Over All Return</div>
                        </div>
                    </div>

                    <div className="p-6 transition-colors hover:bg-muted/30">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <CircleDollarSign className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Cash Flow</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl lg:text-2xl font-mono text-amber-500 font-bold tracking-tight">
                                Rs. {formatCurrency(activeDividendTotal)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Portfolio Cash Dividends</div>
                        </div>
                    </div>

                    <div className="p-6 transition-colors hover:bg-muted/30 bg-primary/5">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-70 text-primary">Adj. Return</span>
                        </div>
                        <div className="space-y-1">
                            <div className={cn("text-xl lg:text-2xl font-mono font-bold tracking-tight flex items-baseline gap-2", isCashflowProfit ? "text-green-500" : "text-red-500")}>
                                {isCashflowProfit ? '+' : ''}{formatCurrency(plWithCashflow)}
                                <span className="text-xs opacity-80 font-bold">({plWithCashflowPercent.toFixed(2)}%)</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium">Cash Flow Adjusted Return</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
