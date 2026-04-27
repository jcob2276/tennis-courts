import { useState, useEffect } from 'react';
import api from '../api';
import { X, CalendarDays, Clock, Check } from 'lucide-react';

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = String(i + 7).padStart(2, '0');
  return `${h}:00`;
});

const DURATIONS = [1, 1.5, 2];

export default function ReservationForm({ courtId, courtName, courtPrice, onClose, onSuccess }) {
  const [courts, setCourts]       = useState([]);
  const [selectedCourt, setSC]    = useState(courtId || '');
  
  const today = new Date();
  const initialDate = today.toISOString().split('T')[0];
  const [date, setDate]           = useState(initialDate);
  const [startTime, setStart]     = useState('');
  const [duration, setDuration]   = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!courtId) api.get('/courts').then(r => setCourts(r.data)).catch(() => {});
  }, [courtId]);

  useEffect(() => {
    if (selectedCourt && date) {
      api.get('/reservations/availability', { params: { court_id: selectedCourt, date } })
        .then(res => setBookedSlots(res.data))
        .catch(() => setBookedSlots([]));
    }
  }, [selectedCourt, date]);

  // Array dni usunięto zgodnie z prośbą o prosty kalendarz

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourt || !date || !startTime || !duration) {
      setError('Uzupełnij wszystkie pola');
      return;
    }
    
    // Obliczanie czasu końcowego z uwzględnieniem połówkowych godzin
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration * 60;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

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
      setError(e.response?.data?.error || 'Nie udało się złożyć rezerwacji (możliwy konflikt)');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourtObj = courtId ? { price_per_hour: courtPrice } : courts.find(c => c.id === Number(selectedCourt));
  const price = selectedCourtObj ? Number(selectedCourtObj.price_per_hour) * duration : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="card w-full max-w-2xl p-6 sm:p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white p-2">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-1 text-[#e8f5ee]">Nowa rezerwacja</h2>
        {courtName && <p className="text-sm text-tennis-400 font-medium mb-6">{courtName}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {!courtId && (
            <div>
              <label className="label mb-2">Kort</label>
              <select className="input" value={selectedCourt} onChange={e => setSC(e.target.value)}>
                <option value="">Wybierz kort…</option>
                {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Kalendarz */}
          <div>
            <label className="label mb-3 flex items-center gap-1"><CalendarDays size={14} /> Wybierz dzień</label>
            <input
              type="date"
              min={initialDate}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input w-full sm:w-1/2 cursor-pointer bg-[#0d1a10] border-[#1e3028] text-[#e8f5ee] focus:border-tennis-500 focus:ring-1 focus:ring-tennis-500 transition-colors"
            />
          </div>

          {/* Czas i Długość trwania */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="label mb-3 flex items-center gap-1"><Clock size={14} /> Czas rozpoczęcia</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {HOURS.map(h => {
                  const disabled = bookedSlots.some(slot => {
                    const [sh, sm] = h.split(':').map(Number);
                    const reqStartMins = sh * 60 + sm;
                    const reqEndMins = reqStartMins + duration * 60;
                    
                    const [bsh, bsm] = slot.start_time.split(':').map(Number);
                    const bookedStartMins = bsh * 60 + bsm;
                    
                    const [beh, bem] = slot.end_time.split(':').map(Number);
                    const bookedEndMins = beh * 60 + bem;
                    
                    return !(reqEndMins <= bookedStartMins || reqStartMins >= bookedEndMins);
                  });

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={disabled}
                      onClick={() => setStart(h)}
                      className={`py-2 text-sm rounded-xl border transition-all ${
                        disabled 
                          ? 'bg-gray-800/10 border-gray-800/30 text-gray-600 cursor-not-allowed opacity-40'
                          : startTime === h 
                            ? 'bg-tennis-500 text-white border-tennis-500 font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                            : 'bg-[#0a0f0d] border-[#1e3028] text-muted hover:border-tennis-700 hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:w-1/3">
              <label className="label mb-3">Czas trwania</label>
              <div className="flex flex-col gap-2">
                {DURATIONS.map(dur => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-3.5 text-sm rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      duration === dur ? 'bg-[#0d1a10] border-tennis-500 text-tennis-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-[#0a0f0d] border-[#1e3028] text-muted hover:border-tennis-700 hover:text-white'
                    }`}
                  >
                    {duration === dur && <Check size={16} />} {dur} h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 border border-red-500/20 rounded-xl bg-red-500/10 px-4 py-3">
              {error}
            </div>
          )}

          {/* Podsumowanie i potwierdzenie */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pt-6 border-t border-[#1e3028]">
            <div>
              <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wide">Całkowity koszt</p>
              <p className="text-3xl font-extrabold text-[#e8f5ee]">
                {price > 0 ? `${price} zł` : '--'}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 sm:flex-none px-6 py-3">Anuluj</button>
              <button type="submit" className="btn-primary flex-1 sm:flex-none px-8 py-3 text-sm" disabled={loading}>
                {loading ? 'Rezerwuję…' : 'Zarezerwuj teraz'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
