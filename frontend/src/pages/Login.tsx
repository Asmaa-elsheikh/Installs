import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  color: '#0f172a', background: '#fff', boxSizing: 'border-box',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error || 'Invalid email or password'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>InstallmentPro</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={inputStyle} placeholder="you@business.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: 44 }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
