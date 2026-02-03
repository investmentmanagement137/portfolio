import { OverviewCards } from './OverviewCards';
import { AllocationChart } from './AllocationChart';
import { SectorDistribution } from './SectorDistribution';
import { WelcomeState } from './WelcomeState';
import { usePortfolio } from '../../context/PortfolioContext';

interface DashboardProps {
    onNavigateToImport: () => void;
}

export function Dashboard({ onNavigateToImport }: DashboardProps) {
    const { state } = usePortfolio();

    if (!state.rawAnalysisData) {
        return <WelcomeState onImportClick={onNavigateToImport} />;
    }

    return (
        <div className="space-y-6">
            <OverviewCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AllocationChart />
                <SectorDistribution />
            </div>
        </div>
    );
}
