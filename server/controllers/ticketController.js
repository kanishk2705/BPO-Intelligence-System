// server/controllers/ticketController.js
const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Create a New Ticket
// ---------------------------------------------------
exports.createTicket = async (req, res) => {
    const { client_name, issue_description, status } = req.body;

    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                client_name,
                issue_description,
                agent_id: req.profile.id, // Locks the ticket to the logged-in agent
                status: status || 'open'
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Ticket created successfully', ticket: data[0] });
    } catch (err) {
        console.error("Create Ticket Error:", err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

// ---------------------------------------------------
// 2. Get Tickets (Role-Based Visibility + Pagination)
// ---------------------------------------------------

exports.getTickets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        // 🛡️ THE FIX: Use '!inner' to force Supabase to strictly join the tables 
        // so we can filter tickets based on the profile of the agent who made them!
        let query = supabase
            .from('tickets')
            .select('*, profiles!inner(full_name, email, lead_id)', { count: 'exact' });

        if (req.profile.role === 'agent') {
            // Agents only see their own tickets
            query = query.eq('agent_id', req.profile.id);
            
        } else if (req.profile.role === 'lead') {
            // Leads ONLY see tickets where the ticket's agent belongs to their team
            query = query.eq('profiles.lead_id', req.profile.id);
        }
        // Admins pass through without filters and see everything!

        const { data, count, error } = await query
            .range(start, end)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ data, meta: { totalCount: count, currentPage: page }});
    } catch (err) {
        console.error("Get Tickets Error:", err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
// ---------------------------------------------------
// 3. Update Ticket Status (Secured & Time-Fixed)
// ---------------------------------------------------
exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params; 
    const { status } = req.body; 

    try {
        // SECURITY: If the user is an agent, ensure they own this ticket first!
        if (req.profile.role !== 'admin' && req.profile.role !== 'lead') {
            const { data: checkTicket } = await supabase
                .from('tickets')
                .select('agent_id')
                .eq('id', id)
                .single();
            
            if (!checkTicket || checkTicket.agent_id !== req.profile.id) {
                return res.status(403).json({ error: 'Forbidden: You can only update your own tickets' });
            }
        }

        const updates = { status };

        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString();
        } else if (status === 'in_progress' || status === 'open') {
            updates.resolved_at = null; 
        }

        const { data, error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Ticket not found' });

        res.status(200).json({ message: `Ticket marked as ${status}`, ticket: data[0] });
    } catch (err) {
        console.error("Update Ticket Error:", err);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};