
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineIndicator() {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium border border-destructive/20">
                <WifiOff className="w-4 h-4" />
                You are offline. Showing last saved data.
            </div>
        </div>
    );
}
