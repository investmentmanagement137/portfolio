import { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent } from '../ui/Card';
import { formatCurrency, cn } from '../../lib/utils';
import { Calendar, Tag, Banknote, Filter, History, LayoutGrid, ArrowUpDown, Search } from 'lucide-react';
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
        <div className="space-y-4 pb-8 text-foreground">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500/10 via-card to-background shadow-xl">
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 lg:grid-cols-2 divide-x divide-y md:divide-y-0 border-border/50">
                        <div className="p-6 transition-colors hover:bg-muted/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <Banknote className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Active Dividends</span>
                            </div>
                            <div className="text-2xl font-mono font-bold text-foreground">
                                Rs. {formatCurrency(totalCurrent)}
                            </div>
                        </div>
                        <div className="p-6 transition-colors hover:bg-muted/30">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <History className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Historical Total</span>
                            </div>
                            <div className="text-2xl font-mono font-bold text-foreground">
                                Rs. {formatCurrency(totalHistorical)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Cash Dividend History
                </h3>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search scrip..."
                            className="bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary w-full sm:w-40 placeholder:text-muted-foreground transition-all focus:w-full sm:focus:w-48 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <select
                            className="bg-card border border-border rounded-lg pl-9 pr-8 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
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
                    <div className="flex p-1 bg-muted rounded-lg border border-border shrink-0">
                        <button
                            onClick={() => setUseActiveOnly(true)}
                            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap",
                                useActiveOnly ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >Active</button>
                        <button
                            onClick={() => setUseActiveOnly(false)}
                            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap",
                                !useActiveOnly ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >History</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {sortedData.map((item, idx) => (
                    <Card key={`${item.Scrip}-${idx}`} className="group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Banknote className="w-12 h-12 rotate-12" />
                        </div>

                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-base text-primary tracking-tight">{item.Scrip}</h4>
                                        <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Cash Div</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <span className="bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">Eligible: {item["Eligible Holdings"] || item.Holdings}</span>
                                        {item["Current Balance"] !== undefined && (
                                            <span className="bg-primary/10 px-1.5 py-0.5 rounded text-primary uppercase tracking-wider border border-primary/20">Current: {item["Current Balance"]}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-mono font-bold text-amber-500">
                                        Rs. {formatCurrency(item["Dividend Amount"])}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase">Total Cash</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] text-muted-foreground uppercase leading-none">Book Closure</div>
                                        <div className="text-xs font-semibold">{item["Book Closure Date"]}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] text-muted-foreground uppercase leading-none">Percentage</div>
                                        <div className="text-xs font-semibold">{item["Cash %"]}%</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] text-muted-foreground uppercase leading-none">Face Value</div>
                                        <div className="text-xs font-semibold">{item["Face Value"]}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] text-muted-foreground uppercase leading-none">Per Share</div>
                                        <div className="text-xs font-semibold">{item["Dividend Per Share"] || (item["Cash %"] * item["Face Value"] / 100).toFixed(2)}</div>
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
