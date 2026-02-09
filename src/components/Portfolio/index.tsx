import { useState } from 'react';
import { HoldingsTable } from './HoldingsTable';
import { ScripDetails } from './ScripDetails';

export function Portfolio() {
    const [selectedScrip, setSelectedScrip] = useState<string | null>(null);

    if (selectedScrip) {
        return <ScripDetails scrip={selectedScrip} onBack={() => setSelectedScrip(null)} />;
    }

    return (
        <div className="space-y-6">
            <HoldingsTable onSelectScrip={setSelectedScrip} />
        </div>
    );
}
