import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Phone, MapPin, CreditCard, FileText, Plus } from 'lucide-react';
import api from '../lib/api';
import type { Customer, Contract } from '../types';
import { useAuthStore } from '../store/auth';

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

const statusBadge: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dbeafe', color: '#1d4ed8' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  defaulted: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function CustomerProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currency = user?.currency || 'EGP';
  const isNew = id === 'new';
  const [form, setForm] = useState({ name: '', phone: '', national_id: '', address: '', notes: '' });
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(isNew || searchParams.get('edit') === '1');

  useEffect(() => {
    if (!isNew) {
      api.get(`/customers/${id}`).then(r => {
        setCustomer(r.data); setContracts(r.data.contracts || []);
        setForm({ name: r.data.name, phone: r.data.phone || '', national_id: r.data.national_id || '', address: r.data.address || '', notes: r.data.notes || '' });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true); setError('');
    try {
      if (isNew) { const { data } = await api.post('/customers', form); navigate(`/customers/${data.id}`); }
      else { const { data } = await api.put(`/customers/${id}`, form); setCustomer(data); setEditing(false); }
    } catch (err: any) { setError(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/customers')}
          style={{ padding: 8, border: 'none', background: '#f1f5f9', borderRadius: 9, cursor: 'pointer', display: 'flex', color: '#475569' }}>
          <ArrowLeft size={17} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isNew ? 'Add Customer' : editing ? 'Edit Customer' : customer?.name}
          </h1>
          {!isNew && !editing && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Customer profile</p>}
        </div>
        {!isNew && !editing && (
          <button onClick={() => setEditing(true)}
            style={{ background: '#f1f5f9', color: '#374151', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer' }}>
            Edit
          </button>
        )}
      </div>

      {/* Form */}
      {(isNew || editing) && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28 }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name *</label>
                <input value={form.name} onChange={setF('name')} required style={inputStyle} placeholder="Customer full name" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={setF('phone')} style={inputStyle} placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <label style={labelStyle}>National ID</label>
                <input value={form.national_id} onChange={setF('national_id')} style={inputStyle} placeholder="Optional" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Address</label>
                <input value={form.address} onChange={setF('address')} style={inputStyle} placeholder="Customer address" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={setF('notes')} rows={3}
                  style={{ ...inputStyle, resize: 'none' }} placeholder="Any notes about this customer…" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Customer'}
              </button>
              {!isNew && (
                <button type="button" onClick={() => setEditing(false)}
                  style={{ background: '#f1f5f9', color: '#374151', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Profile view */}
      {!isNew && !editing && customer && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {customer.phone && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Phone size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                <div><p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Phone</p><p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{customer.phone}</p></div>
              </div>
            )}
            {customer.national_id && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CreditCard size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                <div><p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>National ID</p><p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{customer.national_id}</p></div>
              </div>
            )}
            {customer.address && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', gridColumn: '1 / -1' }}>
                <MapPin size={15} color="#94a3b8" style={{ marginTop: 2 }} />
                <div><p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Address</p><p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{customer.address}</p></div>
              </div>
            )}
            {customer.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Notes</p>
                <p style={{ fontSize: 14, color: '#475569', background: '#f8fafc', borderRadius: 10, padding: '12px 14px', margin: 0 }}>{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contracts */}
      {!isNew && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={15} color="#94a3b8" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Contracts ({contracts.length})</h2>
            </div>
            <Link to={`/contracts/new?customer=${id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
              <Plus size={13} /> New Contract
            </Link>
          </div>
          {contracts.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No contracts yet.</div>
          ) : (
            contracts.map((c, i) => {
              const b = statusBadge[c.status] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <div key={c.id} onClick={() => navigate(`/contracts/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: i < contracts.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{c.product_name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{c.start_date} → {c.end_date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{c.remaining_balance.toLocaleString()} {currency}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, background: b.bg, color: b.color, borderRadius: 999, padding: '3px 10px', display: 'inline-block', marginTop: 4 }}>{c.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
