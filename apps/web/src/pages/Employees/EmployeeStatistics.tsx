import { useState, useEffect } from 'react'
import { employeesApi } from '../../services/api'
import '../ClientStatistics.css' // Reusing styles for consistent look

export default function EmployeeStatistics() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const data = await employeesApi.list()
            setStats({
                total_employees: data.length
            })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        try {
            setSyncing(true)
            setError(null)
            const result = await employeesApi.sync()
            alert(`Sync Completed!\nCreated: ${result.created}\nUpdated: ${result.updated}\nErrors: ${result.errors}`)
            fetchStats()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    return (
        <div className="client-statistics">
            <div className="page-header">
                <div>
                    <h1>Employee Statistics</h1>
                    <p className="description">Overview of employee data and synchronization</p>
                </div>
                <button
                    className="action-btn primary"
                    onClick={handleSync}
                    disabled={syncing}
                >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">👥</div>
                    <div className="stat-info">
                        <h3>Total Employees</h3>
                        <div className="stat-value">{loading ? '...' : stats?.total_employees || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
