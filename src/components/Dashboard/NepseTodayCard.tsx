import { BarChart2, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { usePortfolio } from '../../context/PortfolioContext';
import { cn, formatCurrency } from '../../lib/utils';

export function NepseTodayCard() {
    const { state } = usePortfolio();
    const { nepseData, loading } = state;

    if (loading && !nepseData) {
        return (
            <Card className="shadow-lg border-border/60 bg-card/60 backdrop-blur-sm animate-pulse">
                <div className="h-32" />
            </Card>
        );
    }

    if (!nepseData) return null;

    const marketData = {
        index: nepseData.Price.toLocaleString(),
        change: (nepseData["change in value"] >= 0 ? '+' : '') + nepseData["change in value"].toFixed(2),
        percentChange: (nepseData["Ltp change percent"] >= 0 ? '+' : '') + nepseData["Ltp change percent"].toFixed(2) + '%',
        turnover: nepseData.turnover > 0 ? (nepseData.turnover / 1000000000).toFixed(2) + " Arba" : "N/A",
        status: "Live"
    };

    const isPositive = nepseData["change in value"] >= 0;

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-card to-background shadow-xl relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-border/40">
                    {/* NEPSE Index */}
                    <div className="p-5 flex flex-col gap-3 transition-colors hover:bg-primary/5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">NEPSE Index</span>
                            <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border animate-pulse ${isPositive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {marketData.status}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tighter text-foreground">{marketData.index}</span>
                        </div>
                    </div>

                    {/* Market Change */}
                    <div className="p-5 flex flex-col gap-3 transition-colors hover:bg-primary/5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {isPositive ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Market Change</span>
                        </div>
                        <div className={cn("flex items-baseline gap-3", isPositive ? "text-green-500" : "text-red-500")}>
                            <span className="text-3xl font-black tracking-tighter">{marketData.change}</span>
                            <span className="text-sm font-bold bg-muted/80 px-2 py-0.5 rounded border border-border/50">
                                {marketData.percentChange}
                            </span>
                        </div>
                    </div>

                    {/* Portfolio Today */}
                    <div className="p-5 flex flex-col gap-3 transition-colors hover:bg-primary/5 bg-primary/5">
                        <div className="flex items-center gap-2 text-primary">
                            <BarChart2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Portfolio Today</span>
                        </div>
                        <div className={cn("text-3xl font-black tracking-tighter whitespace-nowrap", state.portfolioSummary.dailyGain >= 0 ? "text-green-500" : "text-red-500")}>
                            रु {state.portfolioSummary.dailyGain >= 0 ? '+' : '-'}{formatCurrency(Math.abs(state.portfolioSummary.dailyGain))}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-2 bg-muted/30 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Last Updated</span>
                    </div>
                    <span className="font-mono text-foreground/70">{new Date(nepseData["Traded _date"]).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
