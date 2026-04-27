import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { Users, Calendar, LayoutGrid, Trash2 } from 'lucide-react';

const ROLE_BADGE = { USER: 'badge-user', MOD: 'badge-mod', ADMIN: 'badge-admin' };
const ROLE_LABEL = { USER: 'Gracz', MOD: 'Moderator', ADMIN: 'Admin' };

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate     = useNavigate();

  const [courts, setCourts]           = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tab, setTab]                 = useState('overview');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/courts'); return; }
    Promise.all([
      api.get('/courts'),
      api.get('/reservations'),
    ]).then(([c, r]) => {
      setCourts(c.data);
      setReservations(r.data);
    }).finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const cancelReservation = async (id) => {
    if (!confirm('Anulować rezerwację?')) return;
    await api.delete(`/reservations/${id}`);
    setReservations(rs => rs.filter(r => r.id !== id));
  };

  const deleteCourt = async (id) => {
    if (!confirm('Usunąć kort?')) return;
    await api.delete(`/courts/${id}`);
    setCourts(cs => cs.filter(c => c.id !== id));
  };

  if (loading) return <div className="flex justify-center py-24 text-muted">Ładowanie panelu admina…</div>;

  const stats = [
    { icon: <LayoutGrid size={22} className="text-tennis-400" />, label: 'Korty aktywne',   value: courts.length },
    { icon: <Calendar   size={22} className="text-blue-400"   />, label: 'Rezerwacje dziś', value: reservations.filter(r => r.date?.slice(0,10) === new Date().toISOString().slice(0,10)).length },
    { icon: <Calendar   size={22} className="text-amber-400"  />, label: 'Łącznie aktywnych', value: reservations.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#e8f5ee] flex items-center gap-3">
          <span className="badge-admin text-sm px-3 py-1">ADMIN</span>
          Panel administracyjny
        </h1>
        <p className="text-muted text-sm mt-1">Zarządzaj kortami i rezerwacjami</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#0a0f0d] border border-[#1e3028] flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e8f5ee]">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key:'courts', label:'Korty' },
          { key:'reservations', label:'Rezerwacje' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`btn text-sm px-5 ${tab === t.key ? 'btn-primary' : 'btn-outline'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Courts table */}
      {tab === 'courts' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e3028] bg-[#0a0f0d]">
              <tr>
                <th className="text-left px-5 py-3 text-muted font-medium">Nazwa</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Nawierzchnia</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Cena/h</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {courts.map(c => (
                <tr key={c.id} className="border-b border-[#1e3028] hover:bg-[#0d1a10] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#e8f5ee]">{c.name}</td>
                  <td className="px-5 py-3 capitalize text-muted">{c.surface}</td>
                  <td className="px-5 py-3 text-tennis-400 font-semibold">{Number(c.price_per_hour).toFixed(0)} PLN</td>
                  <td className="px-5 py-3 text-right">
                    <button className="btn-danger text-xs px-3 py-1.5" onClick={() => deleteCourt(c.id)}>
                      <Trash2 size={12} /> Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservations table */}
      {tab === 'reservations' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e3028] bg-[#0a0f0d]">
              <tr>
                <th className="text-left px-5 py-3 text-muted font-medium">Użytkownik</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Kort</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Data</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Godziny</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id} className="border-b border-[#1e3028] hover:bg-[#0d1a10] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-[#e8f5ee] font-medium">{r.user_name}</p>
                    <p className="text-xs text-muted">{r.user_email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">{r.court_name}</td>
                  <td className="px-5 py-3 text-muted">{new Date(r.date).toLocaleDateString('pl-PL')}</td>
                  <td className="px-5 py-3 text-muted">{r.start_time?.slice(0,5)} – {r.end_time?.slice(0,5)}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="btn-danger text-xs px-3 py-1.5" onClick={() => cancelReservation(r.id)}>
                      <Trash2 size={12} /> Anuluj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
