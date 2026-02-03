import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent } from '../ui/Card';
import { FileDropZone } from './FileDropZone';

interface ImportDataProps {
    onSuccess?: () => void;
}

export function ImportData({ onSuccess }: ImportDataProps) {
    const { actions, state } = usePortfolio();
    const [waccFile, setWaccFile] = useState<File | null>(null);
    const [historyFile, setHistoryFile] = useState<File | null>(null);
    const [holdingsFile, setHoldingsFile] = useState<File | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    // Android often struggles with just .csv, so we include common MIME types
    const CSV_ACCEPT = ".csv,text/csv,application/vnd.ms-excel,application/csv,text/x-csv,application/x-csv,text/comma-separated-values,text/x-comma-separated-values";

    const handleUpload = async () => {
        if (!waccFile || !historyFile) {
            setLocalError("Please select WACC and History CSV files for analysis.");
            return;
        }
        setLocalError(null);

        try {
            await actions.uploadData(waccFile, historyFile, holdingsFile || undefined);
            if (onSuccess) onSuccess();
        } catch (e) {
            // Error is handled in context
        }
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardContent className="p-8">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-2">Import meroshare Data</h2>
                    <p className="text-muted-foreground text-sm">Upload your Meroshare exports to update your portfolio analysis.</p>
                </div>

                {(state.error || localError) && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        {state.error || localError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <FileDropZone
                        label="1. Transaction History"
                        file={historyFile}
                        onFileSelect={setHistoryFile}
                        accept={CSV_ACCEPT}
                    />
                    <FileDropZone
                        label="2. My Wacc Report"
                        file={waccFile}
                        onFileSelect={setWaccFile}
                        accept={CSV_ACCEPT}
                    />
                    <FileDropZone
                        label="3. My Shares Values"
                        file={holdingsFile}
                        onFileSelect={setHoldingsFile}
                        accept={CSV_ACCEPT}
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={state.loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                >
                    {state.loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Portfolio...
                        </>
                    ) : (
                        "Analyze Portfolio"
                    )}
                </button>
            </CardContent>
        </Card>
    );
}
