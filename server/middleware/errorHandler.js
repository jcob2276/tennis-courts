/**
 * Globalny Error Handler. 
 * To ostatni przystanek każdego zapytania, które zakończyło się błędem.
 */
const errorHandler = (err, req, res, next) => {
  console.error('--- BACKEND ERROR ---');
  console.error(`Path: ${req.path}`);
  console.error(`Message: ${err.message}`);
  console.error(err.stack); // Wyświetli stack trace tylko w konsoli (dla dewelopera)
  console.error('----------------------');

  // Domyślny status
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Wystąpił nieoczekiwany błąd serwera';

  // Obsługa specyficznych błędów (np. Postgres / JWT)
  if (err.code === '23505') { // PostgreSQL: Unique Violation
    statusCode = 409;
    message = 'Ten rekord już istnieje w bazie.';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
