import { useState } from 'react'
import { Table, Text, Badge, TextInput, Group } from '@mantine/core'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'
import { Task } from '../types/analytics' // Import Task type

interface AdminDrillDownTableProps {
    data: Task[]
}

export function AdminDrillDownTable({ data }: AdminDrillDownTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // Helper to get Badge for category
    const getCategoryBadge = (category: string) => {
        const lowerCat = category?.toLowerCase() || '';
        let color = 'gray';
        if (lowerCat.includes('hot')) color = 'red';
        else if (lowerCat.includes('warm')) color = 'yellow';
        else if (lowerCat.includes('cold')) color = 'blue';

        return <Badge color={color} variant="light">{category || 'No Info'}</Badge>;
    };

    const columns: ColumnDef<Task>[] = [
        {
            id: 'sno',
            header: 'SNo.',
            cell: (info) => info.row.index + 1,
            size: 50,
        },
        {
            header: 'Client Name',
            accessorFn: (row) => row.client?.['Client Name (*)'] || row.metadata?.clientName || 'N/A'
        },
        {
            header: 'Created At',
            accessorFn: (row) => row.checkinTime ? new Date(row.checkinTime).toLocaleString() : 'N/A'
        },
        {
            header: 'School Category',
            accessorFn: (row) => row.metadata?.schoolCategory?.[0] || 'N/A',
            cell: (info) => getCategoryBadge(info.getValue() as string)
        },
        {
            header: 'Division Name',
            accessorFn: (row) => row.client?.['Division Name new (*)'] || 'N/A'
        },
        {
            header: 'Using Material',
            accessorFn: (row) => row.client?.['Using Material (*)'] || 'N/A'
        },
        {
            header: 'Specimens Given',
            accessorFn: (row) => row.metadata?.specimensGiven || 'N/A'
        },
        {
            header: 'New Specimens Given',
            accessorFn: (row) => {
                const val = row.metadata?.newSpecimenGiven;
                if (Array.isArray(val)) return val.join(', ');
                return val || 'N/A';
            }
        },
        {
            header: 'Remarks',
            accessorFn: (row) => row.metadata?.remarks || 'N/A'
        }
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div style={{ overflow: 'auto', maxHeight: '70vh', position: 'relative' }}>
            <TextInput
                placeholder="Search..."
                mb="md"
                leftSection={<Search size={14} />}
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
            />
            <Table stickyHeader>
                <Table.Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, index) => (
                                <Table.Th
                                    key={header.id}
                                    style={{
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap',
                                        position: 'sticky',
                                        top: 0,
                                        left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                        zIndex: index < 2 ? 20 : 10,
                                        backgroundColor: 'var(--mantine-color-body)',
                                        boxShadow: '0 1px 0 0 var(--mantine-color-gray-3)'
                                    }}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <Group gap="xs" justify="space-between" wrap="nowrap">
                                        <Text size="sm" fw={700}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </Text>
                                        {header.column.getIsSorted() === 'asc' ? <ChevronUp size={14} /> :
                                            header.column.getIsSorted() === 'desc' ? <ChevronDown size={14} /> :
                                                <ChevronsUpDown size={14} color="gray" style={{ opacity: 0.5 }} />}
                                    </Group>
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Thead>
                <Table.Tbody>
                    {data.length === 0 ? (
                        <Table.Tr><Table.Td colSpan={columns.length} align="center">No Data</Table.Td></Table.Tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <Table.Tr key={row.id}>
                                {row.getVisibleCells().map((cell, index) => (
                                    <Table.Td
                                        key={cell.id}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            position: index < 2 ? 'sticky' : undefined,
                                            left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                            zIndex: index < 2 ? 5 : undefined,
                                            backgroundColor: index < 2 ? 'var(--mantine-color-body)' : undefined,
                                            boxShadow: index === 1 ? '2px 0 5px -2px rgba(0,0,0,0.1)' : undefined
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </div>
    )
}
