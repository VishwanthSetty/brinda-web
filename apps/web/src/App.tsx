import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Home from './pages/Home/Home'
// New Public Pages
import About from './pages/public/About'
import Books from './pages/public/Books'
import Papers from './pages/public/Papers'
import Digital from './pages/public/Digital'
import SchoolsPublic from './pages/public/SchoolsPublic'
import Contact from './pages/public/Contact'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsOfService from './pages/public/TermsOfService'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import ClientStatistics from './pages/ClientStatistics'
import ClientMigration from './pages/ClientMigration'
import SchoolsDashboard from './pages/Clients/Schools'
import Distributor from './pages/Clients/Distributor'
import TaskAnalytics from './pages/Tasks/TaskAnalytics'
import EmployeeStatistics from './pages/Employees/EmployeeStatistics'
import EmployeeList from './pages/Employees/EmployeeList'
import EmployeeRoutes from './pages/Employees/EmployeeRoutes'
import EmployeeClients from './pages/Employees/EmployeeClients'
import EmployeeTasks from './pages/Employees/EmployeeTasks'

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/books" element={<Books />} />
                <Route path="/papers" element={<Papers />} />
                <Route path="/digital" element={<Digital />} />
                <Route path="/schools" element={<SchoolsPublic />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
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
                <Route path="/dashboard/client-statistics" element={<ClientStatistics />} />
                <Route path="/dashboard/client-migration" element={<ClientMigration />} />
                <Route path="/dashboard/clients/schools" element={<SchoolsDashboard />} />
                <Route path="/dashboard/clients/distributor" element={<Distributor />} />
                <Route path="/dashboard/tasks" element={<TaskAnalytics />} />

                {/* Employee Routes */}
                <Route path="/dashboard/employee-statistics" element={<EmployeeStatistics />} />
                <Route path="/dashboard/employees" element={<EmployeeList />} />
                <Route path="/dashboard/employee-routes" element={<EmployeeRoutes />} />
                <Route path="/dashboard/employee-clients" element={<EmployeeClients />} />
                <Route path="/dashboard/employee-tasks" element={<EmployeeTasks />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App
