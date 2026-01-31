import { Paper, Title, Text, Group, Stack, ScrollArea } from '@mantine/core'
import Skeleton from 'react-loading-skeleton'

export function AreaWisePerformanceSkeleton() {
    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={4}><Skeleton width={180} /></Title>
                    <Text size="xs" c="dimmed"><Skeleton width={200} /></Text>
                </div>
                <Skeleton width={120} height={24} borderRadius={4} />
            </Group>

            <ScrollArea h={300}>
                <Stack gap="md" pr={10}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}>
                            <Group justify="space-between" mb={4}>
                                <Skeleton width={100} height={14} />
                                <Skeleton width={60} height={14} />
                            </Group>
                            <Skeleton height={8} borderRadius={4} />
                        </div>
                    ))}
                </Stack>
            </ScrollArea>
        </Paper>
    )
}
