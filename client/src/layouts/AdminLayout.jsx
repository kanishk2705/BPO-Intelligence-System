// client/src/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom'; // Changed Link to NavLink
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Settings,
    Menu,
    X
} from 'lucide-react';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Payroll', href: '/admin/payroll', icon: CreditCard },
    ];

    // Helper to figure out the page title even on nested routes
    const getCurrentPageName = () => {
        // Sort by length descending so '/admin/employees' matches before '/admin'
        const sortedNav = [...navigation].sort((a, b) => b.href.length - a.href.length);
        const currentNav = sortedNav.find(n => location.pathname.startsWith(n.href));
        return currentNav ? currentNav.name : 'Admin Dashboard';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* RESPONSIVE SIDEBAR */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
                        <h1 className="text-xl font-bold text-blue-600">Admin Portal</h1>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation Links using NavLink's automatic isActive prop */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === '/admin'} // Ensure /admin doesn't stay highlighted when on /admin/employees
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                        {item.name}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                            {/* CRASH FIX: Safe fallback if email is missing */}
                            {(user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.email || 'Loading user...'}
                            </p>
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="mr-4 p-2 text-gray-500 rounded-md md:hidden hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-medium text-gray-800 truncate">
                            {/* Uses our new helper for nested routes */}
                            {getCurrentPageName()}
                        </h2>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 hidden sm:block">
                        <Settings className="h-5 w-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}