const db = require('better-sqlite3')('./db/tennis.db');
console.log('=== USERS ===');
db.prepare('SELECT id, email, role FROM users').all().forEach(u => console.log(u));
console.log('\n=== COURTS ===');
db.prepare('SELECT id, name, surface, is_active FROM courts').all().forEach(c => console.log(c));
console.log('\n=== RESERVATIONS ===');
db.prepare('SELECT id, user_id, court_id, date, start_time, end_time, status FROM reservations').all().forEach(r => console.log(r));
db.close();
