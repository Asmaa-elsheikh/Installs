const express = require('express');
const supabase = require('../supabaseClient');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users')
      .select('id, business_name, email, currency, default_period, reminder_days')
      .eq('id', req.userId)
      .maybeSingle();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { business_name, currency, default_period, reminder_days } = req.body;
    await supabase.from('users').update({
      business_name,
      currency: currency || 'EGP',
      default_period: default_period || 12,
      reminder_days: reminder_days || 3
    }).eq('id', req.userId);

    const { data: user } = await supabase.from('users')
      .select('id, business_name, email, currency, default_period, reminder_days')
      .eq('id', req.userId)
      .maybeSingle();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
