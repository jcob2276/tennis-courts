const jwt = require('jsonwebtoken');

/**
 * BRAMKARZ AUTORYZACJI (verifyToken)
 * To middleware sprawdza, czy użytkownik ma prawo wejść na dany endpoint.
 */
const verifyToken = (req, res, next) => {
  // Pobieramy nagłówek "Authorization" z zapytania
  const authHeader = req.headers.authorization;
  
  // Token zazwyczaj przesyłany jest jako "Bearer <token>", więc wyciągamy drugą część
  const token = authHeader?.split(' ')[1]; 

  // Jeśli nie ma tokenu, zatrzymujemy zapytanie i zwracamy błąd 401 (Nieautoryzowany)
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji. Zaloguj się.' });
  }

  try {
    // Próbujemy odszyfrować token przy użyciu naszego tajnego klucza
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Jeśli się udało, dopisujemy dane użytkownika do obiektu 'req'
    // Dzięki temu w kolejnych funkcjach mamy dostęp do 'req.user.id' czy 'req.user.role'
    req.user = decoded;
    
    // Puszczamy zapytanie dalej do właściwej trasy
    next();
  } catch (err) {
    // Jeśli token jest zły, sfałszowany lub wygasł
    res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
};

module.exports = { verifyToken };
