const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabaseClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/signup', async (req, res) => {
  try {
    const { business_name, email, password } = req.body;
    if (!business_name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const { error: insertError } = await supabase.from('users').insert({
      id, business_name, email, password_hash
    });
    if (insertError) throw insertError;

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    const { data: user } = await supabase.from('users')
      .select('id, business_name, email, currency, default_period, reminder_days, created_at')
      .eq('id', id).single();

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const { data: user } = await supabase.from('users')
      .select('id, business_name, email, currency, default_period, reminder_days, created_at')
      .eq('id', decoded.id).maybeSingle();

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
