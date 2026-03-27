const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Generate/Save Payroll (Admin Only)
// ---------------------------------------------------
exports.generatePayroll = async (req, res) => {
    const { user_id, month_year, total_hours, night_shift_bonus, tax_deduction } = req.body;

    // SECURITY: Strictly enforce Admin role
    if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can generate payroll' });
    }

    try {
        // PREVENT DOUBLE PAY: Check if payroll for this user + month already exists
        const { data: existingPayroll } = await supabase
            .from('payroll')
            .select('id')
            .match({ user_id: user_id, month_year: month_year })
            .single();

        if (existingPayroll) {
            return res.status(409).json({ error: `Payroll for ${month_year} already exists for this user.` });
        }

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('hourly_rate')
            .eq('id', user_id)
            .single();

        if (profileError || !profileData) throw new Error("Could not fetch user's hourly rate");

        const basePay = total_hours * profileData.hourly_rate;
        const final_salary = basePay + night_shift_bonus - tax_deduction;

        const { data, error } = await supabase
            .from('payroll')
            .insert([{
                user_id, month_year, total_hours, night_shift_bonus, tax_deduction, final_salary
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Payroll generated successfully', payroll: data[0] });
    } catch (err) {
        console.error("Generate Payroll Error:", err);
        res.status(500).json({ error: 'Failed to generate payroll' });
    }
};

// ---------------------------------------------------
// 2. View Payroll (Role-Based Visibility + Pagination)
// ---------------------------------------------------
exports.getPayroll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let query = supabase
            .from('payroll')
            .select('*, profiles(full_name, email)', { count: 'exact' });

        if (req.profile.role === 'agent') {
            query = query.eq('user_id', req.profile.id);
        }

        const { data, count, error } = await query
            .range(start, end)
            .order('month_year', { ascending: false });

        if (error) throw error;

        res.status(200).json({ data, meta: { totalCount: count, currentPage: page }});
    } catch (err) {
        console.error("Get Payroll Error:", err);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
};