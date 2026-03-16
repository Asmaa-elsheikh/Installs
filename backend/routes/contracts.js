const express = require('express');
const crypto = require('crypto');
const supabase = require('../supabaseClient');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function generateInstallments(contractId, startDate, period, amount, paymentDay) {
  const installments = [];
  for (let i = 1; i <= period; i++) {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);
    due.setDate(paymentDay);
    installments.push({
      id: crypto.randomUUID(),
      contract_id: contractId,
      due_date: due.toISOString().split('T')[0],
      amount,
      paid_amount: 0,
      status: 'pending',
      paid_date: null,
    });
  }
  return installments;
}

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from('contracts')
      .select('*, customers(name, phone)')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: contracts, error } = await query;
    if (error) throw error;

    const mapped = (contracts || []).map(ct => ({
      ...ct,
      customer_name: ct.customers?.name,
      customer_phone: ct.customers?.phone
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: contract } = await supabase.from('contracts')
      .select('*, customers(name, phone)')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!contract) return res.status(404).json({ error: 'Not found' });

    const contractData = {
      ...contract,
      customer_name: contract.customers?.name,
      customer_phone: contract.customers?.phone
    };

    const { data: installments } = await supabase.from('installments')
      .select('*').eq('contract_id', req.params.id).order('due_date', { ascending: true });

    const { data: payments } = await supabase.from('payments')
      .select('*').eq('contract_id', req.params.id).order('payment_date', { ascending: false });

    res.json({ ...contractData, installments: installments || [], payments: payments || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_id, product_name, product_category, total_price, deposit, installment_period, installment_amount, start_date, payment_day } = req.body;
    if (!customer_id || !product_name || !total_price || !installment_period || !start_date)
      return res.status(400).json({ error: 'Missing required fields' });

    const { data: customer } = await supabase.from('customers').select('id, name').eq('id', customer_id).eq('user_id', req.userId).maybeSingle();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const remaining = total_price - (deposit || 0);
    const instAmt = installment_amount || Math.ceil(remaining / installment_period * 100) / 100;
    const pDay = payment_day || 1;

    const start = new Date(start_date);
    const end = new Date(start);
    end.setMonth(end.getMonth() + installment_period);

    const id = crypto.randomUUID();
    const { error: insertErr } = await supabase.from('contracts').insert({
      id, user_id: req.userId, customer_id, product_name, product_category: product_category || null,
      total_price, deposit: deposit || 0, remaining_balance: remaining, installment_period,
      installment_amount: instAmt, start_date, end_date: end.toISOString().split('T')[0],
      payment_day: pDay, status: 'active'
    });
    if (insertErr) throw insertErr;

    const installments = generateInstallments(id, start, installment_period, instAmt, pDay);
    const { error: instErr } = await supabase.from('installments').insert(installments);
    if (instErr) throw instErr;

    const { data: contract } = await supabase.from('contracts').select('*').eq('id', id).single();
    res.status(201).json({ ...contract, customer_name: customer.name, installments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data: existing } = await supabase.from('contracts').select('*').eq('id', req.params.id).eq('user_id', req.userId).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { product_name, product_category, status } = req.body;
    await supabase.from('contracts').update({
      product_name: product_name || existing.product_name,
      product_category: product_category || existing.product_category,
      status: status || existing.status
    }).eq('id', req.params.id);

    const { data: contract } = await supabase.from('contracts').select('*').eq('id', req.params.id).single();
    res.json(contract);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/pay', async (req, res) => {
  try {
    const { installment_id, amount, note } = req.body;
    const { data: contract } = await supabase.from('contracts').select('*').eq('id', req.params.id).eq('user_id', req.userId).maybeSingle();
    if (!contract) return res.status(404).json({ error: 'Not found' });

    const paymentId = crypto.randomUUID();
    await supabase.from('payments').insert({
      id: paymentId, contract_id: req.params.id, installment_id: installment_id || null, amount, note: note || null
    });

    if (installment_id) {
      const { data: inst } = await supabase.from('installments').select('*').eq('id', installment_id).eq('contract_id', req.params.id).maybeSingle();
      if (inst) {
        const newPaid = inst.paid_amount + amount;
        const newStatus = newPaid >= inst.amount ? 'paid' : 'partial';
        await supabase.from('installments').update({
          paid_amount: newPaid, status: newStatus, paid_date: new Date().toISOString().split('T')[0]
        }).eq('id', installment_id);
      }
    }

    const { data: allPayments } = await supabase.from('payments').select('amount').eq('contract_id', req.params.id);
    const totalPaid = (allPayments || []).reduce((sum, p) => sum + p.amount, 0);
    const newRemaining = Math.max(0, contract.total_price - totalPaid);
    const newStatus = newRemaining <= 0 ? 'completed' : 'active';

    await supabase.from('contracts').update({
      remaining_balance: newRemaining, status: newStatus
    }).eq('id', req.params.id);

    // Update overdue installments
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('installments').update({ status: 'late' })
      .eq('contract_id', req.params.id)
      .eq('status', 'pending')
      .lt('due_date', today);

    res.json({ success: true, remaining: newRemaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
