import { Paper, Title, Button, Table, Badge, ActionIcon, Group, Text } from '@mantine/core'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table'
import { Phone, Mail, MoreVertical, AlertTriangle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Task } from '../../../../types/analytics'
import { useState } from 'react'

// Mock Data Structure matching the UI mostly
// We will reuse the Task type but adapt columns to match the "Priority Tasks" UI
// UI Columns: School Name, Area, Status, Due Date, Actions

interface PriorityTasksTableProps {
    data: Task[]
    onViewAll: () => void
}

export function PriorityTasksTable({ data, onViewAll }: PriorityTasksTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns: ColumnDef<Task, any>[] = [
        {
            header: 'School Name',
            accessorFn: (row) => row.metadata?.selectClient || row.metadata?.clientName || row.client?.['Client Name (*)'] || 'Unknown School',
            cell: (info) => {
                const name = info.getValue() as string
                const initials = name.substring(0, 3).toUpperCase()
                // Random color logic or hash based
                const colors = ['indigo', 'purple', 'teal', 'blue', 'orange']
                const color = colors[name.length % colors.length]

                return (
                    <Group gap="sm" wrap="nowrap">
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            backgroundColor: `var(--mantine-color-${color}-1)`,
                            color: `var(--mantine-color-${color}-7)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, flexShrink: 0
                        }}>
                            {initials}
                        </div>
                        <div>
                            <Text size="sm" fw={500} c="dark">{name}</Text>
                            <Text size="xs" c="dimmed">Lead ID: #{info.row.original.taskID?.substring(0, 4)}</Text>
                        </div>
                    </Group>
                )
            }
        },
        {
            header: 'Area',
            accessorFn: (row) => row.client?.['Division Name new (*)'] || 'N/A',
            cell: (info) => <Text size="sm" c="dimmed">{info.getValue() as string}</Text>
        },
        {
            header: 'Status',
            accessorFn: (row) => {
                // Logic to determine status based on metadata or priority
                const cats = row.schoolCategory || row.metadata?.schoolCategory || []
                if (Array.isArray(cats) && cats.includes('Hot')) return 'Hot Lead'
                if (Array.isArray(cats) && cats.includes('Cold')) return 'Follow Up'
                return 'Pending'
            },
            cell: (info) => {
                const status = info.getValue() as string
                let color = 'gray'
                if (status === 'Hot Lead') color = 'red'
                if (status === 'Follow Up') color = 'yellow'

                return (
                    <Badge variant="light" color={color} size="sm" radius="xl">
                        {status}
                    </Badge>
                )
            }
        },
        {
            header: 'Due Date',
            accessorFn: (row) => row.metadata?.revisitDate,
            cell: (info) => {
                const dateStr = info.getValue() as string
                if (!dateStr) return <Text size="sm" c="dimmed">No Date</Text>
                const date = new Date(dateStr)
                return <Text size="sm" c="dimmed">{date.toLocaleDateString()}</Text>
            }
        },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <Group gap={4} justify="flex-end">
                    <ActionIcon variant="subtle" color="green" size="sm">
                        <Phone size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="blue" size="sm">
                        <Mail size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                        <MoreVertical size={14} />
                    </ActionIcon>
                </Group>
            )
        }
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5
            }
        }
    })

    return (
        <Paper withBorder p="md" radius="md" mt="xl">
            <Group justify="space-between" mb="md">
                <Title order={4} size="h5" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={20} className="text-red-500" style={{ color: 'var(--mantine-color-red-6)' }} />
                    Priority Tasks
                </Title>
                <Button variant="transparent" size="sm" onClick={onViewAll}>View all tasks</Button>
            </Group>

            {/* Table implementation */}
            <div style={{ overflowX: 'auto' }}>
                <Table highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <Table.Th
                                        key={header.id}
                                        tt="uppercase"
                                        c="dimmed"
                                        fw={600}
                                        style={{ fontSize: 'var(--mantine-font-size-xs)', cursor: header.column.getCanSort() ? 'pointer' : 'default', userSelect: 'none' }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <Group gap="xs" wrap="nowrap" justify="space-between">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                header.column.getIsSorted() === 'asc' ? <ChevronUp size={14} /> :
                                                    header.column.getIsSorted() === 'desc' ? <ChevronDown size={14} /> :
                                                        <ChevronsUpDown size={14} color="gray" style={{ opacity: 0.5 }} />
                                            )}

                                        </Group>
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>
                    <Table.Tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length} align="center" c="dimmed" py="xl">
                                    No priority tasks found
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <Table.Tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <Table.Td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </div>
        </Paper>
    )
}
