import { useState } from 'react';
import { ImportData } from '../Import';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Shield, FileText, Database, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { cn } from '../../lib/utils';

interface SettingsProps {
    onImportSuccess?: () => void;
}

export function Settings({ onImportSuccess }: SettingsProps) {
    const { actions } = usePortfolio();
    const [activeSection, setActiveSection] = useState<'data' | 'privacy' | 'terms' | null>('data');

    // Initialize default for desktop if needed, though 'data' is fine. 
    // We'll use CSS to hide/show on mobile based on state.

    const sections = [
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'privacy', label: 'Privacy Policy', icon: Shield },
        { id: 'terms', label: 'Terms of Service', icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row gap-6">

                {/* 
                   Mobile: Show List if no section selected.
                   Desktop: Always show Sidebar.
                */}
                <div className={cn(
                    "md:block md:w-64 h-fit",
                    activeSection ? "hidden" : "block"
                )}>
                    <Card>
                        <CardContent className="p-2">
                            <nav className="flex flex-col gap-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id as any)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-4 md:py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
                                            activeSection === section.id
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground bg-card md:bg-transparent border md:border-none mb-2 md:mb-0"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <section.icon className="w-4 h-4" />
                                            {section.label}
                                        </div>
                                        {/* Mobile Chevron */}
                                        <ChevronRight className="w-4 h-4 md:hidden opacity-50" />
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* 
                   Mobile: Show Content if section selected.
                   Desktop: Always show Content.
                */}
                <div className={cn(
                    "flex-1",
                    !activeSection ? "hidden md:block" : "block"
                )}>
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => setActiveSection(null)}
                        className="md:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 font-medium"
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

                            <div className="pt-8 border-t border-border">
                                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-4">Once you clear your data, there is no going back. Please be certain.</p>
                                <button
                                    onClick={() => { if (confirm("Clear all application data? This cannot be undone.")) actions.clearData(); }}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear Application Data
                                </button>
                            </div>
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
            </div>
        </div>
    );
}
