import { useState } from 'react';
import { ImportData } from '../Import';
// Timeline import removed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Shield, FileText, Database, ChevronRight, ArrowLeft, Trash2, RefreshCw, Sun, Moon, ExternalLink, History } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface SettingsProps {
    onImportSuccess?: () => void;
    onNavigateToTimeline?: () => void;
}

export function Settings({ onImportSuccess, onNavigateToTimeline }: SettingsProps) {
    const { actions, state } = usePortfolio();
    const { theme, setTheme } = useTheme();
    // activeSection null means "Main Menu"
    const [activeSection, setActiveSection] = useState<'data' | 'privacy' | 'terms' | 'timeline' | null>(null);
    const [isReanalysing, setIsReanalysing] = useState(false);
    const [reanalyseMsg, setReanalyseMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showSyncToast, setShowSyncToast] = useState(false);

    const handleSync = async () => {
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 3000);
        await actions.refreshLtp();
    };

    const handleReanalyse = async () => {
        if (isReanalysing) return;
        setIsReanalysing(true);
        setReanalyseMsg(null);
        try {
            await actions.reanalysePortfolio();
            setReanalyseMsg({ type: 'success', text: 'Portfolio reanalysed successfully!' });
            if (onImportSuccess) onImportSuccess();
        } catch (err: any) {
            setReanalyseMsg({ type: 'error', text: err.message || "Failed to reanalyse" });
        } finally {
            setIsReanalysing(false);
        }
    };

    // Main Menu View
    if (!activeSection) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage your preferences and data.</p>
                </div>

                <div className="grid gap-6">
                    {/* Appearance & Preferences */}
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                        <CardHeader className="justify-center border-b border-border/40 bg-muted/20 py-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Appearance & Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y border-border/40">
                                {/* Theme Toggle */}
                                <div className="flex items-center justify-between p-4 transition-colors hover:bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-orange-500" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Theme</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus-visible:outline-none shadow-inner",
                                            theme === 'dark' ? "bg-primary" : "bg-zinc-200 border border-zinc-300"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-300",
                                                theme === 'dark' ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* ROI Toggle */}
                                <div className="flex items-center justify-between p-4 transition-colors hover:bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs">%</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">ROI Display</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{state.roiType === 'annualized' ? 'Annualized Return' : 'Simple Return'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => actions.updateRoiType(state.roiType === 'simple' ? 'annualized' : 'simple')}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus-visible:outline-none shadow-inner",
                                            state.roiType === 'annualized' ? "bg-primary" : "bg-zinc-200 border border-zinc-300"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-300",
                                                state.roiType === 'annualized' ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                        <CardHeader className="justify-center border-b border-border/40 bg-muted/20 py-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y border-border/40">
                                {/* Reanalyse */}
                                <button
                                    onClick={handleReanalyse}
                                    disabled={isReanalysing}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <RefreshCw className={cn("w-5 h-5 text-blue-500", isReanalysing && "animate-spin")} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{isReanalysing ? 'Analysing...' : 'Reanalyse Portfolio'}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recalculate with saved data</span>
                                            {reanalyseMsg && (
                                                <span className={cn("text-[10px] font-black mt-1 uppercase tracking-widest",
                                                    reanalyseMsg.type === 'success' ? "text-green-500" : "text-red-500"
                                                )}>
                                                    {reanalyseMsg.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>

                                {/* Sync Data */}
                                <button
                                    onClick={handleSync}
                                    disabled={state.loading}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <RefreshCw className={cn("w-5 h-5 text-green-500", state.loading && "animate-spin")} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Sync Live Prices</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fetch latest LTP from market</span>
                                            {showSyncToast && <span className="text-[10px] text-green-500 font-black mt-1 uppercase tracking-widest">Syncing started...</span>}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Broker Settings */}
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                        <CardHeader className="justify-center border-b border-border/40 bg-muted/20 py-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Broker Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40 relative overflow-hidden group/item">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                                <div className="flex flex-col relative z-10">
                                    <span className="font-bold text-sm">Broker Number</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Used for future trade tracking</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10">
                                    <span className="text-xs font-black text-primary opacity-70">#</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        placeholder="No."
                                        value={state.brokerNo || ''}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                                            if (val === null || (val >= 1 && val <= 100)) {
                                                actions.updateBrokerNo(val);
                                            }
                                        }}
                                        className="w-16 bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl px-3 py-2 text-sm font-mono font-black text-foreground focus:outline-none focus:border-primary/50 text-center shadow-inner"
                                    />
                                </div>
                            </div>
                            {state.brokerNo && (
                                <div className="mt-3 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <a
                                        href={`https://tms${state.brokerNo}.nepsetms.com.np/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-all w-fit group/link"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                        Visit Broker #{state.brokerNo} TMS Portal
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data & History */}
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                        <CardHeader className="justify-center border-b border-border/40 bg-muted/20 py-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data & History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y border-border/40">
                                <button
                                    onClick={() => setActiveSection('data')}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <Database className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Meroshare Import</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Update WACC and History</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>
                                <button
                                    onClick={() => onNavigateToTimeline?.()}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <History className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Transaction Timeline</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Buy/Sell history log</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal & About */}
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                        <CardHeader className="justify-center border-b border-border/40 bg-muted/20 py-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Legal & About</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y border-border/40">
                                <button
                                    onClick={() => setActiveSection('privacy')}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <Shield className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Privacy Policy</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data protection guidelines</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>
                                <button
                                    onClick={() => setActiveSection('terms')}
                                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-primary/5 text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Terms of Service</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform rules and usage</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div className="pt-8">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Danger Zone</h3>
                        </div>
                        <div className="border border-red-500/20 rounded-2xl p-6 bg-gradient-to-br from-red-500/5 via-red-500/10 to-transparent relative overflow-hidden group/danger">
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/danger:opacity-100 transition-opacity pointer-events-none" />
                            <p className="text-sm text-muted-foreground mb-6 font-bold leading-relaxed relative z-10">
                                Once you clear your data, there is no going back. This will wipe all portfolio data, WACC history, and application settings.
                            </p>
                            <button
                                onClick={() => { if (confirm("Clear all application data? This cannot be undone.")) actions.clearData(); }}
                                className="w-full bg-red-500 text-white hover:bg-red-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98] relative z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Application Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Sub-Pages
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
            {/* Timeline section removed */}
            {activeSection !== 'timeline' && (
                <>
                    <button
                        onClick={() => setActiveSection(null)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 font-black uppercase tracking-widest text-[10px] transition-all group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        Back to Settings
                    </button>

                    {activeSection === 'data' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-black tracking-tight uppercase">Data Management</h2>
                                <p className="text-muted-foreground font-bold">Import your latest portfolio data from Meroshare.</p>
                            </div>
                            <ImportData onSuccess={onImportSuccess} />
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative">
                            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                            <CardHeader className="border-b border-border/40 bg-muted/20 py-6">
                                <CardTitle className="text-xl font-black tracking-tighter uppercase mb-1">Privacy Policy</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-70">Last updated: February 3, 2026</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 prose prose-sm dark:prose-invert max-w-none space-y-6">
                                <p className="text-foreground/80 font-bold leading-relaxed">
                                    Your privacy is critically important to us. This application operates completely on the client-side, meaning:
                                </p>
                                <div className="grid gap-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">No Server Uploads</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Your financial data (WACC, History, Holdings) is processed locally in your browser and is never uploaded to any external server.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">Local Storage</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Portfolio data is stored exclusively in your browser's LocalStorage for persistence across sessions.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">Data Control</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">You have full control over your data. Clearing your browser cache or LocalStorage will wipe all application data correctly.</p>
                                    </div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest mt-8 border-b border-border/40 pb-2">External Services</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This application may fetch live market data (LTP) from public APIs. No personal identifiable information (PII) is transmitted during these requests.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'terms' && (
                        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-card to-background shadow-xl relative">
                            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
                            <CardHeader className="border-b border-border/40 bg-muted/20 py-6">
                                <CardTitle className="text-xl font-black tracking-tighter uppercase">Terms of Service</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 prose prose-sm dark:prose-invert max-w-none space-y-6">
                                <p className="text-foreground/80 font-bold leading-relaxed">By using this Portfolio Analytics tool, you agree to the following terms:</p>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <div>
                                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Usage</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">This tool is for informational purposes only and does not constitute financial advice.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <div>
                                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Accuracy</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">While we strive for accuracy, calculations are based on user data and public market data, which may not always be real-time.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <div>
                                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Liability</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">The developers are not liable for any financial decisions made based on the data presented in this application.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
