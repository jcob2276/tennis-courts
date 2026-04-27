require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/courts',       require('./routes/courts'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/weather',      require('./routes/weather'));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Endpoint nie istnieje' }));

app.listen(PORT, () => {
  console.log(`🎾 Server running → http://localhost:${PORT}`);
  console.log(`📋 Health check  → http://localhost:${PORT}/api/health`);
});
