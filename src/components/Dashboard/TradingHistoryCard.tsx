import { History, Ticket, Gavel, ArrowRightLeft, TrendingUp, TrendingDown, Gift, Coins, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export function TradingHistoryCard() {
    // Dummy Data
    const stats = [
        { label: "IPOs Allotted", value: 12, icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "FPOs Allotted", value: 2, icon: Ticket, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Auctions Allotted", value: 1, icon: Gavel, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Merged Companies", value: 3, icon: ArrowRightLeft, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { label: "Total Sell Events", value: 45, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Total Buy Events", value: 82, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Bonus Events", value: 28, icon: Gift, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Historical Dividends", value: "Rs. 45.2k", icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Total Transactions", value: 178, icon: History, color: "text-slate-500", bg: "bg-slate-500/10" },
    ];

    return (
        <Card className="shadow-lg border-border/60 bg-card/60 backdrop-blur-sm mt-8">
            <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ScrollText className="w-5 h-5 text-primary" />
                    My Trading History
                    <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md">All Time</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-background/50 border border-border/50 rounded-xl p-4 hover:bg-background/80 transition-colors flex flex-col items-center text-center gap-2">
                            <div className={`p-2 rounded-full ${stat.bg} ${stat.color} mb-1`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
