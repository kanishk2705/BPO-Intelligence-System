const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Create a New Ticket
// ---------------------------------------------------
exports.createTicket = async (req, res) => {
    const { client_name, issue_description } = req.body;

    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                client_name,
                issue_description,
                agent_id: req.profile.id, // Automatically assign to the logged-in agent
                status: 'open'
            }])
            .select(); // Ask Supabase to return the newly created row

        if (error) throw error;

        res.status(201).json({ message: 'Ticket created successfully', ticket: data[0] });
    } catch (err) {
        console.error("Create Ticket Error:", err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

// ---------------------------------------------------
// 2. Get Tickets (Role-Based Visibility)
// ---------------------------------------------------
exports.getTickets = async (req, res) => {
    try {
        // Start building the query (We also fetch the agent's name using a join)
        let query = supabase
            .from('tickets')
            .select('*, profiles(full_name, email)');

        // If the user is an Agent, they should ONLY see their own tickets.
        if (req.profile.role === 'agent') {
            query = query.eq('agent_id', req.profile.id);
        }
        // If Admin or Lead, the query runs without the filter, returning everything.

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Get Tickets Error:", err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// ---------------------------------------------------
// 3. Update Ticket Status
// ---------------------------------------------------
exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params; // The ticket ID from the URL
    const { status } = req.body; // 'in_progress', 'resolved', 'escalated'

    try {
        const updates = { status };

        // If they mark it as resolved, automatically stamp the exact time
        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.status(200).json({ message: `Ticket marked as ${status}`, ticket: data[0] });
    } catch (err) {
        console.error("Update Ticket Error:", err);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};