import { OverviewCards } from './OverviewCards';
import { RatioCard } from './RatioCard';
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

    if (!state.rawAnalysisData) {
        return <WelcomeState onImportClick={onNavigateToImport} />;
    }

    return (
        <div className="space-y-6">
            <OverviewCards />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RatioCard
                    title="Fundamental Ratios"
                    items={[
                        {
                            label: "Price to Earning",
                            value: "15.4",
                            description: "The Price-to-Earnings (P/E) ratio measures the company's current share price relative to its per-share earnings. A weighted average accounts for the size of each holding in your portfolio.",
                            valueColor: "text-blue-500",
                            icon: <div className="text-[10px] border border-current rounded px-1 font-bold">PE</div>
                        },
                        {
                            label: "Price to BookValue",
                            value: "2.1",
                            description: "The Price-to-Book (P/B) ratio compares the company's market value to its book value (assets minus liabilities). It tells you how much you are paying for every rupee of assets.",
                            valueColor: "text-purple-500",
                            icon: <div className="text-[10px] border border-current rounded px-1 font-bold">PB</div>
                        }
                    ]}
                />
                <RatioCard
                    title="Technical Ratios"
                    items={[
                        {
                            label: "Alpha",
                            value: "1.2",
                            description: "Alpha measures the performance of an investment against a market index or benchmark. A positive alpha of 1.2 means the portfolio has outperformed the benchmark by 1.2%.",
                            valueColor: "text-green-500",
                            icon: <span className="text-lg leading-none font-serif italic font-bold">α</span>
                        },
                        {
                            label: "Beta",
                            value: "0.85",
                            description: "Beta measures the volatility of a stock in relation to the overall market. A beta of 0.85 means the portfolio is theoretically 15% less volatile than the market.",
                            valueColor: "text-orange-500",
                            icon: <span className="text-lg leading-none font-serif italic font-bold">β</span>
                        }
                    ]}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AllocationChart />
                <SectorDistribution />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <NepseTodayCard />
                <TradingHistoryCard />
            </div>
        </div>
    );
}
