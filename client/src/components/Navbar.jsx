import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api';
import { CloudSun, Zap, LogOut, Menu, X } from 'lucide-react';

const ROLE_LABELS = { USER: 'Gracz', MOD: 'Moderator', ADMIN: 'Admin' };
const ROLE_CLASS  = { USER: 'badge-user', MOD: 'badge-mod', ADMIN: 'badge-admin' };

export default function Navbar() {
  const { user, role, isGuest } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    api.get('/weather?city=Warsaw').then(r => setWeather(r.data)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e3028] bg-[#0a0f0d]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-tennis-400 text-lg">
          <span className="text-2xl">🎾</span>
          <span>TennisCourts</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/courts" className="text-muted hover:text-tennis-400 transition">Korty</Link>
          {!isGuest && <Link to="/reservations" className="text-muted hover:text-tennis-400 transition">Rezerwacje</Link>}
          {role === 'ADMIN' && <Link to="/admin" className="text-muted hover:text-tennis-400 transition">Admin</Link>}

          {/* Weather badge */}
          {weather && (
            <span className="flex items-center gap-2 text-sm text-[#e8f5ee] bg-[#0d1a10] border border-[#1e3028] rounded-lg px-4 py-1.5 shadow-sm">
              <CloudSun size={18} className={weather.playable ? "text-tennis-400" : "text-gray-400"} />
              <span className="font-semibold">{weather.temp}°C</span>
              <span className="text-muted hidden lg:inline">· {weather.description}</span>
              {weather.playable && <Zap size={14} className="text-tennis-400 ml-1" title="Idealne warunki do gry" />}
            </span>
          )}

          {isGuest ? (
            <Link to="/" className="btn-primary text-xs px-4 py-2">Zaloguj się</Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className={ROLE_CLASS[role]}>{ROLE_LABELS[role]}</span>
              <span className="text-xs text-muted">{user.name}</span>
              <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
                <LogOut size={13} /> Wyloguj
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-muted" onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#1e3028] bg-[#0a0f0d] px-4 py-4 flex flex-col gap-3 text-sm">
          <Link to="/courts" onClick={() => setOpen(false)} className="text-muted hover:text-tennis-400">Korty</Link>
          {!isGuest && <Link to="/reservations" onClick={() => setOpen(false)} className="text-muted hover:text-tennis-400">Rezerwacje</Link>}
          {role === 'ADMIN' && <Link to="/admin" onClick={() => setOpen(false)} className="text-muted hover:text-tennis-400">Admin</Link>}
          {!isGuest && <button onClick={logout} className="btn-ghost text-xs self-start">Wyloguj</button>}
        </div>
      )}
    </nav>
  );
}
