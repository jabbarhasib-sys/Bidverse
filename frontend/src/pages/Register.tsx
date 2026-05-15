import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FIELDS = [
  {
    key: 'name' as const,
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    ),
  },
  {
    key: 'email' as const,
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    key: 'password' as const,
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
];

export function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      const msg = e.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('email already') || e.response?.status === 409) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError('Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <div className="mesh-bg" />

      <div className="orb w-96 h-96 top-0 right-0 opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      <div className="orb w-80 h-80 bottom-0 -left-20 opacity-15"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)', animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        <div className="glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white font-black text-lg">⚡</span>
              </div>
              <span className="text-2xl font-black grad-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                BidVerse
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">Join thousands of active bidders</p>
          </div>

          <form onSubmit={handle} className="space-y-5" noValidate>
            {FIELDS.map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    {icon}
                  </div>
                  <input
                    type={key === 'password' ? (showPwd ? 'text' : 'password') : type}
                    required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    autoComplete={key === 'password' ? 'new-password' : key === 'email' ? 'email' : 'name'}
                    className="input-field pl-10 pr-10"
                  />
                  {key === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPwd((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  )}
                </div>
                {key === 'password' && form.password.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <span>💡</span>
                    Suggested default password:{' '}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, password: '123456' }))}
                      className="font-mono font-bold text-cyan-400 hover:text-cyan-300 underline decoration-dotted transition-colors"
                    >
                      123456
                    </button>
                    {' '}(click to use)
                  </p>
                )}
                {key === 'password' && form.password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            form.password.length >= i * 2
                              ? i <= 1 ? '#fb7185' : i <= 2 ? '#fbbf24' : i <= 3 ? '#34d399' : '#22d3ee'
                              : 'rgba(71,85,105,0.4)',
                        }}
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-1 self-center">
                      {form.password.length < 4 ? 'Weak' : form.password.length < 6 ? 'Fair' : form.password.length < 8 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div className="p-3 rounded-xl"
                style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-rose-400 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm text-rose-300">{error}</p>
                    {error.includes('already registered') && (
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        → Go to Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="btn-primary w-full text-base py-4 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
