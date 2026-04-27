import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api';
import { Layers, DollarSign, Calendar } from 'lucide-react';

const SURFACE_LABEL = { clay: 'Ceglasta', hard: 'Twarda', grass: 'Trawa' };
const SURFACE_COLOR = { clay: 'text-orange-400', hard: 'text-blue-400', grass: 'text-tennis-400' };
const SURFACE_EMOJI = { clay: '🟧', hard: '🟦', grass: '🟩' };
const SURFACE_BORDER = { clay: 'border-orange-500/30 hover:border-orange-500/80', hard: 'border-blue-500/30 hover:border-blue-500/80', grass: 'border-tennis-500/30 hover:border-tennis-500/80' };
const SURFACE_IMAGE = {
  clay: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=600',
  hard: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600',
  grass: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=600'
};

export default function CourtCard({ court, onDeleted, onReserve }) {
  const { isGuest, canManageCourts } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Usunąć kort "${court.name}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/courts/${court.id}`);
      onDeleted?.(court.id);
    } catch (e) {
      alert(e.response?.data?.error || 'Błąd usuwania kortu');
      setDeleting(false);
    }
  };

  return (
    <div className={`card flex flex-col hover:-translate-y-1 transition-all duration-300 overflow-hidden border ${SURFACE_BORDER[court.surface]} group`}>
      {/* Image */}
      <div 
        className="h-48 w-full bg-cover bg-center border-b border-[#1e3028]"
        style={{ backgroundImage: `url(${court.image_url || SURFACE_IMAGE[court.surface]})` }}
      />
      
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-xl text-[#e8f5ee] group-hover:text-tennis-400 transition-colors">
              {court.name}
            </h3>
            <span className={`text-sm font-medium ${SURFACE_COLOR[court.surface]}`}>
              {SURFACE_EMOJI[court.surface]} {SURFACE_LABEL[court.surface]}
            </span>
          </div>
          <div className="flex items-end flex-col">
            <span className="text-tennis-400 font-extrabold text-2xl leading-none">
              {Number(court.price_per_hour).toFixed(0)} <span className="text-base">zł</span>
            </span>
            <span className="text-xs text-muted font-normal mt-1">za godzinę</span>
          </div>
        </div>

      {/* Description */}
      {court.description && (
        <p className="text-sm text-muted leading-relaxed">{court.description}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><Layers size={12} /> Nawierzchnia</span>
        <span className="flex items-center gap-1"><Calendar size={12} /> Dostępny</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[#1e3028]">
        {!isGuest ? (
          <button
            className="btn-primary flex-1 text-sm"
            onClick={() => onReserve(court.id)}
          >
            Zarezerwuj
          </button>
        ) : (
          <button
            className="btn-outline flex-1 text-sm"
            onClick={() => navigate('/login')}
          >
            Zaloguj się, by zarezerwować
          </button>
        )}

        {canManageCourts && (
          <button
            className="btn-danger px-3"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '...' : 'Usuń'}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
