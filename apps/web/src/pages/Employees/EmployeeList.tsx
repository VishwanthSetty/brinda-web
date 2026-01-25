import { useState, useEffect } from 'react'
import { employeesApi } from '../../services/api'
import '../Dashboard.css' // Reusing table styles

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeesApi.list()
                setEmployees(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadEmployees()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div className="error-message">{error}</div>

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>All Employees</h1>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Emp ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Designation ID</th>
                            <th>City</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.empID}>
                                <td>{emp.empID}</td>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar small">
                                            {emp.firstName?.[0] || emp.empName?.[0] || 'U'}
                                        </div>
                                        <span>{emp.empName}</span>
                                    </div>
                                </td>
                                <td>{emp.empEmail || '-'}</td>
                                <td>{emp.empPhoneNumber || '-'}</td>
                                <td>{emp.designationID || '-'}</td>
                                <td>{emp.city || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
