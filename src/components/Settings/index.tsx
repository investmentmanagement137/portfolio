import { useState } from 'react';
import { ImportData } from '../Import';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Shield, FileText, Database, ChevronRight, ArrowLeft, Trash2, RefreshCw, Sun, Moon } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface SettingsProps {
    onImportSuccess?: () => void;
}

export function Settings({ onImportSuccess }: SettingsProps) {
    const { actions, state } = usePortfolio();
    const { theme, setTheme } = useTheme();
    // activeSection null means "Main Menu"
    const [activeSection, setActiveSection] = useState<'data' | 'privacy' | 'terms' | null>(null);
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
                    {/* Appearance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">Appearance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-orange-500" />}
                                    <div className="flex flex-col">
                                        <span className="font-medium">Theme</span>
                                        <span className="text-xs text-muted-foreground">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        theme === 'dark' ? "bg-primary" : "bg-muted border border-border"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                                            theme === 'dark' ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {/* Reanalyse */}
                            <button
                                onClick={handleReanalyse}
                                disabled={isReanalysing}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <RefreshCw className={cn("w-5 h-5 text-blue-500", isReanalysing && "animate-spin")} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{isReanalysing ? 'Analysing...' : 'Reanalyse Portfolio'}</span>
                                        <span className="text-xs text-muted-foreground">Recalculate with saved data</span>
                                        {reanalyseMsg && (
                                            <span className={cn("text-xs font-bold mt-1",
                                                reanalyseMsg.type === 'success' ? "text-green-500" : "text-red-500"
                                            )}>
                                                {reanalyseMsg.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {/* Sync Data */}
                            <button
                                onClick={handleSync}
                                disabled={state.loading}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <RefreshCw className={cn("w-5 h-5 text-green-500", state.loading && "animate-spin")} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Sync Live Prices</span>
                                        <span className="text-xs text-muted-foreground">Fetch latest LTP from market</span>
                                        {showSyncToast && <span className="text-xs text-green-500 font-bold mt-1">Syncing started...</span>}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </CardContent>
                    </Card>

                    {/* Import Data */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">Import Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <button
                                onClick={() => setActiveSection('data')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-purple-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Import Data from Meroshare</span>
                                        <span className="text-xs text-muted-foreground">Upload new WACC and History files</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </CardContent>
                    </Card>

                    {/* About */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <button
                                onClick={() => setActiveSection('privacy')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium">Privacy Policy</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                                onClick={() => setActiveSection('terms')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium">Terms of Service</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div className="pt-4">
                        <h3 className="text-sm font-medium text-red-500 mb-3 px-1 uppercase tracking-wider">Danger Zone</h3>
                        <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                            <p className="text-sm text-muted-foreground mb-4">Once you clear your data, there is no going back. Please be certain.</p>
                            <button
                                onClick={() => { if (confirm("Clear all application data? This cannot be undone.")) actions.clearData(); }}
                                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 border border-red-500/20"
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
            <button
                onClick={() => setActiveSection(null)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
            </button>

            {activeSection === 'data' && (
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
                        <p className="text-muted-foreground">Import your latest portfolio data from Meroshare.</p>
                    </div>
                    <ImportData onSuccess={onImportSuccess} />
                </div>
            )}

            {activeSection === 'privacy' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy Policy</CardTitle>
                        <CardDescription>Last updated: February 3, 2026</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                        <p>
                            Your privacy is critically important to us. This application operates completely on the client-side, meaning:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>No Server Uploads:</strong> Your financial data (WACC, History, Holdings) is processed locally in your browser and is never uploaded to any external server.</li>
                            <li><strong>Local Storage:</strong> Portfolio data is stored exclusively in your browser's LocalStorage for persistence across sessions.</li>
                            <li><strong>Data Control:</strong> You have full control over your data. Clearing your browser cache or LocalStorage will wipe all application data correctly.</li>
                        </ul>
                        <h3 className="text-lg font-semibold mt-6">External Services</h3>
                        <p>
                            This application may fetch live market data (LTP) from public APIs. No personal identifiable information (PII) is transmitted during these requests.
                        </p>
                    </CardContent>
                </Card>
            )}

            {activeSection === 'terms' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Terms of Service</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                        <p>By using this Portfolio Analytics tool, you agree to the following terms:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Usage:</strong> This tool is for informational purposes only and does not constitute financial advice.</li>
                            <li><strong>Accuracy:</strong> While we strive for accuracy, the calculations are based on the data you provide and public market data, which may not always be real-time or error-free.</li>
                            <li><strong>Liability:</strong> The developers are not liable for any financial decisions made based on the data presented in this application.</li>
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
