import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RatioItem {
    label: string;
    value: string | number;
    description: string;
    valueColor?: string;
    icon?: React.ReactNode;
}

interface RatioCardProps {
    title: string;
    items: RatioItem[];
    className?: string;
}

export function RatioCard({ title, items, className }: RatioCardProps) {
    const [selectedItem, setSelectedItem] = useState<RatioItem | null>(null);

    return (
        <>
            <Card className={cn("overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group", className)}>
                <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        {title}
                        <Info className="w-3.5 h-3.5 opacity-50" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y border-border/40">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center group cursor-pointer hover:bg-primary/5 p-5 transition-colors"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                        {item.icon && <div className="text-muted-foreground group-hover:text-primary transition-colors">{item.icon}</div>}
                                    </div>
                                    <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors tracking-tight">
                                        {item.label}
                                    </span>
                                </div>
                                <span className={cn("font-mono font-black text-2xl tracking-tighter", item.valueColor || "text-foreground")}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Simple Modal for Description */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
                    <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 relative">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="mb-2">
                            <h3 className="text-lg font-semibold leading-none tracking-tight">{selectedItem.label}</h3>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-mono font-bold text-primary mb-4">
                                {selectedItem.value}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {selectedItem.description}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
