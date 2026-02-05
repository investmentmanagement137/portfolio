import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export function NepseTodayCard() {
    // Dummy Data
    const marketData = {
        index: "2,084.76",
        change: "+12.45",
        percentChange: "0.60%",
        turnover: "3.24 Arba",
        volume: "85,42,123",
        status: "Open"
    };

    const isPositive = marketData.change.startsWith('+');

    return (
        <Card className="shadow-lg border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    Nepse Today
                    <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 animate-pulse">
                        {marketData.status}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">NEPSE Index</div>
                        <div className="text-2xl font-black tracking-tight">{marketData.index}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Change</div>
                        <div className={`text-2xl font-black tracking-tight flex items-center gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {marketData.change}
                            <span className="text-sm font-bold bg-muted/50 px-1.5 py-0.5 rounded">
                                ({marketData.percentChange})
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Turnover</div>
                        <div className="text-2xl font-black tracking-tight flex items-center gap-1">
                            Rs. {marketData.turnover}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Volume</div>
                        <div className="text-2xl font-black tracking-tight flex items-center gap-1">
                            {marketData.volume}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
