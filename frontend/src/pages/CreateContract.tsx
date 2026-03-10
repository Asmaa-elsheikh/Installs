import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Loader2, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import type { Customer, AIParsed } from '../types';
import { useAuthStore } from '../store/auth';

interface ContractForm {
  customer_id: string; product_name: string; product_category: string;
  total_price: string; deposit: string; installment_period: string;
  installment_amount: string; start_date: string; payment_day: string;
}
const emptyForm: ContractForm = {
  customer_id: '', product_name: '', product_category: '', total_price: '', deposit: '0',
  installment_period: '', installment_amount: '', start_date: new Date().toISOString().split('T')[0], payment_day: '1',
};

const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

export default function CreateContract() {
  const [tab, setTab] = useState<'manual' | 'ai'>('manual');
  const [form, setForm] = useState<ContractForm>(emptyForm);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [aiText, setAiText] = useState('');
  const [aiParsed, setAiParsed] = useState<AIParsed | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currency = user?.currency || 'EGP';

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data));
    const pre = searchParams.get('customer');
    if (pre) setForm(f => ({ ...f, customer_id: pre }));
  }, []);

  const total = parseFloat(form.total_price) || 0;
  const deposit = parseFloat(form.deposit) || 0;
  const period = parseInt(form.installment_period) || 0;
  const remaining = Math.max(0, total - deposit);
  const autoInstallment = period > 0 ? Math.ceil((remaining / period) * 100) / 100 : 0;
  const instAmt = parseFloat(form.installment_amount) || autoInstallment;

  const getEndDate = () => {
    if (!form.start_date || !period) return '';
    const d = new Date(form.start_date); d.setMonth(d.getMonth() + period);
    return d.toISOString().split('T')[0];
  };

  const setF = (k: keyof ContractForm) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAIParse = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true); setAiError(''); setAiParsed(null);
    try {
      const { data } = await api.post('/ai/parse', { text: aiText });
      setAiParsed(data);
      const matched = customers.find(c => c.name.toLowerCase().includes((data.customer_name || '').toLowerCase()));
      setForm(f => ({ ...f, customer_id: matched?.id || f.customer_id, product_name: data.product_name || f.product_name, product_category: data.product_category || f.product_category, total_price: data.total_price?.toString() || f.total_price, deposit: data.deposit?.toString() || f.deposit, installment_period: data.installment_period?.toString() || f.installment_period, installment_amount: data.installment_amount?.toString() || f.installment_amount }));
    } catch { setAiError('Failed to parse. Please try again or fill manually.'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id) return setError('Please select a customer');
    if (!form.product_name) return setError('Product name is required');
    if (!total) return setError('Total price is required');
    if (!period) return setError('Installment period is required');
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/contracts', { customer_id: form.customer_id, product_name: form.product_name, product_category: form.product_category || null, total_price: total, deposit, installment_period: period, installment_amount: parseFloat(form.installment_amount) || null, start_date: form.start_date, payment_day: parseInt(form.payment_day) || 1 });
      navigate(`/contracts/${data.id}`);
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to create contract'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/contracts')} style={{ padding: 8, border: 'none', background: '#f1f5f9', borderRadius: 9, cursor: 'pointer', display: 'flex', color: '#475569' }}>
          <ArrowLeft size={17} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Create Contract</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 2 }}>
        {([['manual', FileText, 'Manual Entry'], ['ai', Sparkles, 'AI Entry']] as const).map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0f172a' : '#64748b', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* AI tab */}
      {tab === 'ai' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Describe the sale</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Write naturally and AI will extract the contract details.</p>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1d4ed8' }}>
            Example: "Elen purchased a shirt for 500 EGP, installment for 6 months, each 50 EGP, paid 200 EGP deposit."
          </div>
          <textarea value={aiText} onChange={e => setAiText(e.target.value)} rows={4}
            style={{ ...inp, resize: 'none' }} placeholder="Describe the sale in your own words…" />
          {aiError && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{aiError}</p>}
          <button onClick={handleAIParse} disabled={aiLoading || !aiText.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: aiLoading || !aiText.trim() ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: aiLoading || !aiText.trim() ? 'not-allowed' : 'pointer', width: 'fit-content' }}>
            {aiLoading ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Parsing…</> : <><Sparkles size={15} /> Generate Contract</>}
          </button>
          {aiParsed && (
            <>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                  <CheckCircle size={15} /> AI extracted — review and confirm below
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(aiParsed).map(([k, v]) => v != null && (
                    <div key={k} style={{ fontSize: 13 }}>
                      <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}: </span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setTab('manual')}
                style={{ width: '100%', border: '1.5px solid #2563eb', color: '#2563eb', background: '#fff', fontWeight: 600, fontSize: 14, padding: '10px', borderRadius: 10, cursor: 'pointer' }}>
                Review & Edit in Form
              </button>
            </>
          )}
        </div>
      )}

      {/* Form */}
      {(tab === 'manual' || (tab === 'ai' && aiParsed)) && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
            {tab === 'ai' && aiParsed ? 'Review & Confirm' : 'Contract Details'}
          </h2>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={lbl}>Customer *</label>
              <select value={form.customer_id} onChange={setF('customer_id')} required style={inp}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
              </select>
              <Link to="/customers/new" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>+ Add new customer</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Product Name *</label>
                <input value={form.product_name} onChange={setF('product_name')} required style={inp} placeholder="e.g. iPhone 15" />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <input value={form.product_category} onChange={setF('product_category')} style={inp} placeholder="Electronics, Fashion…" />
              </div>
              <div>
                <label style={lbl}>Total Price ({currency}) *</label>
                <input type="number" min="0" step="0.01" value={form.total_price} onChange={setF('total_price')} required style={inp} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>Deposit ({currency})</label>
                <input type="number" min="0" step="0.01" value={form.deposit} onChange={setF('deposit')} style={inp} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>Period (months) *</label>
                <input type="number" min="1" max="120" value={form.installment_period} onChange={setF('installment_period')} required style={inp} placeholder="12" />
              </div>
              <div>
                <label style={lbl}>Monthly Amount ({currency})</label>
                <input type="number" min="0" step="0.01" value={form.installment_amount} onChange={setF('installment_amount')} style={inp} placeholder={autoInstallment ? String(autoInstallment) : 'Auto-calculated'} />
                {autoInstallment > 0 && !form.installment_amount && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Auto: {autoInstallment} {currency}/month</p>}
              </div>
              <div>
                <label style={lbl}>Start Date *</label>
                <input type="date" value={form.start_date} onChange={setF('start_date')} required style={inp} />
              </div>
              <div>
                <label style={lbl}>Payment Day of Month</label>
                <input type="number" min="1" max="28" value={form.payment_day} onChange={setF('payment_day')} style={inp} />
              </div>
            </div>

            {total > 0 && period > 0 && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                {[['Remaining', `${remaining.toLocaleString()} ${currency}`, '#0f172a'], ['Monthly', `${instAmt.toLocaleString()} ${currency}`, '#2563eb'], ['End Date', getEndDate(), '#0f172a']].map(([label, value, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={saving}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : 'Create Contract'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
