import React, { useMemo, useState } from 'react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Search,
    X,
    LayoutGrid,     // All
    Gavel,          // Auction
    TrendingUp,     // Holdings
    Briefcase,
    Info,           // Default
    ArrowRightLeft, // Merger/Transfer
    Gift,           // Bonus
    Coins,          // Dividend
    Ticket          // IPO alternative
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { cn } from '../../lib/utils';

// Helper to get color and icon based on transaction type
const getStyle = (type: string) => {
    const t = type.toLowerCase();
    // Brighter, more vibrant colors for dark mode to ensure text pop
    if (t.includes('purchase') || t.includes('buy')) return { color: "text-green-600 dark:text-green-400 font-bold", borderColor: "border-green-200 dark:border-green-400/30", badgeBg: "bg-green-100 dark:bg-green-400/10", dotBorder: "border-green-500", icon: ArrowDownCircle };
    if (t.includes('sales') || t.includes('sell')) return { color: "text-red-600 dark:text-red-400 font-bold", borderColor: "border-red-200 dark:border-red-400/30", badgeBg: "bg-red-100 dark:bg-red-400/10", dotBorder: "border-red-500", icon: ArrowUpCircle };
    if (t.includes('dividend')) return { color: "text-emerald-600 dark:text-emerald-300 font-bold", borderColor: "border-emerald-200 dark:border-emerald-300/30", badgeBg: "bg-emerald-100 dark:bg-emerald-300/10", dotBorder: "border-emerald-500", icon: Coins };
    if (t.includes('bonus')) return { color: "text-purple-600 dark:text-purple-300 font-bold", borderColor: "border-purple-200 dark:border-purple-300/30", badgeBg: "bg-purple-100 dark:bg-purple-300/10", dotBorder: "border-purple-500", icon: Gift };
    if (t.includes('right')) return { color: "text-orange-600 dark:text-orange-300 font-bold", borderColor: "border-orange-200 dark:border-orange-300/30", badgeBg: "bg-orange-100 dark:bg-orange-300/10", dotBorder: "border-orange-500", icon: TrendingUp };
    if (t.includes('ipo')) return { color: "text-blue-600 dark:text-blue-300 font-bold", borderColor: "border-blue-200 dark:border-blue-300/30", badgeBg: "bg-blue-100 dark:bg-blue-300/10", dotBorder: "border-blue-500", icon: Ticket };
    if (t.includes('auction')) return { color: "text-amber-600 dark:text-amber-300 font-bold", borderColor: "border-amber-200 dark:border-amber-300/30", badgeBg: "bg-amber-100 dark:bg-amber-300/10", dotBorder: "border-amber-500", icon: Gavel };
    return { color: "text-slate-600 dark:text-slate-300 font-bold", borderColor: "border-slate-200 dark:border-slate-500/30", badgeBg: "bg-slate-100 dark:bg-slate-300/10", dotBorder: "border-slate-400", icon: Info };
};

const SummaryCard = ({ title, value, subValue, icon: Icon, colorClass, delay }: any) => (
    <div className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:bg-card/80 transition-all duration-300 animate-in fade-in zoom-in-95",
        colorClass
    )} style={{ animationDelay: `${delay}ms` }}>
        <div className="p-2.5 rounded-xl bg-background/50 border border-current opacity-80 current-color shadow-sm">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{title}</div>
            <div className="text-lg font-black tracking-tight leading-none mb-1">{value}</div>
            {subValue && <div className="text-[10px] font-medium opacity-60 leading-tight">{subValue}</div>}
        </div>
    </div>
);

