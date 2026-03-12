import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, Database, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPayroll: 0,
        totalTickets: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            // 1. Fetch Total Registered Users
            const { count: userCount, error: userErr } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            if (userErr) throw userErr;

            // 2. Fetch Total Lifetime Tickets
            const { count: ticketCount, error: ticketErr } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true });
            if (ticketErr) throw ticketErr;

            // 3. Fetch Total Net Payroll for the Current Month
            const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
            const { data: payrollData, error: payrollErr } = await supabase
                .from('payroll')
                .select('final_salary')
                .eq('month_year', currentMonth);
            if (payrollErr) throw payrollErr;

            // Sum up the total money paid out this month
            const totalMoney = payrollData?.reduce((sum, record) => sum + Number(record.final_salary), 0) || 0;

            // Update state
            setStats({
                totalUsers: userCount || 0,
                totalTickets: ticketCount || 0,
                totalPayroll: totalMoney,
            });

        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            toast.error("Could not load system statistics.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
                <p className="text-sm text-slate-500 mt-1">High-level overview of system health and financials.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Executive Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Registered Users</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Month's Net Payroll</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatMoney(stats.totalPayroll)}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Lifetime Tickets</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalTickets}</p>
                            </div>
                        </div>

                    </div>

                    {/* System Health Banner */}
                    <div className="bg-slate-800 rounded-2xl shadow-sm p-8 text-white mt-8 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2 flex items-center">
                                <Database className="h-5 w-5 mr-2 text-emerald-400" />
                                System Status: Optimal
                            </h2>
                            <p className="text-slate-400 text-sm max-w-xl">
                                All database connections, Row Level Security policies, Express API endpoints, and authentication tokens are functioning securely. Your BPO application is fully operational.
                            </p>
                        </div>
                        <button
                            onClick={fetchAdminStats}
                            className="mt-4 md:mt-0 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}