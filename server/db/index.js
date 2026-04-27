const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway często wymaga ssl dla połączeń zewnętrznych
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.NODE_ENV === 'production' 
       ? { rejectUnauthorized: false } 
       : false
});

// Własny wrapper ułatwiający przejście z SQLite, ale i tak używamy czystego pg
const query = async (text, params) => {
  return await pool.query(text, params);
};

// Auto-inicjalizacja bazy przy starcie serwera (przydatne na Railway)
async function initDb() {
  try {
    const res = await pool.query("SELECT to_regclass('public.users') as exists");
    if (!res.rows[0].exists) {
      console.log('🌱 Inicjalizacja schematu bazy danych (PostgreSQL)...');
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      
      console.log('🌱 Tworzenie danych testowych (seed)...');
      const hash = await bcrypt.hash('haslo123', 10);
      
      const addU = 'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)';
      await pool.query(addU, ['test_gracz@tennis.pl', hash, 'Test Gracz', 'USER']);
      await pool.query(addU, ['test_mod@tennis.pl', hash, 'Test Moderator', 'MOD']);
      await pool.query(addU, ['test_admin@tennis.pl', hash, 'Test Admin', 'ADMIN']);

      const addC = 'INSERT INTO courts (name, surface, price_per_hour, description) VALUES ($1, $2, $3, $4)';
      await pool.query(addC, ['Kort Centralny', 'clay', 80, 'Główny kort z trybuną. Ceglasta nawierzchnia, oświetlenie LED.']);
      await pool.query(addC, ['Kort Twardy nr 1', 'hard', 60, 'Nawierzchnia twarda — idealna do szybkiej gry serwisowej.']);
      await pool.query(addC, ['Kort Trawiasty VIP', 'grass', 100, 'Ekskluzywny kort trawiasty. Rezerwacja min. 24h wcześniej.']);
      
      console.log('✅ Baza PostgreSQL gotowa! test_gracz / test_mod / test_admin — hasło: haslo123');
    } else {
      console.log('✅ Baza PostgreSQL znaleziona i podłączona.');
    }
  } catch (err) {
    console.error('❌ Błąd połączenia z PostgreSQL:', err.message);
    console.error('Sprawdź DATABASE_URL w pliku .env!');
  }
}

// Inicjuj bazę od razu po załadowaniu modułu
initDb();

module.exports = {
  query,
  pool
};
