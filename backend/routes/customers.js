const express = require('express');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabaseClient');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { data: customers } = await supabase.from('customers')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (!customers || customers.length === 0) return res.json([]);

    const customerIds = customers.map(c => c.id);
    const { data: contracts } = await supabase.from('contracts')
      .select('id, customer_id, status, remaining_balance')
      .eq('user_id', req.userId)
      .in('customer_id', customerIds);

    const merged = customers.map(c => {
      const c_contracts = (contracts || []).filter(ct => ct.customer_id === c.id);
      const activeContracts = c_contracts.filter(ct => ct.status === 'active');
      return {
        ...c,
        active_contracts: activeContracts.length,
        total_outstanding: activeContracts.reduce((sum, ct) => sum + (ct.remaining_balance || 0), 0)
      };
    });

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: customer } = await supabase.from('customers')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!customer) return res.status(404).json({ error: 'Not found' });

    const { data: contracts } = await supabase.from('contracts')
      .select('*')
      .eq('customer_id', req.params.id)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    res.json({ ...customer, contracts: contracts || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, national_id, address, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const id = uuidv4();
    const { error } = await supabase.from('customers').insert({
      id, user_id: req.userId, name, phone, national_id, address, notes
    });

    if (error) throw error;

    const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single();
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, national_id, address, notes } = req.body;
    const { data: existing } = await supabase.from('customers')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { error } = await supabase.from('customers').update({
      name, phone, national_id, address, notes
    }).eq('id', req.params.id);

    if (error) throw error;

    const { data: customer } = await supabase.from('customers').select('*').eq('id', req.params.id).single();
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { data: existing } = await supabase.from('customers')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
