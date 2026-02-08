import { useState, useEffect } from 'react'
import { Container, Group, Text, Stack, Table, ActionIcon, TextInput, Badge, Paper, Loader, Center, Alert } from '@mantine/core'
import { DateFilter } from '../Tasks/components/DateFilter'
import { StatCard } from '../Tasks/components/StatsHeader/StatCard'
import { allEmpAnalyticsApi } from '../../services/api'
import { Users, Calendar, ClipboardList, MapPin, Eye, Search, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import './AllEmployeesOverview.css'

export default function AllEmployeesOverview() {
    const navigate = useNavigate()
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'custom'>('monthly')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        dayjs().startOf('month').toDate(),
        dayjs().endOf('month').toDate()
    ])

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadData()
    }, [dateRange])

    async function loadData() {
        if (!dateRange[0] || !dateRange[1]) return

        setLoading(true)
        setError(null)

        try {
            const startStr = dayjs(dateRange[0]).format('YYYY-MM-DD')

            // Clamp end date to today
            let endDate = dayjs(dateRange[1])
            if (endDate.isAfter(dayjs(), 'day')) {
                endDate = dayjs()
            }
            const endStr = endDate.format('YYYY-MM-DD')

            const response = await allEmpAnalyticsApi.getOverview(startStr, endStr)
            setData(response)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to load overview data')
        } finally {
            setLoading(false)
        }
    }

    const getAttendanceColor = (pct: number) => {
        if (pct >= 85) return 'green'
        if (pct >= 70) return 'yellow'
        return 'red'
    }

    const filteredEmployees = data?.employees.filter((emp: any) =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <Container size="xl" py="lg" className="all-emp-overview">
            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={0}>
                    <Text size="xl" fw={700}>All Employees Overview</Text>
                    <Text c="dimmed" size="sm">Performance summary across the organization</Text>
                </Stack>
                <DateFilter
                    view={viewMode}
                    range={dateRange}
                    onViewChange={setViewMode}
                    onRangeChange={setDateRange}
                />
            </Group>

            {/* Error */}
            {error && (
                <Alert icon={<AlertCircle size={16} />} title="Error" color="red" mb="lg">
                    {error}
                </Alert>
            )}

            {/* Summary Stats */}
            <div className="overview-stats">
                <StatCard
                    title="Total Employees"
                    value={data?.total_employees || 0}
                    icon={Users}
                    iconColor="blue"
                    borderColor="blue.6"
                />
                <StatCard
                    title="Avg Attendance"
                    value={`${data?.avg_attendance || 0}%`}
                    icon={Calendar}
                    iconColor="green"
                    borderColor="green.6"
                />
                <StatCard
                    title="Total Tasks"
                    value={data?.total_tasks || 0}
                    icon={ClipboardList}
                    iconColor="teal"
                    borderColor="teal.6"
                />
                <StatCard
                    title="Total Distance"
                    value={`${data?.total_distance_km || 0} km`}
                    icon={MapPin}
                    iconColor="orange"
                    borderColor="orange.6"
                />
            </div>

            {/* Table Section */}
            <Paper withBorder radius="md" p="md" mt="xl">
                <Group justify="space-between" mb="md">
                    <Text fw={600}>Employee Performance</Text>
                    <TextInput
                        placeholder="Search employees..."
                        leftSection={<Search size={16} />}
                        size="sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        style={{ width: 300 }}
                    />
                </Group>

                {loading ? (
                    <Center h={300}>
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <div className="overview-table-container">
                        <Table highlightOnHover verticalSpacing="sm" className="emp-table">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Employee</Table.Th>
                                    <Table.Th>Role</Table.Th>
                                    <Table.Th>Attendance</Table.Th>
                                    <Table.Th>Tasks Done</Table.Th>
                                    <Table.Th>Distance</Table.Th>
                                    <Table.Th>Total Breaks</Table.Th>
                                    <Table.Th>Avg Break</Table.Th>
                                    <Table.Th style={{ width: 60, textAlign: 'center' }}>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp: any) => (
                                        <Table.Tr key={emp.employee_id}>
                                            <Table.Td>
                                                <Group gap="sm" wrap="nowrap">
                                                    <div className="avatar-initial">
                                                        {emp.employee_name.charAt(0)}
                                                    </div>
                                                    <Text size="sm" fw={500}>{emp.employee_name}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="gray" size="sm" tt="capitalize">
                                                    {emp.role}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    variant="light"
                                                    color={getAttendanceColor(emp.attendance_percentage)}
                                                >
                                                    {emp.attendance_percentage}%
                                                </Badge>
                                                <Text size="xs" c="dimmed">
                                                    {emp.total_present_days} days
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{emp.total_tasks}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{emp.total_distance_km} km</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{emp.total_breaks}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{emp.avg_break_time_minutes} min</Text>
                                            </Table.Td>
                                            <Table.Td align="center">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="blue"
                                                    className="action-btn"
                                                    onClick={() => navigate(`/dashboard/analytics?employee=${emp.employee_id}`)}
                                                >
                                                    <Eye size={18} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Tr>
                                            <Table.Td colSpan={8}>
                                                <Center h={100} c="dimmed">
                                                    No employees found
                                                </Center>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}
            </Paper>
        </Container>
    )
}
