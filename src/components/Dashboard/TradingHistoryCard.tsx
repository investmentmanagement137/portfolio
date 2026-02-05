import { History, Ticket, Gavel, ArrowRightLeft, TrendingUp, TrendingDown, Gift, Coins, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { usePortfolio } from '../../context/PortfolioContext';

const iconMap: Record<string, any> = {
    "IPOs Allotted": { icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" },
    "FPOs Allotted": { icon: Ticket, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    "Auctions Allotted": { icon: Gavel, color: "text-amber-500", bg: "bg-amber-500/10" },
    "Merged Companies": { icon: ArrowRightLeft, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    "Total Sell Events": { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    "Total Buy Events": { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    "Bonus Events": { icon: Gift, color: "text-purple-500", bg: "bg-purple-500/10" },
    "Rights Allotted": { icon: Ticket, color: "text-orange-500", bg: "bg-orange-500/10" },
    "Historical Dividends": { icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "Total Transactions": { icon: History, color: "text-slate-500", bg: "bg-slate-500/10" },
};

export function TradingHistoryCard() {
    const { state } = usePortfolio();
    const { tradingHistory } = state;

    const getStats = () => {
        if (!tradingHistory) return [];

        // If it's the new object structure { allTime: { ... } }
        if (typeof tradingHistory === 'object' && !Array.isArray(tradingHistory)) {
            const data = (tradingHistory as any).allTime || tradingHistory;
            const mapping = [
                { key: 'iposAllotted', label: 'IPOs Allotted' },
                { key: 'fposAllotted', label: 'FPOs Allotted' },
                { key: 'auctionsAllotted', label: 'Auctions Allotted' },
                { key: 'mergedCompanies', label: 'Merged Companies' },
                { key: 'bonusEvents', label: 'Bonus Events' },
                { key: 'rightShare', label: 'Rights Allotted' },
                { key: 'totalBuyEvents', label: 'Total Buy Events' },
                { key: 'totalSellEvents', label: 'Total Sell Events' },
                { key: 'totalTransactions', label: 'Total Transactions' },
            ];

            return mapping
                .filter(m => data[m.key] !== undefined)
                .map(m => {
                    const config = iconMap[m.label] || { icon: ScrollText, color: "text-slate-500", bg: "bg-slate-500/10" };
                    return {
                        label: m.label,
                        value: data[m.key],
                        ...config
                    };
                });
        }

        // Fallback for legacy array structure
        if (Array.isArray(tradingHistory)) {
            return tradingHistory.map((item: any) => {
                const config = iconMap[item.label] || { icon: ScrollText, color: "text-slate-500", bg: "bg-slate-500/10" };
                return {
                    ...item,
                    ...config
                };
            });
        }

        return [];
    };

    const stats = getStats();

    if (stats.length === 0) {
        return (
            <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative mt-8">
                <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ScrollText className="w-5 h-5 text-primary" />
                        My Trading History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest px-4">No trading history data found. Import your portfolio to see lifecycle insights.</p>
                </CardContent>
            </Card>
        );
    }

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
                    {stats.map((stat: any, idx: number) => (
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
