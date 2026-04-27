import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourtsPage from './pages/CourtsPage';
import ReservationsPage from './pages/ReservationsPage';
import AdminPage from './pages/AdminPage';
import useAuth from './hooks/useAuth';
import Footer from './components/Footer';

// Protected route — przekieruj gości na login
function Protected({ children, roles }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/courts" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/"            element={<Navigate to="/courts" replace />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/courts"      element={<CourtsPage />} />
            <Route path="/reservations" element={
              <Protected><ReservationsPage /></Protected>
            } />
            <Route path="/admin" element={
              <Protected roles={['ADMIN']}><AdminPage /></Protected>
            } />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/courts" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
