import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { usePortfolio } from '../../context/PortfolioContext';
import { cn, formatCurrency } from '../../lib/utils';

export function NepseTodayCard() {
    const { state } = usePortfolio();
    const { nepseData, loading } = state;

    if (loading && !nepseData) {
        return (
            <Card className="shadow-lg border-border/60 bg-card/60 backdrop-blur-sm animate-pulse">
                <div className="h-48" />
            </Card>
        );
    }

    if (!nepseData) return null;

    const marketData = {
        index: nepseData.Price.toLocaleString(),
        change: (nepseData["change in value"] >= 0 ? '+' : '') + nepseData["change in value"].toFixed(2),
        percentChange: (nepseData["Ltp change percent"] >= 0 ? '+' : '') + nepseData["Ltp change percent"].toFixed(2) + '%',
        turnover: nepseData.turnover > 0 ? (nepseData.turnover / 1000000000).toFixed(2) + " Arba" : "N/A",
        volume: "N/A", // Volume not present in the new source for NEPSE Index
        status: "Live"
    };

    const isPositive = nepseData["change in value"] >= 0;

    return (
        <Card className="shadow-lg border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    Nepse Today
                    <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full border animate-pulse ${isPositive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {marketData.status}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">NEPSE Index</div>
                        <div className="text-3xl font-black tracking-tight">{marketData.index}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Market Change</div>
                        <div className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {marketData.change}
                            <span className="text-base font-bold bg-muted/50 px-2 py-0.5 rounded">
                                ({marketData.percentChange})
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Portfolio Today</div>
                        <div className={cn("text-3xl font-black tracking-tight whitespace-nowrap", state.portfolioSummary.dailyGain >= 0 ? "text-green-500" : "text-red-500")}>
                            रु {state.portfolioSummary.dailyGain >= 0 ? '+' : '-'}{formatCurrency(Math.abs(state.portfolioSummary.dailyGain))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    <span>Updated at</span>
                    <span className="font-mono">{new Date(nepseData["Traded _date"]).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
