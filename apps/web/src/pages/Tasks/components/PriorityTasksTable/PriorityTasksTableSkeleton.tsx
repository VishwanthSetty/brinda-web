import { Paper, Title, Group, Table } from '@mantine/core'
import Skeleton from 'react-loading-skeleton'
import { AlertTriangle } from 'lucide-react'

export function PriorityTasksTableSkeleton() {
    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Group justify="space-between" mb="md">
                <Title order={4} size="h5" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={20} style={{ color: 'var(--mantine-color-red-6)' }} />
                    Priority Tasks
                </Title>
                <Skeleton width={100} height={24} />
            </Group>

            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th><Skeleton width={100} height={12} /></Table.Th>
                        <Table.Th><Skeleton width={60} height={12} /></Table.Th>
                        <Table.Th><Skeleton width={50} height={12} /></Table.Th>
                        <Table.Th><Skeleton width={70} height={12} /></Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Table.Tr key={i}>
                            <Table.Td>
                                <Group gap="sm" wrap="nowrap">
                                    <Skeleton circle width={32} height={32} />
                                    <Skeleton width={120} height={14} />
                                </Group>
                            </Table.Td>
                            <Table.Td><Skeleton width={80} height={14} /></Table.Td>
                            <Table.Td><Skeleton width={60} height={22} borderRadius={12} /></Table.Td>
                            <Table.Td><Skeleton width={70} height={14} /></Table.Td>
                            <Table.Td><Skeleton width={80} height={20} /></Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    )
}
