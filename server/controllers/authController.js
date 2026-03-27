// server/controllers/authController.js
const supabase = require('../config/db');

exports.getMe = async (req, res) => {
    try {
        const profile = req.profile;
        if (!profile) return res.status(404).json({ error: 'Profile not found or unauthorized' });

        res.status(200).json({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            fullName: profile.full_name
        });
    } catch (err) {
        console.error("GetMe Error:", err);
        res.status(500).json({ error: 'Server Error retrieving profile' });
    }
};

exports.registerEmployee = async (req, res) => {
    const { email, password, fullName, role, hourlyRate, leadId } = req.body;

    if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can create users' });
    }

    try {
        console.log(`\n🚀 1. STARTING REGISTRATION: ${email}`);

        // 1. Create the Auth Login
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: role }
        });

        if (authError) {
            console.error("❌ AUTH ERROR:", authError.message);
            return res.status(400).json({ error: authError.message });
        }

        console.log(`✅ 2. AUTH LOGIN CREATED. ID: ${authData.user.id}`);

        // 2. Determine the Lead ID
        const finalLeadId = (role === 'agent' && leadId) ? leadId : null;
        console.log(`📝 3. ATTEMPTING PROFILE UPSERT (Lead ID: ${finalLeadId})`);

        // 3. The "Truth Serum" Upsert
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: role,
                hourly_rate: hourlyRate || 15,
                lead_id: finalLeadId
            }, { onConflict: 'id' })
            .select(); // 🚨 THIS FORCES THE DATABASE TO CONFESS ERRORS

        // Check if the database threw an explicit error
        if (profileError) {
            console.error("❌ 4. DATABASE THREW AN ERROR:", profileError);
            return res.status(400).json({ error: `Database rejected profile: ${profileError.message}` });
        }

        // Check if the database silently failed (returned 0 rows)
        if (!profileData || profileData.length === 0) {
            console.error("❌ 4. SILENT FAILURE: Database inserted 0 rows.");
            return res.status(400).json({ error: "Profile was silently rejected by the database. Check RLS policies." });
        }

        console.log("✅ 4. SUCCESS! DATABASE RETURNED THE NEW ROW:", profileData[0]);

        res.status(201).json({
            message: `Employee ${fullName} created successfully!`,
            userId: authData.user.id
        });

    } catch (err) {
        console.error("❌ FATAL SERVER ERROR:", err);
        res.status(500).json({ error: 'Server Error during registration' });
    }
};