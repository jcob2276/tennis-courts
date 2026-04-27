const jwt = require('jsonwebtoken');

/**
 * Bramkarz #1 — sprawdza czy request ma prawidłowy JWT token.
 * Dodaje req.user = { id, email, name, role } dla kolejnych middleware.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
};

module.exports = { verifyToken };
