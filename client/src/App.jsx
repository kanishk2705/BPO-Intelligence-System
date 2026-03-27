// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast'; // IMPORT GLOBALLY

// Auth Imports
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './layouts/AdminLayout';
import EmployeesList from './pages/admin/EmployeesList';
import AdminPayroll from './pages/admin/AdminPayroll';

// Lead Imports
import LeadLayout from './layouts/LeadLayout';
import LeadDashboard from './pages/lead/LeadDashboard';
import LeadAgents from './pages/lead/LeadAgents';
import LeadEscalations from './pages/lead/LeadEscalations';

// Agent Imports
import AgentLayout from './layouts/AgentLayout';
import AgentWorkspace from './pages/agent/AgentWorkspace';
import AgentTickets from './pages/agent/AgentTickets';
import AgentSchedule from './pages/agent/AgentSchedule';
import AgentPayslips from './pages/agent/AgentPayslips';

function App() {
    return (
        <AuthProvider>
            {/* Global Toaster ensures notifications persist across page changes */}
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }} 
            />
            
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/employees" element={<EmployeesList />} />
                            <Route path="/admin/payroll" element={<AdminPayroll />} />
                        </Route>
                    </Route>

                    {/* Protected Team Lead Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['lead']} />}>
                        <Route element={<LeadLayout />}>
                            <Route path="/lead" element={<LeadDashboard />} />
                            <Route path="/lead/team" element={<LeadAgents />} />
                            <Route path="/lead/escalations" element={<LeadEscalations />} />
                        </Route>
                    </Route>

                    {/* Protected Agent Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
                        <Route element={<AgentLayout />}>
                            <Route path="/agent" element={<AgentWorkspace />} />
                            <Route path="/agent/tickets" element={<AgentTickets />} />
                            <Route path="/agent/schedule" element={<AgentSchedule />} />
                            <Route path="/agent/payslips" element={<AgentPayslips />} />
                        </Route>
                    </Route>

                    {/* Fallback Route */}
                    {/* If a user goes to a random URL, send them to login. ProtectedRoute will bounce them to their correct dashboard if they are already logged in! */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;