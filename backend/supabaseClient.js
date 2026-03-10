const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or ANON KEY not set in config.env');
    process.exit(1);
}

module.exports = createClient(supabaseUrl, supabaseAnonKey);
