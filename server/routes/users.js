const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// 1. Create a "God-Mode" Admin Client using the Service Key
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// 2. Create a standard client to verify the person making the request
const getSupabaseUserClient = (req) => {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: req.headers.authorization } }
    });
};

router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const { email, password, full_name, role, hourly_rate } = req.body;

        // --- THE ACTUAL CREATION PROCESS ---

        // 1. Create the user in Supabase Authentication (Background creation)
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Auto-confirm so they don't need to click an email link
        });

        if (createError) throw createError;

        // 2. Upsert their details into your public `profiles` table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newAuthUser.user.id,
                email: email,
                full_name: full_name,
                role: role || 'agent',
                hourly_rate: hourly_rate || 15.00
            });

        if (profileError) throw profileError;

        res.status(201).json({ message: 'User created successfully!' });

    } catch (error) {
        console.error('❌ User Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;