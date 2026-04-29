/**
 * BRAMKARZ RÓL (requireRole)
 * Służy do ograniczania dostępu do konkretnych funkcji serwera.
 * Użycie: requireRole('ADMIN') - tylko admin wejdzie.
 */
const requireRole = (...roles) => (req, res, next) => {
  // Sprawdzamy czy wcześniejszy bramkarz (verifyToken) ustalił kim jest użytkownik
  if (!req.user) {
    return res.status(401).json({ error: 'Najpierw musisz się zalogować' });
  }

  // Sprawdzamy czy rola użytkownika (np. 'USER') znajduje się na liście dozwolonych (np. ['ADMIN'])
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Dostęp zabroniony. Ta funkcja wymaga roli: ${roles.join(' lub ')}`
    });
  }

  // Jeśli wszystko się zgadza - idziemy dalej
  next();
};

/**
 * GLOBALNY SYSTEM OBSŁUGI BŁĘDÓW
 * To jest ostatni przystanek każdego zapytania, które "wybuchło" (rzuciło błąd).
 */
const errorHandler = (err, req, res, next) => {
  // Logujemy błąd w konsoli serwera, żeby programista wiedział co się stało
  console.error('--- BŁĄD SERWERA ---');
  console.error(`Ścieżka: ${req.path}`);
  console.error(`Komunikat: ${err.message}`);
  console.error('----------------------');

  // Domyślnie ustawiamy status 500 (Błąd serwera)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Wystąpił nieoczekiwany błąd serwera';

  // --- SPECYFICZNE BŁĘDY BAZY DANYCH ---
  // Jeśli Postgres zwróci kod '23505', oznacza to, że ktoś próbuje dodać coś, co już istnieje (np. ten sam email)
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Ten rekord już istnieje w bazie danych.';
  }

  // Wysyłamy elegancką odpowiedź JSON do frontendu
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = { requireRole, errorHandler };
