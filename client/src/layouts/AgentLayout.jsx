import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Headphones,
    Ticket,
    Calendar,
    LogOut,
    Wallet
} from 'lucide-react';

export default function AgentLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    // Notice how the agent gets completely different tools than the admin!
    const navigation = [
        { name: 'Workspace', href: '/agent', icon: Headphones },
        { name: 'My Tickets', href: '/agent/tickets', icon: Ticket },
        { name: 'My Schedule', href: '/agent/schedule', icon: Calendar },
        { name: 'Payslips', href: '/agent/payslips', icon: Wallet },
    ];

    return (
        <div className="flex h-screen bg-slate-50">

            {/* ---------------- AGENT SIDEBAR ---------------- */}
            <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white">BPO Portal</h1>
                    <span className="ml-2 text-xs font-semibold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">AGENT</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ---------------- MAIN CONTENT AREA ---------------- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Agent Workspace'}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <span className="relative flex h-2.5 w-2.5 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        Status: Available for Calls
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}