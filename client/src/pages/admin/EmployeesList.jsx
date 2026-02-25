import { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Shield, Briefcase, Mail, Loader2, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // NEW: Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '', password: '', full_name: '', role: 'agent', hourly_rate: 15.00
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('role', { ascending: true });

            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load the employee roster.");
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Handle creating the new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('https://bpo-backend-vemc.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create user');
            }

            toast.success(`${formData.full_name} added successfully!`);
            setIsModalOpen(false);
            setFormData({ email: '', password: '', full_name: '', role: 'agent', hourly_rate: 15.00 });
            fetchEmployees(); // Refresh the table

        } catch (error) {
            console.error('Creation Error:', error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredEmployees = employees.filter((emp) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            emp.full_name?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower) ||
            emp.role?.toLowerCase().includes(searchLower)
        );
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-fit"><Shield className="h-3 w-3 mr-1.5" /> Admin</span>;
            case 'lead': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-fit"><Briefcase className="h-3 w-3 mr-1.5" /> Lead</span>;
            default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-fit"><Users className="h-3 w-3 mr-1.5" /> Agent</span>;
        }
    };

    return (
        <div className="space-y-6 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Company Directory</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all registered users across the BPO floor.</p>
                </div>

                <div className="flex space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* OPEN MODAL BUTTON */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 font-medium">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p>No employees match your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">System Role</th>
                                    <th className="px-6 py-4">Account ID</th>
                                    <th className="px-6 py-4">Hourly Rate</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
                                                    {emp.full_name ? emp.full_name.charAt(0).toUpperCase() : emp.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{emp.full_name || 'Pending Setup'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                                        <Mail className="h-3 w-3 mr-1" /> {emp.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRoleBadge(emp.role)}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{emp.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium text-slate-700">${emp.hourly_rate || '15.00'} / hr</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- ADD EMPLOYEE MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">

                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Register New Employee</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm border border-slate-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                    value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
                                <input required type="password" minLength={6} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                                    <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                        value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="agent">Floor Agent</option>
                                        <option value="lead">Team Lead</option>
                                        <option value="admin">System Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hourly Rate ($)</label>
                                    <input required type="number" step="0.50" min="0" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                        value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })} />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}