import { useState, useEffect } from 'react';
import { CalendarPlus, X, UserCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient'; // Import Supabase

export default function LeadAgents() {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shiftData, setShiftData] = useState({
        date: '',
        shiftType: 'Morning (9AM - 5PM)'
    });

    // Fetch the roster when the page loads
    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            // Fetch all users with the 'agent' role directly from your public profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'agent');

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error("Error fetching agents:", error);
            toast.error("Could not load team roster.");
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (agent) => {
        setSelectedAgent(agent);
        setIsModalOpen(true);
    };

    const handleAssignShift = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Get the Lead's secure token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Authentication error. Please log in again.");

            // 2. Send the exact payload our new Express route expects
            const response = await fetch('http://localhost:5000/api/shifts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    user_id: selectedAgent.id,
                    date: shiftData.date,
                    shift_string: shiftData.shiftType
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to assign shift');
            }

            toast.success(`Shift assigned to ${selectedAgent.full_name || 'Agent'} for ${shiftData.date}!`);

            // Close and reset the modal
            setIsModalOpen(false);
            setShiftData({ date: '', shiftType: 'Morning (9AM - 5PM)' });

        } catch (error) {
            console.error('Shift Assignment Error:', error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Agents</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your team's roster and weekly schedules.</p>
            </div>

            {/* Agents Roster Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">
                        No agents found in the system.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/50 text-slate-700 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Agent Profile</th>
                                <th className="px-6 py-4 text-right">Schedule Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <UserCircle className="h-8 w-8 text-indigo-300 mr-3" />
                                            <div>
                                                <p className="font-bold text-slate-800">{agent.full_name || 'Unnamed Agent'}</p>
                                                <p className="text-xs text-slate-500">{agent.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openModal(agent)}
                                            className="flex items-center justify-end w-full px-3 py-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-medium text-sm rounded-lg transition-colors"
                                        >
                                            <CalendarPlus className="h-4 w-4 mr-2" />
                                            Assign Shift
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Shift Assignment Modal Overlay --- */}
            {isModalOpen && selectedAgent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-indigo-100">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-indigo-50 bg-indigo-50/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Assign Schedule</h2>
                                <p className="text-xs text-slate-500">For {selectedAgent.full_name || selectedAgent.email}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAssignShift} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                                    value={shiftData.date}
                                    onChange={(e) => setShiftData({ ...shiftData, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Shift Slot</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                                    value={shiftData.shiftType}
                                    onChange={(e) => setShiftData({ ...shiftData, shiftType: e.target.value })}
                                >
                                    <option value="Morning (9AM - 5PM)">Morning (9AM - 5PM)</option>
                                    <option value="Evening (1PM - 9PM)">Evening (1PM - 9PM)</option>
                                    <option value="Night (9PM - 5AM)">Night Shift (9PM - 5AM)</option>
                                    <option value="Off Duty">Rest Day / Off Duty</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors">
                                    {isSubmitting ? 'Saving...' : 'Confirm Shift'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}