export const Timeline: React.FC = () => {
    const { state } = usePortfolio();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScrip, setSelectedScrip] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);

    // Helpers
    const toggleFilter = (filter: string) => {
        if (filter === 'All') {
            setSelectedFilters(['All']);
            return;
        }

        let newFilters = [...selectedFilters];
        if (newFilters.includes('All')) {
            newFilters = [];
        }

        if (newFilters.includes(filter)) {
            newFilters = newFilters.filter(f => f !== filter);
        } else {
            newFilters.push(filter);
        }

        if (newFilters.length === 0) newFilters = ['All'];
        setSelectedFilters(newFilters);
    };

    // Extract and process transactions
    const { processedData, searchContextEvents, isSingleScrip, uniqueScripsInSearch, allAvailableScrips } = useMemo(() => {
        if (!state.rawAnalysisData) return { processedData: [], searchContextEvents: [], isSingleScrip: false, uniqueScripsInSearch: [], allAvailableScrips: [] };

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
            if (Array.isArray(item)) {
                if (isTransactionList(item)) historyList = item;
                if (isDividendList(item)) dividendList = item;
            }
            if (typeof item === 'object' && item !== null) {
                Object.entries(item).forEach(([key, val]: [string, any]) => {
                    if (Array.isArray(val)) {
                        if (isTransactionList(val)) historyList = val;

                        // Prioritize 'Divident Calculation' (Historical) and ignore 'current holdings in dividents' (Active)
                        if (key === 'Divident Calculation') {
                            dividendList = val;
                        } else if (isDividendList(val) && key !== 'current holdings in dividents' && dividendList.length === 0) {
                            dividendList = val;
                        }
                    }
                });
            }
        }

        // --- Core Processing Logic ---

        // 1. Map raw transaction data
        const mappedTransactions = historyList.map((item: any) => {
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
            const balance = parseFloat(String(item['Balance After Transaction'] || '0').replace(/,/g, ''));
            const amount = parseFloat(String(item['Amount'] || (qty * rate)).replace(/,/g, ''));

            const isCredit = !isNaN(credit) && credit > 0;
            const isDebit = !isNaN(debit) && debit > 0;

            // Calculate Balance Before
            let balanceBefore = 0;
            if (isCredit) {
                balanceBefore = balance - qty;
            } else if (isDebit) {
                balanceBefore = balance + qty;
            } else {
                // Determine direction based on type if explicit quantities aren't clear (fallback)
                const isTypeSell = ['sales', 'sell', 'outflow'].some(k => type.toLowerCase().includes(k));
                if (isTypeSell) balanceBefore = balance + qty;
                else balanceBefore = balance - qty;
            }

            return {
                scrip: item['Scrip'],
                type: type,
                typeLower: type.toLowerCase(),
                quantity: qty,
                rate: rate,
                balance: balance,
                balanceBefore: balanceBefore < 0 ? 0 : balanceBefore, // Guard against negatives
                date: new Date(dateStr),
                originalDate: dateStr,
                isLeftSide: !['sales', 'sell', 'merger', 'closure', 'outflow'].some(k => type.toLowerCase().includes(k)),
                isDividend: false,
                amount: amount, // Transaction Amount
                // Defaults for shape consistency
                cashPercent: 0,
                dividendPerShare: 0,
                holdingsAtClosure: 0,
                faceValue: 0
            };
        });

        // 2. Map raw dividend data
        const mappedDividends = dividendList.map((item: any) => {
            const holdings = parseFloat(item['Holdings'] || 0);
            return {
                scrip: item['Scrip'],
                type: 'Cash Dividend',
                typeLower: 'cash dividend',
                quantity: 0,
                rate: 0,
                balance: holdings, // Set balance to holdingsAtClosure
                balanceBefore: holdings, // Set balanceBefore to holdingsAtClosure
                date: new Date(item['Book Closure Date']),
                originalDate: item['Book Closure Date'],
                isLeftSide: true,
                isDividend: true,
                amount: parseFloat(item['Dividend Amount'] || 0),
                // New fields for detailed display
                cashPercent: parseFloat(item['Cash %'] || 0),
                dividendPerShare: parseFloat(item['Dividend Per Share'] || 0),
                holdingsAtClosure: holdings,
                faceValue: parseFloat(item['Face Value'] || 100)
            };
        });

        const allEvents = [...mappedTransactions, ...mappedDividends].sort((a, b) => b.date.getTime() - a.date.getTime());
        const allAvailableScrips = Array.from(new Set(allEvents.map(e => e.scrip))).sort();

        // --- Filter for Search Context ---
        // Priority: 1. Selected Scrip, 2. Empty query (All), 3. No match (Empty)
        let searchContextEvents = allEvents;

        if (selectedScrip) {
            searchContextEvents = allEvents.filter(e => e.scrip === selectedScrip);
        } else if (searchQuery.trim() !== '') {
            // If typing but not selected, we don't show the timeline yet to avoid "AIL" matching "UAIL"
            // EXCEPT if the query happens to be an exact match (auto-select logic below)
            searchContextEvents = [];
        }

        // --- Check for Single Scrip Selected ---
        const uniqueScripsInSearch = Array.from(new Set(searchContextEvents.map(e => e.scrip)));
        const isSingleScrip = uniqueScripsInSearch.length === 1;

        // --- Aggregation Logic (Based on Search Context) ---
        let totalBuy = 0;
        let totalSell = 0;
        let totalIPO = 0;
        let totalAuction = 0;
        let totalDividend = 0;

        let portfolioValue = 0;

        // For portfolio value, we need latest balance of each scrip found in search context
        uniqueScripsInSearch.forEach(scrip => {
            const scripEvents = searchContextEvents.filter(e => e.scrip === scrip); // Already filtered by search logic above if applicable
            // Find latest non-dividend tx for balance
            const latestTx = scripEvents.find(e => !e.isDividend && e.balance > 0);
            const holding = latestTx ? latestTx.balance : 0;
            const ltp = state.ltpData?.[scrip] || 0;
            portfolioValue += holding * ltp;
        });

        searchContextEvents.forEach(e => {
            const t = e.typeLower;
            if (e.isDividend) {
                totalDividend += e.amount;
            } else {
                if (t.includes('buy') || t.includes('purchase')) totalBuy += e.amount;
                else if (t.includes('sell') || t.includes('sales')) totalSell += e.amount;
                else if (t.includes('ipo')) totalIPO += e.amount;
                else if (t.includes('auction')) totalAuction += e.amount;
            }
        });

        // --- Filter for Display (Timeline) ---
        let displayEvents = searchContextEvents;

        if (!selectedFilters.includes('All')) {
            displayEvents = displayEvents.filter(e => {
                const t = e.typeLower;
                return selectedFilters.some(f => {
                    const fLower = f.toLowerCase();
                    if (fLower === 'buys' && (t.includes('buy') || t.includes('purchase'))) return true;
                    if (fLower === 'sells' && (t.includes('sell') || t.includes('sales'))) return true;
                    if (fLower === 'dividends' && (t.includes('dividend'))) return true;
                    return t.includes(fLower);
                });
            });
        }

        // Group by Date
        const grouped: Record<string, typeof displayEvents> = {};
        displayEvents.forEach(item => {
            const dateKey = item.date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(item);
        });

        return {
            processedData: Object.entries(grouped),
            searchContextEvents,
            isSingleScrip,
            uniqueScripsInSearch,
            allAvailableScrips
        };
    }, [state.rawAnalysisData, searchQuery, selectedFilters]);

    // Derived stats for the summary card
    const summaryData = useMemo(() => {
        // --- Aggregation Logic (Based on Search Context) ---
        let totalBuy = 0;
        let totalSell = 0;
        let totalIPO = 0;
        let totalAuction = 0;
        let totalDividend = 0;

        // Calculate totals from events (History)
        searchContextEvents.forEach(e => {
            const t = e.typeLower;
            if (e.isDividend) {
                totalDividend += e.amount;
            } else {
                if (t.includes('buy') || t.includes('purchase')) totalBuy += e.amount;
                else if (t.includes('sell') || t.includes('sales')) totalSell += e.amount;
                else if (t.includes('ipo')) totalIPO += e.amount;
                else if (t.includes('auction')) totalAuction += e.amount;
            }
        });

        // Calculate Holdings from Current Holdings JSON (state.holdings)
        let holdingsQty = 0;
        let holdingsValue = 0;
        let ltp = 0;

        if (isSingleScrip) {
            const scrip = uniqueScripsInSearch[0];
            const holdingItem = state.holdings.find(h => h.scrip === scrip);
            if (holdingItem) {
                holdingsQty = holdingItem.quantity;
                holdingsValue = holdingItem.currentValue;
                ltp = holdingItem.ltp;
            } else {
                // Fallback if not in current holdings (e.g. fully sold or not yet processed)
                ltp = state.ltpData?.[scrip] || 0;
            }
        } else {
            // Aggregate Holdings based on search context
            const relevantScrips = new Set(uniqueScripsInSearch);
            const relevantHoldings = state.holdings.filter(h => relevantScrips.has(h.scrip));

            holdingsQty = relevantHoldings.reduce((sum, h) => sum + h.quantity, 0);
            holdingsValue = relevantHoldings.reduce((sum, h) => sum + h.currentValue, 0);
        }

        const stats = {
            scrip: isSingleScrip ? uniqueScripsInSearch[0] : 'Portfolio',
            totalBuy,
            totalSell,
            totalIPO,
            totalAuction,
            totalDividend,
            currentValue: holdingsValue,
            ltp,
            holdings: holdingsQty
        };

        return stats;
    }, [state.holdings, searchContextEvents, isSingleScrip, uniqueScripsInSearch, state.ltpData]);


    return (
        <div className="min-h-screen bg-background relative pb-32 animate-in fade-in duration-500">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#00000005_70%,transparent_100%)] pointer-events-none" />

            {/* Header Area */}
            <div className="relative sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 pb-2 shadow-sm transition-all duration-300">
                <div className="flex flex-col gap-3 max-w-3xl mx-auto px-4 pt-4">
                    {/* Search Bar */}
                    <div className="relative group w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search scrip..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);

                                // Auto-select if exact match (case insensitive)
                                const exactMatch = allAvailableScrips.find(s => s.toLowerCase() === val.toLowerCase());
                                if (exactMatch) {
                                    setSelectedScrip(exactMatch);
                                } else if (selectedScrip) {
                                    setSelectedScrip(null);
                                }
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            className="w-full pl-9 pr-9 py-2 bg-muted/30 hover:bg-muted/50 focus:bg-background border border-border/50 focus:border-primary/50 rounded-full text-sm transition-all focus:ring-2 focus:ring-primary/10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedScrip(null);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted/80 rounded-full transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        )}

                        {/* Search Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg max-h-[300px] overflow-y-auto no-scrollbar z-50 animate-in fade-in zoom-in-95 p-1">
                                {allAvailableScrips
                                    .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((scrip) => (
                                        <button
                                            key={scrip}
                                            onClick={() => {
                                                setSearchQuery(scrip);
                                                setSelectedScrip(scrip);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                                        >
                                            <span className="font-medium">{scrip}</span>
                                            {selectedScrip === scrip && (
                                                <span className="text-[10px] text-primary-foreground bg-primary px-1.5 py-0.5 rounded uppercase font-bold">Active</span>
                                            )}
                                        </button>
                                    ))}
                                {allAvailableScrips.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                        No scrips found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Scroll Area */}
                <div className="relative -mx-4 px-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]">
                        {[
                            { id: 'All', icon: LayoutGrid, label: 'All' },
                            { id: 'Buys', icon: ArrowDownCircle, label: 'Buys' },
                            { id: 'Sells', icon: ArrowUpCircle, label: 'Sells' },
                            { id: 'Bonus', icon: Gift, label: 'Bonus' },
                            { id: 'IPO', icon: Ticket, label: 'IPO' },
                            { id: 'Dividends', icon: Coins, label: 'Dividends' },
                            { id: 'Auction', icon: Gavel, label: 'Auction' }
                        ].map(filter => {
                            const Icon = filter.icon;
                            const isActive = selectedFilters.includes(filter.id);
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => toggleFilter(filter.id)}
                                    className={cn(
                                        "pl-3 pr-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95",
                                        isActive
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stats Card Area */}
            {summaryData && (
                <div className="max-w-3xl mx-auto px-4 mt-6 relative z-10 transition-all duration-500">
                    {/* Dynamic Card Logic */}
                    {isSingleScrip ? (
                        // Single Scrip Detailed Card (Existing Style)
                        <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-baseline justify-between mb-4">
                                <h3 className="text-2xl font-bold tracking-tight">{summaryData.scrip}</h3>
                                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                    LTP: <span className="text-foreground font-bold">Rs. {summaryData.ltp.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background/80 rounded-2xl p-4 border border-border/40 shadow-sm">
                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Holdings</div>
                                    <div className="text-2xl font-black tracking-tight">{summaryData.holdings.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">units</span></div>
                                    <div className="text-xs text-muted-foreground font-medium mt-1">Val: Rs. {(summaryData.currentValue / 1000).toFixed(1)}k</div>
                                </div>
                                <div className="bg-background/80 rounded-2xl p-4 border border-border/40 shadow-sm">
                                    <div className="text-[11px] text-green-600/80 uppercase tracking-wider font-bold mb-1">Historical Cash Dividends</div>
                                    <div className="text-2xl font-black tracking-tight text-green-600">Rs. {summaryData.totalDividend.toLocaleString()}</div>
                                    <div className="text-xs text-green-600/70 font-medium mt-1">Total Cash Earned</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Aggregate Portfolio Summary Card (New)
                        <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Portfolio Summary <span className="text-xs font-normal text-muted-foreground opacity-60">(Filtered View)</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <SummaryCard
                                    title="Current Holdings"
                                    value={`Rs. ${(summaryData.currentValue / 100000).toFixed(2)}L`}
                                    subValue={`${summaryData.holdings.toLocaleString()} Units`}
                                    icon={TrendingUp}
                                    colorClass="text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20"
                                    delay={0}
                                />
                                <SummaryCard
                                    title="Total Buy"
                                    value={`Rs. ${(summaryData.totalBuy / 100000).toFixed(2)}L`}
                                    subValue="Invested Amount"
                                    icon={ArrowDownCircle}
                                    colorClass="text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                                    delay={100}
                                />
                                <SummaryCard
                                    title="Total Sell"
                                    value={`Rs. ${(summaryData.totalSell / 100000).toFixed(2)}L`}
                                    subValue="Realized Amount"
                                    icon={ArrowUpCircle}
                                    colorClass="text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                                    delay={150}
                                />
                                <SummaryCard
                                    title="Total IPO"
                                    value={`Rs. ${(summaryData.totalIPO / 1000).toFixed(1)}k`}
                                    icon={Ticket}
                                    colorClass="text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20"
                                    delay={200}
                                />
                                <SummaryCard
                                    title="Historical Dividends"
                                    value={`Rs. ${(summaryData.totalDividend / 1000).toFixed(1)}k`}
                                    icon={Coins}
                                    colorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                                    delay={250}
                                />
                                <SummaryCard
                                    title="Auctions"
                                    value={`Rs. ${(summaryData.totalAuction / 1000).toFixed(1)}k`}
                                    icon={Gavel}
                                    colorClass="text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20"
                                    delay={300}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )
            }

            {/* Content */}
            <div className="relative max-w-3xl mx-auto p-4 md:p-8 safe-area-bottom">
                {/* Center Line */}
                <div className="absolute left-4 md:left-1/2 top-8 bottom-0 w-1 bg-border md:-translate-x-1/2 ml-[19px] md:ml-0" />

                {processedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/50 animate-in fade-in zoom-in duration-300">
                        <Search className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-lg font-medium">
                            {searchQuery && !selectedScrip
                                ? `Select scrip from suggestions...`
                                : `No transactions found`}
                        </p>
                        {searchQuery && !selectedScrip && (
                            <p className="text-xs opacity-60 mt-2 font-mono uppercase tracking-widest">
                                Typing: {searchQuery}
                            </p>
                        )}
                    </div>
                ) : (
                    processedData.map(([date, items], groupIdx) => (
                        <div key={date}>
                            {groupIdx > 0 && (
                                <div className="flex items-center justify-center py-8 opacity-50 relative z-10">
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent dashed" />
                                </div>
                            )}
                            <div className="relative mb-8 group pl-12 md:pl-0 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${groupIdx * 50}ms` }}>
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
                                        const style = getStyle(item.type);
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
                                                    "inline-block relative overflow-hidden border rounded-[28px] p-4 shadow-2xl transition-all duration-300 active:scale-[0.98] w-full md:w-fit min-w-[320px]",
                                                    "bg-white dark:bg-slate-900 hover:shadow-2xl", // Deep navy/slate instead of pure black
                                                    style.borderColor,
                                                    isLeft ? "md:mr-auto" : "md:ml-auto"
                                                )}>
                                                    {/* Header: Transaction Type Badge */}
                                                    <div className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-4",
                                                        style.badgeBg,
                                                        style.color
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                        {item.type}
                                                    </div>

                                                    {/* Scrip Mini-Card */}
                                                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 mb-3 shadow-inner">
                                                        <div className="text-3xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white drop-shadow-sm">{item.scrip}</div>

                                                        {!item.isDividend && (
                                                            <div className="flex items-center gap-4 text-xs font-mono bg-white dark:bg-slate-900 px-3 py-2 rounded-xl w-fit border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                <span className="font-bold text-slate-700 dark:text-slate-100 flex items-center gap-1">
                                                                    {item.quantity.toLocaleString()} <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter font-black">units</span>
                                                                </span>
                                                                <span className="h-3 w-[1.5px] bg-slate-200 dark:bg-slate-700"></span>
                                                                <span className="font-bold text-slate-600 dark:text-slate-300">{item.rate > 0 ? `Rs. ${item.rate.toLocaleString()}` : 'N/A'}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.isDividend ? (
                                                        <div className={cn(
                                                            "rounded-2xl p-4 border relative overflow-hidden mb-3",
                                                            "bg-emerald-500/10 border-emerald-500/30"
                                                        )}>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                                                                    Cash Dividend <span className="opacity-60 text-[9px] font-mono">({item.cashPercent}%)</span>
                                                                </span>
                                                                <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-300">
                                                                    + Rs. {item.amount.toLocaleString()}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-200 font-bold bg-emerald-500/10 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-emerald-500/20">
                                                                <span>On {item.holdingsAtClosure?.toLocaleString() ?? 0} units</span>
                                                                <span className="h-3 w-px bg-emerald-500/30"></span>
                                                                <span>Rs. {item.dividendPerShare} / sh</span>
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {/* Balance Section */}
                                                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black text-[9px] mb-1.5 opacity-80">Balance Before</span>
                                                                <span className="font-mono font-black text-slate-600 dark:text-slate-300 text-sm">{item.balanceBefore?.toLocaleString() ?? 0}</span>
                                                            </div>

                                                            <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                                                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                            </div>

                                                            <div className="flex flex-col text-right">
                                                                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black text-[9px] mb-1.5 opacity-80">Balance After</span>
                                                                <span className="font-mono font-black text-slate-900 dark:text-white text-base tracking-tight">{item.balance.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};
