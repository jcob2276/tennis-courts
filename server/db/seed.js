/**
 * db/seed.js — wstawia dane testowe do bazy
 * Uruchom: node db/seed.js
 */
const bcrypt = require('bcrypt');
const { pool, query } = require('./index');

const SALT_ROUNDS = 12;

async function seed() {
  console.log('Rozpoczynam zasilanie bazy danych (Seeding)...\n');

  // Hashujemy hasło 'haslo123'. 
  // Robimy to tylko raz na początku, żeby nie obciążać procesora.
  const hash = await bcrypt.hash('haslo123', SALT_ROUNDS);

  // --- TWORZENIE UŻYTKOWNIKÓW ---
  // Używamy ON CONFLICT DO NOTHING, żeby skrypt się nie wywalił, 
  // jeśli te konta już istnieją w bazie.
  await query(`
    INSERT INTO users (email, password_hash, name, role) VALUES
      ('test_gracz@tennis.pl', $1, 'Test Gracz',      'USER'),
      ('test_mod@tennis.pl',   $1, 'Test Moderator',  'MOD'),
      ('test_admin@tennis.pl', $1, 'Test Admin',       'ADMIN')
    ON CONFLICT (email) DO NOTHING
  `, [hash]);

  // --- TWORZENIE KORTÓW ---
  await query(`
    INSERT INTO courts (name, surface, price_per_hour, description) VALUES
      ('Kort Centralny',    'clay',  80.00,
       'Główny kort z trybuną. Nawierzchnia ceglasta, profesjonalne oświetlenie LED.'),
      ('Kort Twardy nr 1',  'hard',  60.00,
       'Nawierzchnia twarda — idealna do szybkiej gry serwisowej. Dostępny cały dzień.'),
      ('Kort Trawiasty VIP','grass', 100.00,
       'Ekskluzywny kort trawiasty. Rezerwacja minimum 24h wcześniej.')
    ON CONFLICT DO NOTHING
  `);

  console.log('Seed zakończony pomyślnie!\n');
  console.log('Możesz się teraz zalogować na konta testowe (hasło: haslo123)');

  // Zamykamy połączenie z bazą, inaczej skrypt będzie "wisiał" w konsoli
  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
