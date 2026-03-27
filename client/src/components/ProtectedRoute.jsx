// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react'; // Ensure visual consistency

export default function ProtectedRoute({ allowedRoles }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If we require a role, but it hasn't loaded yet, show the unified loader
    if (allowedRoles && !role) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // The Bounce Logic - This is great!
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'lead') return <Navigate to="/lead" replace />;
        if (role === 'agent') return <Navigate to="/agent" replace />;
        return <Navigate to="/login" replace />; 
    }

    return <Outlet />;
}