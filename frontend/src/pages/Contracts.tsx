import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../lib/api';
import type { Contract } from '../types';
import { useAuthStore } from '../store/auth';

const statusBadge: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dbeafe', color: '#1d4ed8' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  defaulted: { bg: '#fee2e2', color: '#b91c1c' },
};

const th: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 20px', textAlign: 'left' };
const td: React.CSSProperties = { padding: '14px 20px', fontSize: 14, color: '#0f172a', verticalAlign: 'middle' };

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const currency = user?.currency || 'EGP';

  useEffect(() => {
    setLoading(true);
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/contracts${q}`).then(r => setContracts(r.data)).finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = contracts.filter(c =>
    (c.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Contracts</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{contracts.length} total contracts</p>
        </div>
        <Link to="/contracts/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, padding: '9px 18px', borderRadius: 10, textDecoration: 'none' }}>
          <Plus size={15} /> New Contract
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer or product…"
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 42, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#0f172a' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#0f172a', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="defaulted">Defaulted</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No contracts found.</p>
            <Link to="/contracts/new" style={{ color: '#2563eb', fontSize: 14, display: 'inline-block', marginTop: 8 }}>Create your first contract</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={th}>Customer</th>
                <th style={th}>Product</th>
                <th style={th}>Total</th>
                <th style={th}>Remaining</th>
                <th style={th}>Monthly</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const badge = statusBadge[c.status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={c.id} onClick={() => navigate(`/contracts/${c.id}`)}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}>
                    <td style={td}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{c.customer_name}</p>
                      {c.customer_phone && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{c.customer_phone}</p>}
                    </td>
                    <td style={td}>
                      <p style={{ margin: 0 }}>{c.product_name}</p>
                      {c.product_category && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{c.product_category}</p>}
                    </td>
                    <td style={td}>{c.total_price.toLocaleString()} {currency}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{c.remaining_balance.toLocaleString()} {currency}</td>
                    <td style={{ ...td, color: '#64748b' }}>{c.installment_amount.toLocaleString()} {currency}</td>
                    <td style={td}>
                      <span style={{ fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color, borderRadius: 999, padding: '4px 10px' }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
