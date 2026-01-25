import { Paper, Text, Group, Badge, ThemeIcon, Stack } from '@mantine/core'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number | string
    delta?: string
    badge?: string
    badgeColor?: string
    icon: LucideIcon
    iconColor?: string
    borderColor?: string
    onClick?: () => void
}

export function StatCard({
    title,
    value,
    delta,
    badge,
    badgeColor = 'green',
    icon: Icon,
    iconColor = 'teal',
    borderColor = 'teal.7',
    onClick
}: StatCardProps) {
    return (
        <Paper
            withBorder
            p="md"
            radius="md"
            style={{
                borderLeft: `4px solid var(--mantine-color-${borderColor})`,
                cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}>
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {title}
                    </Text>
                    <Group gap="xs" align="baseline">
                        <Text fw={700} size="xl" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{value}</Text>
                        {delta && (
                            <Badge variant="light" color="green" size="sm" radius="xl" style={{ textTransform: 'none' }}>
                                {delta}
                            </Badge>
                        )}
                        {badge && (
                            <Badge variant="light" color={badgeColor} size="sm" radius="xl">
                                {badge}
                            </Badge>
                        )}
                    </Group>
                </Stack>
                <ThemeIcon size={42} radius="md" variant="light" color={iconColor}>
                    <Icon size={24} />
                </ThemeIcon>
            </Group>
        </Paper>
    )
}
