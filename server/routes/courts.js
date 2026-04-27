const express = require('express');
const { body, validationResult } = require('express-validator');
const pool    = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// ── GET /api/courts — publiczne ─────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM courts WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── GET /api/courts/:id — publiczne ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM courts WHERE id = $1 AND is_active = TRUE',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Kort nie znaleziony' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── POST /api/courts — tylko ADMIN ─────────────────────────────
router.post('/', verifyToken, requireRole('ADMIN'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Nazwa musi mieć min. 2 znaki'),
  body('surface').isIn(['clay', 'hard', 'grass']).withMessage('Nieprawidłowa nawierzchnia (clay/hard/grass)'),
  body('price_per_hour').isNumeric().withMessage('Cena musi być liczbą'),
  body('description').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, surface, price_per_hour, description, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courts (name, surface, price_per_hour, description, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, surface, price_per_hour, description || null, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── DELETE /api/courts/:id — tylko ADMIN (soft delete) ─────────
router.delete('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE courts SET is_active = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Kort nie znaleziony' });
    res.json({ message: 'Kort usunięty', id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
