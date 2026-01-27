import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Container, Grid, Group } from '@mantine/core'
import dayjs from 'dayjs'
import { StatsHeader } from './components/StatsHeader'
import { AreaWisePerformance } from './components/AreaWisePerformance'
import { SchoolCategoriesChart } from './components/SchoolCategoriesChart'
// import { ViewAllTasksCard } from './components/ViewAllTasksCard' // Removed
import { AreaLeadDistributionChart } from './components/AreaLeadDistributionChart'
import { PriorityTasksTable } from './components/PriorityTasksTable'
import { DateFilter } from './components/DateFilter'
import { useTaskAnalyticsQuery, useAreaWiseQuery, useSchoolCategoryQuery, useClientsGroupedQuery } from './hooks/useTaskAnalytics'
import { DrillDownData, Task, ClientWithTasks, ClientWithLatestTask, Client } from '../../types/analytics'
import { Modal, Table, Text, Badge, TextInput } from '@mantine/core'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'

type ViewMode = 'weekly' | 'monthly' | 'custom'

// Special type for Area Drilldown containing both visited and unvisited
type AreaDrillDownData = {
    visited: ClientWithTasks[];
    unvisited: Client[];
}

export default function TaskAnalytics() {
    const { selectedEmployee } = useOutletContext<{ selectedEmployee: string | null }>()
    const [viewMode, setViewMode] = useState<ViewMode>('monthly')
    // State now holds Date objects for the UI
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])

    // Initialize date range on mount
    useEffect(() => {
        const start = dayjs().startOf('month')
        const end = dayjs().endOf('month')
        setDateRange([start.toDate(), end.toDate()])
    }, [])

    // Format dates for API hooks
    const startDateStr = dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : ''
    const endDateStr = dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : ''

    // React Query Hooks
    const tasksQuery = useTaskAnalyticsQuery(startDateStr, endDateStr, selectedEmployee || undefined)
    const areaQuery = useAreaWiseQuery(startDateStr, endDateStr, selectedEmployee || undefined)
    const categoryQuery = useSchoolCategoryQuery(startDateStr, endDateStr, selectedEmployee || undefined)
    // Fetch all clients grouped by area to determine total present vs visited
    const clientGroupsQuery = useClientsGroupedQuery('AREA_WISE', "School", selectedEmployee || undefined)

    // Drilldown State
    const [drillDown, setDrillDown] = useState<{ type: string; title: string; data: DrillDownData | AreaDrillDownData } | null>(null)

    const handleDrillDown = (title: string, data: DrillDownData | AreaDrillDownData, type: string = 'tasks') => {
        setDrillDown({ type, title, data })
    }

    // Filter tasks for "Hot" leads to show in Priority Table
    // Adapting the `tasksQuery.data` which is { total: number, data: Task[] }
    // Filter tasks for Revisit Required to show in Priority Table
    // Sort logic: No date first, then ascending date
    const priorityTasksWithoutSort = tasksQuery.data?.data?.filter(t => {
        const revisitArr = t.metadata?.revisit || []
        return Array.isArray(revisitArr) && revisitArr.includes('Required')
    }) || []

    const priorityTasks = [...priorityTasksWithoutSort].sort((a, b) => {
        const dateA = a.metadata?.revisitDate
        const dateB = b.metadata?.revisitDate
        if (!dateA && !dateB) return 0
        if (!dateA) return -1 // no date first
        if (!dateB) return 1
        return new Date(dateA).getTime() - new Date(dateB).getTime()
    })

    // Calculate total specimens given
    const totalSpecimens = tasksQuery.data?.data?.reduce((sum, task) => {
        const specimens = parseInt(task.metadata?.specimensGiven || '0', 10)
        return sum + (isNaN(specimens) ? 0 : specimens)
    }, 0) || 0

    // Handler for specimen card click
    const handleSpecimenClick = () => {
        const filtered = (tasksQuery.data?.data || []).filter(t => {
            const specimens = parseInt(t.metadata?.specimensGiven || '0', 10)
            return !isNaN(specimens) && specimens > 0
        })
        handleDrillDown('Tasks with Specimens', filtered, 'tasks')
    }

    const handleCategoryClick = (category: string) => {
        const allTasks = tasksQuery.data?.data || []
        const filtered = allTasks.filter(t => {
            const cats = t.schoolCategory || t.metadata?.schoolCategory || []
            // Handle "No Info" case or exact match
            if (category === 'No Info') {
                return !cats || cats.length === 0 || (cats.length === 1 && cats[0] === 'NoInfo')
            }
            return Array.isArray(cats) && cats.includes(category)
        })

        handleDrillDown(`${category} Tasks`, filtered, 'tasks')
    }

    return (
        <Container size="xl" py="lg">
            {/* Header Controls */}
            <Group justify="space-between" mb="xl" align="center">
                <Group>
                    <DateFilter
                        view={viewMode}
                        range={dateRange}
                        onViewChange={setViewMode}
                        onRangeChange={setDateRange}
                    />
                </Group>
            </Group>

            {/* Stats Cards */}
            <StatsHeader
                totalTasks={tasksQuery.data?.total || 0}
                hotLeadsCount={categoryQuery.data?.summary.hot_count || 0}
                totalLeadsGoal={300} // Mock goal
                totalSpecimens={totalSpecimens}
                onSpecimenClick={handleSpecimenClick}
                onTotalTasksClick={() => handleDrillDown('All Tasks', tasksQuery.data?.data || [], 'tasks')}
            />

            {/* Main Grid */}
            <Grid gutter="md">
                {/* Section 2: Area Distribution & Performance */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <AreaLeadDistributionChart
                        data={categoryQuery.data || null}
                        isLoading={categoryQuery.isLoading}
                        onDrillDown={handleDrillDown}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <AreaWisePerformance
                        data={areaQuery.data || null}
                        clientGroups={clientGroupsQuery.data || null}
                        isLoading={areaQuery.isLoading || clientGroupsQuery.isLoading}
                        onDrillDown={handleDrillDown}
                    />
                </Grid.Col>

                {/* Section 3: Categories & Priority Tasks */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <SchoolCategoriesChart
                        data={categoryQuery.data || null}
                        isLoading={categoryQuery.isLoading}
                        onCategoryClick={handleCategoryClick}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <PriorityTasksTable
                        data={priorityTasks}
                        onViewAll={() => handleDrillDown('Priority Tasks', priorityTasks, 'tasks')}
                    />
                </Grid.Col>
            </Grid>

            {/* Drilldown Modal using Mantine Modal */}
            <Modal
                opened={!!drillDown}
                onClose={() => setDrillDown(null)}
                title={drillDown?.title}
                size="100%"
                centered
            >
                {drillDown && (
                    <DrillDownTable data={drillDown.data} type={drillDown.type} />
                )}
            </Modal>
        </Container>
    )
}

function DrillDownTable({ data, type }: { data: DrillDownData | AreaDrillDownData, type: string }) {

    // Handle Special "Mixed" View for Area Details (Visited vs Unvisited)
    if (type === 'area_details') {
        const { visited, unvisited } = data as AreaDrillDownData;
        return (
            <div>
                <Text fw={700} size="lg" mb="sm">Visited Schools ({visited.length})</Text>
                <SimpleClientTable data={visited} />

                <Text fw={700} size="lg" mt="xl" mb="sm">Not Visited Schools ({unvisited.length})</Text>
                <SimpleClientTable data={unvisited} isUnvisited />
            </div>
        )
    }

    return <SimpleDataTable data={data as any[]} type={type} />
}

// Reusable table for strict Client[] lists or ClientWithTasks[]
function SimpleClientTable({ data, isUnvisited }: { data: (Client | ClientWithTasks)[], isUnvisited?: boolean }) {
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

    const columns: ColumnDef<Client | ClientWithTasks>[] = [
        {
            id: 'sno',
            header: 'SNo.',
            cell: (info) => info.row.index + 1,
            size: 50,
        },
        {
            header: 'Client Name',
            accessorFn: (row) => {
                const c = 'client' in row ? row.client : row;
                return c['Client Name (*)'] || 'N/A';
            }
        }
    ]

    // Add specific columns for Visited (ClientWithTasks)
    if (!isUnvisited) {
        columns.push({
            header: 'Category',
            accessorFn: (row) => {

                //get latest date tasks category
                let cat = 'N/A';
                if ('tasks' in row && row.tasks && row.tasks.length > 0) {
                    const sortedTasks = [...row.tasks].sort((a, b) => {
                        const dateA = a.checkinTime ? new Date(a.checkinTime).getTime() : 0;
                        const dateB = b.checkinTime ? new Date(b.checkinTime).getTime() : 0;
                        return dateB - dateA;
                    });
                    cat = sortedTasks[0]?.metadata?.schoolCategory?.[0];
                }
                return cat;
            },
            cell: (info) => getCategoryBadge(info.getValue() as string)
        });
        columns.push({
            header: 'Latest Visit',
            accessorFn: (row) => {
                if ('tasks' in row && row.tasks && row.tasks.length > 0) {
                    // Assuming tasks are sorted or we take the first/last? 
                    // Usually backend groups sorts them, or we sort descending by date.
                    // The user request for 'Latest Visit' typically implies the most recent checkin.
                    // Let's assume row.tasks[0] is latest or we find max date. 
                    // Without strict knowledge of order, we map dates and take max.
                    // Safe approach:
                    const dates = row.tasks.map((t: Task) => t.checkinTime ? new Date(t.checkinTime).getTime() : 0);
                    const maxDate = Math.max(...dates);
                    return maxDate > 0 ? new Date(maxDate).toLocaleDateString() : 'N/A';
                }
                return 'N/A';
            }
        });

        columns.push({
            header: 'Remarks',
            accessorFn: (row) => {
                if ('tasks' in row && row.tasks) {
                    const allRemarks = row.tasks
                        .map((t: Task) => t.metadata?.remarks || '')
                        .filter((r: string) => r && r.trim() !== '');
                    return allRemarks.length > 0 ? allRemarks.join(' | ') : 'N/A';
                }
                return 'N/A';
            },
            // Limit width or wrap text if needed, but accessorFn return string is fine for now
        });

        columns.push({
            header: 'No of Visits',
            accessorFn: (row) => {
                if ('tasks' in row && row.tasks) {
                    return row.tasks.length;
                }
                return 0;
            },
            // Limit width or wrap text if needed, but accessorFn return string is fine for now
        });
    }

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div style={{ overflow: 'auto', maxHeight: '70vh', position: 'relative' }}>
            <TextInput
                placeholder="Search clients..."
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
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        position: 'sticky',
                                        top: 0,
                                        left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                        zIndex: index < 2 ? 20 : 10,
                                        backgroundColor: 'var(--mantine-color-body)',
                                        boxShadow: '0 1px 0 0 var(--mantine-color-gray-3)'
                                    }}
                                >
                                    <Group gap="xs" justify="space-between" wrap="nowrap">
                                        <Text size="sm" fw={700}>{flexRender(header.column.columnDef.header, header.getContext())}</Text>
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
                            <Table.Tr key={row.id} bg={isUnvisited ? 'red.0' : undefined}>
                                {row.getVisibleCells().map((cell, index) => (
                                    <Table.Td
                                        key={cell.id}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            position: index < 2 ? 'sticky' : undefined,
                                            left: index === 0 ? 0 : index === 1 ? '50px' : undefined,
                                            zIndex: index < 2 ? 5 : undefined,
                                            backgroundColor: index < 2 ? (isUnvisited ? 'var(--mantine-color-red-0)' : 'var(--mantine-color-body)') : undefined,
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

// Wrapper for the previous generic logic to keep it clean
function SimpleDataTable({ data, type }: { data: any[], type: string }) {
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

    let columns: ColumnDef<any>[] = []

    if (type === 'tasks') {
        columns = [
            {
                id: 'sno',
                header: 'SNo.',
                cell: (info) => info.row.index + 1,
                size: 50,
            },
            { header: 'Client Name', accessorFn: (row: Task) => row.client?.['Client Name (*)'] || row.metadata?.clientName || 'N/A' },
            { header: 'Created At', accessorFn: (row: Task) => row.checkinTime ? new Date(row.checkinTime).toLocaleString() : 'N/A' },
            {
                header: 'School Category',
                accessorFn: (row: Task) => {
                    const val = row.schoolCategory || row.metadata?.schoolCategory;
                    return val;
                },
                cell: (info) => {
                    const val = info.getValue() as string | string[];
                    if (Array.isArray(val)) {
                        return <Group gap={4}>{val.map((v, i) => <div key={i}>{getCategoryBadge(v)}</div>)}</Group>;
                    }
                    return getCategoryBadge(val as string);
                }
            },
            { header: 'Division Name', accessorFn: (row: Task) => row.client?.['Division Name new (*)'] || 'N/A' },
            { header: 'Using Material', accessorFn: (row: Task) => row.client?.['Using Material (*)'] || 'N/A' },
            { header: 'Material Brand', accessorFn: (row: Task) => row.client?.['Currently Used Brand'] || 'N/A' },
            { header: 'Revisit', accessorFn: (row: Task) => row.metadata?.revisit?.join(', ') || 'N/A' },
            { header: 'Revisit Date', accessorFn: (row: Task) => row.metadata?.revisitDate || 'N/A' },
            { header: 'Specimens Given', accessorFn: (row: Task) => row.metadata?.specimensGiven || 'N/A' },
            { header: 'Purpose of Visit', accessorFn: (row: Task) => row.metadata?.purposeOfVisit?.join(', ') || 'N/A' },
            { header: 'Remarks', accessorFn: (row: Task) => row.metadata?.remarks || 'N/A' }

        ]
    } else if (type === 'area') {
        columns = [
            {
                id: 'sno',
                header: 'SNo.',
                cell: (info) => info.row.index + 1,
                size: 50,
            },
            { header: 'Client', accessorFn: (row: ClientWithTasks) => row.client?.['Client Name (*)'] || 'N/A' },
            { header: 'Area', accessorFn: (row: ClientWithTasks) => row.client?.['Division Name new (*)'] || 'N/A' },
            { header: 'Task Count', accessorFn: (row: ClientWithTasks) => row.task_count }
        ]
    } else if (type === 'category') {
        columns = [
            {
                id: 'sno',
                header: 'SNo.',
                cell: (info) => info.row.index + 1,
                size: 50,
            },
            { header: 'Client', accessorFn: (row: ClientWithLatestTask) => row.client?.['Client Name (*)'] || 'N/A' },
            {
                header: 'Category',
                accessorFn: (row: ClientWithLatestTask) => row.school_category,
                cell: (info) => getCategoryBadge(info.getValue() as string)
            },
            { header: 'Latest Task Date', accessorFn: (row: ClientWithLatestTask) => row.latest_task?.date || 'N/A' },
            { header: 'Remarks', accessorFn: (row: ClientWithLatestTask) => row.latest_task?.metadata?.remarks || 'N/A' }

        ]
    } else if (type === 'all-categories') {
        columns = [
            {
                id: 'sno',
                header: 'SNo.',
                cell: (info) => info.row.index + 1,
                size: 50,
            },
            { header: 'Client', accessorFn: (row: ClientWithLatestTask) => row.client?.['Client Name (*)'] || 'N/A' },
            {
                header: 'Category',
                accessorFn: (row: ClientWithLatestTask) => row.latest_task?.metadata?.schoolCategory?.[0] || row.school_category,
                cell: (info) => getCategoryBadge(info.getValue() as string)
            },
            { header: 'Latest Task Date', accessorFn: (row: ClientWithLatestTask) => row.latest_task?.date || 'N/A' },
            { header: 'Remarks', accessorFn: (row: ClientWithLatestTask) => row.latest_task?.metadata?.remarks || 'N/A' }
        ]
    }

    const table = useReactTable({
        data: data as any[],
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
