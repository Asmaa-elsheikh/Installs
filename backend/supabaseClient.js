const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(__dirname, 'config.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
    }
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or ANON KEY not set. Database operations will fail.');
}

module.exports = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
