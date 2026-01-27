import { Paper, Title, Text, ScrollArea, LoadingOverlay, Button } from '@mantine/core';
import { useState } from 'react';
import { AreaLeadDistributionBar } from './AreaLeadDistributionBar';
import { SchoolCategoryResponse, ClientWithLatestTask } from '../../../../types/analytics';

interface AreaLeadDistributionChartProps {
    data: SchoolCategoryResponse | null;
    isLoading: boolean;
}

export function AreaLeadDistributionChart({
    data,
    isLoading,
    onDrillDown
}: AreaLeadDistributionChartProps & { onDrillDown?: (title: string, data: any[], type: string) => void }) {
    if (!data) return null;

    // 1. Initialize Aggregation Map
    const areaMap = new Map<string, {
        hot: ClientWithLatestTask[];
        warm: ClientWithLatestTask[];
        cold: ClientWithLatestTask[];
        noInfo: ClientWithLatestTask[];
        visitedTotal: number;
    }>();

    const getArea = (clientItem: ClientWithLatestTask) =>
        clientItem.client?.["Division Name new (*)"] || "Unknown Area";

    const updateArea = (area: string, type: 'hot' | 'warm' | 'cold' | 'noInfo', item: ClientWithLatestTask) => {
        const stats = areaMap.get(area) || { hot: [], warm: [], cold: [], noInfo: [], visitedTotal: 0 };
        stats[type].push(item);
        stats.visitedTotal++;
        areaMap.set(area, stats);
    };

    // 2. Process SchoolCategoryResponse categories
    data.hot.forEach(item => updateArea(getArea(item), 'hot', item));
    data.warm.forEach(item => updateArea(getArea(item), 'warm', item));
    data.cold.forEach(item => updateArea(getArea(item), 'cold', item));
    data.no_info.forEach(item => updateArea(getArea(item), 'noInfo', item));

    // 3. Prepare Display Data
    const areas = Array.from(areaMap.keys());

    // Sort areas by Hot Descending, then Warm Descending
    const sortedAreas = areas.sort((a, b) => {
        const statsA = areaMap.get(a)!;
        const statsB = areaMap.get(b)!;

        const hotDiff = statsB.hot.length - statsA.hot.length;
        if (hotDiff !== 0) return hotDiff;

        const warmDiff = statsB.warm.length - statsA.warm.length;
        if (warmDiff !== 0) return warmDiff;

        return statsB.visitedTotal - statsA.visitedTotal;
    });

    const [expanded, setExpanded] = useState(false);

    return (
        <Paper withBorder p="md" radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Title order={4} mb={4}>Area-wise Lead Distribution</Title>
            <Text size="xs" c="dimmed" mb="xl">Distribution of leads across areas by quality</Text>

            <ScrollArea h={expanded ? 'auto' : 300} type="always" offsetScrollbars>
                <div style={{ paddingRight: 15 }}>
                    {sortedAreas.map(area => {
                        const stats = areaMap.get(area)!;

                        return (
                            <AreaLeadDistributionBar
                                key={area}
                                area={area}
                                total={stats.visitedTotal}
                                hotList={stats.hot}
                                warmList={stats.warm}
                                coldList={stats.cold}
                                noInfoList={stats.noInfo}
                                onDrillDown={onDrillDown}
                            />
                        );
                    })}

                    {sortedAreas.length === 0 && (
                        <Text c="dimmed" ta="center" py="xl">No data available for the selected range.</Text>
                    )}
                </div>
            </ScrollArea>

            {sortedAreas.length > 5 && (
                <Button
                    variant="subtle"
                    fullWidth
                    mt="sm"
                    onClick={() => setExpanded(!expanded)}
                    size="xs"
                >
                    {expanded ? 'Show Less' : 'Show All Areas'}
                </Button>
            )}
        </Paper>
    );
}
