import { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Activity, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function LeadOverview() {
    const [stats, setStats] = useState({
        totalAgents: 0,
        escalatedTickets: 0,
        resolvedTickets: 0,
        openTickets: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // 1. Get the total number of Agents
            const { count: agentCount, error: agentErr } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'agent');
            if (agentErr) throw agentErr;

            // 2. Get the number of Escalated Tickets
            const { count: escalatedCount, error: escErr } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'escalated');
            if (escErr) throw escErr;

            // 3. Get the number of Resolved Tickets
            const { count: resolvedCount, error: resErr } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'resolved');
            if (resErr) throw resErr;

            // 4. Get the number of standard Open Tickets
            const { count: openCount, error: openErr } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'open');
            if (openErr) throw openErr;

            // Update the state with our live database counts!
            setStats({
                totalAgents: agentCount || 0,
                escalatedTickets: escalatedCount || 0,
                resolvedTickets: resolvedCount || 0,
                openTickets: openCount || 0
            });

        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            toast.error("Could not load live floor statistics.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Team Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Live metrics and performance for your BPO floor.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Metric 1: Agents */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 flex items-center space-x-4 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Active Agents</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalAgents}</p>
                            </div>
                        </div>

                        {/* Metric 2: Open Tickets */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 flex items-center space-x-4 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Open Tickets</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.openTickets}</p>
                            </div>
                        </div>

                        {/* Metric 3: Escalated Tickets */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 flex items-center space-x-4 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Escalated</p>
                                <p className="text-2xl font-bold text-red-600">{stats.escalatedTickets}</p>
                            </div>
                        </div>

                        {/* Metric 4: Resolved Tickets */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 flex items-center space-x-4 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Resolved</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.resolvedTickets}</p>
                            </div>
                        </div>

                    </div>

                    {/* Quick Actions / Info Banner */}
                    <div className="bg-indigo-600 rounded-2xl shadow-sm p-8 text-white mt-8 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Floor Status: Monitoring</h2>
                            <p className="text-indigo-200 text-sm max-w-lg">
                                Your team is currently handling live calls. Keep an eye on the Escalated tab to unblock agents and ensure smooth customer resolution.
                            </p>
                        </div>
                        <button
                            onClick={fetchDashboardStats}
                            className="mt-4 md:mt-0 px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors"
                        >
                            Refresh Floor Data
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}