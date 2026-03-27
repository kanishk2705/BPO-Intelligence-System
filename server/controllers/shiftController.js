const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Assign a Shift (Admin/Lead Only)
// ---------------------------------------------------
exports.createShift = async (req, res) => {
    const { user_id, shift_date, shift_type, is_night_shift, start_time, end_time } = req.body;

    // SECURITY: Only Admins or Leads can assign shifts
    if (!req.profile || (req.profile.role !== 'admin' && req.profile.role !== 'lead')) {
        return res.status(403).json({ error: 'Forbidden: Not authorized to assign shifts' });
    }

    try {
        const { data, error } = await supabase
            .from('shifts')
            .insert([{
                user_id, shift_date, shift_type, is_night_shift, start_time, end_time
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
// 2. Get Shifts (Role-Based Visibility + Pagination)
// ---------------------------------------------------
exports.getShifts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30; // 30 covers a month view
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let query = supabase
            .from('shifts')
            .select('*, profiles(full_name, role)', { count: 'exact' });

        if (req.profile.role === 'agent') {
            query = query.eq('user_id', req.profile.id);
        }

        const { data, count, error } = await query
            .range(start, end)
            .order('shift_date', { ascending: true });

        if (error) throw error;

        res.status(200).json({ data, meta: { totalCount: count, currentPage: page }});
    } catch (err) {
        console.error("Get Shifts Error:", err);
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
};