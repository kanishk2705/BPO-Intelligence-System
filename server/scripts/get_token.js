// server/scripts/get_token.js
require('dotenv').config({ path: '../.env' }); // Load your secret keys
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function getAccessToken() {
    console.log("🔄 Attempting to log in as Admin...");

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@bpo.com', // The user you just created
        password: 'admin123'
    });

    if (error) {
        console.error("❌ Login Failed:", error.message);
    } else {
        console.log("\n✅ LOGIN SUCCESSFUL!");
        console.log("---------------------------------------------------");
        console.log("COPY THIS TOKEN BELOW (without quotes) FOR POSTMAN:");
        console.log("---------------------------------------------------");
        console.log(data.session.access_token);
        console.log("---------------------------------------------------");
    }
}

getAccessToken();