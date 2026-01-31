import { SimpleGrid, Paper, Group, Stack } from '@mantine/core'
import Skeleton from 'react-loading-skeleton'

export function StatsHeaderSkeleton() {
    const StatCardSkeleton = () => (
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid #e0e0e0' }}>
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Skeleton width={80} height={12} />
                    <Skeleton width={60} height={32} />
                </Stack>
                <Skeleton width={42} height={42} borderRadius={8} />
            </Group>
        </Paper>
    )

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </SimpleGrid>
    )
}
