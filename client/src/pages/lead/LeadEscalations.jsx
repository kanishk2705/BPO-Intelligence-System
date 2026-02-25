import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function LeadEscalations() {
    const [escalations, setEscalations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);

    useEffect(() => {
        fetchEscalations();
    }, []);

    const fetchEscalations = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) return;

            // Fetch ONLY tickets where status is 'escalated'
            const response = await fetch('https://bpo-backend-vemc.onrender.com/api/tickets?status=escalated', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch escalations');

            const data = await response.json();
            setEscalations(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load escalated tickets.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (id) => {
        setResolvingId(id);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Send a PUT request to update the status to 'resolved'
            const response = await fetch(`https://bpo-backend-vemc.onrender.com/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: 'resolved' })
            });

            if (!response.ok) throw new Error('Failed to resolve ticket');

            // Remove the ticket from the UI instantly
            setEscalations(escalations.filter(ticket => ticket.id !== id));
            toast.success(`Ticket resolved successfully!`);

        } catch (error) {
            console.error("Resolve Error:", error);
            toast.error("Failed to resolve the ticket.");
        } finally {
            setResolvingId(null);
        }
    };

    // --- HELPER FUNCTIONS ---

    // Extracts just the Notes section from our combined issue_description string
    const extractNotes = (description) => {
        if (!description) return 'No notes provided.';
        const parts = description.split('\nNotes: ');
        return parts.length > 1 ? parts[1] : description;
    };

    // Formats the PostgreSQL timestamp into a readable time
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Escalated Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">Review and resolve complex issues escalated by your floor agents.</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center shadow-sm ${escalations.length > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                    {escalations.length > 0 ? (
                        <><AlertTriangle className="h-4 w-4 mr-2" /> {escalations.length} Action(s) Needed</>
                    ) : (
                        <><CheckCircle className="h-4 w-4 mr-2" /> All Clear</>
                    )}
                </div>
            </div>

            {/* Ticket Feed */}
            <div className="grid gap-5">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12 bg-white rounded-2xl border border-indigo-50">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : escalations.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-indigo-50 text-center shadow-sm">
                        <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-800">Inbox Zero!</h3>
                        <p className="text-slate-500 mt-2">There are no escalated tickets requiring your attention. Great job team!</p>
                    </div>
                ) : (
                    escalations.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">

                                {/* Ticket Meta */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg text-sm tracking-wide">
                                            {/* Show the first 8 characters of the UUID for a clean Ticket ID */}
                                            TKT-{ticket.id.substring(0, 8).toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium text-slate-500 flex items-center">
                                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                            {formatTime(ticket.created_at)}
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
                                        Requires Action
                                    </span>
                                </div>

                                {/* Ticket Details */}
                                <div className="mb-5">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Customer: {ticket.client_name}</h3>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 flex items-start">
                                        <MessageSquare className="h-5 w-5 text-indigo-400 mr-3 shrink-0 mt-0.5" />
                                        <p>
                                            <strong>Agent Note ({ticket.profiles?.full_name || 'Unknown Agent'}):</strong>
                                            <br />
                                            {extractNotes(ticket.issue_description)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                    <button className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                                        View Full History
                                    </button>
                                    <button
                                        onClick={() => handleResolve(ticket.id)}
                                        disabled={resolvingId === ticket.id}
                                        className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 rounded-xl shadow-sm transition-colors flex items-center"
                                    >
                                        {resolvingId === ticket.id ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resolving...</>
                                        ) : (
                                            <><CheckCircle className="h-4 w-4 mr-2" /> Mark Resolved</>
                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}