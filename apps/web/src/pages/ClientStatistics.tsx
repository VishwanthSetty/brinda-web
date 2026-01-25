
import { useState, useEffect } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    SortingState,
} from '@tanstack/react-table'
import { clientsApi } from '../services/api'
import './ClientStatistics.css'

type SessionTab = 'all' | 'live-location' | 'timeline' | 'card-view' | 'compliance' | 'site-attendance'

const SESSION_TABS: { id: SessionTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All Clients', icon: '📊' },
    { id: 'live-location', label: 'Live Location', icon: '📍' },
    { id: 'timeline', label: 'Timeline', icon: '🕐' },
    { id: 'card-view', label: 'Card View', icon: '🗂️' },
    { id: 'compliance', label: 'Compliance Status', icon: 'ⓘ' },
    { id: 'site-attendance', label: 'Site Attendance', icon: '📍' },
]

export default function ClientStatistics() {
    const [data, setData] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([])
    const [activeTab, setActiveTab] = useState<SessionTab>('all')

    // Pagination state
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(20)

    // Filter states
    const [divisionFilter, setDivisionFilter] = useState('')
    const [visibleToFilter, setVisibleToFilter] = useState('')
    const [usingMaterialFilter, setUsingMaterialFilter] = useState('')

    const rawColumns = [
        { header: 'Client Name', accessorKey: 'Client Name (*)' },
        { header: 'Contact Name', accessorKey: 'Contact Name (*)' },
        { header: 'Phone', accessorKey: 'Contact Number (*)' },
        { header: 'Division', accessorKey: 'Division Name new (*)' },
        { header: 'Visible To', accessorKey: 'Visible To (*)' },
        { header: 'Using Material', accessorKey: 'Using Material (*)' },
        { header: 'Created At', accessorKey: 'Created At' },
    ]

    useEffect(() => {
        fetchClients()
    }, [pageIndex, pageSize, divisionFilter, visibleToFilter, usingMaterialFilter])

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const filters: Record<string, any> = {
                limit: pageSize,
                skip: pageIndex * pageSize,
            }

            if (divisionFilter) filters.division_name_new = divisionFilter
            if (visibleToFilter) filters.visible_to = visibleToFilter
            if (usingMaterialFilter) filters.using_material = usingMaterialFilter

            const response = await clientsApi.getClients(filters)
            setData(response.data)
            setTotalCount(response.total)
        } catch (error) {
            console.error('Failed to fetch clients', error)
        } finally {
            setIsLoading(false)
        }
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    const table = useReactTable({
        data,
        columns: rawColumns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    })

    const handleApplyFilters = () => {
        setPageIndex(0)
        fetchClients()
    }

    const handleClearFilters = () => {
        setDivisionFilter('')
        setVisibleToFilter('')
        setUsingMaterialFilter('')
        setPageIndex(0)
    }

    return (
        <div className="client-statistics-container">
            {/* Session Tabs */}
            <div className="session-tabs">
                {SESSION_TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`session-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Clients</span>
                    <span className="stat-value">{totalCount}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h3>Filters</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Division</label>
                        <input
                            type="text"
                            value={divisionFilter}
                            onChange={e => setDivisionFilter(e.target.value)}
                            placeholder="Filter by Division..."
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Visible To</label>
                        <input
                            type="text"
                            value={visibleToFilter}
                            onChange={e => setVisibleToFilter(e.target.value)}
                            placeholder="Filter by Visible To..."
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Using Material</label>
                        <input
                            type="text"
                            value={usingMaterialFilter}
                            onChange={e => setUsingMaterialFilter(e.target.value)}
                            placeholder="Filter by Using Material..."
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
                    </div>
                </div>
            </div>

            {/* Data Table */}
            {activeTab === 'all' && (
                <div className="data-table-container">
                    <div className="table-header-controls">
                        <span className="table-title">Client List</span>
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
                                        <td colSpan={rawColumns.length} style={{ textAlign: 'center' }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={rawColumns.length} style={{ textAlign: 'center' }}>
                                            No clients found
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
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'all' && (
                <div className="tab-placeholder">
                    <p>🚧 {SESSION_TABS.find(t => t.id === activeTab)?.label} coming soon...</p>
                </div>
            )}
        </div>
    )
}
