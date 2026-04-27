import { useState, useEffect } from 'react';
import api from '../api';
import { X, CalendarDays, Clock } from 'lucide-react';

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = String(i + 7).padStart(2, '0');
  return `${h}:00`;
}); // 07:00 → 20:00

export default function ReservationForm({ courtId, courtName, onClose, onSuccess }) {
  const [courts, setCourts]       = useState([]);
  const [selectedCourt, setSC]    = useState(courtId || '');
  const [date, setDate]           = useState('');
  const [startTime, setStart]     = useState('');
  const [endTime, setEnd]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!courtId) api.get('/courts').then(r => setCourts(r.data)).catch(() => {});
  }, [courtId]);

  // Ustaw minimalną datę na dziś
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourt || !date || !startTime || !endTime) {
      setError('Uzupełnij wszystkie pola');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reservations', {
        court_id:   Number(selectedCourt),
        date,
        start_time: startTime,
        end_time:   endTime,
      });
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e.response?.data?.error || 'Nie udało się złożyć rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 relative">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-[#e8f5ee]">Nowa rezerwacja</h2>
        {courtName && <p className="text-sm text-muted mb-5">{courtName}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Court select (jeśli nie przekazano) */}
          {!courtId && (
            <div>
              <label className="label">Kort</label>
              <select
                className="input"
                value={selectedCourt}
                onChange={e => setSC(e.target.value)}
              >
                <option value="">Wybierz kort…</option>
                {courts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="label flex items-center gap-1"><CalendarDays size={12} /> Data</label>
            <input
              type="date"
              className="input"
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1"><Clock size={12} /> Od</label>
              <select className="input" value={startTime} onChange={e => setStart(e.target.value)}>
                <option value="">--</option>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Clock size={12} /> Do</label>
              <select className="input" value={endTime} onChange={e => setEnd(e.target.value)}>
                <option value="">--</option>
                {HOURS.filter(h => h > startTime).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 border border-red-500/20 rounded-xl bg-red-500/10 px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Anuluj</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Rezerwuję…' : 'Zarezerwuj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
