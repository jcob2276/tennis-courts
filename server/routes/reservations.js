const express = require('express');
const { body, validationResult } = require('express-validator');
const pool    = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// ── GET /api/reservations ───────────────────────────────────────
// USER → swoje | MOD/ADMIN → wszystkie
router.get('/', verifyToken, async (req, res) => {
  try {
    let result;
    if (['MOD', 'ADMIN'].includes(req.user.role)) {
      result = await pool.query(`
        SELECT r.*, u.name AS user_name, u.email AS user_email, c.name AS court_name
        FROM   reservations r
        JOIN   users  u ON r.user_id  = u.id
        JOIN   courts c ON r.court_id = c.id
        WHERE  r.status = 'CONFIRMED'
        ORDER  BY r.date DESC, r.start_time ASC
      `);
    } else {
      result = await pool.query(`
        SELECT r.*, c.name AS court_name, c.surface, c.price_per_hour
        FROM   reservations r
        JOIN   courts c ON r.court_id = c.id
        WHERE  r.user_id = $1 AND r.status = 'CONFIRMED'
        ORDER  BY r.date DESC, r.start_time ASC
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── GET /api/reservations/availability ─────────────────────────
// Zwraca zajęte przedziały czasowe dla danego kortu i daty
router.get('/availability', verifyToken, async (req, res) => {
  try {
    const { court_id, date } = req.query;
    if (!court_id || !date) {
      return res.status(400).json({ error: 'Wymagane parametry court_id oraz date' });
    }
    
    const result = await pool.query(`
      SELECT start_time, end_time 
      FROM reservations 
      WHERE court_id = $1 AND date = $2 AND status = 'CONFIRMED'
    `, [court_id, date]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania dostępności' });
  }
});

// ── POST /api/reservations — USER, MOD, ADMIN ───────────────────
router.post('/', verifyToken, requireRole('USER', 'MOD', 'ADMIN'), [
  body('court_id').isInt({ min: 1 }).withMessage('Nieprawidłowe ID kortu'),
  body('date').isDate().withMessage('Nieprawidłowa data (YYYY-MM-DD)'),
  body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Nieprawidłowa godzina startowa (HH:MM)'),
  body('end_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Nieprawidłowa godzina końcowa (HH:MM)'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { court_id, date, start_time, end_time } = req.body;

  if (start_time >= end_time) {
    return res.status(400).json({ error: 'Godzina końcowa musi być późniejsza niż startowa' });
  }

  try {
    // Sprawdź kolizję terminów
    const conflict = await pool.query(`
      SELECT id FROM reservations
      WHERE  court_id = $1 AND date = $2 AND status = 'CONFIRMED'
        AND  NOT (end_time <= $3 OR start_time >= $4)
    `, [court_id, date, start_time, end_time]);

    if (conflict.rows.length) {
      return res.status(409).json({ error: 'Kort jest już zajęty w tym terminie' });
    }

    const result = await pool.query(
      'INSERT INTO reservations (user_id, court_id, date, start_time, end_time) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, court_id, date, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── DELETE /api/reservations/:id ───────────────────────────────
// USER → tylko swoja | MOD/ADMIN → każda
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reservations WHERE id = $1 AND status = 'CONFIRMED'",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });

    const reservation = result.rows[0];
    if (req.user.role === 'USER' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Możesz anulować tylko własne rezerwacje' });
    }

    await pool.query(
      "UPDATE reservations SET status = 'CANCELLED' WHERE id = $1",
      [req.params.id]
    );
    res.json({ message: 'Rezerwacja anulowana', id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
