/**
 * Dashboard Layout Component
 * Layout wrapper for protected dashboard pages with sidebar
 */

import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EmployeeSelector from '../components/EmployeeSelector'
import { clientsApi, tasksApi } from '../services/api'
import { Button } from '@mantine/core'
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
    BookOpen,
    ChevronRight,
    TrendingUp
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
    { path: '/dashboard/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
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

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Clients', 'Employees'])
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState<string>('')

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
        if (user.role === 'admin') return adminNavItems
        if (user.role === 'sales_rep' || user.role === 'manager') return salesRepNavItems
        return []
    }

    const navItems = getNavItems()

    const handleSyncUnolo = async () => {
        setIsSyncing(true)
        setSyncStatus('Starting Sync...')
        try {
            // 1. Sync Clients
            setSyncStatus('Syncing Clients...')
            const clientRes = await clientsApi.syncClients()

            // 2. Sync Tasks (29 days batch, 2 months back)
            setSyncStatus('Syncing Tasks...')

            const today = new Date()
            // 2 months ago
            const startDateLimit = new Date()
            startDateLimit.setMonth(today.getMonth() - 2)

            let currentStart = new Date(startDateLimit)
            const endLimit = new Date(today)

            let totalTasks = 0

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

            alert(`Sync Complete\nClients Processed: ${clientRes.total_processed
                }\nTasks Processed: ${totalTasks}`)

        } catch (error: any) {
            console.error(error)
            alert(`Sync Failed: ${error.message || 'Unknown error occurred'}`)
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

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <span className="logo-icon">
                            <BookOpen size={24} />
                        </span>
                        <span className="logo-text">Brinda</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(renderNavItem)}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.full_name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="dashboard-header glass">
                    {user?.role === 'manager' && (
                        <EmployeeSelector
                            selectedId={selectedEmployee}
                            onSelect={setSelectedEmployee}
                        />
                    )}
                    <h1 className="dashboard-title">
                        {(() => {
                            const activeCustomItem = navItems
                                .flatMap(item => item.children ? item.children : [item])
                                .find(item => item.path === location.pathname);
                            return activeCustomItem?.label || 'Dashboard';
                        })()}
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Button
                            onClick={handleSyncUnolo}
                            loading={isSyncing}
                            size="sm"
                            variant="light"
                            color="blue"
                        >
                            {isSyncing ? syncStatus : 'Sync Unolo'}
                        </Button>
                        <Link to="/" className="back-link">
                            ← Back to Website
                        </Link>
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
