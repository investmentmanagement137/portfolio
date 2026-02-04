import React, { useMemo, useState } from 'react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Search,
    X,
    Gift,           // Bonus
    Coins,          // Dividend
    Vote,           // Right Share
    Building2,      // IPO/Merger
    Ticket,         // IPO alternative
    ArrowRightLeft  // Merger/Transfer
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { cn } from '../../lib/utils';

// Helper to get color and icon based on transaction type
const getTransactionStyle = (type: string) => {
    const t = type.toLowerCase();

    // Light mode: Stronger backgrounds (e.g. bg-green-100), Darker text (text-green-700)
    // Dark mode: Subtle backgrounds (bg-green-500/10), Lighter text (dark:text-green-400)

    if (t.includes('purchase') || t.includes('buy')) {
        return {
            color: 'text-green-700 dark:text-green-400',
            borderColor: 'border-green-200 dark:border-green-500/30',
            bgTint: 'bg-green-50 hover:bg-green-100 dark:bg-green-500/5 dark:hover:bg-green-500/10',
            dotBorder: 'border-green-500',
            icon: ArrowDownCircle,
            label: 'Purchase'
        };
    }
    if (t.includes('sales') || t.includes('sell')) {
        return {
            color: 'text-red-700 dark:text-red-400',
            borderColor: 'border-red-200 dark:border-red-500/30',
            bgTint: 'bg-red-50 hover:bg-red-100 dark:bg-red-500/5 dark:hover:bg-red-500/10',
            dotBorder: 'border-red-500',
            icon: ArrowUpCircle,
            label: 'Sales'
        };
    }
    if (t.includes('bonus')) {
        return {
            color: 'text-purple-700 dark:text-purple-400',
            borderColor: 'border-purple-200 dark:border-purple-500/30',
            bgTint: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/5 dark:hover:bg-purple-500/10',
            dotBorder: 'border-purple-500',
            icon: Gift,
            label: 'Bonus Share'
        };
    }
    if (t.includes('ipo')) {
        return {
            color: 'text-blue-700 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-500/30',
            bgTint: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/5 dark:hover:bg-blue-500/10',
            dotBorder: 'border-blue-500',
            icon: Ticket,
            label: 'IPO'
        };
    }
    if (t.includes('dividend')) {
        return {
            color: 'text-emerald-700 dark:text-emerald-400',
            borderColor: 'border-emerald-200 dark:border-emerald-500/30',
            bgTint: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10',
            dotBorder: 'border-emerald-500',
            icon: Coins,
            label: 'Cash Dividend'
        };
    }
    if (t.includes('right')) {
        return {
            color: 'text-amber-700 dark:text-amber-400',
            borderColor: 'border-amber-200 dark:border-amber-500/30',
            bgTint: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/5 dark:hover:bg-amber-500/10',
            dotBorder: 'border-amber-500',
            icon: Vote,
            label: 'Right Share'
        };
    }
    if (t.includes('merge')) {
        return {
            color: 'text-indigo-700 dark:text-indigo-400',
            borderColor: 'border-indigo-200 dark:border-indigo-500/30',
            bgTint: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/5 dark:hover:bg-indigo-500/10',
            dotBorder: 'border-indigo-500',
            icon: ArrowRightLeft,
            label: 'Merger'
        };
    }

    // Default / Others
    return {
        color: 'text-slate-700 dark:text-slate-400',
        borderColor: 'border-slate-200 dark:border-slate-500/30',
        bgTint: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-500/5 dark:hover:bg-slate-500/10',
        dotBorder: 'border-slate-400',
        icon: Building2,
        label: type
    };
};



