// @ts-nocheck
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface DonutChartProps {
    data: any[];
    dataKey: string;
    nameKey: string;
    colors: string[];
    centerLabel?: string;
    centerValue?: number;
}

export function DonutChart({ data, dataKey, nameKey, colors, centerLabel, centerValue }: DonutChartProps) {
    const renderCustomLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
        if (percent < 0.08) return null;

        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 25;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                className="text-[10px] font-bold fill-muted-foreground"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            <div className="h-[280px] w-full relative">
                {centerLabel && centerValue !== undefined && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{centerLabel}</span>
                        <span className="text-sm font-mono font-bold text-foreground">Rs. {formatCurrency(centerValue)}</span>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={centerLabel ? 70 : 60}
                            outerRadius={centerLabel ? 90 : 80}
                            paddingAngle={4}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            // @ts-ignore
                            label={renderCustomLabel}
                            labelLine={false}
                            animationDuration={1000}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="stroke-background stroke-2 hover:opacity-80 transition-opacity" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`Rs. ${formatCurrency(value)}`, 'Value']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className="grid grid-cols-1 gap-2 pt-2">
                {data.map((item, index) => {
                    const total = data.reduce((sum, d) => sum + d[dataKey], 0);
                    const percent = ((item[dataKey] / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-xs font-bold truncate text-foreground/80 group-hover:text-foreground">
                                    {item[nameKey]}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                    Rs. {formatCurrency(item[dataKey])}
                                </span>
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold text-primary min-w-[38px] text-center">
                                    {percent}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
