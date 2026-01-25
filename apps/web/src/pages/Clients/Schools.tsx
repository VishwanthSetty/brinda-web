import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
} from '@tanstack/react-table'
import { analyticsApi } from '../../services/api'
import './Schools.css'

type TabType = 'total' | 'area-wise'

interface SchoolsContext {
    selectedEmployee: string | null
}

export default function Schools() {
    const { selectedEmployee } = useOutletContext<SchoolsContext>()
    const [activeTab, setActiveTab] = useState<TabType>('total')

    // Data States
    const [schools, setSchools] = useState<any[]>([])
    const [groupedSchools, setGroupedSchools] = useState<Record<string, any[]>>({})
    const [unassignedSchools, setUnassignedSchools] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Area Wise Drill-down State
    const [selectedArea, setSelectedArea] = useState<string | null>(null)

    const [totalSchools, setTotalSchools] = useState(0)

    // Fetch Total Schools
    useEffect(() => {
        if (activeTab === 'total') {
            loadTotalSchools()
        }
    }, [activeTab, selectedEmployee])

    // Fetch Area Wise Schools
    useEffect(() => {
        if (activeTab === 'area-wise') {
            loadAreaWiseSchools()
        }
    }, [activeTab, selectedEmployee])

    const loadTotalSchools = async () => {
        setLoading(true)
        try {
            const response = await analyticsApi.getEmployeeClients('School', selectedEmployee || undefined)
            setSchools(response.data)
            setTotalSchools(response.total)
        } catch (error) {
            console.error('Failed to load schools:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadAreaWiseSchools = async () => {
        setLoading(true)
        try {
            const response = await analyticsApi.getGroupedClients('AREA_WISE', 'School', selectedEmployee || undefined)
            setGroupedSchools(response.groups)
            setUnassignedSchools(response.unassigned)
            setTotalSchools(response.total)
        } catch (error) {
            console.error('Failed to load grouped schools:', error)
        } finally {
            setLoading(false)
        }
    }

    // Table Columns Configuration
    const columns = [
        {
            id: 'sno',
            header: 'SNo.',
            cell: (info: any) => info.row.index + 1,
        },
        { header: 'Client Name', accessorKey: 'Client Name (*)' },
        { header: 'Contact Name', accessorKey: 'Contact Name (*)' },
        { header: 'Phone', accessorKey: 'Contact Number (*)' },
        { header: 'Division', accessorKey: 'Division Name new (*)' },
        { header: 'Address', accessorKey: 'Address (*)' },
    ]

    // Create Table Instance (reused for both tabs)
    const tableData = activeTab === 'total'
        ? schools
        : (selectedArea
            ? (selectedArea === 'Unassigned' ? unassignedSchools : (groupedSchools[selectedArea] || []))
            : [])

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const renderTable = () => (
        <div className="data-table-container">
            <div className="table-wrapper">
                <table className="data-table">
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
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="loading-spinner"></div> Loading...
                                </td>
                            </tr>
                        ) : tableData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No schools found
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

            {/* Simple Pagination */}
            {tableData.length > 0 && (
                <div className="scan-pagination">
                    <div className="page-info">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="schools-page">
            <header className="page-header">
                <h2>Total Schools: {totalSchools}</h2>
            </header>

            <div className="tabs-container">
                <div className="tabs-header">
                    <button
                        className={`tab-button ${activeTab === 'total' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('total')
                            setSelectedArea(null)
                        }}
                    >
                        Total Schools
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'area-wise' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('area-wise')
                            setSelectedArea(null)
                        }}
                    >
                        Area Wise Schools
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'total' && renderTable()}

                    {activeTab === 'area-wise' && (
                        <>
                            {!selectedArea ? (
                                // Area Grid View
                                loading ? (
                                    <div className="loading-state">Loading areas...</div>
                                ) : (
                                    <div className="area-cards-grid">
                                        {Object.entries(groupedSchools).map(([area, schools]) => (
                                            <div
                                                key={area}
                                                className="area-card"
                                                onClick={() => setSelectedArea(area)}
                                            >
                                                <div className="area-name">{area || 'Unknown Area'}</div>
                                                <div className="area-count">{schools.length} Schools</div>
                                            </div>
                                        ))}
                                        {unassignedSchools.length > 0 && (
                                            <div
                                                className="area-card"
                                                onClick={() => setSelectedArea('Unassigned')}
                                            >
                                                <div className="area-name">Unassigned</div>
                                                <div className="area-count">{unassignedSchools.length} Schools</div>
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                // Drill-down Table View
                                <div>
                                    <div className="drill-down-header">
                                        <button
                                            className="back-btn"
                                            onClick={() => setSelectedArea(null)}
                                        >
                                            ← Back to Areas
                                        </button>
                                        <div className="drill-down-title">
                                            <h3>{selectedArea}</h3>
                                            <p className="drill-down-subtitle">
                                                {selectedArea === 'Unassigned'
                                                    ? unassignedSchools.length
                                                    : groupedSchools[selectedArea]?.length} Schools found
                                            </p>
                                        </div>
                                    </div>
                                    {renderTable()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
