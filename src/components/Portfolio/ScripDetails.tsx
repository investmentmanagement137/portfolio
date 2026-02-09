import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, PieChart, DollarSign, Calendar, History, Activity } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';

interface ScripDetailsProps {
    scrip: string;
    onBack: () => void;
}

export function ScripDetails({ scrip, onBack }: ScripDetailsProps) {
    const { state } = usePortfolio();
    const { holdings, activeDividends, ltpData, dailyChanges, transactionHistory } = state;

    const holding = useMemo(() => holdings.find(h => h.scrip === scrip), [holdings, scrip]);

    const scripTransactions = useMemo(() => {
        if (!transactionHistory) return [];
        return transactionHistory.filter(t => t.Scrip === scrip);
    }, [transactionHistory, scrip]);

    // Get dividends for this scrip
    const scripDividends = useMemo(() =>
        activeDividends.filter(d => d.Scrip === scrip).sort((a, b) =>
            new Date(b["Book Closure Date"]).getTime() - new Date(a["Book Closure Date"]).getTime()
        ),
        [activeDividends, scrip]);

    const totalCashDividends = scripDividends.reduce((sum, d) => sum + (d["Dividend Amount"] || 0), 0);

    // Get value history from LTP data (mock/active)
    const ltp = ltpData[scrip] || holding?.ltp || 0;
    const dailyChange = dailyChanges[scrip] || 0;

    if (!holding) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <p className="text-muted-foreground">Holding not found.</p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-primary hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    const { quantity, wacc, investment, currentValue, pl, plPercent, plWithCashflow = pl + totalCashDividends, plWithCashflowPercent = ((pl + totalCashDividends) / investment) * 100 } = holding;

    const dailyChangeAmount = dailyChange * quantity;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-background border border-border/40 shadow-2xl">
                {/* Decorative Background Elements */}
                <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20",
                    dailyChange >= 0 ? "bg-green-500" : "bg-red-500"
                )} />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-[80px] opacity-30" />

                <div className="relative p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <button
                                onClick={onBack}
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Back to Portfolio
                            </button>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground truncate max-w-2xl">
                                    {holding.companyName}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-black text-sm border border-primary/20">
                                        {scrip}
                                    </span>
                                    <span className="text-muted-foreground/40 font-light">•</span>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-muted/40 px-2 py-1 rounded-md">
                                        {holding.sector}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-baseline md:items-end gap-3 md:gap-1 p-4 md:p-0 rounded-2xl bg-muted/20 md:bg-transparent border border-border/40 md:border-none">
                            <div className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Last Traded Price</div>
                            <div className="flex items-center gap-3">
                                <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground font-mono">
                                    रु. {formatNumber(ltp)}
                                </div>
                                {dailyChange !== 0 && (
                                    <div className={cn(
                                        "flex flex-col items-center px-3 py-1.5 rounded-xl border font-black text-xs transition-all",
                                        dailyChange > 0
                                            ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                            : "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                    )}>
                                        <div className="flex items-center gap-1">
                                            {dailyChange > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                            {dailyChange > 0 ? '+' : ''}{formatNumber(dailyChange)}
                                        </div>
                                        <div className="text-[10px] opacity-80 uppercase tracking-tighter">
                                            {((dailyChange / (ltp - dailyChange)) * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Gross Investment',
                        value: investment,
                        subValue: `${quantity} Units @ ${formatNumber(wacc)}`,
                        icon: Wallet,
                        color: 'blue',
                        gradient: 'from-blue-500/10 to-transparent'
                    },
                    {
                        label: "Today's Market Gain",
                        value: dailyChangeAmount,
                        subValue: `${dailyChange !== 0 ? (dailyChange / (ltp - dailyChange) * 100).toFixed(2) : '0.00'}% Change`,
                        icon: dailyChangeAmount >= 0 ? TrendingUp : TrendingDown,
                        color: dailyChangeAmount >= 0 ? 'green' : 'red',
                        gradient: dailyChangeAmount >= 0 ? 'from-green-500/10 to-transparent' : 'from-red-500/10 to-transparent',
                        isCurrency: true,
                        showSign: true
                    },
                    {
                        label: 'Market Valuation',
                        value: currentValue,
                        subValue: `Current Price रु. ${formatNumber(ltp)}`,
                        icon: PieChart,
                        color: 'purple',
                        gradient: 'from-purple-500/10 to-transparent'
                    },
                    {
                        label: 'Net Returns (Inc. Div)',
                        value: plWithCashflow,
                        subValue: `${plWithCashflowPercent.toFixed(2)}% Performance`,
                        icon: plWithCashflow >= 0 ? TrendingUp : TrendingDown,
                        color: plWithCashflow >= 0 ? 'green' : 'red',
                        gradient: plWithCashflow >= 0 ? 'from-emerald-500/10 to-transparent' : 'from-orange-500/10 to-transparent',
                        isCurrency: true,
                        showSign: true
                    }
                ].map((stat, i) => (
                    <Card key={i} className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border-border/40 bg-card/40 backdrop-blur-xl">
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", stat.gradient)} />
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "p-2 rounded-2xl transition-transform group-hover:scale-110",
                                    stat.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                                        stat.color === 'green' ? "bg-emerald-500/10 text-emerald-500" :
                                            stat.color === 'red' ? "bg-rose-500/10 text-rose-500" :
                                                stat.color === 'purple' ? "bg-violet-500/10 text-violet-500" : "bg-muted text-muted-foreground"
                                )}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                                    {stat.label}
                                </div>
                            </div>
                            <div className={cn(
                                "text-2xl font-black font-mono tracking-tighter mb-1 truncate",
                                stat.showSign && stat.value > 0 ? "text-emerald-500" :
                                    stat.showSign && stat.value < 0 ? "text-rose-500" : "text-foreground"
                            )}>
                                रु {stat.showSign && stat.value > 0 ? '+' : ''}{formatCurrency(stat.value)}
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest bg-muted/20 px-2 py-1 rounded-lg inline-block border border-border/20">
                                {stat.subValue}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Returns Breakdown - Now Full Width */}
            <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border-border/40 bg-card/40 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Returns Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-4">
                            <div className="group p-4 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Unrealized Capital P/L</span>
                                    <span className={cn("text-xs font-black", pl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {plPercent.toFixed(2)}%
                                    </span>
                                </div>
                                <div className={cn("text-xl font-mono font-black tracking-tight", pl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                    रु {pl >= 0 ? '+' : '-'}{formatCurrency(Math.abs(pl))}
                                </div>
                            </div>

                            <div className="group p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 hover:bg-amber-500/[0.06] transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-black text-amber-600/70 uppercase tracking-widest">Realized Dividend Income</span>
                                    <span className="text-xs font-black text-amber-500">Earned</span>
                                </div>
                                <div className="text-xl font-mono font-black tracking-tight text-amber-500">
                                    रु +{formatCurrency(totalCashDividends)}
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/20 overflow-hidden shadow-inner h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <div className="relative">
                                <div className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-2">Overall Portfolio Return</div>
                                <div className={cn("text-3xl font-mono font-black tracking-tighter", plWithCashflow >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                    रु {plWithCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(plWithCashflow))}
                                </div>
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {plWithCashflowPercent.toFixed(2)}% Performance
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/40 space-y-4 mt-6">
                                <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Calculation Steps</div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-muted-foreground">Investment</span>
                                        <span className="font-bold text-foreground">
                                            {formatNumber(quantity)}×{formatNumber(wacc)} = रु {formatCurrency(investment)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-muted-foreground">Market Value</span>
                                        <span className="font-bold text-foreground">
                                            {formatNumber(quantity)}×{formatNumber(ltp)} = रु {formatCurrency(currentValue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono p-1.5 rounded-lg bg-muted/30 border border-dashed border-border/60">
                                        <span className="text-muted-foreground">Cap. Gain</span>
                                        <span className={cn("font-bold", pl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                            रु {formatCurrency(pl)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono p-1.5 rounded-lg bg-primary/5 border border-primary/20">
                                        <span className="text-primary font-black uppercase tracking-tighter text-[9px]">Net Result</span>
                                        <span className={cn("font-black", plWithCashflow >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                            +रु {formatCurrency(totalCashDividends)} = रु {formatCurrency(plWithCashflow)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History Tabs Content */}
            <div className="space-y-8">
                {/* Transaction History Table */}
                {scripTransactions.length > 0 && (
                    <Card className="group relative transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border-border/40 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <History className="w-4 h-4" /> Transaction Lifecycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                                        <tr className="border-b border-border/40">
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution Date</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Categorization</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Volume & Rate</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Event Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {[...scripTransactions].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()).map((tx, idx) => (
                                            <tr key={idx} className="hover:bg-primary/[0.02] transition-colors group/tx">
                                                <td className="p-4">
                                                    <div className="text-sm font-black font-mono text-foreground opacity-90">{tx.Date}</div>
                                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-70">
                                                        TX ID: {tx["Contract No"] || tx["S.N"] || "---"}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                        tx.Type.includes('Buy') || tx.Type.includes('IPO') || tx.Type.includes('Auction')
                                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            tx.Type.includes('Sell')
                                                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                                tx.Type.includes('Bonus') || tx.Type.includes('Right')
                                                                    ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                                                                    "bg-muted text-muted-foreground border-border/40"
                                                    )}>
                                                        {tx.Type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="text-sm font-black tabular-nums">{formatNumber(tx.Quantity)} Shares</div>
                                                    <div className="text-[10px] font-mono text-muted-foreground opacity-60">
                                                        {tx.Rate > 0 ? `@ रु ${formatNumber(tx.Rate)}` : 'Zero Cost Base'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className={cn(
                                                        "text-sm font-black font-mono whitespace-nowrap",
                                                        tx.Type.includes('Sell') ? "text-rose-500" :
                                                            tx.Amount > 0 ? "text-foreground/80" : "text-muted-foreground/40 italic"
                                                    )}>
                                                        {tx.Amount > 0 ? `रु ${formatCurrency(tx.Amount)}` : 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dividend History Table moved to bottom (scoped within history container) */}
            </div>

            {/* Final Section: Dividend Yield History */}
            <Card className="group relative transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border-border/40 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden mt-8">
                <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Dividend Yield History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {scripDividends.length > 0 ? (
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                                    <tr className="border-b border-border/40">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fiscal Period</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Closure Date</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Yield Details</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Payout Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {scripDividends.map((div, idx) => (
                                        <tr key={idx} className="hover:bg-amber-500/[0.02] transition-colors group/row">
                                            <td className="p-4">
                                                <div className="text-sm font-black text-foreground">{(div as any)["Fiscal Year"] || "---"}</div>
                                                <div className="text-[10px] text-amber-600/70 font-black uppercase tracking-widest">{div["Cash %"]}% Cash Bonus</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/40 text-[10px] font-bold text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {div["Book Closure Date"]}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {(div.Holdings || div["Eligible Holdings"]) ? (
                                                    <div className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">
                                                        {formatNumber((div.Holdings || div["Eligible Holdings"]) as number)} units × रु.{((div["Dividend Amount"] || 0) / ((div.Holdings || div["Eligible Holdings"]) as number || 1)).toFixed(2)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/40 italic">Not Available</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-sm font-black font-mono text-emerald-500">
                                                    +रु. {formatCurrency(div["Dividend Amount"] || 0)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto border border-border/40">
                                <DollarSign className="w-8 h-8 text-muted-foreground/20" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">No Dividend Records Identified</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
