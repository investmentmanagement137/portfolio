import React, { useRef } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileDropZoneProps {
    label: string;
    file: File | null;
    onFileSelect: (file: File | null) => void;
    accept?: string;
    description?: string;
    optional?: boolean;
}

export function FileDropZone({ label, file, onFileSelect, accept = ".csv", description, optional }: FileDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) onFileSelect(droppedFile);
    };

    return (
        <div className="space-y-2">
            <div className="ml-1">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">{label}</label>
                    {optional && <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Optional</span>}
                </div>
                {description && <span className="text-[9px] text-muted-foreground/60 tracking-wider block mt-0.5">{description}</span>}
            </div>
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={cn(
                    "relative h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 gap-2 group",
                    file
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={inputRef}
                    accept={accept}
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                />

                {file ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold truncate max-w-[150px]">{file.name}</div>
                            <div className="text-[10px] text-muted-foreground">Ready for analysis</div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">
                            Click or Drag<br /><span className="text-[8px] opacity-70">to upload</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
