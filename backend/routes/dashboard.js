const express = require('express');
const supabase = require('../supabaseClient');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/summary', async (req, res) => {
  try {
    const { count: totalCustomers } = await supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', req.userId);

    const { data: contracts } = await supabase.from('contracts').select('id, status, remaining_balance').eq('user_id', req.userId);
    const activeContractsData = (contracts || []).filter(c => c.status === 'active');
    const activeContracts = activeContractsData.length;
    const outstandingBalance = activeContractsData.reduce((sum, c) => sum + (c.remaining_balance || 0), 0);

    const contractIds = (contracts || []).map(c => c.id);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: payments } = await supabase.from('payments').select('amount, payment_date').in('contract_id', contractIds.length > 0 ? contractIds : ['00000000-0000-0000-0000-000000000000']);

    let collectedThisMonth = 0;
    const monthlyCollectionsMap = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const sixMonthsAgoDate = sixMonthsAgo.toISOString().split('T')[0];

    (payments || []).forEach(p => {
      // Handle the fact that Postgres payment_date might be ISO string
      const pDate = p.payment_date.split('T')[0];
      if (pDate >= monthStart && pDate <= monthEnd) {
        collectedThisMonth += p.amount;
      }
      if (pDate >= sixMonthsAgoDate) {
        const monthStr = pDate.substring(0, 7); // YYYY-MM
        monthlyCollectionsMap[monthStr] = (monthlyCollectionsMap[monthStr] || 0) + p.amount;
      }
    });

    const monthlyCollections = Object.keys(monthlyCollectionsMap).sort().map(month => ({ month, total: monthlyCollectionsMap[month] }));

    const today = now.toISOString().split('T')[0];
    const in7daysDate = new Date(now.getTime() + 7 * 86400000);
    const in7days = in7daysDate.toISOString().split('T')[0];

    const { data: installments } = await supabase.from('installments')
      .select('*, contracts(product_name, customers(name, phone))')
      .in('contract_id', contractIds.length > 0 ? contractIds : ['00000000-0000-0000-0000-000000000000']);

    let overdueCount = 0;
    const statusCountsMap = {};
    const upcomingPayments = [];

    (installments || []).forEach(inst => {
      if (inst.status === 'late') overdueCount++;
      statusCountsMap[inst.status] = (statusCountsMap[inst.status] || 0) + 1;

      if (['pending', 'partial', 'late'].includes(inst.status) && inst.due_date >= today && inst.due_date <= in7days) {
        upcomingPayments.push({
          ...inst,
          product_name: inst.contracts?.product_name,
          customer_name: inst.contracts?.customers?.name,
          customer_phone: inst.contracts?.customers?.phone
        });
      }
    });

    upcomingPayments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    if (upcomingPayments.length > 20) upcomingPayments.length = 20;

    const statusCounts = Object.keys(statusCountsMap).map(status => ({ status, count: statusCountsMap[status] }));

    res.json({ totalCustomers: totalCustomers || 0, activeContracts, outstandingBalance, collectedThisMonth, overdueCount, upcomingPayments, monthlyCollections, statusCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
