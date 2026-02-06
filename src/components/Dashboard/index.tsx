import { OverviewCards } from './OverviewCards';

import { AllocationChart } from './AllocationChart';
import { SectorDistribution } from './SectorDistribution';
import { WelcomeState } from './WelcomeState';
import { usePortfolio } from '../../context/PortfolioContext';
import { NepseTodayCard } from './NepseTodayCard';
import { TradingHistoryCard } from './TradingHistoryCard';

interface DashboardProps {
    onNavigateToImport: () => void;
}

export function Dashboard({ onNavigateToImport }: DashboardProps) {
    const { state } = usePortfolio();

    return (
        <div className="space-y-6">
            <NepseTodayCard />
            {!state.rawAnalysisData ? (
                <WelcomeState onImportClick={onNavigateToImport} />
            ) : (
                <>
                    <OverviewCards />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AllocationChart />
                        <SectorDistribution />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <TradingHistoryCard />
                    </div>
                </>
            )}
        </div>
    );
}
