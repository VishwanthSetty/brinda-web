/**
 * Dashboard Page Component
 * Analytics dashboard for authenticated users
 */

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { SalesAnalytics, DashboardSummary } from '../types'
import './Dashboard.css'

export default function Dashboard() {
    const { user } = useAuth()
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [days, setDays] = useState(30)

    // Redirect non-admin users
    if (user && user.role !== 'admin') {
        return <Navigate to="/dashboard/tasks" replace />
    }

    useEffect(() => {
        loadDashboardData()
    }, [days])

    async function loadDashboardData() {
        setLoading(true)
        setError(null)

        try {
            const [summaryData, analyticsData] = await Promise.all([
                dashboardApi.getSummary(),
                dashboardApi.getAnalytics(days),
            ])
            setSummary(summaryData)
            setAnalytics(analyticsData)
        } catch {
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value)
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button onClick={loadDashboardData} className="btn btn-primary">
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            {/* Quick Stats */}
            <div className="stats-row">
                <div className="stat-card card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <span className="stat-value">{summary?.total_products || 0}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <span className="stat-value">{summary?.total_users || 0}</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-value">{formatCurrency(summary?.today_revenue || 0)}</span>
                        <span className="stat-label">Today's Revenue</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <span className="stat-value">{summary?.today_orders || 0}</span>
                        <span className="stat-label">Today's Orders</span>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="analytics-section">
                <div className="section-header">
                    <h2>Sales Analytics</h2>
                    <select
                        className="form-input period-select"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>

                {/* Analytics Summary Cards */}
                <div className="analytics-summary">
                    <div className="summary-card card">
                        <h4>Total Revenue</h4>
                        <span className="summary-value">
                            {formatCurrency(analytics?.summary.total_revenue || 0)}
                        </span>
                    </div>
                    <div className="summary-card card">
                        <h4>Total Orders</h4>
                        <span className="summary-value">
                            {analytics?.summary.total_orders || 0}
                        </span>
                    </div>
                    <div className="summary-card card">
                        <h4>Units Sold</h4>
                        <span className="summary-value">
                            {analytics?.summary.total_quantity || 0}
                        </span>
                    </div>
                    <div className="summary-card card">
                        <h4>Avg Order Value</h4>
                        <span className="summary-value">
                            {formatCurrency(analytics?.summary.average_order_value || 0)}
                        </span>
                    </div>
                </div>

                {/* Data Tables */}
                <div className="data-tables">
                    {/* Sales by Region */}
                    <div className="data-table card">
                        <h3>Sales by Region</h3>
                        {analytics?.by_region.length ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Region</th>
                                        <th>Orders</th>
                                        <th>Revenue</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.by_region.map((region) => (
                                        <tr key={region.region}>
                                            <td>{region.region}</td>
                                            <td>{region.total_orders}</td>
                                            <td>{formatCurrency(region.total_revenue)}</td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${region.percentage}%` }}
                                                    />
                                                    <span>{region.percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">No data available</p>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="data-table card">
                        <h3>Top Products</h3>
                        {analytics?.by_product.length ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Revenue</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.by_product.map((product) => (
                                        <tr key={product.product_id}>
                                            <td className="product-name">{product.product_title}</td>
                                            <td>{product.total_quantity}</td>
                                            <td>{formatCurrency(product.total_revenue)}</td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${product.percentage}%` }}
                                                    />
                                                    <span>{product.percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
