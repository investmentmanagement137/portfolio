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
        { label: "Historical Dividends", value: "रु 45.2k", icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Total Transactions", value: 178, icon: History, color: "text-slate-500", bg: "bg-slate-500/10" },
    ];

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group mt-8">
            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
            <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ScrollText className="w-5 h-5 text-primary" />
                    My Trading History
                    <span className="ml-auto text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-muted/50 border-border/40 text-muted-foreground opacity-70">All Time</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-5 hover:bg-primary/5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default flex flex-col items-center text-center gap-2 group/item">
                            <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-1 group-hover/item:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black tracking-tighter text-foreground">{stat.value}</div>
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
