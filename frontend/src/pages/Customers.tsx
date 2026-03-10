import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Phone } from 'lucide-react';
import api from '../lib/api';
import type { Customer } from '../types';
import { useAuthStore } from '../store/auth';

const th: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 20px' };
const td: React.CSSProperties = { padding: '14px 20px', fontSize: 14, color: '#0f172a', verticalAlign: 'middle' };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const currency = user?.currency || 'EGP';

  const load = () => {
    setLoading(true);
    api.get('/customers').then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    setDeleting(id);
    try { await api.delete(`/customers/${id}`); load(); } finally { setDeleting(null); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{customers.length} total customers</p>
        </div>
        <Link to="/customers/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '9px 18px', borderRadius: 10, textDecoration: 'none' }}>
          <Plus size={15} /> Add Customer
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 42, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#0f172a' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>{search ? 'No customers match your search.' : 'No customers yet.'}</p>
            {!search && <Link to="/customers/new" style={{ color: '#2563eb', fontSize: 14, display: 'inline-block', marginTop: 8 }}>Add your first customer</Link>}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={th}>Customer</th>
                <th style={th}>Phone</th>
                <th style={th}>Contracts</th>
                <th style={th}>Outstanding</th>
                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={td}>
                    <p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{c.name}</p>
                    {c.address && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{c.address}</p>}
                  </td>
                  <td style={td}>
                    {c.phone ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                        <Phone size={13} color="#94a3b8" />{c.phone}
                      </span>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={td}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.active_contracts ?? 0}</span>
                  </td>
                  <td style={td}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{(c.total_outstanding ?? 0).toLocaleString()} {currency}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => navigate(`/customers/${c.id}`)} title="View"
                        style={{ padding: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: 8, display: 'flex' }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => navigate(`/customers/${c.id}?edit=1`)} title="Edit"
                        style={{ padding: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: 8, display: 'flex' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} disabled={deleting === c.id} title="Delete"
                        style={{ padding: 7, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: 8, display: 'flex', opacity: deleting === c.id ? 0.5 : 1 }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
