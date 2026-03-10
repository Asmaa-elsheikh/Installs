import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import api from '../lib/api';
import type { Contract, Installment } from '../types';
import { useAuthStore } from '../store/auth';

const instBadge: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#dbeafe', color: '#1d4ed8' },
  paid:    { bg: '#dcfce7', color: '#15803d' },
  late:    { bg: '#fee2e2', color: '#b91c1c' },
  partial: { bg: '#fef3c7', color: '#92400e' },
};
const contractBadge: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dbeafe', color: '#1d4ed8' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  defaulted: { bg: '#fee2e2', color: '#b91c1c' },
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff',
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currency = user?.currency || 'EGP';

  const [contract, setContract] = useState<Contract | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<Installment | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const load = () => {
    api.get(`/contracts/${id}`).then(r => {
      setContract(r.data);
      setInstallments(r.data.installments || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const openPay = (inst: Installment) => {
    setPayModal(inst);
    setPayAmount((inst.amount - inst.paid_amount).toString());
    setPayNote(''); setPayError('');
  };

  const handlePay = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return setPayError('Enter a valid amount');
    setPaying(true); setPayError('');
    try {
      await api.post(`/contracts/${id}/pay`, { installment_id: payModal?.id, amount: amt, note: payNote });
      setPayModal(null); load();
    } catch (err: any) {
      setPayError(err.response?.data?.error || 'Payment failed');
    } finally { setPaying(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!contract) return <div style={{ textAlign: 'center', padding: '64px 0', color: '#94a3b8' }}>Contract not found.</div>;

  const paidCount = installments.filter(i => i.status === 'paid').length;
  const progress = installments.length ? Math.round(paidCount / installments.length * 100) : 0;
  const cb = contractBadge[contract.status] || { bg: '#f1f5f9', color: '#475569' };

  const infoItems = [
    { label: 'Total Price',   value: `${contract.total_price.toLocaleString()} ${currency}` },
    { label: 'Deposit Paid',  value: `${contract.deposit.toLocaleString()} ${currency}` },
    { label: 'Remaining',     value: `${contract.remaining_balance.toLocaleString()} ${currency}`, highlight: true },
    { label: 'Monthly',       value: `${contract.installment_amount.toLocaleString()} ${currency}` },
    { label: 'Period',        value: `${contract.installment_period} months` },
    { label: 'Payment Day',   value: `${contract.payment_day}th of month` },
    { label: 'Start Date',    value: contract.start_date },
    { label: 'End Date',      value: contract.end_date },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/contracts')}
          style={{ padding: 8, border: 'none', background: '#f1f5f9', borderRadius: 9, cursor: 'pointer', display: 'flex', color: '#475569' }}>
          <ArrowLeft size={17} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>{contract.product_name}</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Contract details</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, background: cb.bg, color: cb.color, borderRadius: 999, padding: '5px 14px' }}>
          {contract.status}
        </span>
      </div>

      {/* Info card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f8fafc' }}>
          <User size={16} color="#94a3b8" />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{contract.customer_name}</span>
          {contract.customer_phone && <span style={{ fontSize: 13, color: '#94a3b8' }}>· {contract.customer_phone}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {infoItems.map(({ label, value, highlight }) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: highlight ? '#2563eb' : '#0f172a', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Progress — {paidCount} of {installments.length} paid</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{progress}%</span>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8 }}>
            <div style={{ background: '#2563eb', height: 8, borderRadius: 999, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Installment Schedule</h2>
        </div>
        {installments.map((inst, i) => {
          const b = instBadge[inst.status] || { bg: '#f1f5f9', color: '#475569' };
          return (
            <div key={inst.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: i < installments.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: b.bg, color: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>Due: {inst.due_date}</p>
                  {inst.paid_date && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Paid: {inst.paid_date}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{inst.amount.toLocaleString()} {currency}</p>
                  {inst.paid_amount > 0 && inst.status !== 'paid' && (
                    <p style={{ fontSize: 12, color: '#d97706', margin: '2px 0 0' }}>Paid: {inst.paid_amount.toLocaleString()}</p>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: b.bg, color: b.color, borderRadius: 999, padding: '3px 10px' }}>{inst.status}</span>
                {inst.status !== 'paid' && (
                  <button onClick={() => openPay(inst)}
                    style={{ background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    Pay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay modal */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', width: '100%', maxWidth: 440, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Record Payment</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
              Installment #{installments.indexOf(payModal) + 1} · Due {payModal.due_date}
            </p>
            {payError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>{payError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Amount ({currency})</label>
                <input type="number" min="0.01" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={inputStyle} />
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Outstanding: {(payModal.amount - payModal.paid_amount).toLocaleString()} {currency}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Note (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)} style={inputStyle} placeholder="Cash, bank transfer…" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={handlePay} disabled={paying}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: paying ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px', borderRadius: 10, border: 'none', cursor: paying ? 'not-allowed' : 'pointer' }}>
                  {paying ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</> : 'Confirm Payment'}
                </button>
                <button onClick={() => setPayModal(null)}
                  style={{ padding: '12px 20px', background: '#f1f5f9', color: '#374151', fontWeight: 600, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
