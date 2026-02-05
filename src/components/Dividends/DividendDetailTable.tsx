import { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency, cn } from '../../lib/utils';
import { Calendar, Tag, Banknote, Filter, History, LayoutGrid, ArrowUpDown, Search, Briefcase } from 'lucide-react';
import type { DividendEvent } from '../../types';

type SortKey = 'Book Closure Date' | 'Dividend Amount' | 'Scrip';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

export function DividendDetailTable() {
    const { state: { dividendDetails, activeDividends } } = usePortfolio();
    const [useActiveOnly, setUseActiveOnly] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'Book Closure Date', direction: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    const baseData = useActiveOnly ? activeDividends : dividendDetails;

    const sortedData = useMemo(() => {
        const { key, direction } = sortConfig;

        // If searching, search effectively across all history
        const dataToFilter = searchQuery ? dividendDetails : baseData;

        let filtered = dataToFilter;
        if (searchQuery) {
            filtered = dataToFilter.filter(item =>
                item.Scrip.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return [...filtered].sort((a, b) => {
            let valA: any = a[key as keyof DividendEvent] ?? 0;
            let valB: any = b[key as keyof DividendEvent] ?? 0;

            if (key === 'Book Closure Date') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [baseData, sortConfig, searchQuery]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split(':') as [SortKey, SortDirection];
        setSortConfig({ key, direction });
    };

    if (!baseData || baseData.length === 0) {
        return (
            <div className="space-y-4 text-foreground">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Cash Dividend History
                    </h3>
                    <div className="flex p-1 bg-muted rounded-lg border border-border">
                        <button
                            onClick={() => setUseActiveOnly(true)}
                            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                                useActiveOnly ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >Active Portfolio</button>
                        <button
                            onClick={() => setUseActiveOnly(false)}
                            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                                !useActiveOnly ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >All History</button>
                    </div>
                </div>
                <div className="text-center p-12 bg-card border border-dashed border-border rounded-2xl">
                    <p className="text-muted-foreground text-sm">No dividend records found for this view.</p>
                </div>
            </div>
        );
    }

    const totalHistorical = dividendDetails.reduce((acc, curr) => acc + (curr["Dividend Amount"] || 0), 0);
    const totalCurrent = activeDividends.reduce((acc, curr) => acc + (curr["Dividend Amount"] || 0), 0);

    return (
        <div className="space-y-6 pb-8 text-foreground">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500/10 via-card to-background shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                <CardHeader className="justify-center border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Cash Dividend Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 lg:grid-cols-2 divide-x border-border/40">
                        <div className="p-6 transition-colors hover:bg-primary/5">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <Banknote className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Active Dividends</span>
                            </div>
                            <div className="text-2xl font-mono font-black text-foreground tracking-tighter">
                                रु. {formatCurrency(totalCurrent)}
                            </div>
                        </div>
                        <div className="p-6 transition-colors hover:bg-primary/5">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <History className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Historical Total</span>
                            </div>
                            <div className="text-2xl font-mono font-black text-foreground tracking-tighter">
                                रु. {formatCurrency(totalHistorical)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                    <History className="w-5 h-5 text-primary" />
                    Dividend Statistics
                </h3>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search scrip..."
                            className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 w-full sm:w-40 placeholder:text-muted-foreground/50 transition-all focus:w-full sm:focus:w-48 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <select
                            className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-primary/5 transition-colors shadow-sm [&>option]:bg-card [&>option]:text-foreground"
                            onChange={handleSortChange}
                            value={`${sortConfig.key}:${sortConfig.direction}`}
                        >
                            <option value="Book Closure Date:desc">Recent (Newest)</option>
                            <option value="Book Closure Date:asc">Date (Oldest)</option>
                            <option value="Dividend Amount:desc">Amount (High to Low)</option>
                            <option value="Dividend Amount:asc">Amount (Low to High)</option>
                            <option value="Scrip:asc">Scrip (A-Z)</option>
                        </select>
                    </div>
                    <div className="flex p-1 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/40 shrink-0">
                        <button
                            onClick={() => setUseActiveOnly(true)}
                            className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                                useActiveOnly ? "bg-card text-primary shadow-lg border border-border/40" : "text-muted-foreground hover:text-foreground")}
                        >Active</button>
                        <button
                            onClick={() => setUseActiveOnly(false)}
                            className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                                !useActiveOnly ? "bg-card text-primary shadow-lg border border-border/40" : "text-muted-foreground hover:text-foreground")}
                        >History</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedData.map((item, idx) => (
                    <Card key={`${item.Scrip}-${idx}`} className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group/card relative">
                        <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity">
                            <Banknote className="w-16 h-16 rotate-12 text-primary" />
                        </div>

                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="p-5 flex justify-between items-start border-b border-border/40 transition-colors group-hover/card:bg-primary/5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-lg text-foreground tracking-tighter uppercase">{item.Scrip}</h4>
                                            <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest">CASH DIV</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                                            <Briefcase className="w-3 h-3 text-primary/70" />
                                            Holdings: {item["Eligible Holdings"] || item.Holdings}
                                            {item["Current Balance"] !== undefined && (
                                                <span className="text-primary">• Balance: {item["Current Balance"]}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5 opacity-70">Payout</div>
                                        <div className="text-xl font-mono font-black text-amber-500 tracking-tighter">
                                            रु. {formatCurrency(item["Dividend Amount"])}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-border/40 bg-muted/10 group-hover/card:bg-primary/5 transition-colors">
                                    <div className="p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                                            <Calendar className="w-3 h-3" /> Book Close
                                        </div>
                                        <div className="text-xs font-black text-foreground">{item["Book Closure Date"]}</div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                                            <Tag className="w-3 h-3" /> Percentage
                                        </div>
                                        <div className="text-xs font-black text-foreground">{item["Cash %"]}%</div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                                            <LayoutGrid className="w-3 h-3" /> Face Value
                                        </div>
                                        <div className="text-xs font-black text-foreground">रु. {item["Face Value"]}</div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                                            <Filter className="w-3 h-3" /> Per Share
                                        </div>
                                        <div className="text-xs font-black text-foreground">रु. {item["Dividend Per Share"] || (item["Cash %"] * item["Face Value"] / 100).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
