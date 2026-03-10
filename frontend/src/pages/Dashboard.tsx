import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, DollarSign, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../lib/api';
import type { DashboardData } from '../types';
import { useAuthStore } from '../store/auth';

const STATUS_COLORS: Record<string, string> = {
  pending: '#3b82f6', paid: '#22c55e', late: '#ef4444', partial: '#f59e0b',
};

const STAT_CONFIG = [
  { key: 'totalCustomers',    label: 'Total Customers',      icon: Users,          bg: '#eff6ff', iconColor: '#2563eb' },
  { key: 'activeContracts',   label: 'Active Contracts',     icon: FileText,       bg: '#f5f3ff', iconColor: '#7c3aed' },
  { key: 'outstandingBalance',label: 'Outstanding Balance',  icon: DollarSign,     bg: '#fffbeb', iconColor: '#d97706' },
  { key: 'overdueCount',      label: 'Overdue Installments', icon: AlertTriangle,  bg: '#fef2f2', iconColor: '#dc2626' },
];

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    late:    { bg: '#fee2e2', color: '#b91c1c' },
    partial: { bg: '#fef3c7', color: '#92400e' },
    pending: { bg: '#dbeafe', color: '#1d4ed8' },
    paid:    { bg: '#dcfce7', color: '#15803d' },
  };
  return map[status] || { bg: '#f1f5f9', color: '#475569' };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const currency = user?.currency || 'EGP';
  const fmt = (n: number) => `${n.toLocaleString()} ${currency}`;

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const statusData = data?.statusCounts.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
  })) || [];

  const statValues: Record<string, any> = {
    totalCustomers:     data?.totalCustomers ?? 0,
    activeContracts:    data?.activeContracts ?? 0,
    outstandingBalance: fmt(data?.outstandingBalance ?? 0),
    overdueCount:       data?.overdueCount ?? 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Welcome back, {user?.business_name}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STAT_CONFIG.map(({ key, label, icon: Icon, bg, iconColor }) => (
          <div key={key} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={iconColor} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{statValues[key]}</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Bar chart */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Monthly Collections</h2>
            <TrendingUp size={16} color="#94a3b8" />
          </div>
          {data?.monthlyCollections && data.monthlyCollections.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyCollections} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 13 }}
                  formatter={(v: any) => [`${v} ${currency}`, 'Collected']}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 14 }}>
              No payment data yet
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>Installment Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={52} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 14 }}>
              No data yet
            </div>
          )}
        </div>

      </div>

      {/* Upcoming payments */}
      <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={15} color="#94a3b8" />
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Upcoming Payments — Next 7 Days</h2>
          </div>
          <Link to="/contracts" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
        </div>

        {data?.upcomingPayments && data.upcomingPayments.length > 0 ? (
          data.upcomingPayments.map((p, i) => {
            const badge = statusBadge(p.status);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: i < data.upcomingPayments.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{p.customer_name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.product_name} · Due {p.due_date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{fmt(p.amount)}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color, borderRadius: 999, padding: '3px 10px' }}>
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#cbd5e1', fontSize: 14 }}>
            No upcoming payments in the next 7 days
          </div>
        )}
      </div>

    </div>
  );
}
