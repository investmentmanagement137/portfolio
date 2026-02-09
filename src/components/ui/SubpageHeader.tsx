import { ArrowLeft } from 'lucide-react';

interface SubpageHeaderProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    rightElement?: React.ReactNode;
}

export function SubpageHeader({ title, subtitle, onBack, rightElement }: SubpageHeaderProps) {
    return (
        <div className="sticky top-0 z-50 -mx-4 md:-mx-6 mb-6 px-4 md:px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/40 flex items-center gap-4 transition-all animate-in fade-in slide-in-from-top-4">
            <button
                onClick={onBack}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-muted/60 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all active:scale-95 shrink-0 shadow-md backdrop-blur-sm"
                title="Go Back"
            >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-black tracking-tight text-foreground truncate font-display">
                    {title}
                </h2>
                {subtitle && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate">
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>
            {rightElement && (
                <div className="flex items-center gap-3">
                    {rightElement}
                </div>
            )}
        </div>
    );
}
