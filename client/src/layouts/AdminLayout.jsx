import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Settings
} from 'lucide-react';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation(); // Gets the current URL path

    // Define our sidebar links
    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Payroll', href: '/admin/payroll', icon: CreditCard },
    ];

    return (
        <div className="flex h-screen bg-gray-50">

            {/* ---------------- SIDEBAR ---------------- */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <img src="/logo.jpg" alt="Logo" className="h-16 w-auto mr-2" />

                    <span className="ml-2 text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">ADMIN</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout (Bottom of Sidebar) */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ---------------- MAIN CONTENT AREA ---------------- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-medium text-gray-800">
                        {/* Dynamically display the page title based on the URL */}
                        {navigation.find(n => n.href === location.pathname)?.name || 'Admin Portal'}
                    </h2>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <Settings className="h-5 w-5" />
                    </button>
                </header>

                {/* Dynamic Page Content (This is where Dashboard, Employees, etc. will inject) */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}