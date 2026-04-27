import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api';
import { Layers, DollarSign, Calendar } from 'lucide-react';

const SURFACE_LABEL = { clay: 'Ceglasta', hard: 'Twarda', grass: 'Trawa' };
const SURFACE_COLOR = { clay: 'text-orange-400', hard: 'text-blue-400', grass: 'text-tennis-400' };
const SURFACE_EMOJI = { clay: '🟧', hard: '🟦', grass: '🟩' };

export default function CourtCard({ court, onDeleted }) {
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
    <div className="card p-6 flex flex-col gap-4 hover:border-tennis-700 transition-colors duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-[#e8f5ee] group-hover:text-tennis-400 transition-colors">
            {court.name}
          </h3>
          <span className={`text-sm font-medium ${SURFACE_COLOR[court.surface]}`}>
            {SURFACE_EMOJI[court.surface]} {SURFACE_LABEL[court.surface]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-tennis-400 font-bold text-xl">
          <DollarSign size={16} />
          {Number(court.price_per_hour).toFixed(0)}
          <span className="text-xs text-muted font-normal">/h</span>
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
            onClick={() => navigate('/reservations', { state: { courtId: court.id, courtName: court.name } })}
          >
            Zarezerwuj
          </button>
        ) : (
          <button
            className="btn-outline flex-1 text-sm"
            onClick={() => navigate('/')}
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
  );
}
