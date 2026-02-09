import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, PieChart, DollarSign, Calendar, History } from 'lucide-react';
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
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">{holding.companyName}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded">{scrip}</span>
                        <span>•</span>
                        <span className="font-mono">LTP: रु. {formatNumber(ltp)}</span>
                        {dailyChange !== 0 && (
                            <span className={cn("font-bold flex items-center gap-1", dailyChange > 0 ? "text-green-500" : "text-red-500")}>
                                {dailyChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {dailyChange > 0 ? '+' : ''}{formatNumber(dailyChange)}
                                ({((dailyChange / (ltp - dailyChange)) * 100).toFixed(2)}%)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Investment Card */}
                <Card className="bg-gradient-to-br from-blue-500/5 via-card to-background border-blue-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-blue-500" /> Investment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold mb-1">
                            रु. {formatCurrency(investment)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                            <span className="bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
                                {quantity} Units
                            </span>
                            <span>
                                WACC: {formatNumber(wacc)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Gain/Loss Card */}
                <Card className={cn("bg-gradient-to-br border-opacity-20", dailyChangeAmount >= 0 ? "from-green-500/5 border-green-500" : "from-red-500/5 border-red-500")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            {dailyChangeAmount >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                            Today's Gain/Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-mono font-bold mb-1", dailyChangeAmount >= 0 ? "text-green-500" : "text-red-500")}>
                            रु. {dailyChangeAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(dailyChangeAmount))}
                        </div>
                        <div className="text-xs font-bold">
                            <span className={cn("px-1.5 py-0.5 rounded bg-background/50 border border-current/20", dailyChangeAmount >= 0 ? "text-green-500" : "text-red-500")}>
                                {dailyChange !== 0 ? (dailyChange / (ltp - dailyChange) * 100).toFixed(2) : '0.00'}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Value Card */}
                <Card className="bg-gradient-to-br from-purple-500/5 via-card to-background border-purple-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-purple-500" /> Current Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold mb-1">
                            रु. {formatCurrency(currentValue)}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                            Based on LTP: रु. {formatNumber(ltp)}
                        </div>
                    </CardContent>
                </Card>

                {/* P/L Card */}
                <Card className={cn("bg-gradient-to-br border-opacity-20", plWithCashflow >= 0 ? "from-green-500/5 border-green-500" : "from-red-500/5 border-red-500")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            {plWithCashflow >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                            Total Profit/Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-mono font-bold mb-1", plWithCashflow >= 0 ? "text-green-500" : "text-red-500")}>
                            रु. {plWithCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(plWithCashflow))}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className={cn("px-1.5 py-0.5 rounded bg-background/50 border border-current/20", plWithCashflow >= 0 ? "text-green-500" : "text-red-500")}>
                                {plWithCashflowPercent.toFixed(2)}%
                            </span>
                            <span className="text-muted-foreground font-medium ml-auto">
                                (Inc. Cash Div)
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* P/L Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Profit/Loss Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                            <span className="text-sm font-medium text-muted-foreground">Capital Gain/Loss</span>
                            <div className="text-right">
                                <div className={cn("font-mono font-bold", pl >= 0 ? "text-green-500" : "text-red-500")}>
                                    {pl >= 0 ? '+' : '-'}{formatCurrency(Math.abs(pl))}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {plPercent.toFixed(2)}% Return
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                            <span className="text-sm font-medium text-muted-foreground">Total Cash Dividends</span>
                            <div className="font-mono font-bold text-amber-500">
                                +{formatCurrency(totalCashDividends)}
                            </div>
                        </div>
                        <div className="border-t border-border/50 my-2"></div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <span className="text-sm font-bold">Net Total Profit/Loss</span>
                            <div className={cn("font-mono font-bold text-lg", plWithCashflow >= 0 ? "text-green-500" : "text-red-500")}>
                                {plWithCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(plWithCashflow))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dividend History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-500" /> Dividend History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {scripDividends.length > 0 ? (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {scripDividends.map((div, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-xs font-bold">{(div as any)["Fiscal Year"] || "FY N/A"}</div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {div["Book Closure Date"]}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-amber-500 text-sm">
                                                +{formatCurrency(div["Dividend Amount"])}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {div["Cash %"]}% Cash
                                            </div>
                                            {(div.Holdings || div["Eligible Holdings"]) && (
                                                <div className="text-[10px] text-muted-foreground font-mono opacity-80 mt-0.5">
                                                    {div.Holdings || div["Eligible Holdings"]} units × Rs.{((div["Dividend Amount"] || 0) / (div.Holdings || div["Eligible Holdings"] || 1)).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground text-xs font-medium">
                                <DollarSign className="w-8 h-8 mb-2 opacity-20" />
                                No Cash Dividends Recorded
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History - Full Width */}
            {scripTransactions.length > 0 && (
                <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2 border-b border-border/40">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                            <History className="w-4 h-4 text-primary" />
                            Full Transaction History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
                                    <tr className="border-b border-border/40">
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Date</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Type</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap text-right">Qty</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap text-right">Rate</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {[...scripTransactions].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()).map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                            <td className="p-3 text-xs font-medium whitespace-nowrap text-muted-foreground">
                                                {tx.Date}
                                            </td>
                                            <td className="p-3 text-xs">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap",
                                                    tx.Type.includes('Buy') || tx.Type.includes('IPO') || tx.Type.includes('Auction') ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                                                        tx.Type.includes('Sell') ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400" :
                                                            tx.Type.includes('Bonus') || tx.Type.includes('Right') ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" :
                                                                "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                                )}>
                                                    {tx.Type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs font-mono font-bold text-right">
                                                {formatNumber(tx.Quantity)}
                                            </td>
                                            <td className="p-3 text-xs font-mono text-muted-foreground text-right italic opacity-80">
                                                {tx.Rate > 0 ? `रु. ${formatNumber(tx.Rate)}` : '-'}
                                            </td>
                                            <td className="p-3 text-xs font-mono font-bold text-right text-primary/80">
                                                {tx.Amount > 0 ? `रु. ${formatCurrency(tx.Amount)}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
