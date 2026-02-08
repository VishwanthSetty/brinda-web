import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts'
import { Text, Paper, Group } from '@mantine/core'

interface AdminBarChartProps {
    data: { name: string; value: number; id: string }[]
    title: string
    valueLabel: string
    barColor: string
    onBarClick: (id: string, name: string) => void
    height?: number
}

export function AdminBarChart({ data, title, valueLabel, barColor, onBarClick, height = 300 }: AdminBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <Paper shadow="sm" p="md" radius="md" withBorder h="100%">
                <Text fw={700} mb="md">{title}</Text>
                <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text c="dimmed" size="sm">No data available</Text>
                </div>
            </Paper>
        )
    }

    // Sort data descending by value for better visualization
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 10) // Top 10

    return (
        <Paper shadow="sm" p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
                <Text fw={700}>{title}</Text>
            </Group>

            <div style={{ height, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={sortedData}
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        barCategoryGap={5}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            tick={{ fontSize: 12, textAnchor: 'start', x: 0 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [value, valueLabel]}
                        />
                        <Bar
                            dataKey="value"
                            fill={barColor}
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                            onClick={(data: any) => onBarClick(data.id, data.name)}
                            cursor="pointer"
                            isAnimationActive={true}
                        >
                            <LabelList dataKey="value" position="right" style={{ fill: 'var(--mantine-color-gray-7)', fontSize: 12, fontWeight: 500 }} />
                            {sortedData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColor} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    )
}
