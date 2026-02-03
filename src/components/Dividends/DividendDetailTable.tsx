import { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent } from '../ui/Card';
import { formatCurrency, cn } from '../../lib/utils';
import { Calendar, Tag, Banknote, Filter, History, LayoutGrid } from 'lucide-react';

export function DividendDetailTable() {
    const { state: { dividendDetails, activeDividends } } = usePortfolio();
    const [useActiveOnly, setUseActiveOnly] = useState(true);

    const baseData = useActiveOnly ? activeDividends : dividendDetails;

    const sortedData = useMemo(() => {
        return [...baseData].sort((a, b) => {
            const dateA = new Date(a["Book Closure Date"]).getTime();
            const dateB = new Date(b["Book Closure Date"]).getTime();
            return dateB - dateA;
        });
    }, [baseData]);

    if (!baseData || baseData.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Dividend History
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

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Dividend History
                </h3>
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
