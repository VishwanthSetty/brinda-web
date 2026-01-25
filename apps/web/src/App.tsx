import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientMigration from './pages/ClientMigration'
import ClientStatistics from './pages/ClientStatistics'
import EmployeeStatistics from './pages/Employees/EmployeeStatistics'
import EmployeeList from './pages/Employees/EmployeeList'
import EmployeeRoutes from './pages/Employees/EmployeeRoutes'
import EmployeeClients from './pages/Employees/EmployeeClients'
import EmployeeTasks from './pages/Employees/EmployeeTasks'
import Schools from './pages/Clients/Schools'
import Distributor from './pages/Clients/Distributor'
import TaskAnalytics from './pages/Tasks/TaskAnalytics'
import NotFound from './pages/NotFound'

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/analytics" element={<Dashboard />} />
                <Route path="/dashboard/client-statistics" element={<ClientStatistics />} />
                <Route path="/dashboard/client-migration" element={<ClientMigration />} />
                <Route path="/dashboard/clients/schools" element={<Schools />} />
                <Route path="/dashboard/clients/distributor" element={<Distributor />} />
                <Route path="/dashboard/tasks" element={<TaskAnalytics />} />

                {/* Employee Routes */}
                <Route path="/dashboard/employee-tasks" element={<EmployeeTasks />} />
                <Route path="/dashboard/employee-statistics" element={<EmployeeStatistics />} />
                <Route path="/dashboard/employees" element={<EmployeeList />} />
                <Route path="/dashboard/employee-routes" element={<EmployeeRoutes />} />
                <Route path="/dashboard/employee-clients" element={<EmployeeClients />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App
