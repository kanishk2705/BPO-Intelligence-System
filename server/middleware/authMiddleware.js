// server/middleware/authMiddleware.js
const supabase = require('../config/db');

// Middleware: "The Fast Bouncer"
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get the token from the header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access Denied: Missing or Invalid Token Format' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Ask Supabase: "Is this token valid?" (This is a secure network call to Auth)
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or Expired Token', details: authError?.message });
        }

        // 3. PERFORMANCE FIX: Only select exactly what the controllers need
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, email, full_name') 
            .eq('id', user.id)
            .single();

        // SILENT BUG FIX: If we can't find their profile, deny access immediately.
        if (profileError || !profile) {
            console.error("Profile Fetch Error in Auth:", profileError);
            return res.status(401).json({ error: 'Access Denied: User profile data is missing or corrupted.' });
        }

        // 4. Attach user info to the request object
        req.user = user;
        req.profile = profile;

        // Note: Removed the console.log here to prevent production log spam

        next(); 

    } catch (err) {
        console.error("Auth Middleware Critical Error:", err);
        res.status(500).json({ error: 'Server Error during Authentication process' });
    }
};

module.exports = authMiddleware;