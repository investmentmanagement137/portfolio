import { X, ExternalLink } from 'lucide-react';
import { DATA_SOURCES } from '../../lib/data-sources';

interface DataSourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbol: string;
}

export function DataSourceModal({ isOpen, onClose, symbol }: DataSourceModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background border border-border/40 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <h3 className="font-bold text-lg">Select Source for {symbol}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 grid gap-2">
                    {DATA_SOURCES.map((source) => (
                        <a
                            key={source.key}
                            href={source.url(symbol)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-primary/5 transition-all group"
                        >
                            <span className="font-bold text-sm group-hover:text-primary transition-colors">{source.name}</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                    ))}
                </div>
                <div className="p-4 bg-muted/20 text-[10px] text-center text-muted-foreground font-medium border-t border-border/40">
                    You can set a default source in Settings
                </div>
            </div>
        </div>
    );
}
