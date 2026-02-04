import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RatioItem {
    label: string;
    value: string | number;
    description: string;
    valueColor?: string;
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
            <Card className={cn("border-border/50 shadow-md", className)}>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        {title}
                        <Info className="w-3 h-3" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                onClick={() => setSelectedItem(item)}
                            >
                                <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
                                    {item.label}
                                </span>
                                <span className={cn("font-mono font-bold text-lg", item.valueColor || "text-foreground")}>
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
