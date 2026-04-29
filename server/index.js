// --- KONFIGURACJA ŚRODOWISKA ---
// Wczytujemy zmienne z pliku .env (np. hasła do bazy). 
// Dzięki temu nie wpisujemy ich bezpośrednio w kodzie, co jest bezpieczniejsze.
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const app  = express();
// Port pobieramy z systemu (np. na Railway) lub domyślnie 3001
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE (Bramkarze i Tłumacze) ---

// CORS (Cross-Origin Resource Sharing) 
// Blokada przeglądarki, która pozwala tylko naszej stronie (frontendowi) rozmawiać z tym serwerem.
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Pozwalamy na przesyłanie tokenów/ciasteczek
}));

// Tłumacz JSON - Express domyślnie nie rozumie danych wysyłanych w formularzach JSON.
// Ta linia sprawia, że dane trafiają do 'req.body'.
app.use(express.json());

// --- TRASY (Routing) ---
// Tutaj definiujemy, które pliki obsługują jakie adresy URL (endpointy).
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/courts',       require('./routes/courts'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/weather',      require('./routes/weather'));

// Prosty "Health Check" - służy do sprawdzenia czy serwer w ogóle żyje.
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// --- OBSŁUGA BŁĘDÓW (Error Handling) ---

// 404 - Jeśli ktoś wpisze adres, którego nie ma, np. /api/pizza
app.use((_req, res) => res.status(404).json({ error: 'Endpoint nie istnieje' }));

// Globalny handler błędów - tu lądują wszystkie błędy z asynchronicznych tras (asyncHandler).
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Odpalenie silnika serwera na danym porcie.
app.listen(PORT, () => {
  console.log(`Server running -> http://localhost:${PORT}`);
  console.log(`Health check  -> http://localhost:${PORT}/api/health`);
});
