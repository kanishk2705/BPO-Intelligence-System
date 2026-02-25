const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Get Current User Profile
// ---------------------------------------------------
exports.getMe = async (req, res) => {
    try {
        // req.profile comes from the middleware we just wrote!
        const profile = req.profile;

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            fullName: profile.full_name
        });

    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// ---------------------------------------------------
// 2. Create New Employee (Admin Only Feature)
// ---------------------------------------------------
exports.registerEmployee = async (req, res) => {
    const { email, password, fullName, role, hourlyRate } = req.body;

    // Security Check: Only Admins can create new users
    if (req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can create users' });
    }

    try {
        // A. Create User in Supabase Auth (The Login System)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Auto-confirm email so they can login immediately
        });

        if (authError) return res.status(400).json({ error: authError.message });

        // B. Create Profile in 'profiles' table (The Data System)
        // Note: Our SQL Trigger usually handles this, but for Admin creation, 
        // we might want to set specific fields like 'hourly_rate' manually.
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                role: role,
                hourly_rate: hourlyRate
            })
            .eq('id', authData.user.id);

        if (profileError) {
            return res.status(400).json({ error: 'User created but profile update failed.' });
        }

        res.status(201).json({
            message: `Employee ${fullName} created successfully as ${role}`,
            userId: authData.user.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error during registration' });
    }
};