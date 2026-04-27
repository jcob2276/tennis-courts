import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import CourtCard from '../components/CourtCard';
import ReservationForm from '../components/ReservationForm';
import useAuth from '../hooks/useAuth';
import { Search, Plus } from 'lucide-react';

const SURFACES = [
  { value: '',      label: 'Wszystkie' },
  { value: 'clay',  label: '🟧 Ceglasta' },
  { value: 'hard',  label: '🟦 Twarda' },
  { value: 'grass', label: '🟩 Trawa' },
];

export default function CourtsPage() {
  const { canManageCourts } = useAuth();
  const location = useLocation();

  const [courts, setCourts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [surface, setSurface]         = useState('');
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]         = useState({ name:'', surface:'clay', price_per_hour:'', description:'' });
  const [addError, setAddError]       = useState('');
  const [adding, setAdding]           = useState(false);

  // Pre-fill courtId when navigated from CourtCard "Zarezerwuj"
  const preselect = location.state?.courtId;

  const fetchCourts = () => {
    setLoading(true);
    api.get('/courts').then(r => setCourts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourts(); }, []);

  const filtered = courts.filter(c =>
    (!surface || c.surface === surface) &&
    (!search  || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCourt = async (e) => {
    e.preventDefault();
    setAddError(''); setAdding(true);
    try {
      await api.post('/courts', { ...addForm, price_per_hour: Number(addForm.price_per_hour) });
      setShowAddForm(false);
      setAddForm({ name:'', surface:'clay', price_per_hour:'', description:'' });
      fetchCourts();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setAddError(errs ? errs.map(e => e.msg).join(', ') : err.response?.data?.error || 'Błąd');
    } finally { setAdding(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden mb-10 bg-[#0d1a10] border border-[#1e3028]">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1595435934249-5df7ed86e1f0?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f0d] via-[#0a0f0d]/90 to-transparent" />
        <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#e8f5ee] tracking-tight mb-3">Znajdź swój idealny kort</h1>
            <p className="text-muted text-lg">Zarezerwuj jeden z {courts.length} profesjonalnych kortów i ciesz się grą na najwyższym poziomie.</p>
          </div>
          {canManageCourts && (
            <button className="btn-primary whitespace-nowrap shadow-xl shadow-tennis-900/20 h-12 px-6" onClick={() => setShowAddForm(true)}>
              <Plus size={18} className="mr-2" /> Dodaj nowy kort
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Szukaj kortu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {SURFACES.map(s => (
            <button
              key={s.value}
              onClick={() => setSurface(s.value)}
              className={`btn text-xs px-3 py-2 ${surface === s.value ? 'btn-primary' : 'btn-outline'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add court form */}
      {showAddForm && (
        <div className="card p-6 mb-8 border-tennis-700">
          <h3 className="font-bold text-[#e8f5ee] mb-4 flex items-center gap-2">
            <Plus size={16} className="text-tennis-400" /> Nowy kort
          </h3>
          <form onSubmit={handleAddCourt} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nazwa</label>
              <input className="input" value={addForm.name} onChange={e => setAddForm(f=>({...f, name:e.target.value}))} required />
            </div>
            <div>
              <label className="label">Nawierzchnia</label>
              <select className="input" value={addForm.surface} onChange={e => setAddForm(f=>({...f, surface:e.target.value}))}>
                <option value="clay">Ceglasta</option>
                <option value="hard">Twarda</option>
                <option value="grass">Trawa</option>
              </select>
            </div>
            <div>
              <label className="label">Cena za godzinę (PLN)</label>
              <input type="number" className="input" min="1" value={addForm.price_per_hour} onChange={e => setAddForm(f=>({...f, price_per_hour:e.target.value}))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Opis (opcjonalnie)</label>
              <textarea className="input resize-none h-20" value={addForm.description} onChange={e => setAddForm(f=>({...f, description:e.target.value}))} />
            </div>
            {addError && <div className="sm:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{addError}</div>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" className="btn-ghost" onClick={() => setShowAddForm(false)}>Anuluj</button>
              <button type="submit" className="btn-primary" disabled={adding}>{adding ? 'Dodaję…' : 'Dodaj kort'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-muted">Ładowanie kortów…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">Brak kortów spełniających kryteria</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              onDeleted={id => setCourts(cs => cs.filter(c => c.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Reservation modal */}
      {(showForm || preselect) && (
        <ReservationForm
          courtId={preselect}
          courtName={courts.find(c => c.id === preselect)?.name}
          courtPrice={courts.find(c => c.id === preselect)?.price_per_hour}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); }}
        />
      )}
    </div>
  );
}
