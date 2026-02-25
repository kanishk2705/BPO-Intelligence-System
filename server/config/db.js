// server/config/db.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL ERROR: Supabase credentials missing in .env');
    process.exit(1);
}

// Create a single Supabase client for the entire app
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase Configured Successfully');

module.exports = supabase;