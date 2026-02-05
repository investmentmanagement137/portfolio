import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function PWAInstallPrompt() {
    const { state } = usePortfolio();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    // Only show if visible AND user has data (scripCount > 0)
    // We check state.holdings.length or portfolioSummary.scripCount
    const hasData = state.portfolioSummary.scripCount > 0;

    if (!isVisible || !hasData) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl shadow-primary/30 flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Download className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                        <div className="font-bold">Install App</div>
                        <div className="opacity-90 text-xs">Add to Home Screen for offline access</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstall}
                        className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
