import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/NotesContext';

export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '123456' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Show hint banner after a short delay
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = e.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('email already')) {
        setError('That email is already registered. Did you mean to sign in?');
      } else if (msg.toLowerCase().includes('invalid') || e.response?.status === 401) {
        setError('Wrong email or password. Try the default password: 123456');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <div className="mesh-bg" />

      {/* Orbs */}
      <div className="orb w-96 h-96 -top-48 -left-48 opacity-20"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }} />
      <div className="orb w-72 h-72 bottom-0 right-0 opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Card */}
        <div className="glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white font-black text-lg">⚡</span>
              </div>
              <span className="text-2xl font-black grad-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                BidVerse
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to continue bidding</p>
          </div>

          <form onSubmit={handle} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Default password hint */}
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <span>💡</span>
                Default password for all accounts:{' '}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, password: '123456' }))}
                  className="font-mono font-bold text-cyan-400 hover:text-cyan-300 underline decoration-dotted transition-colors"
                >
                  123456
                </button>
                {' '}(click to fill)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
                <span className="text-rose-400 text-base">⚠</span>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-primary w-full text-base py-4 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo Accounts */}
          {showHint && (
            <div
              className="mt-6 p-4 rounded-2xl page-enter"
              style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">🧪 Demo Accounts</p>
              <div className="space-y-2">
                {[
                  { name: 'Alice',  email: 'alice@example.com'     },
                  { name: 'Bob',    email: 'bob@example.com'       },
                  { name: 'Jabbar', email: 'jabbar.hasib@gmail.com'},
                ].map(({ name, email }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setForm({ email, password: '123456' })}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[rgba(34,211,238,0.08)] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                        {name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">{name}</span>
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-cyan-400 font-mono transition-colors">{email}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">Password: <span className="font-mono font-bold text-cyan-400">123456</span></p>
            </div>
          )}

          <p className="text-center text-sm text-slate-400 mt-6">
            New to BidVerse?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Your bids are secure and protected.
        </p>
      </div>
    </div>
  );
}
