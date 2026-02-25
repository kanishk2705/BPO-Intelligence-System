const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// --- HELPER: Create a User-Scoped Supabase Client ---
// This ensures your database RLS policies are strictly followed
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
// 1. ASSIGN A SHIFT (Lead Action)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);
        const { user_id, date, shift_string } = req.body;

        // 1. If Lead selects "Off Duty", we remove any existing shift for that day
        if (shift_string === 'Off Duty') {
            const { error: delError } = await supabase
                .from('shifts')
                .delete()
                .match({ user_id: user_id, shift_date: date });

            if (delError) throw delError;
            return res.status(200).json({ message: 'Shift cleared (Off Duty)' });
        }

        // 2. Map the Frontend UI string to your strict SQL Columns
        let shift_type, start_time, end_time, is_night_shift = false;

        if (shift_string.includes('Morning')) {
            shift_type = 'morning';
            start_time = '09:00:00';
            end_time = '17:00:00';
        } else if (shift_string.includes('Evening')) {
            shift_type = 'evening';
            start_time = '13:00:00';
            end_time = '21:00:00';
        } else if (shift_string.includes('Night')) {
            shift_type = 'night';
            start_time = '21:00:00';
            end_time = '05:00:00';
            is_night_shift = true;
        } else {
            return res.status(400).json({ error: 'Invalid shift type selected' });
        }

        // 3. Upsert (Insert or Update) the shift into the database
        // We use an upsert strategy so if a lead accidentally assigns two shifts to 
        // the same person on the same day, it overwrites the old one.
        const { data, error } = await supabase
            .from('shifts')
            .upsert({
                user_id: user_id,
                shift_date: date,
                shift_type: shift_type,
                start_time: start_time,
                end_time: end_time,
                is_night_shift: is_night_shift
            }, { onConflict: 'user_id, shift_date' }) // Prevents duplicate shifts per day
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        console.error('❌ Assign Shift Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. FETCH SHIFTS (Agent viewing Schedule)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const supabase = getSupabaseUserClient(req);
        const { user_id } = req.query;

        // Fetch shifts and order them by date so the schedule is chronological
        let query = supabase
            .from('shifts')
            .select('*')
            .order('shift_date', { ascending: true });

        // Filter for a specific user if requested
        if (user_id) {
            query = query.eq('user_id', user_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json(data);

    } catch (error) {
        console.error('❌ Fetch Shifts Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;