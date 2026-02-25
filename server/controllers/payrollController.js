const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Generate/Save Payroll (Admin Only)
// ---------------------------------------------------
exports.generatePayroll = async (req, res) => {
    const { user_id, month_year, total_hours, night_shift_bonus, tax_deduction } = req.body;

    try {
        // First, fetch the user's hourly rate from their profile
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('hourly_rate')
            .eq('id', user_id)
            .single();

        if (profileError || !profileData) throw new Error("Could not fetch user's hourly rate");

        // Calculate the math: (Hours * Rate) + Bonus - Tax
        const basePay = total_hours * profileData.hourly_rate;
        const final_salary = basePay + night_shift_bonus - tax_deduction;

        // Save to Database
        const { data, error } = await supabase
            .from('payroll')
            .insert([{
                user_id,
                month_year,
                total_hours,
                night_shift_bonus,
                tax_deduction,
                final_salary
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
// 2. View Payroll (Role-Based Visibility)
// ---------------------------------------------------
exports.getPayroll = async (req, res) => {
    try {
        let query = supabase
            .from('payroll')
            .select('*, profiles(full_name, email)');

        // Agents can only see their own payslips
        if (req.profile.role === 'agent') {
            query = query.eq('user_id', req.profile.id);
        }

        const { data, error } = await query.order('month_year', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Get Payroll Error:", err);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
};