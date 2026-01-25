import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
} from '@tanstack/react-table'
import { analyticsApi } from '../../services/api'
import './Distributor.css'

interface DistributorContext {
    selectedEmployee: string | null
}

export default function Distributor() {
    const { selectedEmployee } = useOutletContext<DistributorContext>()
    const [distributors, setDistributors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadDistributors()
    }, [selectedEmployee])

    const loadDistributors = async () => {
        setLoading(true)
        try {
            const response = await analyticsApi.getEmployeeClients('Distributor', selectedEmployee || undefined)
            setDistributors(response.data)
        } catch (error) {
            console.error('Failed to load distributors:', error)
        } finally {
            setLoading(false)
        }
    }

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

    const table = useReactTable({
        data: distributors,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="distributor-page">
            <header className="page-header">
                <h2>Total Distributors: {distributors.length}</h2>
            </header>

            <div className="distributor-content">
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
                                ) : distributors.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                            No distributors found
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
                    {distributors.length > 0 && (
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
            </div>
        </div>
    )
}
