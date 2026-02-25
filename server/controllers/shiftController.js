const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Assign a Shift (Admin/Lead Only)
// ---------------------------------------------------
exports.createShift = async (req, res) => {
    const { user_id, shift_date, shift_type, is_night_shift, start_time, end_time } = req.body;

    try {
        const { data, error } = await supabase
            .from('shifts')
            .insert([{
                user_id,
                shift_date,
                shift_type,
                is_night_shift,
                start_time,
                end_time
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Shift assigned successfully', shift: data[0] });
    } catch (err) {
        console.error("Create Shift Error:", err);
        res.status(500).json({ error: 'Failed to assign shift' });
    }
};

// ---------------------------------------------------
// 2. Get Shifts (Role-Based Visibility)
// ---------------------------------------------------
exports.getShifts = async (req, res) => {
    try {
        // Fetch shifts and join with the profiles table to get the employee's name
        let query = supabase
            .from('shifts')
            .select('*, profiles(full_name, role)');

        // If Agent, only show their own shifts.
        if (req.profile.role === 'agent') {
            query = query.eq('user_id', req.profile.id);
        }

        const { data, error } = await query.order('shift_date', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Get Shifts Error:", err);
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
};