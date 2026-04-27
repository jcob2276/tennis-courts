/**
 * useAuth — dekoduje JWT z localStorage.
 * JWT payload to base64 — nie potrzebujemy biblioteki do odczytu.
 */
const useAuth = () => {
  const token = localStorage.getItem('token');

  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]));
      // Sprawdź wygaśnięcie
      if (user.exp && user.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        user = null;
      }
    } catch {
      localStorage.removeItem('token');
    }
  }

  return {
    user,
    token,
    role:     user?.role ?? null,
    isGuest:  !user,
    isUser:   user?.role === 'USER',
    isMod:    user?.role === 'MOD',
    isAdmin:  user?.role === 'ADMIN',
    canDelete: ['MOD', 'ADMIN'].includes(user?.role),
    canManageCourts: user?.role === 'ADMIN',
  };
};

export default useAuth;
