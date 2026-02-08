/**
 * Dashboard Layout Component
 * Layout wrapper for protected dashboard pages with sidebar
 */

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EmployeeSelector from '../components/EmployeeSelector'
import { authApi, clientsApi, tasksApi, attendanceApi, eodSummaryApi } from '../services/api'
import { Button, Menu, Modal, PasswordInput, Stack, SegmentedControl } from '@mantine/core'
import {
    LayoutDashboard,
    BarChart2,
    Users,
    Upload,
    User,
    ClipboardList,
    Map,
    Link as LinkIcon,
    School,
    Truck,
    ChevronRight,
    TrendingUp,
    Search,
    Bell,
    LogOut
} from 'lucide-react'
import './DashboardLayout.css'

interface NavItem {
    path?: string
    label: string
    icon: React.ReactNode
    children?: NavItem[]
}

const adminNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/dashboard/all-employees', label: 'All Employees Details', icon: <Users size={20} /> },
    {
        label: 'Clients',
        icon: <Users size={20} />,
        children: [
            { path: '/dashboard/client-statistics', label: 'Statistics', icon: <BarChart2 size={20} /> },
            { path: '/dashboard/client-migration', label: 'Migration', icon: <Upload size={20} /> },
        ]
    },
    {
        label: 'Employees',
        icon: <User size={20} />,
        children: [
            { path: '/dashboard/analytics', label: 'Employee Analytics', icon: <TrendingUp size={20} /> },
            { path: '/dashboard/employee-statistics', label: 'Statistics', icon: <BarChart2 size={20} /> },
            { path: '/dashboard/employees', label: 'All Employees', icon: <ClipboardList size={20} /> },
            { path: '/dashboard/employee-tasks', label: 'Tasks', icon: <Map size={20} /> },
            { path: '/dashboard/employee-clients', label: 'Clients List', icon: <LinkIcon size={20} /> },
        ]
    },
]

const salesRepNavItems: NavItem[] = [
    { path: '/dashboard/tasks', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
        label: 'Clients',
        icon: <Users size={20} />,
        children: [
            { path: '/dashboard/clients/schools', label: 'Schools', icon: <School size={20} /> },
            { path: '/dashboard/clients/distributor', label: 'Distributor', icon: <Truck size={20} /> },
        ]
    },
]

