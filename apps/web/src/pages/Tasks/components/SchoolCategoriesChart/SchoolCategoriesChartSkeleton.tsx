import { Paper, Title, Text, Group } from '@mantine/core'
import Skeleton from 'react-loading-skeleton'

export function SchoolCategoriesChartSkeleton() {
    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Title order={4} mb={4}><Skeleton width={150} /></Title>
            <Text size="xs" c="dimmed" mb="lg"><Skeleton width={180} /></Text>

            {/* Pie chart placeholder */}
            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 200, alignItems: 'center' }}>
                <Skeleton circle width={160} height={160} />
            </div>

            {/* Legend */}
            <Group grow mt="lg" gap="xs">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Paper key={i} p="xs" radius="sm" style={{ textAlign: 'center' }}>
                        <Skeleton width={40} height={24} style={{ margin: '0 auto' }} />
                        <Skeleton width={30} height={12} style={{ margin: '4px auto 0' }} />
                    </Paper>
                ))}
            </Group>
        </Paper>
    )
}
