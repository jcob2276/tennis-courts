const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Tworzymy "Pool" - to jest pula połączeń. 
// Zamiast otwierać nowe połączenie do bazy przy każdym zapytaniu (co jest wolne),
// serwer trzyma kilka otwartych i używa ich wielokrotnie.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Ważne: Chmury typu Railway wymagają SSL (szyfrowania) dla połączeń z zewnątrz.
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.NODE_ENV === 'production' 
       ? { rejectUnauthorized: false } 
       : false
});

// Ułatwienie: query to funkcja, którą będziemy importować w trasach.
const query = async (text, params) => {
  return await pool.query(text, params);
};

// AUTO-INICJALIZACJA BAZY
// To jest sprytny mechanizm, który sprawdza czy tabele istnieją.
// Jeśli nie (np. przy pierwszym uruchomieniu na serwerze), sam je stworzy.
async function initDb() {
  try {
    // Sprawdzamy czy istnieje tabela 'users'
    const res = await pool.query("SELECT to_regclass('public.users') as exists");
    
    if (!res.rows[0].exists) {
      console.log('--- Inicjalizacja bazy danych (PostgreSQL) ---');
      
      // Wczytujemy przepis na bazę z pliku schema.sql
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      
      console.log('--- Tworzenie kont testowych ---');
      const hash = await bcrypt.hash('haslo123', 10);
      
      const addU = 'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)';
      await pool.query(addU, ['test_gracz@tennis.pl', hash, 'Test Gracz', 'USER']);
      await pool.query(addU, ['test_mod@tennis.pl', hash, 'Test Moderator', 'MOD']);
      await pool.query(addU, ['test_admin@tennis.pl', hash, 'Test Admin', 'ADMIN']);

      const addC = 'INSERT INTO courts (name, surface, price_per_hour, description) VALUES ($1, $2, $3, $4)';
      await pool.query(addC, ['Kort Centralny', 'clay', 80, 'Główny kort z trybuną. Ceglasta nawierzchnia.']);
      await pool.query(addC, ['Kort Twardy nr 1', 'hard', 60, 'Szybka nawierzchnia twarda.']);
      
      console.log('Baza danych gotowa do pracy!');
    } else {
      console.log('Połączono z bazą PostgreSQL.');
    }
  } catch (err) {
    console.error('BŁĄD POŁĄCZENIA Z BAZĄ:', err.message);
  }
}

// Uruchamiamy sprawdzanie bazy przy starcie serwera
initDb();

module.exports = {
  query,
  pool
};
