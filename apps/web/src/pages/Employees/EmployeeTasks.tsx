import { useState, useEffect } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    SortingState,
} from '@tanstack/react-table'
import { tasksApi } from '../../services/api'
import '../ClientStatistics.css' // Reusing styles

const EmployeeTasks = () => {
    const [data, setData] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([])
    const [error, setError] = useState<string | null>(null)
    const [syncMessage, setSyncMessage] = useState<string | null>(null)

    // Pagination state
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(20)

    // Filter states
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [customTaskName, setCustomTaskName] = useState('')

    const columns = [
        { header: 'Task ID', accessorKey: 'taskID' },
        { header: 'Employee ID', accessorKey: 'internalEmpID' },
        { header: 'Date', accessorKey: 'date' },
        { header: 'Check-in', accessorKey: 'checkinTime' },
        { header: 'Check-out', accessorKey: 'checkoutTime' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Description', accessorKey: 'taskDescription' },
    ]

    useEffect(() => {
        fetchTasks()
    }, [pageIndex, pageSize])

    const fetchTasks = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const filters: Record<string, any> = {
                limit: pageSize,
                skip: pageIndex * pageSize,
            }

            if (startDate) filters.start = startDate
            if (endDate) filters.end = endDate
            if (customTaskName) filters.customTaskName = customTaskName

            const response = await tasksApi.list(filters)
            setData(response.data)
            setTotalCount(response.total)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tasks')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSync = async () => {
        if (!startDate || !customTaskName) {
            setError('Please fill in Start Date and Task Name to sync')
            return
        }

        setIsSyncing(true)
        setError(null)
        setSyncMessage(null)

        try {
            const finalEndDate = endDate || new Date().toISOString().split('T')[0]

            const start = new Date(startDate)
            const end = new Date(finalEndDate)

            const totalStats = {
                total_fetched: 0,
                created: 0,
                updated: 0,
                errors: 0
            }

            let current = new Date(start)

            while (current <= end) {
                // Determine batch end date (current + 30 days)
                const batchEnd = new Date(current)
                batchEnd.setDate(batchEnd.getDate() + 29)

                // If batch end is beyond final end, cap it
                const actualEnd = batchEnd > end ? end : batchEnd

                // Format dates as YYYY-MM-DD
                const batchStartStr = current.toISOString().split('T')[0]
                const batchEndStr = actualEnd.toISOString().split('T')[0]

                // Perform sync
                const result = await tasksApi.sync({
                    start: batchStartStr,
                    end: batchEndStr,
                    customTaskName: customTaskName,
                })

                // Aggregate stats
                totalStats.total_fetched += result.total_fetched
                totalStats.created += result.created
                totalStats.updated += result.updated
                totalStats.errors += result.errors

                // Move current to next day after actualEnd
                current = new Date(actualEnd)
                current.setDate(current.getDate() + 1)
            }

            setSyncMessage(
                `Sync completed! Fetched: ${totalStats.total_fetched}, Created: ${totalStats.created}, Updated: ${totalStats.updated}, Errors: ${totalStats.errors}`
            )
            // Refresh the list after sync
            fetchTasks()
        } catch (err: any) {
            setError(err.message || 'Sync failed')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleApplyFilters = () => {
        setPageIndex(0)
        fetchTasks()
    }

    const handleClearFilters = () => {
        setStartDate('')
        setEndDate('')
        setCustomTaskName('')
        setPageIndex(0)
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    })

    return (
        <div className="client-statistics-container">
            {/* Header */}
            <div className="page-header">
                <h1>Employee Tasks</h1>
                <p className="description">View and sync employee tasks from Unolo</p>
            </div>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Tasks</span>
                    <span className="stat-value">{totalCount}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h3>Filters & Sync</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Task Name</label>
                        <input
                            type="text"
                            value={customTaskName}
                            onChange={e => setCustomTaskName(e.target.value)}
                            placeholder="e.g. Visit"
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-actions">
                        <button className="filter-btn apply" onClick={handleApplyFilters}>
                            Apply
                        </button>
                        <button className="filter-btn clear" onClick={handleClearFilters}>
                            Clear
                        </button>
                        <button
                            className="filter-btn apply"
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{ marginLeft: '8px' }}
                        >
                            {isSyncing ? 'Syncing...' : '🔄 Sync from Unolo'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {syncMessage && <div className="success-message" style={{ padding: '12px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '16px' }}>{syncMessage}</div>}

            {/* Data Table */}
            <div className="data-table-container">
                <div className="table-header-controls">
                    <span className="table-title">Task List</span>
                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                            setPageIndex(0)
                        }}
                        className="page-size-select"
                    >
                        {[10, 20, 30, 50, 100].map(size => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                        No tasks found. Use the filters and Sync button to fetch tasks.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="scan-pagination">
                    <div className="page-info">
                        Page {pageIndex + 1} of {totalPages || 1} ({totalCount} total)
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                            disabled={pageIndex === 0}
                        >
                            Previous
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => setPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={pageIndex >= totalPages - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeTasks
