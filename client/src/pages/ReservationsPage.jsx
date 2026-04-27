import { useEffect, useState } from 'react';
import api from '../api';
import ReservationForm from '../components/ReservationForm';
import useAuth from '../hooks/useAuth';
import { Calendar, Clock, Trash2, Plus } from 'lucide-react';

const SURFACE_LABEL = { clay: 'Ceglasta', hard: 'Twarda', grass: 'Trawa' };
const SURFACE_COLOR = { clay: 'text-orange-400', hard: 'text-blue-400', grass: 'text-tennis-400' };

export default function ReservationsPage() {
  const { canDelete } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);

  const fetchReservations = () => {
    setLoading(true);
    api.get('/reservations').then(r => setReservations(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Anulować tę rezerwację?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations(rs => rs.filter(r => r.id !== id));
    } catch (e) {
      alert(e.response?.data?.error || 'Błąd anulowania');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('pl-PL', { weekday:'short', day:'numeric', month:'long', year:'numeric' });
  const formatTime = (t) => t?.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#e8f5ee]">Rezerwacje</h1>
          <p className="text-muted text-sm mt-1">
            {canDelete ? 'Wszystkie rezerwacje w systemie' : 'Twoje rezerwacje'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Nowa rezerwacja
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted">Ładowanie rezerwacji…</div>
      ) : reservations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-muted">Brak aktywnych rezerwacji</p>
          <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>Zarezerwuj kort</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reservations.map(r => (
            <div key={r.id} className="card px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-tennis-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-tennis-500/10 border border-tennis-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-tennis-400" />
                </div>
                <div>
                  <p className="font-semibold text-[#e8f5ee]">{r.court_name}</p>
                  {r.surface && (
                    <p className={`text-xs font-medium ${SURFACE_COLOR[r.surface]}`}>{SURFACE_LABEL[r.surface]}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(r.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatTime(r.start_time)} – {formatTime(r.end_time)}
                    </span>
                  </div>
                  {/* MOD/ADMIN view — show user info */}
                  {r.user_name && (
                    <p className="text-xs text-muted mt-1">
                      👤 {r.user_name} ({r.user_email})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {r.price_per_hour && (
                  <span className="badge-green text-xs">
                    {Number(r.price_per_hour).toFixed(0)} PLN/h
                  </span>
                )}
                <button
                  id={`cancel-reservation-${r.id}`}
                  className="btn-danger text-xs px-3 py-1.5"
                  onClick={() => handleCancel(r.id)}
                >
                  <Trash2 size={13} /> Anuluj
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchReservations(); }}
        />
      )}
    </div>
  );
}
