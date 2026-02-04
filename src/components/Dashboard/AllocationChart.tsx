import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DonutChart } from '../ui/DonutChart';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#64748b'];

export function AllocationChart() {
    const { state: { holdings, portfolioSummary } } = usePortfolio();

    const chartData = [...holdings]
        .sort((a, b) => b.currentValue - a.currentValue);

    const mainAssets = chartData.slice(0, 5);
    const othersValue = chartData.slice(5).reduce((sum, item) => sum + item.currentValue, 0);

    const finalData = othersValue > 0
        ? [...mainAssets, { scrip: 'Others', currentValue: othersValue }]
        : mainAssets;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-80">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
                <DonutChart
                    data={finalData}
                    dataKey="currentValue"
                    nameKey="scrip"
                    colors={CHART_COLORS}
                    centerLabel="Total Value"
                    centerValue={portfolioSummary.value}
                    detailedData={chartData}
                />
            </CardContent>
        </Card>
    );
}
