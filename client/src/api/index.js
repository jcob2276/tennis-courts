import axios from 'axios';

// Tworzymy instancję Axios - to nasze narzędzie do gadania z backendem.
const api = axios.create({
  // URL serwera (zmieniamy to, gdy wrzucamy projekt do internetu)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// INTERCEPTOR (Przechwytywacz) - REQUEST
// Ta funkcja uruchamia się przed KAŻDYM wysłaniem zapytania do serwera.
// Automatycznie sprawdza czy mamy w przeglądarce (localStorage) token JWT
// i jeśli tak - dokleja go do nagłówka Authorization. 
// Dzięki temu nie musimy o tym pamiętać przy każdym zapytaniu.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// INTERCEPTOR (Przechwytywacz) - RESPONSE
// Ta funkcja uruchamia się po otrzymaniu odpowiedzi z serwera.
// Jeśli serwer powie: "Twój token wygasł (401)", automatycznie wylogowujemy użytkownika.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
