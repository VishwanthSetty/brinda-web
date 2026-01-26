import { Group, Text, Progress, Flex, Tooltip } from '@mantine/core';
import { ClientWithLatestTask } from '../../../../types/analytics';

interface AreaLeadDistributionBarProps {
    area: string;
    total: number;
    hotList: ClientWithLatestTask[];
    warmList: ClientWithLatestTask[];
    coldList: ClientWithLatestTask[];
    noInfoList: ClientWithLatestTask[];
    onDrillDown?: (title: string, data: any[], type: string) => void;
}

export function AreaLeadDistributionBar({
    area,
    total,
    hotList,
    warmList,
    coldList,
    noInfoList,
    onDrillDown
}: AreaLeadDistributionBarProps) {
    // Percentage relative to total shown in bar (categorized/visited)
    const getPercent = (value: number) => total > 0 ? (value / total) * 100 : 0;

    const handleSectionClick = (category: string, list: ClientWithLatestTask[]) => {
        if (!onDrillDown || list.length === 0) return;
        onDrillDown(`${area} - ${category} Leads`, list, 'category');
    };

    return (
        <div style={{ marginBottom: '1.25rem' }}>
            {/* Header: Area Name + Badges */}
            <Flex justify="space-between" align="center" mb="xs">
                <Group gap="xs">
                    <Text fw={700} size="md">{area}</Text>
                    <Text size="sm" c="dimmed">
                        {total} Total
                    </Text>
                </Group>
            </Flex>

            {/* Stacked Progress Bar */}
            <Progress.Root size={24} radius="md">
                {hotList.length > 0 && (
                    <Tooltip label={`Hot: ${hotList.length} (Click to view)`} withArrow>
                        <Progress.Section
                            value={getPercent(hotList.length)}
                            color="#EF4444"
                            onClick={() => handleSectionClick('Hot', hotList)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Progress.Label>{hotList.length}</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {warmList.length > 0 && (
                    <Tooltip label={`Warm: ${warmList.length} (Click to view)`} withArrow>
                        <Progress.Section
                            value={getPercent(warmList.length)}
                            color="#F59E0B"
                            onClick={() => handleSectionClick('Warm', warmList)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Progress.Label>{warmList.length}</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {coldList.length > 0 && (
                    <Tooltip label={`Cold: ${coldList.length} (Click to view)`} withArrow>
                        <Progress.Section
                            value={getPercent(coldList.length)}
                            color="#3B82F6"
                            onClick={() => handleSectionClick('Cold', coldList)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Progress.Label>{coldList.length}</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
                {noInfoList.length > 0 && (
                    <Tooltip label={`No Info: ${noInfoList.length} (Click to view)`} withArrow>
                        <Progress.Section
                            value={getPercent(noInfoList.length)}
                            color="#9CA3AF"
                            onClick={() => handleSectionClick('No Info', noInfoList)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Progress.Label>{noInfoList.length}</Progress.Label>
                        </Progress.Section>
                    </Tooltip>
                )}
            </Progress.Root>
        </div>
    );
}