const managerNavItems: NavItem[] = [
    { path: '/dashboard/tasks', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
        label: 'Employees', icon: <User size={20} />,
        children: [
            { path: '/dashboard/all-employees', label: 'All Employees Details', icon: <Users size={20} /> },
            { path: '/dashboard/analytics', label: 'Employee Analytics', icon: <TrendingUp size={20} /> },
        ]
    },
    {
        label: 'Clients',
        icon: <Users size={20} />,
        children: [
            { path: '/dashboard/clients/schools', label: 'Schools', icon: <School size={20} /> },
            { path: '/dashboard/clients/distributor', label: 'Distributor', icon: <Truck size={20} /> },
        ]
    },
]

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Clients', 'Employees'])
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<string>('admin')
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState<string>('')

    // Reset view mode when user role changes or initially loads being admin
    useEffect(() => {
        if (user?.role === 'admin') {
            setViewMode('admin')
        }
    }, [user?.role])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const isPathActive = (item: NavItem): boolean => {
        if (item.path === location.pathname) return true
        if (item.children) {
            return item.children.some(child => isPathActive(child))
        }
        return false
    }

    const getNavItems = (): NavItem[] => {
        if (!user) return []
        const currentRole = user.role === 'admin' ? viewMode : user.role
        if (currentRole === 'admin') return adminNavItems
        if (currentRole === 'manager') return managerNavItems
        if (currentRole === 'sales_rep') return salesRepNavItems
        return []
    }

    const navItems = getNavItems()

    const handleSyncUnolo = async () => {
        setIsSyncing(true)
        setSyncStatus('Starting Sync...')
        try {
            // 1. Sync Clients
            setSyncStatus('Syncing Clients...')
            let clientRes: any = {
                total_processed: 0,
                created: 0,
                updated: 0,
                deleted: 0
            }
            clientRes = await clientsApi.syncClients()

            // Date range for syncing Tasks, Attendance, EOD Summary
            const today = new Date()
            const startDateLimit = new Date()
            startDateLimit.setMonth(today.getMonth() - 2)

            let currentStart = new Date(startDateLimit)
            const endLimit = new Date(today)

            let totalTasks = 0
            let totalAttendance = 0
            let totalEodSummary = 0

            // 2. Sync Tasks (29 days batch, 2 months back)
            setSyncStatus('Syncing Tasks...')

            // We iterate in 29 day chunks from start limit to today
            while (currentStart < endLimit) {
                const batchEnd = new Date(currentStart)
                batchEnd.setDate(batchEnd.getDate() + 29)

                const finalEnd = batchEnd > endLimit ? endLimit : batchEnd

                const startStr = currentStart.toISOString().split('T')[0]
                const endStr = finalEnd.toISOString().split('T')[0]

                setSyncStatus(`Syncing Tasks: ${startStr} to ${endStr}`)

                const taskRes = await tasksApi.sync({
                    start: startStr,
                    end: endStr,
                    customTaskName: 'School Visit' // Defaulting to School Visit
                })

                totalTasks += taskRes.created + taskRes.updated

                // Move to next day after batch
                currentStart = new Date(finalEnd)
                currentStart.setDate(currentStart.getDate() + 1)
            }

            // 3. Sync Attendance (29 days batch, 2 months back)
            setSyncStatus('Syncing Attendance...')
            currentStart = new Date(startDateLimit)

            while (currentStart < endLimit) {
                const batchEnd = new Date(currentStart)
                batchEnd.setDate(batchEnd.getDate() + 29)

                const finalEnd = batchEnd > endLimit ? endLimit : batchEnd

                const startStr = currentStart.toISOString().split('T')[0]
                const endStr = finalEnd.toISOString().split('T')[0]

                setSyncStatus(`Syncing Attendance: ${startStr} to ${endStr}`)

                const attendanceRes = await attendanceApi.sync({
                    start: startStr,
                    end: endStr,
                })

                totalAttendance += attendanceRes.created + attendanceRes.updated

                currentStart = new Date(finalEnd)
                currentStart.setDate(currentStart.getDate() + 1)
            }

            // 4. Sync EOD Summary (29 days batch, 2 months back)
            setSyncStatus('Syncing EOD Summary...')
            currentStart = new Date(startDateLimit)

            while (currentStart < endLimit) {
                const batchEnd = new Date(currentStart)
                batchEnd.setDate(batchEnd.getDate() + 29)

                const finalEnd = batchEnd > endLimit ? endLimit : batchEnd

                const startStr = currentStart.toISOString().split('T')[0]
                const endStr = finalEnd.toISOString().split('T')[0]

                setSyncStatus(`Syncing EOD Summary: ${startStr} to ${endStr}`)

                const eodRes = await eodSummaryApi.sync({
                    start: startStr,
                    end: endStr,
                })

                totalEodSummary += eodRes.created + eodRes.updated

                currentStart = new Date(finalEnd)
                currentStart.setDate(currentStart.getDate() + 1)
            }

            toast.success(`Sync Complete\nClients: ${clientRes.total_processed}\nTasks: ${totalTasks}\nAttendance: ${totalAttendance}\nEOD Summary: ${totalEodSummary}`)

        } catch (error: any) {
            console.error(error)
            toast.error(`Sync Failed: ${error.message || 'Unknown error occurred'}`)
        } finally {
            setIsSyncing(false)
            setSyncStatus('')
        }
    }

    const renderNavItem = (item: NavItem) => {
        if (item.children) {
            const isExpanded = expandedItems.includes(item.label)
            const isActive = isPathActive(item)

            return (
                <div key={item.label} className={`nav-group ${isActive ? 'active-group' : ''}`}>
                    <div
                        className={`sidebar-link parent ${isActive ? 'active-parent' : ''}`}
                        onClick={() => toggleExpand(item.label)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                        <span className={`arrow-icon ${isExpanded ? 'expanded' : ''}`}>
                            <ChevronRight size={16} />
                        </span>
                    </div>
                    {isExpanded && (
                        <div className="nav-children">
                            {item.children.map(child => renderNavItem(child))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <Link
                key={item.path}
                to={item.path!}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
            </Link>
        )
    }

    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    })
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const handlePasswordChangeSubmit = async () => {
        setPasswordError('')
        setPasswordSuccess('')

        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordError("New passwords do not match")
            return
        }

        if (passwordForm.new.length < 8) {
            setPasswordError("Password must be at least 8 characters")
            return
        }

        setIsChangingPassword(true)
        try {
            await authApi.changePassword({
                old_password: passwordForm.current,
                new_password: passwordForm.new
            })
            setPasswordSuccess("Password updated successfully")
            setTimeout(() => {
                setPasswordModalOpen(false)
                setPasswordForm({ current: '', new: '', confirm: '' })
                setPasswordSuccess('')
            }, 1500)
        } catch (err: any) {
            setPasswordError(err.response?.data?.detail || "Failed to update password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="dashboard-layout">
            <Modal
                opened={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                title="Change Password"
                centered
            >
                <Stack>
                    <PasswordInput
                        label="Current Password"
                        placeholder="Enter current password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.currentTarget.value })}
                        error={passwordError && !passwordForm.current ? true : undefined}
                    />
                    <PasswordInput
                        label="New Password"
                        placeholder="Enter new password (min 8 chars)"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.currentTarget.value })}
                    />
                    <PasswordInput
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.currentTarget.value })}
                        error={passwordError}
                    />

                    {passwordSuccess && <div style={{ color: 'green', fontSize: '0.9rem' }}>{passwordSuccess}</div>}

                    <Button
                        fullWidth
                        onClick={handlePasswordChangeSubmit}
                        loading={isChangingPassword}
                        mt="md"
                    >
                        Update Password
                    </Button>
                </Stack>
            </Modal>

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <img src="/brinda_only_logo.svg" alt="Logo" className="logo-icon" style={{ height: '32px', width: 'auto' }} />
                        <span className="logo-text">Brinda</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(renderNavItem)}
                </nav>

                <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem' }}>
                    <div
                        className="sidebar-link"
                        onClick={handleLogout}
                        style={{ cursor: 'pointer', color: '#fa5252' }}
                    >
                        <span className="sidebar-icon"><LogOut size={20} /></span>
                        <span className="sidebar-label">Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="dashboard-header glass">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            {(() => {
                                const activeCustomItem = navItems
                                    .flatMap(item => item.children ? item.children : [item])
                                    .find(item => item.path === location.pathname);
                                return activeCustomItem?.label || 'Dashboard';
                            })()}
                        </h1>
                        <p className="dashboard-subtitle">Brinda Publications Employee Analytics</p>
                    </div>

                    <div className="header-right">
                        {/* Search Bar */}
                        <div className="header-search">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search..." className="search-input" />
                        </div>

                        {/* Admin View Toggle */}
                        {user?.role === 'admin' && (
                            <SegmentedControl
                                value={viewMode}
                                onChange={(value) => {
                                    setViewMode(value)
                                    if (value === 'admin') {
                                        navigate('/dashboard')
                                    } else {
                                        navigate('/dashboard/tasks')
                                    }
                                }}
                                data={[
                                    { label: 'Admin View', value: 'admin' },
                                    { label: 'Manager View', value: 'manager' }
                                ]}
                                size="xs"
                                radius="xl"
                                style={{ marginRight: '1rem' }}
                            />
                        )}

                        {/* Employee Selector (Manager only or Admin in Manager View) */}
                        {(user?.role === 'manager' || (user?.role === 'admin' && viewMode === 'manager')) && (
                            <EmployeeSelector
                                selectedId={selectedEmployee}
                                onSelect={setSelectedEmployee}
                            />
                        )}

                        {/* Sync Button */}
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <Button
                                onClick={handleSyncUnolo}
                                loading={isSyncing}
                                size="sm"
                                variant="light"
                                color="blue"
                                className="sync-btn"
                            >
                                {isSyncing ? syncStatus : 'Sync Unolo'}
                            </Button>
                        )}

                        {/* Notification Bell */}
                        <button className="header-icon-btn">
                            <Bell size={20} />
                        </button>

                        {/* User Profile Menu */}
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <div className="header-user-profile">
                                    <div className="text-right hidden md:block">
                                        <div className="user-name">{user?.full_name}</div>
                                        <div className="user-role">{user?.role}</div>
                                    </div>
                                    <div className="user-avatar">
                                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </div>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Account</Menu.Label>
                                <Menu.Item leftSection={<User size={14} />} onClick={() => setPasswordModalOpen(true)}>
                                    Change Password
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<Upload size={14} style={{ transform: 'rotate(90deg)' }} />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="dashboard-content">
                    <Outlet context={{ selectedEmployee }} />
                </main>
            </div>
        </div>
    )
}

