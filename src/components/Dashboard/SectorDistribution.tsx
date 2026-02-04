import { usePortfolio } from '../../context/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DonutChart } from '../ui/DonutChart';

const SECTOR_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#64748B'];

export function SectorDistribution() {
    const { state: { holdings, portfolioSummary } } = usePortfolio();

    const sectorMap = holdings.reduce((acc, item) => {
        acc[item.sector] = (acc[item.sector] || 0) + item.currentValue;
        return acc;
    }, {} as Record<string, number>);

    const sectorData = Object.entries(sectorMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const mainSectors = sectorData.slice(0, 5);
    const othersValue = sectorData.slice(5).reduce((sum, item) => sum + item.value, 0);

    const finalData = othersValue > 0
        ? [...mainSectors, { name: 'Others', value: othersValue }]
        : mainSectors;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-80">Sector Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <DonutChart
                    data={finalData}
                    dataKey="value"
                    nameKey="name"
                    colors={SECTOR_COLORS}
                    centerLabel="Total Value"
                    centerValue={portfolioSummary.value}
                    detailedData={sectorData}
                />
            </CardContent>
        </Card>
    );
}
