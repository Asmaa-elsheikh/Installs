import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Zap, BarChart3, Bell, Shield, ArrowRight, FileText } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Smart Contract Creation', desc: 'Create installment contracts manually or let AI parse your natural language descriptions.' },
  { icon: Zap, title: 'AI-Powered Entry', desc: 'Just describe the sale in plain text and our AI extracts all the details automatically.' },
  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Get instant insights on collections, outstanding balances, and overdue payments.' },
  { icon: Bell, title: 'Payment Reminders', desc: 'Never miss a payment with automated upcoming payment tracking and alerts.' },
  { icon: Shield, title: 'Secure & Multi-tenant', desc: 'Your data is fully isolated. Each merchant has their own secure, private workspace.' },
  { icon: CheckCircle, title: 'Payment Tracking', desc: 'Mark payments, add partial payments, and track the full history for every contract.' },
];

const steps = [
  { step: '01', title: 'Sign Up Free', desc: 'Create your merchant account in under a minute.' },
  { step: '02', title: 'Add Customers', desc: 'Build your customer database with contact details.' },
  { step: '03', title: 'Create Contracts', desc: 'Add installment contracts manually or via AI prompt.' },
  { step: '04', title: 'Track Payments', desc: 'Monitor balances and mark payments as they come in.' },
];

const plans = [
  {
    name: 'Starter', price: 'Free', period: '14-day trial',
    features: ['Up to 50 customers', '100 contracts', 'AI entry (5/day)', 'Basic dashboard'],
    highlight: false, cta: 'Get Started Free',
  },
  {
    name: 'Pro', price: '199', period: 'EGP / month',
    features: ['Unlimited customers', 'Unlimited contracts', 'Unlimited AI entry', 'Advanced analytics', 'Priority support'],
    highlight: true, cta: 'Start Pro Trial',
  },
  {
    name: 'Business', price: '499', period: 'EGP / month',
    features: ['Everything in Pro', 'Multi-branch support', 'SMS reminders', 'Custom reports', 'Dedicated support'],
    highlight: false, cta: 'Contact Sales',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>InstallmentPro</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Pricing</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none' }}>Log in</Link>
            <Link to="/signup" style={{ background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: '#020617', color: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 999, padding: '6px 16px', fontSize: 13, color: '#93c5fd', marginBottom: 32 }}>
            <Zap size={13} />
            AI-Powered Installment Management
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24, color: '#fff' }}>
            Track Your Installments<br />
            <span style={{ color: '#3b82f6' }}>Effortlessly</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            The smart platform for merchants to manage installment sales, track customer payments, and create contracts with AI — all in one place.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/signup')}
              style={{ background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Start Free Trial <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', color: '#64748b', fontSize: 13 }}>
            {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} color="#22c55e" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: '#f8fafc', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Everything you need to manage installments
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Built specifically for small merchants who sell on installment plans.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 16, padding: '28px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={20} color="#2563eb" />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Up and running in minutes
            </h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Four simple steps to modernize your installment business.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {steps.map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: '#2563eb', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, margin: '0 auto 20px' }}>
                  {step}
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: '#f8fafc', padding: '96px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Start free. Upgrade when you're ready.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'start' }}>
            {plans.map(({ name, price, period, features: fts, highlight, cta }) => (
              <div key={name} style={{ background: highlight ? '#2563eb' : '#fff', border: `1px solid ${highlight ? '#2563eb' : '#e2e8f0'}`, borderRadius: 20, padding: 28, transform: highlight ? 'scale(1.04)' : 'none', boxShadow: highlight ? '0 20px 40px rgba(37,99,235,0.25)' : 'none' }}>
                {highlight && (
                  <div style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 999, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontWeight: 700, fontSize: 18, color: highlight ? '#fff' : '#0f172a', marginBottom: 4 }}>{name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: highlight ? '#fff' : '#0f172a' }}>
                    {price === 'Free' ? 'Free' : price}
                  </span>
                  <span style={{ fontSize: 14, color: highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>{period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fts.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: highlight ? 'rgba(255,255,255,0.85)' : '#475569' }}>
                      <CheckCircle size={15} color={highlight ? '#fff' : '#22c55e'} style={{ flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/signup')}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', background: highlight ? '#fff' : '#2563eb', color: highlight ? '#2563eb' : '#fff' }}>
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#020617', padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Ready to modernize your business?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
            Join merchants who've moved from notebooks to smart digital installment management.
          </p>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={12} color="#fff" />
            </div>
            <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>InstallmentPro</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13 }}>© 2024 InstallmentPro. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
