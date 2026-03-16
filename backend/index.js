const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(__dirname, 'config.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
    }
}

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', async (_, res) => {
  try {
    const supabase = require('./supabaseClient');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      env: {
        has_url: !!process.env.SUPABASE_URL,
        has_key: !!process.env.SUPABASE_ANON_KEY,
        has_jwt: !!process.env.JWT_SECRET
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      env_debug: {
        has_url: !!process.env.SUPABASE_URL,
        has_key: !!process.env.SUPABASE_ANON_KEY
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
    app.listen(PORT, () => console.log(`InstallmentPro API running on port ${PORT}`));
}

module.exports = app;
