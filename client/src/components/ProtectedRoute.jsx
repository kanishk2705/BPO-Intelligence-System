import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-lg font-semibold text-gray-600 animate-pulse">Verifying Access...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If we require a role, but it hasn't loaded yet, show a loader instead of blanking out
    if (allowedRoles && !role) {
        return <div className="p-10 text-center">Fetching user role...</div>;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'lead') return <Navigate to="/lead" replace />;
        if (role === 'agent') return <Navigate to="/agent" replace />;
        return <Navigate to="/login" replace />; // Safe fallback if completely unknown
    }

    return <Outlet />;
}