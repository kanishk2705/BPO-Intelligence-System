const supabase = require('../config/db');

// Middleware: "The Bouncer"
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get the token from the header
        // The frontend sends: "Authorization: Bearer <token>"
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access Denied: No Token Provided' });
        }

        // 2. Ask Supabase: "Is this token valid?"
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        // 3. Get the user's role from the 'profiles' table
        // We need to know if they are Admin, Lead, or Agent
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // 4. Attach user info to the request object so the next function can use it
        req.user = user;
        req.profile = profile;

        console.log(`👤 User Verified: ${profile?.email} (${profile?.role})`);

        next(); // Pass control to the next function (The Controller)

    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ error: 'Server Error during Authentication' });
    }
};

module.exports = authMiddleware;