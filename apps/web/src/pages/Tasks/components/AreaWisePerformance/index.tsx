import { Paper, Title, Text, Group, Badge, ScrollArea, LoadingOverlay } from '@mantine/core'
import { AreaProgressItem } from './AreaProgressItem'
import { AreaWiseTasksResponse, ClientWithTasks, Client, DrillDownData } from '../../../../types/analytics'

// Special type for Area Drilldown containing both visited and unvisited
type AreaDrillDownData = {
    visited: ClientWithTasks[];
    unvisited: Client[];
}

interface AreaWisePerformanceProps {
    data: AreaWiseTasksResponse | null
    clientGroups: { groups: Record<string, any[]>; unassigned: any[]; total: number } | null
    isLoading: boolean
    onDrillDown: (title: string, data: any, type: string) => void
}

export function AreaWisePerformance({ data, clientGroups, isLoading, onDrillDown }: AreaWisePerformanceProps) {
    if (!data) return null

    const handleDrillDown = (area: string, visitedList: ClientWithTasks[]) => {
        // Prepare data for drilldown

        // 1. Visited Clients - Pass full ClientWithTasks object now
        const visitedClients = visitedList;

        // 2. Unvisited Clients
        let unvisitedClients: Client[] = [];
        let totalCount = visitedClients.length;

        if (clientGroups && clientGroups.groups[area]) {
            const allInArea = clientGroups.groups[area] as Client[];
            const visitedIds = new Set(visitedClients.map(c => c.client.ID || c.client._id));

            unvisitedClients = allInArea.filter(c => !visitedIds.has(c.ID || c._id));
            totalCount = allInArea.length;
        }

        onDrillDown(
            `Area Details: ${area}`,
            { visited: visitedClients, unvisited: unvisitedClients } as AreaDrillDownData,
            'area_details'
        )
    }

    return (
        <Paper withBorder p="md" radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" mb="md">
                <div>
                    <Title order={4}>Area Wise Performance</Title>
                    <Text size="xs" c="dimmed">Visit progress by neighborhood</Text>
                </div>
                <Badge variant="light" color="gray" radius="sm">
                    {data.total_unique_clients} Clients Visited
                </Badge>
            </Group>

            <ScrollArea h={300} type="always" offsetScrollbars>
                <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.areas && Object.entries(data.areas).map(([area, areaInfo]) => {
                        const visitedCount = areaInfo.clients_with_tasks.length

                        // Calculate Total Present using clientGroups
                        let totalClients = 0;
                        console.log(clientGroups, area, "area");
                        if (clientGroups && clientGroups.groups[area]) {
                            totalClients = clientGroups.groups[area].length;
                        } else if ((areaInfo as any).total_clients_in_area) {
                            totalClients = (areaInfo as any).total_clients_in_area;
                        }

                        // Ensure total covers visited
                        totalClients = Math.max(totalClients, visitedCount);
                        const pending = Math.max(0, totalClients - visitedCount); // Pending here implies unvisited

                        return (
                            <AreaProgressItem
                                key={area}
                                area={area}
                                visited={visitedCount}
                                total={totalClients}
                                pending={pending}
                                data={areaInfo.clients_with_tasks}
                                onDrillDown={handleDrillDown}
                            />
                        )
                    })}
                </div>
            </ScrollArea>
        </Paper>
    )
}
