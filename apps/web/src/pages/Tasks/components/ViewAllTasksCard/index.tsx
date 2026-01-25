import { Paper, Title, Text, Button, Center, Stack } from '@mantine/core'
import { ArrowRight, ListChecks } from 'lucide-react'

interface ViewAllTasksCardProps {
    totalTasks: number
    onViewAll: () => void
}

export function ViewAllTasksCard({ totalTasks, onViewAll }: ViewAllTasksCardProps) {
    return (
        <Paper withBorder p="md" radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Title order={4} mb="md">View All Tasks</Title>

            <Center style={{ flex: 1, border: '2px dashed var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Stack align="center" gap="xs" p="xl">
                    <ListChecks size={40} color="var(--mantine-color-teal-6)" />
                    <Text size="sm" c="dimmed" ta="center">
                        You have a total of <Text span fw={700} c="dark">{totalTasks} tasks</Text> pending for this week.
                    </Text>
                    <Button
                        rightSection={<ArrowRight size={16} />}
                        color="teal"
                        mt="md"
                        onClick={onViewAll}
                    >
                        Go to Task List
                    </Button>
                </Stack>
            </Center>
        </Paper>
    )
}
