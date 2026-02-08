import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container, Grid, Group, Loader, Center, Alert, Table, Paper, Text, Stack } from '@mantine/core'
import { DateFilter } from '../Tasks/components/DateFilter'
import { StatCard } from '../Tasks/components/StatsHeader/StatCard'
import { empAnalyticsApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import EmployeeSelector from '../../components/EmployeeSelector'
import { EmployeeAnalyticsResponse } from '../../types/analytics'
import { CalendarCheck, ClipboardList, MapPin, Coffee, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './EmployeeAnalytics.css'

export default function EmployeeAnalytics() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()

    const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'custom'>('monthly')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        dayjs().startOf('month').toDate(),
        dayjs().endOf('month').toDate()
    ])

    // Initialize with URL param if present, otherwise fallback to user's own ID
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
        searchParams.get('employee') || user?.employee_id || null
    )

    // Update selected employee when URL param changes
    useEffect(() => {
        const paramId = searchParams.get('employee')
        if (paramId) {
            setSelectedEmployeeId(paramId)
        }
    }, [searchParams])

    const [data, setData] = useState<EmployeeAnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load data when filters change
    useEffect(() => {
        loadAnalytics()
    }, [dateRange, selectedEmployeeId])

    async function loadAnalytics() {
        if (!dateRange[0] || !dateRange[1]) return

        // If not admin and no employee ID, wait (though usually user.employee_id is present)
        // If admin and hasn't selected anyone yet, we might want to wait or show empty? 
        // Logic: if admin and no selection, maybe show "Select an employee".
        // But let's fetch if we have an ID.

        if (!selectedEmployeeId) {
            // If regular user (not admin/manager) but no ID, that's an issue
            if (user?.role !== 'admin' && user?.role !== 'manager') {
                setError("No employee profile found for your account.")
                return
            }
            // Admin hasn't selected - we can return or clear data
            setData(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const startStr = dayjs(dateRange[0]).format('YYYY-MM-DD')

            // Limit end date to today max
            let endDate = dayjs(dateRange[1])
            if (endDate.isAfter(dayjs(), 'day')) {
                endDate = dayjs()
            }
            const endStr = endDate.format('YYYY-MM-DD')

            const response = await empAnalyticsApi.getDashboard(startStr, endStr, selectedEmployeeId)
            setData({
                ...response,
                daily_breakdown: response.daily_breakdown || [] // ensure array
            })
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    // Chart Data Transformation
    const chartData = data?.daily_breakdown.map(d => ({
        date: dayjs(d.date).format('DD MMM'),
        tasks: d.tasks_done,
        distance: d.distance_km,
        present: d.is_present ? 1 : 0
    })) || []

    return (
        <Container size="xl" py="lg" className="emp-analytics-container">
            {/* Header / Filters */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack>
                    <Text size="xl" fw={700}>Employee Analytics</Text>
                    {data?.employee_name && (
                        <Text c="dimmed" size="sm">Viewing stats for: {data.employee_name}</Text>
                    )}
                </Stack>

                <Group>
                    {/* Employee Selector for Admins */}
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                        <EmployeeSelector
                            selectedId={selectedEmployeeId || ''}
                            onSelect={setSelectedEmployeeId}
                        // placeholder prop removed
                        />
                    )}

                    <DateFilter
                        view={viewMode}
                        range={dateRange}
                        onViewChange={setViewMode}
                        onRangeChange={setDateRange}
                    />
                </Group>
            </Group>

            {/* Error or Loading */}
            {error && (
                <Alert icon={<AlertCircle size={16} />} title="Error" color="red" mb="lg">
                    {error}
                </Alert>
            )}

            {loading ? (
                <Center h={400}>
                    <Loader size="lg" />
                </Center>
            ) : !data ? (
                <Center h={400}>
                    <Text c="dimmed">Select an employee and date range to view analytics</Text>
                </Center>
            ) : (
                <>
                    {/* Stat Cards */}
                    <Grid gutter="md" mb="xl">
                        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                            <StatCard
                                title="Attendance"
                                value={`${data.attendance_percentage}%`}
                                delta={`${data.total_present_days}/${data.total_working_days} Days`}
                                icon={CalendarCheck}
                                iconColor="blue"
                                borderColor="blue.6"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                            <StatCard
                                title="Tasks Done"
                                value={data.total_tasks}
                                delta={`${data.avg_tasks_per_day} / day`}
                                icon={ClipboardList}
                                iconColor="teal"
                                borderColor="teal.6"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                            <StatCard
                                title="Distance"
                                value={`${data.total_distance_km} km`}
                                delta={`${data.avg_distance_per_day} km / day`}
                                icon={MapPin}
                                iconColor="orange"
                                borderColor="orange.6"
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                            <StatCard
                                title="Breaks"
                                value={data.total_breaks}
                                delta={`${data.avg_break_time_minutes} min avg`}
                                icon={Coffee}
                                iconColor="violet"
                                borderColor="violet.6"
                            />
                        </Grid.Col>
                    </Grid>

                    {/* Charts Section */}
                    <Grid gutter="xl" mb="xl">
                        <Grid.Col span={{ base: 12, lg: 12 }}>
                            <Paper p="md" withBorder radius="md">
                                <Text fw={600} mb="lg">Daily Performance Trend</Text>
                                <div style={{ height: 350, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" />
                                            <YAxis yAxisId="left" orientation="left" stroke="#20c997" />
                                            <YAxis yAxisId="right" orientation="right" stroke="#fd7e14" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="tasks" name="Tasks" fill="#20c997" radius={[4, 4, 0, 0]} />
                                            <Bar yAxisId="right" dataKey="distance" name="Distance (km)" fill="#fd7e14" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    {/* Breakdown Table */}
                    <Paper p="md" withBorder radius="md">
                        <Text fw={600} mb="md">Daily Breakdown</Text>
                        <Table highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Tasks</Table.Th>
                                    <Table.Th>Distance (km)</Table.Th>
                                    <Table.Th>Breaks</Table.Th>
                                    <Table.Th>Break Time</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.daily_breakdown.map((row, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{dayjs(row.date).format('DD MMM, ddd')}</Table.Td>
                                        <Table.Td>
                                            <Text c={row.is_present ? 'green' : row.is_working_day ? 'red' : 'dimmed'} fw={500}>
                                                {row.is_present ? 'Present' : row.is_working_day ? 'Absent' : 'Weekend'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>{row.tasks_done}</Table.Td>
                                        <Table.Td>{row.distance_km}</Table.Td>
                                        <Table.Td>{row.num_breaks}</Table.Td>
                                        <Table.Td>{row.break_time_minutes} min</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </>
            )}
        </Container>
    )
}
