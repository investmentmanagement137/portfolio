import { useState } from 'react';
import { ImportData } from '../Import';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Shield, FileText, Database } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SettingsProps {
    onImportSuccess?: () => void;
}

export function Settings({ onImportSuccess }: SettingsProps) {
    const [activeSection, setActiveSection] = useState<'data' | 'privacy' | 'terms'>('data');

    const sections = [
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'privacy', label: 'Privacy Policy', icon: Shield },
        { id: 'terms', label: 'Terms of Service', icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <Card className="md:w-64 h-fit">
                    <CardContent className="p-2">
                        <nav className="flex flex-col gap-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id as any)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                                        activeSection === section.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <section.icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1">
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
            </div>
        </div>
    );
}
