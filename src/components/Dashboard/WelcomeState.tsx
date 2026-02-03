import { UploadCloud, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface WelcomeStateProps {
    onImportClick: () => void;
}

export function WelcomeState({ onImportClick }: WelcomeStateProps) {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <h2 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                    Smart Portfolio <span className="text-primary">Analyzer</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                    Get deep insights into your investment performance, dividends, and asset distribution with a single upload.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { icon: ShieldCheck, title: "Private & Secure", desc: "Data stays in your browser" },
                    { icon: Zap, title: "Instant Insights", desc: "Real-time market price sync" },
                    { icon: UploadCloud, title: "Easy Import", desc: "Compatible with Meroshare" }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
                        <feature.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                ))}
            </div>

            <Card className="bg-gradient-to-br from-primary via-primary/90 to-indigo-600 border-none shadow-2xl shadow-primary/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <UploadCloud className="w-32 h-32 text-white" />
                </div>
                <CardContent className="p-10 text-center relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to start?</h3>
                    <p className="text-white/80 mb-8 max-w-md mx-auto font-medium">
                        Upload your WACC and Transaction History exports to see your detailed analysis.
                    </p>
                    <button
                        onClick={onImportClick}
                        className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-4 rounded-xl shadow-xl transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Getting Started
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
