import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    AlertTriangle,
    LogOut
} from 'lucide-react';

export default function LeadLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Team Overview', href: '/lead', icon: LayoutDashboard },
        { name: 'My Agents', href: '/lead/team', icon: Users },
        { name: 'Escalations', href: '/lead/escalations', icon: AlertTriangle },
    ];

    return (
        <div className="flex h-screen bg-indigo-50/30">

            {/* ---------------- LEAD SIDEBAR ---------------- */}
            <div className="w-64 bg-white border-r border-indigo-100 flex flex-col shadow-sm z-10">
                <div className="h-16 flex items-center px-6 border-b border-indigo-50">
                    <img src="/logo.jpg" alt="Logo" className="h-8 w-auto mr-2" />
                    <span className="ml-2 text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">LEAD</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-50 bg-indigo-50/50">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-500 truncate">Team Supervisor</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ---------------- MAIN CONTENT AREA ---------------- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-indigo-100 flex items-center justify-between px-8 z-0">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Lead Workspace'}
                    </h2>
                    <div className="flex items-center space-x-2 bg-white border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm text-sm font-medium text-slate-600">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span>Monitoring Floor</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}