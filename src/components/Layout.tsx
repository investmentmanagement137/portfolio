import { useState } from 'react';
import { Home, Wallet, PieChart, RefreshCw, Settings, Sun, Moon, CheckCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';

interface NavItemProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center w-full p-2 transition-colors duration-200 rounded-lg",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current/10")} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
    // We could lift theme state up, but for now we manage classList here for simplicity
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const { state, actions } = usePortfolio();
    const { theme, setTheme } = useTheme();
    const [showSyncToast, setShowSyncToast] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleSync = async () => {
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 3000); // Hide after 3s
        await actions.refreshLtp();
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-32 md:pb-36 transition-colors duration-300">
            {/* Sync Toast Notification */}
            {showSyncToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Syncing latest prices...
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center transition-colors duration-300">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground/90">Portfolio Analyzer</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {state.rawAnalysisData && (
                        <button
                            onClick={handleSync}
                            disabled={state.loading}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
                                state.loading
                                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 cursor-not-allowed"
                                    : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20 active:bg-green-500/30"
                            )}
                            title="Sync Market Prices"
                        >
                            <RefreshCw className={cn("w-3 h-3", state.loading && "animate-spin")} />
                            <span className="hidden sm:inline">Sync Price</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">

                {children}
            </main>

            <nav className="fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-lg border-t border-border z-50 safe-area-bottom transition-colors duration-300">
                <div className="flex items-center justify-around p-2 max-w-md mx-auto">
                    <NavItem
                        icon={Home}
                        label="Home"
                        isActive={activeTab === 'home'}
                        onClick={() => onTabChange('home')}
                    />
                    <NavItem
                        icon={Wallet}
                        label="Portfolio"
                        isActive={activeTab === 'portfolio'}
                        onClick={() => onTabChange('portfolio')}
                    />
                    <NavItem
                        icon={PieChart}
                        label="Dividends"
                        isActive={activeTab === 'dividends'}
                        onClick={() => onTabChange('dividends')}
                    />
                    <NavItem
                        icon={Settings}
                        label="Settings"
                        isActive={activeTab === 'settings'}
                        onClick={() => onTabChange('settings')}
                    />
                </div>
            </nav>
        </div>
    );
}
