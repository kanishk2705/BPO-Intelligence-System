const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// --- HELPER: Create a User-Scoped Supabase Client ---
// This takes the token from the React frontend and passes it to Supabase.
// This is CRITICAL for your RLS policies to work correctly!
const getSupabaseUserClient = (req) => {
    const authHeader = req.headers.authorization;
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: authHeader // Pass the user's JWT token
            }
        }
    });
};

// ==========================================
// 1. CREATE A NEW TICKET (Agent Workspace)
// ==========================================
router.post('/', authMiddleware, authorizeRoles('agent'), async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);

        // Securely get the logged-in user's ID from their token
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized access' });

        // Map the frontend form data to your exact SQL column names
        const { client_name, issue_description, status } = req.body;

        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                client_name,
                issue_description,
                status: status || 'open', // Defaults to 'open' if not provided
                agent_id: user.id         // Automatically assign to the logged-in agent
            }])
            .select(); // Return the newly created ticket

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        console.error('❌ Ticket Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. FETCH TICKETS (Agent History & Lead Escalations)
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);

        // We can use query parameters to filter data dynamically
        const { status, agent_id } = req.query;

        // Start a query. We also join the 'profiles' table to get the agent's full name!
        let query = supabase
            .from('tickets')
            .select(`
                *,
                profiles:agent_id (full_name, email)
            `)
            .order('created_at', { ascending: false });

        // If the Lead Dashboard asks for "?status=escalated"
        if (status) {
            query = query.eq('status', status);
        }

        // If the Agent Dashboard asks for "?agent_id=123"
        if (agent_id) {
            query = query.eq('agent_id', agent_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json(data);

    } catch (error) {
        console.error('❌ Fetch Tickets Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. UPDATE A TICKET (Lead Resolving Escalations)
// ==========================================
router.put('/:id', authMiddleware, authorizeRoles('lead', 'admin'), async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);
        const { id } = req.params;
        const { status } = req.body;

        const updatePayload = { status };

        // If the Lead marks it as resolved, automatically timestamp your 'resolved_at' column
        if (status === 'resolved') {
            updatePayload.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('tickets')
            .update(updatePayload)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);

    } catch (error) {
        console.error('❌ Update Ticket Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;