import { TrendingUp, TrendingDown, Wallet, BarChart3, CircleDollarSign } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent } from '../ui/Card';
import { RatioCard } from './RatioCard';
import { cn, formatCurrency } from '../../lib/utils';

export function OverviewCards() {
    const { state } = usePortfolio();
    const { portfolioSummary } = state;
    const { investment, value, pl, plPercent, activeDividendTotal, plWithCashflow, plWithCashflowPercent } = portfolioSummary;

    const isProfit = pl >= 0;
    const isCashflowProfit = plWithCashflow >= 0;

    return (
        <>
            <Card className="mb-8 overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                <CardContent className="p-0">
                    <div className="p-4 border-b border-border/40 bg-muted/20">
                        <h2 className="text-sm font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
                            Portfolio Performance
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 lg:divide-x border-border/40">
                        {/* Net Capital */}
                        <div className="p-6 transition-colors hover:bg-primary/5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Net Capital</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl lg:text-2xl font-mono text-foreground font-bold tracking-tighter whitespace-nowrap">
                                    रु {formatCurrency(investment)}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight opacity-70">Invested Amount</div>
                            </div>
                        </div>

                        {/* Market Value */}
                        <div className="p-6 transition-colors hover:bg-primary/5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Market Value</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl lg:text-2xl font-mono text-foreground font-bold tracking-tighter whitespace-nowrap">
                                    रु {formatCurrency(value)}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight opacity-70">Current Worth</div>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="p-6 transition-colors hover:bg-primary/5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {isProfit ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Performance
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className={cn("text-xl lg:text-2xl font-mono font-bold tracking-tighter whitespace-nowrap", isProfit ? "text-green-500" : "text-red-500")}>
                                    रु {isProfit ? '+' : '-'}{formatCurrency(Math.abs(pl))}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className={cn("text-[10px] font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                        ({plPercent.toFixed(2)}%)
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight opacity-70">Over All Return</div>
                                </div>
                            </div>
                        </div>

                        {/* Cash Flow */}
                        <div className="p-6 transition-colors hover:bg-primary/5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CircleDollarSign className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Cash Flow</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl lg:text-2xl font-mono text-amber-500 font-bold tracking-tighter whitespace-nowrap">
                                    रु {formatCurrency(activeDividendTotal)}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight opacity-70">Cash Dividends</div>
                            </div>
                        </div>

                        {/* Adj. Return */}
                        <div className="p-6 transition-colors hover:bg-primary/5 flex flex-col gap-2 bg-primary/5">
                            <div className="flex items-center gap-2 text-primary">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Adj. Return</span>
                            </div>
                            <div className="space-y-1">
                                <div className={cn("text-xl lg:text-2xl font-mono font-bold tracking-tighter whitespace-nowrap", isCashflowProfit ? "text-green-500" : "text-red-500")}>
                                    रु {isCashflowProfit ? '+' : '-'}{formatCurrency(Math.abs(plWithCashflow))}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className={cn("text-[10px] font-bold", isCashflowProfit ? "text-green-500" : "text-red-500")}>
                                        ({plWithCashflowPercent.toFixed(2)}%)
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight opacity-70">Adj. Net Return</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <RatioCard
                title="Fundamental Ratios"
                items={[
                    {
                        label: "Weighted P/E",
                        value: (state.fundamentalAnalysis?.weightedPE || 0).toFixed(2),
                        description: "Weighted Price-to-Earnings Ratio based on your portfolio holdings. A lower P/E suggests your portfolio is undervalued relative to its earnings.",
                        valueColor: "text-blue-500",
                        icon: <div className="text-[10px] border border-current rounded px-1 font-bold">PE</div>,
                        details: state.fundamentalAnalysis ? {
                            totalValue: state.fundamentalAnalysis.peDetails.totalValue,
                            totalMetric: state.fundamentalAnalysis.peDetails.totalEarnings,
                            metricName: "Total Portfolio Earnings",
                            waccRatio: state.fundamentalAnalysis.weightedPE_WACC
                        } : undefined
                    },
                    {
                        label: "Weighted P/B",
                        value: (state.fundamentalAnalysis?.weightedPB || 0).toFixed(2),
                        description: "Weighted Price-to-Book Ratio based on your portfolio holdings. A lower P/B suggests you are paying less for the net assets of the companies.",
                        valueColor: "text-purple-500",
                        icon: <div className="text-[10px] border border-current rounded px-1 font-bold">PB</div>,
                        details: state.fundamentalAnalysis ? {
                            totalValue: state.fundamentalAnalysis.pbDetails.totalValue,
                            totalMetric: state.fundamentalAnalysis.pbDetails.totalBookValue,
                            metricName: "Total Book Value",
                            waccRatio: state.fundamentalAnalysis.weightedPB_WACC
                        } : undefined
                    }
                ]}
                className="mb-8"
            />
        </>
    );
}
