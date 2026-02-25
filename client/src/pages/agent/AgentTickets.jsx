import { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Loader2, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function AgentTickets() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // NEW: State for the Ghost Button Modal
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) return;

            const response = await fetch(`https://bpo-backend-vemc.onrender.com/api/tickets?agent_id=${session.user.id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch tickets');

            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load your ticket history.");
        } finally {
            setIsLoading(false);
        }
    };

    const extractCategory = (description) => {
        const match = description?.match(/\[Category:\s*(.*?)\]/);
        return match ? match[1] : 'General';
    };

    // NEW: Helper to extract the actual notes from the DB string
    const extractNotes = (description) => {
        if (!description) return 'No notes provided.';
        const parts = description.split('\nNotes: ');
        return parts.length > 1 ? parts[1] : description;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredTickets = tickets.filter((tkt) => {
        const searchLower = searchTerm.toLowerCase();
        const customerMatch = tkt.client_name?.toLowerCase().includes(searchLower);
        const categoryMatch = extractCategory(tkt.issue_description).toLowerCase().includes(searchLower);
        const statusMatch = tkt.status.toLowerCase().includes(searchLower);
        return customerMatch || categoryMatch || statusMatch;
    });

    // NEW: Function to open the modal
    const openTicketModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage your recent customer interactions.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or status..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">
                        {searchTerm ? 'No tickets match your search.' : "You haven't logged any calls yet today."}
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Logged At</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTickets.map((tkt) => (
                                <tr key={tkt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{tkt.client_name}</td>
                                    <td className="px-6 py-4">{extractCategory(tkt.issue_description)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                            tkt.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                tkt.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {tkt.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(tkt.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {/* NEW: Click handler added to the Eye button */}
                                        <button
                                            onClick={() => openTicketModal(tkt)}
                                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
                                        >
                                            <Eye className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- NEW: Ticket Detail Modal Overlay --- */}
            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-emerald-100">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Ticket Details</h2>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedTicket.id}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm border border-slate-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 mb-1">Customer Name</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedTicket.client_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-500 mb-1">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                            selectedTicket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {selectedTicket.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">Category</p>
                                    <p className="text-sm font-medium text-slate-800">{extractCategory(selectedTicket.issue_description)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center"><Clock className="h-3 w-3 mr-1" /> Logged At</p>
                                    <p className="text-sm font-medium text-slate-800">{formatDate(selectedTicket.created_at)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-2 flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1.5 text-emerald-500" />
                                    Agent Notes
                                </p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                                    {extractNotes(selectedTicket.issue_description)}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Close Window
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}