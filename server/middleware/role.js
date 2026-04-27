/**
 * Bramkarz #2 — sprawdza czy zalogowany użytkownik ma właściwą rolę.
 * Użycie: router.delete('/...', verifyToken, requireRole('ADMIN'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nie jesteś zalogowany' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Brak uprawnień. Wymagana rola: ${roles.join(' lub ')}`
    });
  }
  next();
};

module.exports = { requireRole };
