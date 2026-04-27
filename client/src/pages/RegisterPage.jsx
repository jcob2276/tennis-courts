import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      navigate('/courts');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? apiErrors.map(e => e.msg).join(', ') : err.response?.data?.error || 'Błąd rejestracji');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-[#0a0f0d] via-[#0d1a10] to-[#0a0f0d]">
      <div className="mb-8 text-center">
        <div className="text-4xl mb-2">🎾</div>
        <h1 className="text-2xl font-extrabold text-[#e8f5ee]">TennisCourts</h1>
      </div>

      <div className="card w-full max-w-md p-7">
        <h2 className="text-xl font-bold text-[#e8f5ee] mb-6 flex items-center gap-2">
          <UserPlus size={20} className="text-tennis-400" /> Rejestracja
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Imię i nazwisko</label>
            <input
              id="reg-name"
              type="text"
              className="input"
              placeholder="Jan Kowalski"
              value={form.name}
              onChange={set('name')}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="twoj@email.pl"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Hasło</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Min. 6 znaków"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-muted mt-1">Minimum 6 znaków. Nowe konto otrzymuje rolę USER.</p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          <button type="submit" id="reg-submit" className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? 'Rejestruję…' : 'Utwórz konto'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Masz już konto?{' '}
          <Link to="/login" className="text-tennis-400 hover:underline font-medium">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