export const Timeline: React.FC = () => {
    const { state } = usePortfolio();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    // Extract and process transactions
    const transactions = useMemo(() => {
        if (!state.rawAnalysisData) return [];

        let historyList: any[] = [];
        let dividendList: any[] = [];

        // Helper to check if a list looks like transactions
        const isTransactionList = (list: any[]) => {
            if (!Array.isArray(list) || list.length === 0) return false;
            const first = list[0];
            return first && (
                (first.hasOwnProperty('Scrip') && first.hasOwnProperty('Transaction Date')) ||
                (first.hasOwnProperty('Scrip') && first.hasOwnProperty('Date'))
            );
        };

        // Helper to check if a list looks like dividends
        const isDividendList = (list: any[]) => {
            if (!Array.isArray(list) || list.length === 0) return false;
            const first = list[0];
            return first && first.hasOwnProperty('Dividend Amount') && first.hasOwnProperty('Book Closure Date');
        };

        // Iterate top-level items to find data sources
        for (const item of state.rawAnalysisData) {
            // Check direct array (unlikely based on structure analysis but good safety)
            if (Array.isArray(item)) {
                if (isTransactionList(item)) historyList = item;
                if (isDividendList(item)) dividendList = item;
            }

            // Check object values
            if (typeof item === 'object' && item !== null) {
                Object.values(item).forEach((val: any) => {
                    if (Array.isArray(val)) {
                        if (isTransactionList(val)) historyList = val;
                        // Check for key specifically if possible, but heuristic works
                        if (isDividendList(val)) dividendList = val;
                    }
                });
            }
        }

        // Process Transactions
        const processedTransactions = historyList.map((item: any) => {
            const dateStr = item['Date'] || item['Transaction Date'];
            const typeRaw = item['source'] || item['Type'] || item['Transaction Type'] || 'Unknown';
            const type = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);

            let qty = 0;
            const creditRaw = item['Credit Quantity'] || item['Quantity'];
            const debitRaw = item['Debit Quantity'];

            const credit = parseFloat(String(creditRaw).replace(/,/g, ''));
            const debit = parseFloat(String(debitRaw).replace(/,/g, ''));

            if (!isNaN(credit) && credit > 0) qty = credit;
            else if (!isNaN(debit) && debit > 0) qty = debit;

            const rate = parseFloat(item['Rate'] || item['Price'] || 0);

            // Balance After Transaction
            const balance = parseFloat(String(item['Balance After Transaction'] || '0').replace(/,/g, ''));

            // Determine alignment and color logic
            // User request: Only Sell, Merger, Company Closure on Right Side (Red).
            // All others (Buy, Bonus, IPO, Right, Dividend) on Left Side (Green).
            const typeLower = type.toLowerCase();
            const isRightSide = ['sales', 'sell', 'merger', 'closure', 'outflow'].some(k => typeLower.includes(k));
            const isLeftSide = !isRightSide;

            return {
                scrip: item['Scrip'],
                type: type,
                quantity: qty,
                rate: rate,
                balance: balance,
                date: new Date(dateStr),
                originalDate: dateStr,
                isLeftSide: isLeftSide,
                isDividend: false,
                amount: 0
            };
        });

        // Process Dividends (Always Left/Green as it's an inflow)
        const processedDividends = dividendList.map((item: any) => {
            const dateStr = item['Book Closure Date'];
            return {
                scrip: item['Scrip'],
                type: 'Cash Dividend',
                quantity: 0,
                rate: 0,
                balance: 0,
                date: new Date(dateStr),
                originalDate: dateStr,
                isLeftSide: true, // Dividends on left
                isDividend: true,
                amount: parseFloat(item['Dividend Amount'] || 0)
            };
        });

        // Merge and Sort
        let allEvents = [...processedTransactions, ...processedDividends].sort((a, b) => b.date.getTime() - a.date.getTime());

        // Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            allEvents = allEvents.filter(e => e.scrip.toLowerCase().includes(q));
        }

        if (filterType !== 'All') {
            const t = filterType.toLowerCase();
            if (t === 'purchase' || t === 'buy') {
                allEvents = allEvents.filter(e => ['Buy', 'Purchase'].some(k => e.type.includes(k)));
            } else if (t === 'sales' || t === 'sell') {
                allEvents = allEvents.filter(e => ['Sales', 'Sell'].some(k => e.type.includes(k)));
            } else {
                allEvents = allEvents.filter(e => e.type.toLowerCase().includes(t));
            }
        }

        // Group by Date
        const grouped: Record<string, typeof allEvents> = {};
        allEvents.forEach(item => {
            const dateKey = item.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(item);
        });

        return Object.entries(grouped);
    }, [state.rawAnalysisData, searchQuery, filterType]);

    // Derived stats for the summary card
    const scripStats = useMemo(() => {
        if (!searchQuery) return null;

        const flatEvents = transactions.flatMap(([_, items]) => items);
        if (flatEvents.length === 0) return null;

        const uniqueScrips = Array.from(new Set(flatEvents.map(e => e.scrip)));
        if (uniqueScrips.length !== 1) return null;

        const scrip = uniqueScrips[0];
        const scripEvents = flatEvents;

        // Current Holdings: latest 'balance'
        const latestTx = scripEvents.find(e => !e.isDividend && e.balance > 0);
        const currentHoldings = latestTx ? latestTx.balance : 0;

        // Total Dividend
        const totalDividend = scripEvents
            .filter(e => e.isDividend)
            .reduce((sum, e) => sum + e.amount, 0);

        // LTP
        const ltp = state.ltpData?.[scrip] || 0;

        const currentValue = currentHoldings * ltp;

        return { scrip, currentHoldings, totalDividend, ltp, currentValue };
    }, [transactions, searchQuery, state.ltpData]);

    return (
        <div className="min-h-screen bg-background relative pb-20 animate-in fade-in duration-500">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#00000005_70%,transparent_100%)] pointer-events-none" />

            {/* Header Area */}
            <div className="relative sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60 p-4 shadow-sm">
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                    {/* Title & Search */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Timeline</h2>
                            <p className="text-sm text-muted-foreground mt-1">Track your investment milestones</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search scrip (e.g. NABIL)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-card/50 dark:bg-muted/30 border border-input/50 dark:border-transparent rounded-2xl text-base shadow-sm transition-all focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                            {['All', 'Purchase', 'Sales', 'Bonus', 'IPO', 'Cash Dividend'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border",
                                        filterType === type
                                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                                            : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrip Stats (if available) - needs similar container wrapper */}
            {scripStats && (
                <div className="max-w-3xl mx-auto px-4 mt-6 relative z-10">
                    <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
                        {/* existing stats content */}
                        <div className="flex items-baseline justify-between mb-4">
                            <h3 className="text-2xl font-bold tracking-tight">{scripStats.scrip}</h3>
                            <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                LTP: <span className="text-foreground font-bold">Rs. {scripStats.ltp.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/80 rounded-2xl p-4 border border-border/40 shadow-sm">
                                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Holdings</div>
                                <div className="text-2xl font-black tracking-tight">{scripStats.currentHoldings.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">units</span></div>
                                <div className="text-xs text-muted-foreground font-medium mt-1">Val: Rs. {(scripStats.currentValue / 1000).toFixed(1)}k</div>
                            </div>

                            <div className="bg-background/80 rounded-2xl p-4 border border-border/40 shadow-sm">
                                <div className="text-[11px] text-green-600/80 uppercase tracking-wider font-bold mb-1">Dividends</div>
                                <div className="text-2xl font-black tracking-tight text-green-600">Rs. {scripStats.totalDividend.toLocaleString()}</div>
                                <div className="text-xs text-green-600/70 font-medium mt-1">Total Cash Earned</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative max-w-3xl mx-auto p-4 md:p-8 safe-area-bottom">
                {/* Center Line */}
                <div className="absolute left-4 md:left-1/2 top-8 bottom-0 w-px bg-border/60 md:-translate-x-1/2 ml-[19px] md:ml-0 dashed" />

                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/50 animate-in fade-in zoom-in duration-300">
                        <Search className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-lg font-medium">No transactions found</p>
                    </div>
                ) : (
                    transactions.map(([date, items], groupIdx) => (
                        <div key={date} className="relative mb-12 group pl-12 md:pl-0 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                            {/* Date Marker */}
                            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 -top-3 z-10 text-center">
                                <div className="bg-background/95 backdrop-blur border border-border/80 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold shadow-sm flex items-center justify-center gap-2 whitespace-nowrap mx-auto w-fit ring-4 ring-background transition-transform hover:scale-105 hover:border-primary/30">
                                    <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                    <span className="text-foreground/80">{date}</span>
                                </div>
                            </div>

                            <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
                                {items.map((item, idx) => {
                                    const isLeft = item.isLeftSide;
                                    const style = getTransactionStyle(item.type);
                                    const Icon = style.icon;

                                    return (
                                        <div
                                            key={`${item.scrip}-${idx}`}
                                            className={cn(
                                                "relative",
                                                // Desktop positioning
                                                "md:col-span-1",
                                                isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2 md:text-left"
                                            )}
                                        >
                                            {/* Dot Connector */}
                                            <div className={cn(
                                                "absolute top-8 w-3.5 h-3.5 rounded-full border-[3px] bg-background z-20 shadow-sm transition-transform group-hover:scale-125",
                                                style.dotBorder,
                                                // Position dot on the center line
                                                "left-[-26px] md:left-auto", // Mobile: left aligned
                                                isLeft ? "md:-right-[33px]" : "md:-left-[33px]"
                                            )} />

                                            {/* Card */}
                                            <div className={cn(
                                                "inline-block relative overflow-hidden backdrop-blur-md border rounded-[24px] p-5 shadow-sm transition-all duration-300 active:scale-[0.98] w-full md:w-auto min-w-[240px]",
                                                "bg-card/80 hover:bg-card hover:shadow-md", // Base bg with improved opacity for light mode visibility
                                                style.borderColor, // Dynamic Border
                                                style.bgTint       // Dynamic Hover Tint
                                            )}>
                                                <div className={cn(
                                                    "font-bold text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2",
                                                    style.color,
                                                    isLeft ? "md:justify-end" : "md:justify-start",
                                                    "justify-start" // Mobile always start
                                                )}>
                                                    {!isLeft && <Icon className="w-4 h-4" />}
                                                    {item.type}
                                                    {isLeft && <Icon className="w-4 h-4" />}
                                                </div>

                                                <div className="text-xl font-black tracking-tight mb-3 text-foreground">{item.scrip}</div>

                                                {item.isDividend ? (
                                                    <div className={cn(
                                                        "rounded-2xl p-3 flex items-center justify-between border",
                                                        "bg-emerald-500/10 border-emerald-500/10 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                    )}>
                                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-tight">Dividend</span>
                                                        <span className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-300">
                                                            + Rs. {item.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between gap-4 text-xs font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                                                            <span className="font-bold text-foreground/80">{item.quantity} <span className="text-[9px] font-normal text-muted-foreground">units</span></span>
                                                            <span className="opacity-20">|</span>
                                                            <span className="font-medium">{item.rate > 0 ? `@ ${item.rate}` : 'N/A'}</span>
                                                        </div>

                                                        {item.balance > 0 && (
                                                            <div className="pt-2 border-t border-dashed border-border/60 flex items-center justify-between text-[11px]">
                                                                <span className="text-muted-foreground uppercase tracking-widest font-bold opacity-70">Balance</span>
                                                                <span className="font-mono font-bold tracking-tighter text-foreground">{item.balance.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
