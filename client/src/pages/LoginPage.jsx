import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { LogIn, Eye, EyeOff, Copy, Check } from 'lucide-react';

const TEST_ACCOUNTS = [
  { email: 'test_gracz@tennis.pl', password: 'haslo123', role: 'USER',  label: 'Gracz',      badge: 'badge-user'  },
  { email: 'test_mod@tennis.pl',   password: 'haslo123', role: 'MOD',   label: 'Moderator',  badge: 'badge-mod'   },
  { email: 'test_admin@tennis.pl', password: 'haslo123', role: 'ADMIN', label: 'Admin',      badge: 'badge-admin' },
];

export default function LoginPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState('');

  // Już zalogowany → idź do kortów
  if (user) { navigate('/courts'); return null; }

  const login = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/courts');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd logowania');
    } finally { setLoading(false); }
  };

  const quickLogin = async (acc) => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: acc.email, password: acc.password });
      localStorage.setItem('token', data.token);
      navigate('/courts');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd logowania');
      setLoading(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0f0d]">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=1600')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f0d]/40 to-[#0a0f0d]" />
        <div className="absolute bottom-16 left-16 right-16">
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">Twój serw,<br/>Twój kort.</h2>
          <p className="text-xl text-white/80 font-medium">Najszybszy system rezerwacji kortów tenisowych w mieście.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-12 sm:px-12 bg-gradient-to-br from-[#0a0f0d] via-[#0d1a10] to-[#0a0f0d]">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 text-center lg:text-left">
            <div className="text-5xl mb-4 lg:hidden font-bold text-tennis-400">T</div>
            <h1 className="text-4xl font-extrabold text-[#e8f5ee] tracking-tight flex items-center gap-3 lg:justify-start justify-center">
              <span className="hidden lg:inline text-4xl font-bold text-tennis-400">T</span>
              TennisCourts
            </h1>
            <p className="text-muted text-base mt-2">Zaloguj się, aby zarządzać rezerwacjami.</p>
          </div>

          {/* Test accounts */}
          <div className="card p-5 mb-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Konta testowe — kliknij aby zalogować
          </p>
          <div className="flex flex-col gap-2">
            {TEST_ACCOUNTS.map((acc) => (
              <div key={acc.role} className="flex items-center justify-between rounded-xl bg-[#0a0f0d] border border-[#1e3028] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={acc.badge}>{acc.label}</span>
                  <div>
                    <p className="text-xs text-[#e8f5ee] font-mono">{acc.email}</p>
                    <p className="text-xs text-muted">haslo123</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(acc.email, acc.role + '_email')}
                    className="text-muted hover:text-tennis-400 transition"
                    title="Kopiuj email"
                  >
                    {copied === acc.role + '_email' ? <Check size={13} className="text-tennis-400" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => quickLogin(acc)}
                    className="btn-primary text-xs px-3 py-1.5"
                    disabled={loading}
                  >
                    <LogIn size={12} /> Wejdź
                  </button>
                </div>
              </div>
            ))}
            
            {/* Guest Role */}
            <div className="flex items-center justify-between rounded-xl bg-[#0a0f0d] border border-gray-800/50 px-4 py-2.5 mt-1">
              <div className="flex items-center gap-3">
                <span className="badge-user bg-gray-500/10 text-gray-400 border-gray-500/20">Gość</span>
                <div>
                  <p className="text-xs text-[#e8f5ee]">Konto niezalogowane</p>
                  <p className="text-xs text-muted">Tylko podgląd kortów</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/courts')}
                  className="btn-outline text-xs px-3 py-1.5"
                >
                  Wejdź
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="card p-7">
          <h2 className="text-xl font-bold text-[#e8f5ee] mb-6">Zaloguj się</h2>
          <form onSubmit={login} className="flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="twoj@email.pl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Hasło</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-1" id="login-submit" disabled={loading}>
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Nie masz konta?{' '}
            <Link to="/register" className="text-tennis-400 hover:text-tennis-300 hover:underline font-medium transition-colors">
              Zarejestruj się
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
