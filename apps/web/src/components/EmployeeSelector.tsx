import { useState, useEffect } from 'react'
import { employeesApi } from '../services/api'
import './EmployeeSelector.css'

interface EmployeeSelectorProps {
    selectedId: string | null
    onSelect: (id: string | null) => void
}

export default function EmployeeSelector({ selectedId, onSelect }: EmployeeSelectorProps) {
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeesApi.list()
                setEmployees(data)
            } catch (err) {
                console.error('Failed to load employees:', err)
            } finally {
                setLoading(false)
            }
        }
        loadEmployees()
    }, [])

    if (loading) {
        return (
            <div className="employee-selector">
                <span className="selector-label">Loading employees...</span>
            </div>
        )
    }

    return (
        <div className="employee-selector">
            <span className="selector-label">View as:</span>
            <select
                className="employee-select"
                value={selectedId || ''}
                onChange={(e) => onSelect(e.target.value || null)}
            >
                {employees.map((emp) => (
                    <option key={emp.empID} value={emp.employeeID}>
                        {emp.empName}
                    </option>
                ))}
            </select>
        </div>
    )
}
