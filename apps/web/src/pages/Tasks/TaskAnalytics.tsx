import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Container, Grid, Title, Group, Box } from '@mantine/core'
import dayjs from 'dayjs'
import { StatsHeader } from './components/StatsHeader'
import { AreaWisePerformance } from './components/AreaWisePerformance'
import { SchoolCategoriesChart } from './components/SchoolCategoriesChart'
import { ViewAllTasksCard } from './components/ViewAllTasksCard'
import { PriorityTasksTable } from './components/PriorityTasksTable'
import { DateFilter } from './components/DateFilter'
import { useTaskAnalyticsQuery, useAreaWiseQuery, useSchoolCategoryQuery } from './hooks/useTaskAnalytics'
import { DrillDownData, Task, ClientWithTasks, ClientWithLatestTask } from '../../types/analytics'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState } from '@tanstack/react-table'
import { Modal, Table, Text } from '@mantine/core'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

type ViewMode = 'weekly' | 'monthly' | 'custom'

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


    // Drilldown State
    const [drillDown, setDrillDown] = useState<{ type: string; title: string; data: DrillDownData } | null>(null)

    const handleDrillDown = (title: string, data: DrillDownData, type: string = 'tasks') => {
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
            />

            {/* Main Grid */}
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <AreaWisePerformance
                        data={areaQuery.data || null}
                        isLoading={areaQuery.isLoading}
                        onDrillDown={handleDrillDown}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <SchoolCategoriesChart
                        data={categoryQuery.data || null}
                        isLoading={categoryQuery.isLoading}
                        onCategoryClick={handleCategoryClick}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <ViewAllTasksCard
                        totalTasks={tasksQuery.data?.total || 0}
                        onViewAll={() => handleDrillDown('All Tasks', tasksQuery.data?.data || [], 'tasks')}
                    />
                </Grid.Col>
            </Grid>

            {/* Priority Tasks Table */}
            <PriorityTasksTable
                data={priorityTasks}
                onViewAll={() => handleDrillDown('Priority Tasks', priorityTasks, 'tasks')}
            />

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

function DrillDownTable({ data, type }: { data: DrillDownData, type: string }) {
    const [sorting, setSorting] = useState<SortingState>([])

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
                    return Array.isArray(val) ? val.join(', ') : (val || 'N/A');
                }
            },
            { header: 'Division Name', accessorFn: (row: Task) => row.client?.['Division Name new (*)'] || 'N/A' },
            { header: 'Using Material', accessorFn: (row: Task) => row.client?.['Using Material (*)'] || 'N/A' },
            { header: 'Material Brand', accessorFn: (row: Task) => row.client?.['Currently Used Brand'] || 'N/A' },
            { header: 'Revisit', accessorFn: (row: Task) => row.metadata?.revisit?.join(', ') || 'N/A' },
            { header: 'Revisit Date', accessorFn: (row: Task) => row.metadata?.revisitDate || 'N/A' },
            { header: 'Specimens Given', accessorFn: (row: Task) => row.metadata?.specimensGiven || 'N/A' },
            { header: 'Purpose of Visit', accessorFn: (row: Task) => row.metadata?.purposeOfVisit?.join(', ') || 'N/A' },
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
            { header: 'Category', accessorFn: (row: ClientWithLatestTask) => row.school_category },
            { header: 'Latest Task Date', accessorFn: (row: ClientWithLatestTask) => row.latest_task?.date || 'N/A' }
        ]
    }

    const table = useReactTable({
        data: data as any[],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div style={{ overflowX: 'auto' }}>
            <Table>
                <Table.Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Table.Th
                                    key={header.id}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
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
    )
}
