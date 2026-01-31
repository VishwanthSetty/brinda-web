import { Paper, Title, Text, Stack } from '@mantine/core'
import Skeleton from 'react-loading-skeleton'

export function AreaLeadDistributionChartSkeleton() {
    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Title order={4} mb={4}><Skeleton width={200} /></Title>
            <Text size="xs" c="dimmed" mb="xl"><Skeleton width={250} /></Text>

            <Stack gap="md">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
                        <Skeleton height={24} borderRadius={4} />
                    </div>
                ))}
            </Stack>
        </Paper>
    )
}
