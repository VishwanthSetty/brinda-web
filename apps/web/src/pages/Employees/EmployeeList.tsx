import { useState, useEffect } from 'react'
import { employeesApi, authApi } from '../../services/api'
import '../Dashboard.css' // Reusing table styles
import { Modal, Button, TextInput, PasswordInput, Stack, ActionIcon, Tooltip } from '@mantine/core'
import { Key } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

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

    const { user } = useAuth()
    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedEmp, setSelectedEmp] = useState<any>(null)
    const [editForm, setEditForm] = useState({ email: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editError, setEditError] = useState('')
    const [editSuccess, setEditSuccess] = useState('')

    const handleEditClick = (emp: any) => {
        setSelectedEmp(emp)
        setEditForm({ email: emp.empEmail || '', password: '' })
        setEditError('')
        setEditSuccess('')
        setEditModalOpen(true)
    }

    const handleEditSubmit = async () => {
        setEditError('')
        setEditSuccess('')
        setIsSubmitting(true)

        try {
            await authApi.adminUpdateUser({
                emp_id: selectedEmp.empID,
                email: editForm.email || undefined,
                password: editForm.password || undefined
            })
            setEditSuccess("Credentials updated successfully!")
            // Optionally refresh list if email changed, but list loads from Unolo mostly so might not reflect immediately unless sync happens.
            // But we can update local state if needed.
            setTimeout(() => {
                setEditModalOpen(false)
            }, 1500)
        } catch (err: any) {
            setEditError(err.response?.data?.detail || "Failed to update credentials")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div className="error-message">{error}</div>

    return (
        <div className="dashboard-page">
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={`Edit Credentials - ${selectedEmp?.empName}`}
                centered
            >
                <Stack>
                    <TextInput
                        label="Email"
                        placeholder="Employee Email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <PasswordInput
                        label="New Password"
                        placeholder="Leave blank to keep current"
                        value={editForm.password}
                        onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                    {editError && <div style={{ color: 'red', fontSize: '0.9rem' }}>{editError}</div>}
                    {editSuccess && <div style={{ color: 'green', fontSize: '0.9rem' }}>{editSuccess}</div>}
                    <Button
                        fullWidth
                        onClick={handleEditSubmit}
                        loading={isSubmitting}
                        mt="md"
                    >
                        Update Credentials
                    </Button>
                </Stack>
            </Modal>

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
                            {isAdminOrManager && <th>Actions</th>}
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
                                {isAdminOrManager && (
                                    <td>
                                        <Tooltip label="Edit Credentials">
                                            <ActionIcon variant="light" color="blue" onClick={() => handleEditClick(emp)}>
                                                <Key size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
