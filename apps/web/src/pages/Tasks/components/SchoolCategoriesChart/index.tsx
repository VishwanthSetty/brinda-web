import { Paper, Title, Text, Group, LoadingOverlay } from '@mantine/core'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { SchoolCategoryResponse } from '../../../../types/analytics'

interface SchoolCategoriesChartProps {
    data: SchoolCategoryResponse | null
    isLoading: boolean
    onCategoryClick?: (category: string) => void
}

import { SchoolCategoriesChartSkeleton } from './SchoolCategoriesChartSkeleton'

export function SchoolCategoriesChart({ data, isLoading, onCategoryClick }: SchoolCategoriesChartProps) {
    if (isLoading || !data) return <SchoolCategoriesChartSkeleton />

    const hot = data.summary.hot_count
    const warm = data.summary.warm_count
    const cold = data.summary.cold_count
    const noInfo = data.summary.no_info_count
    const total = data.summary.total

    const chartData = [
        { name: 'Hot', value: hot, color: '#EF4444' }, // red-500
        { name: 'Warm', value: warm, color: '#F59E0B' }, // amber-500
        { name: 'Cold', value: cold, color: '#3B82F6' }, // blue-500
        { name: 'No Info', value: noInfo, color: '#9CA3AF' }, // gray-400
    ]

    const getTextColor = (color: string) => {
        if (color === '#EF4444') return 'red'
        if (color === '#F59E0B') return 'orange' // or yellow/amber
        if (color === '#3B82F6') return 'blue'
        return 'gray'
    }

    return (
        <Paper withBorder p="md" radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Title order={4} mb={4}>School Categories</Title>
            <Text size="xs" c="dimmed" mb="lg">Breakdown by engagement level</Text>

            <div style={{ flex: 1, minHeight: 200, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            onClick={(data) => onCategoryClick?.(data.name)}
                            style={{ cursor: 'pointer' }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <Text fw={700} size="xl" style={{ fontSize: '2rem', lineHeight: 1 }}>{total}</Text>
                    <Text size="xs" c="dimmed">Total</Text>
                </div>
            </div>

            <Group grow mt="lg" gap="xs">
                {chartData.map((item) => (
                    <Paper
                        key={item.name}
                        bg={item.color + '15'}
                        p="xs"
                        radius="sm"
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => onCategoryClick?.(item.name)}
                    >
                        <Text fw={700} size="lg" c={getTextColor(item.color)}>
                            {item.value}
                        </Text>
                        <Text size="xs" c="dimmed">{item.name}</Text>
                    </Paper>
                ))}
            </Group>
        </Paper>
    )
}
