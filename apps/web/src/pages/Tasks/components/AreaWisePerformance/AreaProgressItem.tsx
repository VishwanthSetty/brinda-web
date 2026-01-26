import { Group, Text, Progress, UnstyledButton } from '@mantine/core'
import { ClientWithTasks } from '../../../../types/analytics'

interface AreaProgressItemProps {
    area: string
    visited: number
    total: number
    pending: number
    data: ClientWithTasks[]
    onDrillDown: (area: string, data: ClientWithTasks[]) => void
}

export function AreaProgressItem({ area, visited, total, data, onDrillDown }: AreaProgressItemProps) {
    const progress = Math.min(Math.round((visited / total) * 100), 100)

    return (
        <UnstyledButton
            onClick={() => onDrillDown(area, data)}
            className="group"
            p="xs"
            w="100%"
            style={{ borderRadius: 'var(--mantine-radius-md)', transition: 'background-color 200ms ease' }}
            mod={{ 'hover': true }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <Group justify="space-between" mb={4}>
                <Text fw={600} size="sm" c="dark.9">{area}</Text>
                <Text fw={700} size="xs" c="dimmed">
                    {visited} / {total} Visited
                </Text>
            </Group>
            <Progress
                value={progress}
                size="sm"
                color="teal"
                radius="xl"
                bg="gray.2"
            />
        </UnstyledButton>
    )
}
