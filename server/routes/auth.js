const express   = require('express');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool      = require('../db');

const router      = express.Router();
const SALT_ROUNDS = 12;
const TOKEN_TTL   = '7d';

// ── POST /api/auth/register ─────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Nieprawidłowy email'),
  body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć min. 6 znaków'),
  body('name').trim().isLength({ min: 2 }).withMessage('Imię musi mieć min. 2 znaki'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje' });
    }

    const hash   = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id,email,name,role',
      [email, hash, name, 'USER']
    );
    const user  = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Nieprawidłowy email'),
  body('password').notEmpty().withMessage('Hasło jest wymagane'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user   = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
