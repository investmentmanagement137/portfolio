import { History, Ticket, Gavel, ArrowRightLeft, TrendingUp, TrendingDown, Gift, Coins, ScrollText, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { usePortfolio } from '../../context/PortfolioContext';

const iconMap: Record<string, any> = {
    "IPOs Allotted": { icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" },
    "FPOs Allotted": { icon: Ticket, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    "Auctions Allotted": { icon: Gavel, color: "text-amber-500", bg: "bg-amber-500/10" },
    "Merged Companies": { icon: ArrowRightLeft, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    "Total Sell Events": { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    "Total Buy Events": { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    "Bonus Share Events": { icon: Gift, color: "text-purple-500", bg: "bg-purple-500/10" },
    "Right share alloted": { icon: Ticket, color: "text-orange-500", bg: "bg-orange-500/10" },
    "Total Cash Divident": { icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "Cash Divident frequency": { icon: History, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "Recent Activity": { icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    "Trading Since": { icon: Calendar, color: "text-slate-400", bg: "bg-slate-500/10" },
    "Total Transactions": { icon: History, color: "text-slate-500", bg: "bg-slate-500/10" },
};

export function TradingHistoryCard() {
    const { state } = usePortfolio();
    const { tradingHistory, dividendDetails } = state;

    // Calculate integrated dividend metrics
    const totalCashDividend = dividendDetails?.reduce((sum, item) => sum + (item["Dividend Amount"] || 0), 0) || 0;
    const dividendCount = dividendDetails?.length || 0;

    const getStatsByCategory = () => {
        if (!tradingHistory) return { market: [], rewards: [] };

        const data = (tradingHistory as any).allTime || tradingHistory;

        const marketMapping = [
            { key: 'iposAllotted', label: 'IPOs Allotted', format: (val: number) => val || 0 },
            { key: 'fposAllotted', label: 'FPOs Allotted', format: (val: number) => val || 0 },
            { key: 'auctionsAllotted', label: 'Auctions Allotted', format: (val: number) => val || 0 },
            { key: 'mergedCompanies', label: 'Merged Companies', format: (val: number) => val || 0 },
            { key: 'totalBuyEvents', label: 'Total Buy Events', format: (val: number) => val || 0 },
            { key: 'totalSellEvents', label: 'Total Sell Events', format: (val: number) => val || 0 },
        ];

        const rewardsMapping = [
            { key: 'bonusEvents', label: 'Bonus Share Events', format: (val: number) => val || 0 },
            { key: 'rightShare', label: 'Right share alloted', format: (val: number) => val || 0 },
        ];

        const mapItem = (m: any) => {
            const config = iconMap[m.label] || { icon: ScrollText, color: "text-slate-500", bg: "bg-slate-500/10" };
            const rawValue = data[m.key];
            const formattedValue = m.format ? m.format(rawValue) : rawValue;
            return {
                label: m.label,
                value: formattedValue,
                ...config
            };
        };

        const market = marketMapping
            .map(m => mapItem(m));

        const rewards = rewardsMapping
            .map(m => mapItem(m));

        // Add integrated dividend metrics to rewards
        if (dividendCount > 0) {
            rewards.push({
                label: 'Total Cash Divident',
                value: `रु. ${totalCashDividend.toLocaleString('en-IN')}`,
                ...iconMap['Total Cash Divident']
            });
            rewards.push({
                label: 'Cash Divident frequency',
                value: `${dividendCount} Times`,
                ...iconMap['Cash Divident frequency']
            });
        }

        return { market, rewards };
    };

    const sections = getStatsByCategory();
    const hasData = sections.market.length > 0 || sections.rewards.length > 0;

    if (!tradingHistory || !hasData) {
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

    const normalizedData = (tradingHistory as any).allTime || tradingHistory;
    const root = tradingHistory as any;

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group mt-8">
            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
            <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-lg">
                        <ScrollText className="w-5 h-5 text-primary" />
                        Investor Journey
                    </div>
                    {root.activeInMarket && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 transition-all hover:bg-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active In Market</span>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Identity Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm relative overflow-hidden group/header">
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/header:translate-y-0 transition-transform duration-500" />
                    <div className="relative">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Investor Since
                        </div>
                        <div className="text-sm font-black text-foreground">{normalizedData.tradingStartDate || 'N/A'}</div>
                    </div>
                    <div className="relative">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Last Activity
                        </div>
                        <div className="text-sm font-black text-foreground">{normalizedData.recentTradingDate || 'N/A'}</div>
                    </div>
                    <div className="relative">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                            <History className="w-3 h-3" /> Total Events
                        </div>
                        <div className="text-sm font-black text-foreground">{normalizedData.totalTransactions || 0}</div>
                    </div>
                </div>

                {/* Market Activity Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/40" />
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Market Activity</h3>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {sections.market.map((stat: any, idx: number) => (
                            <div key={idx} className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-4 hover:bg-primary/5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default flex flex-col items-center text-center gap-2 group/item">
                                <div className={`p-2.5 rounded-full ${stat.bg} ${stat.color} mb-1 group-hover/item:scale-110 transition-transform`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div className={`font-extrabold tracking-tighter text-foreground text-center break-words w-full px-1 leading-[1.1] ${String(stat.value).length > 20 ? 'text-[10px]' :
                                    String(stat.value).length > 15 ? 'text-xs' :
                                        String(stat.value).length > 12 ? 'text-sm' :
                                            String(stat.value).length > 10 ? 'text-base' : 'text-lg'
                                    }`}>
                                    {stat.value}
                                </div>
                                <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-70 leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rewards & Growth Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/40" />
                        <h3 className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em]">Rewards & Growth</h3>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {sections.rewards.map((stat: any, idx: number) => (
                            <div key={idx} className="bg-emerald-500/[0.02] backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 hover:bg-emerald-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default flex flex-col items-center text-center gap-2 group/item">
                                <div className={`p-2.5 rounded-full ${stat.bg} ${stat.color} mb-1 group-hover/item:scale-110 transition-transform`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div className={`font-extrabold tracking-tighter text-foreground text-center break-words w-full px-1 leading-[1.1] ${String(stat.value).length > 20 ? 'text-[10px]' :
                                    String(stat.value).length > 15 ? 'text-xs' :
                                        String(stat.value).length > 12 ? 'text-sm' :
                                            String(stat.value).length > 10 ? 'text-base' : 'text-lg'
                                    }`}>
                                    {stat.value}
                                </div>
                                <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest opacity-70 leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
