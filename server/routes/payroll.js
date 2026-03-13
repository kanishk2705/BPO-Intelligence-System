const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// --- HELPER: Create a User-Scoped Supabase Client ---
const getSupabaseUserClient = (req) => {
    const authHeader = req.headers.authorization;
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: authHeader
            }
        }
    });
};

// ==========================================
// 1. GENERATE PAYROLL (Admin Action)
// ==========================================
router.post('/generate', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);
        const { month_year } = req.body; // Expected format: 'YYYY-MM-01'

        // 2. Fetch all agents and their hourly rates
        const { data: agents, error: agentsError } = await supabase
            .from('profiles')
            .select('id, hourly_rate')
            .eq('role', 'agent');

        if (agentsError) throw agentsError;

        // 3. Define the start and end of the requested month
        const startDate = new Date(month_year);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];

        // 4. Fetch all shifts for that month
        const { data: shifts, error: shiftsError } = await supabase
            .from('shifts')
            .select('*')
            .gte('shift_date', startDateString)
            .lte('shift_date', endDateString);

        if (shiftsError) throw shiftsError;

        // 5. The Financial Math Algorithm
        const payrollInserts = agents.map(agent => {
            // Find shifts for this specific agent
            const agentShifts = shifts.filter(s => s.user_id === agent.id);

            // Assume 8 hours per shift based on our 9-5, 1-9, and 9-5 slots
            const total_hours = agentShifts.length * 8;
            const nightShifts = agentShifts.filter(s => s.is_night_shift === true).length;

            // Financial Variables
            const base_pay = total_hours * (agent.hourly_rate || 15.00);
            const night_shift_bonus = nightShifts * 20.00; // $20 bonus per night shift
            const gross_pay = base_pay + night_shift_bonus;
            const tax_deduction = gross_pay * 0.15; // 15% flat tax rate
            const final_salary = gross_pay - tax_deduction;

            return {
                user_id: agent.id,
                month_year: month_year,
                total_hours: total_hours,
                night_shift_bonus: night_shift_bonus,
                tax_deduction: tax_deduction,
                final_salary: final_salary
            };
        });

        // 6. Upsert the generated payroll into the database
        // We use Upsert so if the Admin runs payroll twice for the same month, it updates rather than duplicates.
        // *Note: This requires a unique constraint on (user_id, month_year) in your DB!*
        const { data, error } = await supabase
            .from('payroll')
            .upsert(payrollInserts, { onConflict: 'user_id, month_year' })
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Payroll generated successfully!', records: data.length });

    } catch (error) {
        console.error('❌ Payroll Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. FETCH PAYROLL RECORDS (Admin & Agent View)
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);
        const { month_year, user_id } = req.query;

        // Join with the profiles table to get the agent's name
        let query = supabase
            .from('payroll')
            .select(`
                *,
                profiles:user_id (full_name, email)
            `)
            .order('month_year', { ascending: false });

        if (month_year) query = query.eq('month_year', month_year);
        if (user_id) query = query.eq('user_id', user_id);

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json(data);

    } catch (error) {
        console.error('❌ Fetch Payroll Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;