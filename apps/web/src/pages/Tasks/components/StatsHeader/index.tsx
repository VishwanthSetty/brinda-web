import { SimpleGrid } from '@mantine/core'
import { ClipboardList, Flame, BookCopy } from 'lucide-react'
import { StatCard } from './StatCard'
import { ProgressCard } from './ProgressCard'

interface StatsHeaderProps {
    totalTasks: number
    hotLeadsCount: number
    totalLeadsGoal?: number // e.g. 215 weekly goal
    totalSpecimens?: number
    onSpecimenClick?: () => void
}

export function StatsHeader({
    totalTasks,
    hotLeadsCount,
    totalLeadsGoal = 215,
    totalSpecimens = 0,
    onSpecimenClick
}: StatsHeaderProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
            <StatCard
                title="Total Tasks"
                value={totalTasks}
                icon={ClipboardList}
                borderColor="teal.7"
                iconColor="teal"
            />
            <StatCard
                title="Active Hot Leads"
                value={hotLeadsCount}
                badge="Urgent"
                badgeColor="red"
                icon={Flame}
                borderColor="red.5"
                iconColor="red"
            />
            <StatCard
                title="Total Specimens"
                value={totalSpecimens}
                icon={BookCopy}
                borderColor="violet.5"
                iconColor="violet"
                onClick={onSpecimenClick}
            />
            <ProgressCard
                title="Target Progress"
                value={totalTasks}
                goal={totalLeadsGoal}
            />
        </SimpleGrid>
    )
}
