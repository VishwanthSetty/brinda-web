import { Paper, Text, Group, Progress, Stack } from '@mantine/core'

interface ProgressCardProps {
    title: string
    value: number
    goal: number
    borderColor?: string
}

export function ProgressCard({
    title,
    value,
    goal,
    borderColor = 'blue.5'
}: ProgressCardProps) {
    const percentage = Math.min(Math.round((value / goal) * 100), 100)

    return (
        <Paper withBorder p="md" radius="md" style={{ borderLeft: `4px solid var(--mantine-color-${borderColor})` }}>
            <Stack gap="sm" justify="space-between" h="100%">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {title}
                </Text>

                <div>
                    <Group justify="space-between" align="baseline" mb={4}>
                        <Text fw={700} size="xl" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{percentage}%</Text>
                        <Text size="xs" c="dimmed">Goal: {goal} Tasks</Text>
                    </Group>
                    <Progress value={percentage} size="md" radius="xl" color="blue" />
                </div>
            </Stack>
        </Paper>
    )
}
