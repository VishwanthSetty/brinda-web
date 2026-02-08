import { useState, useEffect } from 'react'
import { employeesApi } from '../services/api'
import './EmployeeSelector.css'
import { ChevronDown, Search, Check } from 'lucide-react'

interface EmployeeSelectorProps {
    selectedId: string | null
    onSelect: (id: string | null) => void
}

export default function EmployeeSelector({ selectedId, onSelect }: EmployeeSelectorProps) {
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeesApi.list()
                setEmployees(data)
                // Auto-select first employee if none selected and NO prop passed
                // But if prop is passed (even if null specifically meant "no selection"), we might want to respect it?
                // Actually, if selectedId is null, we can default.
                if (!selectedId && data.length > 0) {
                    // Start with first one
                    // onSelect(data[0].employeeID) 
                    // Wait, if parent controls it, we should maybe just let parent decide?
                    // But if parent passes null, we might want to auto pick.
                    onSelect(String(data[0].employeeID))
                }
            } catch (err) {
                console.error('Failed to load employees:', err)
            } finally {
                setLoading(false)
            }
        }
        loadEmployees()
    }, [])

    const selectedEmployee = employees.find(e => String(e.employeeID) === String(selectedId))

    const filteredEmployees = employees.filter(emp =>
        emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.employee-selector')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
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
            <button
                className={`selector-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedEmployee ? (
                    <>
                        <div className="selected-avatar">
                            {selectedEmployee.empName.charAt(0)}
                        </div>
                        <div className="selected-info">
                            <span className="selected-name">{selectedEmployee.empName}</span>
                            <span className="selected-role">{selectedEmployee.role || 'Sales Rep'}</span>
                        </div>
                    </>
                ) : (
                    <span className="placeholder-text">Select Employee</span>
                )}
                <ChevronDown size={16} className={`arrow-icon ${isOpen ? 'expanded' : ''}`} />
            </button>

            {isOpen && (
                <div className="selector-dropdown">
                    <div className="dropdown-search">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="dropdown-list">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.employeeID}
                                className={`employee-option ${String(selectedId) === String(emp.employeeID) ? 'selected' : ''}`}
                                onClick={() => {
                                    onSelect(emp.employeeID)
                                    setIsOpen(false)
                                }}
                            >
                                <div className="option-avatar">
                                    {emp.empName.charAt(0)}
                                </div>
                                <div className="option-info">
                                    <div className="option-name">{emp.empName}</div>
                                    <div className="option-role">{emp.role || 'Sales Rep'}</div>
                                </div>
                                {String(selectedId) === String(emp.employeeID) && <Check size={16} className="check-icon" />}
                            </div>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <div className="no-results">No employees found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
