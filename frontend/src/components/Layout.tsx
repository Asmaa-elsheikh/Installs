import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/contracts', icon: FileText, label: 'Contracts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', width: 230 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ width: 34, height: 34, background: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp size={17} color="#fff" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.3 }}>InstallmentPro</p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.business_name}</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <button key={to} onClick={() => { navigate(to); onClose?.(); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left', background: active ? '#2563eb' : 'transparent', color: active ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: 500 }}>
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1e293b' }}>
        <button onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Desktop sidebar */}
      <div style={{ flexShrink: 0, display: 'flex' }}>
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile topbar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 4 }}>
            <Menu size={21} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>InstallmentPro</span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
