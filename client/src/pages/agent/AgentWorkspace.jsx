// client/src/pages/agent/AgentWorkspace.jsx
import { useState } from 'react';
import { PhoneCall, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient'; 

export default function AgentWorkspace() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [callData, setCallData] = useState({
        customerName: '',
        phoneNumber: '',
        category: 'General Inquiry',
        status: 'resolved', 
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Authentication error. Please log in again.");

            const formattedPayload = {
                client_name: callData.customerName,
                status: callData.status,
                issue_description: `[Phone: ${callData.phoneNumber}] | [Category: ${callData.category}]\nNotes: ${callData.notes}`
            };

            const response = await fetch('https://bpo-backend-vemc.onrender.com/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formattedPayload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save ticket');
            }

            toast.success('Call logged successfully into database!');

            // Clear the form for the next call
            setCallData({
                customerName: '',
                phoneNumber: '',
                category: 'General Inquiry',
                status: 'resolved',
                notes: ''
            });

        } catch (error) {
            console.error('API Error:', error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* --- LEFT COLUMN: Call Entry Form --- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <PhoneCall className="h-5 w-5 mr-2 text-blue-600" />
                            Active Call Log
                        </h2>
                        <span className="animate-pulse flex h-3 w-3 rounded-full bg-red-500"></span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                                <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={callData.customerName} onChange={(e) => setCallData({ ...callData, customerName: e.target.value })} placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input type="tel" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={callData.phoneNumber} onChange={(e) => setCallData({ ...callData, phoneNumber: e.target.value })} placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Category</label>
                                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={callData.category} onChange={(e) => setCallData({ ...callData, category: e.target.value })}>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Billing & Payments">Billing & Payments</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Customer Complaint">Customer Complaint</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Call Status</label>
                                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={callData.status} onChange={(e) => setCallData({ ...callData, status: e.target.value })}>
                                    <option value="resolved">Resolved (Closed)</option>
                                    <option value="in_progress">In Progress (Follow-up)</option>
                                    <option value="open">Open (Needs Action)</option>
                                    <option value="escalated">Escalated to Lead</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Interaction Notes</label>
                            <textarea required rows="4" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                value={callData.notes} onChange={(e) => setCallData({ ...callData, notes: e.target.value })} placeholder="Summarize the customer's issue and steps taken..." />
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70">
                                <Save className="h-5 w-5 mr-2" />
                                {isSubmitting ? 'Saving to Database...' : 'Log Call & Close'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- RIGHT COLUMN: Agent Stats --- */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Shift Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex items-center text-emerald-700">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span className="font-medium">Resolved</span>
                                </div>
                                <span className="text-xl font-bold text-emerald-700">12</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="flex items-center text-amber-700">
                                    <Clock className="h-5 w-5 mr-2" />
                                    <span className="font-medium">Avg Handle Time</span>
                                </div>
                                <span className="text-xl font-bold text-amber-700">4m 12s</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center text-red-700">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    <span className="font-medium">Escalated</span>
                                </div>
                                <span className="text-xl font-bold text-red-700">1</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}