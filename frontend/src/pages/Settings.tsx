import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff',
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ business_name: '', currency: 'EGP', default_period: '12', reminder_days: '3' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ business_name: user.business_name, currency: user.currency, default_period: String(user.default_period), reminder_days: String(user.reminder_days) });
  }, [user]);

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const { data } = await api.put('/settings', { ...form, default_period: parseInt(form.default_period), reminder_days: parseInt(form.reminder_days) });
      setUser(data); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage your business preferences</p>
      </div>

      {/* Business info */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Business Information</h2>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>Settings saved successfully.</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Business Name</label>
            <input value={form.business_name} onChange={setF('business_name')} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={user?.email || ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select value={form.currency} onChange={setF('currency')} style={inputStyle}>
              <option value="EGP">EGP — Egyptian Pound</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="SAR">SAR — Saudi Riyal</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Default Period (months)</label>
              <input type="number" min="1" max="120" value={form.default_period} onChange={setF('default_period')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Reminder Days</label>
              <input type="number" min="0" max="30" value={form.reminder_days} onChange={setF('reminder_days')} style={inputStyle} />
            </div>
          </div>
          <div>
            <button type="submit" disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><Save size={15} /> Save Settings</>}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Subscription</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', borderRadius: 12, padding: '16px 20px' }}>
          <div>
            <p style={{ fontWeight: 700, color: '#1e40af', margin: 0, fontSize: 15 }}>Free Trial</p>
            <p style={{ fontSize: 13, color: '#3b82f6', margin: '3px 0 0' }}>14 days remaining</p>
          </div>
          <button style={{ background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer' }}>
            Upgrade to Pro
          </button>
        </div>
      </div>

    </div>
  );
}
