import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourtsPage from './pages/CourtsPage';
import ReservationsPage from './pages/ReservationsPage';
import AdminPage from './pages/AdminPage';
import useAuth from './hooks/useAuth';
import Footer from './components/Footer';

// KOMPONENT CHRONIONY (Protected)
// To jest specjalna funkcja, która pilnuje dostępu do podstron.
// Jeśli ktoś nie jest zalogowany, a próbuje wejść na /reservations - przekieruje go do logowania.
function Protected({ children, roles }) {
  const { user, role } = useAuth();
  
  // Jeśli brak użytkownika - wracaj na login
  if (!user) return <Navigate to="/login" replace />;
  
  // Jeśli użytkownik ma zbyt niską rolę (np. gracz chce wejść do admina) - wracaj na korty
  if (roles && !roles.includes(role)) return <Navigate to="/courts" replace />;
  
  // Jeśli wszystko OK - wyświetl zawartość strony
  return children;
}

export default function App() {
  return (
    // BrowserRouter - umożliwia nawigację bez przeładowania strony (SPA)
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Definicja ścieżek URL i komponentów, które mają się na nich wyświetlać */}
            <Route path="/"            element={<Navigate to="/courts" replace />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/courts"      element={<CourtsPage />} />
            
            {/* Strony dostępne tylko po zalogowaniu */}
            <Route path="/reservations" element={
              <Protected><ReservationsPage /></Protected>
            } />
            
            {/* Strona dostępna tylko dla ADMINA */}
            <Route path="/admin" element={
              <Protected roles={['ADMIN']}><AdminPage /></Protected>
            } />
            
            {/* Każdy inny adres (np. błąd w URL) kieruje na listę kortów */}
            <Route path="*" element={<Navigate to="/courts" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
