/**
 * Dashboard Page Component
 * Analytics dashboard for authenticated users
 * Admin View: Aggregated stats across all employees
 */

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { analyticsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { AdminOverviewResponse } from '../types/analytics'
import { Container, Grid, Group, Loader, Center, Modal, LoadingOverlay } from '@mantine/core'
import { DateFilter } from './Tasks/components/DateFilter'
import { StatCard } from './Tasks/components/StatsHeader/StatCard'
import { ClipboardList, Flame, BookCopy } from 'lucide-react'
import dayjs from 'dayjs'
import { AdminBarChart } from '../components/AdminBarChart'
import { AdminDrillDownTable } from '../components/AdminDrillDownTable'
import { useDisclosure } from '@mantine/hooks'
import './Dashboard.css'

export default function Dashboard() {
    const { user } = useAuth()
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'custom'>('monthly')
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        dayjs().startOf('month').toDate(),
        dayjs().endOf('month').toDate()
    ])

    const [data, setData] = useState<AdminOverviewResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // DrillDown State
    const [drillDownTitle, setDrillDownTitle] = useState('')
    const [drillDownData, setDrillDownData] = useState<any[]>([])
    const [isDrillDownLoading, setIsDrillDownLoading] = useState(false)
    const [opened, { open, close }] = useDisclosure(false)

    // Redirect non-admin users
    if (user && user.role !== 'admin') {
        return <Navigate to="/dashboard/tasks" replace />
    }

    useEffect(() => {
        loadDashboardData()
    }, [dateRange])

    async function loadDashboardData() {
        if (!dateRange[0] || !dateRange[1]) return

        setLoading(true)
        setError(null)

        try {
            const startStr = dayjs(dateRange[0]).format('YYYY-MM-DD')
            const endStr = dayjs(dateRange[1]).format('YYYY-MM-DD')

            const response = await analyticsApi.getAdminOverview(startStr, endStr)
            setData(response)
        } catch (err) {
            console.error(err)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fetchDrillDownData = async (type: string, employeeId?: string) => {
        if (!dateRange[0] || !dateRange[1]) return

        setIsDrillDownLoading(true)
        setDrillDownData([])
        open()

        try {
            const start = dayjs(dateRange[0]).format('YYYY-MM-DD')
            const end = dayjs(dateRange[1]).format('YYYY-MM-DD')

            let filterType = undefined
            if (type === 'hot_schools') filterType = 'hot_schools'
            if (type === 'specimens') filterType = 'specimens'

            // if type is employee_schools, we need both employeeId AND filterType='hot_schools'
            if (type === 'employee_schools') filterType = 'hot_schools'

            const response = await analyticsApi.getAdminTasks(start, end, employeeId, filterType)
            setDrillDownData(response.data || [])
        } catch (err: any) {
            console.error(err)
        } finally {
            setIsDrillDownLoading(false)
        }
    }

    // Handlers
    const handleTotalTasksClick = () => {
        setDrillDownTitle('All Tasks in Range')
        fetchDrillDownData('all_tasks')
    }

    const handleHotSchoolsClick = () => {
        setDrillDownTitle('All Hot Schools Tasks')
        fetchDrillDownData('hot_schools')
    }

    const handleSpecimensClick = () => {
        setDrillDownTitle('Tasks with Specimens')
        fetchDrillDownData('specimens')
    }

    const handleEmployeeTasksClick = (id: string, name: string) => {
        setDrillDownTitle(`Tasks by ${name}`)
        fetchDrillDownData('employee_tasks', id)
    }

    const handleEmployeeSchoolsClick = (id: string, name: string) => {
        setDrillDownTitle(`Hot Schools by ${name}`)
        fetchDrillDownData('employee_schools', id)
    }

    if (loading && !data) {
        return (
            <Center style={{ height: '50vh' }}>
                <Loader />
            </Center>
        )
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={loadDashboardData} className="btn btn-primary">
                    Retry
                </button>
            </div>
        )
    }

    // Transform data for charts
    const taskChartData = data?.tasks_by_employee.map(e => ({
        name: e.employee_name,
        value: e.task_count,
        id: e.employee_id
    })) || []

    const schoolChartData = data?.schools_by_employee.map(e => ({
        name: e.employee_name,
        value: e.hot_school_count,
        id: e.employee_id
    })) || []

    return (
        <Container size="xl" py="lg">
            {/* Date Filter */}
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

            {/* Stats Overview */}
            <Grid gutter="md" mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div onClick={handleTotalTasksClick} style={{ cursor: 'pointer' }}>
                        <StatCard
                            title="Total Tasks"
                            value={data?.total_tasks || 0}
                            icon={ClipboardList}
                            borderColor="teal.7"
                            iconColor="teal"
                        />
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div onClick={handleHotSchoolsClick} style={{ cursor: 'pointer' }}>
                        <StatCard
                            title="Total Hot Schools"
                            value={data?.hot_schools_count || 0}
                            icon={Flame}
                            borderColor="red.5"
                            iconColor="red"
                            badge="Hot"
                            badgeColor='red'
                        />
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <div onClick={handleSpecimensClick} style={{ cursor: 'pointer' }}>
                        <StatCard
                            title="Total Specimens Given"
                            value={data?.total_specimens || 0}
                            icon={BookCopy}
                            borderColor="violet.5"
                            iconColor="violet"
                        />
                    </div>
                </Grid.Col>
            </Grid>

            {/* Charts Section */}
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <div style={{ height: 500 }}>
                        <AdminBarChart
                            title="Tasks Created by Employee"
                            data={taskChartData}
                            valueLabel="Tasks"
                            barColor="#20c997" // teal.5
                            onBarClick={handleEmployeeTasksClick}
                            height={450}
                        />
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <div style={{ height: 500 }}>
                        <AdminBarChart
                            title="Hot Schools by Employee"
                            data={schoolChartData}
                            valueLabel="Hot Schools"
                            barColor="#ff6b6b" // red.5
                            onBarClick={handleEmployeeSchoolsClick}
                            height={450}
                        />
                    </div>
                </Grid.Col>
            </Grid>

            {/* Drilldown Modal */}
            <Modal opened={opened} onClose={close} title={drillDownTitle} size="100%" centered>
                <div style={{ position: 'relative', minHeight: '200px' }}>
                    <LoadingOverlay visible={isDrillDownLoading} zIndex={100} overlayProps={{ radius: "sm", blur: 2 }} />
                    {!isDrillDownLoading && <AdminDrillDownTable data={drillDownData} />}
                </div>
            </Modal>
        </Container>
    )
}
