-- =============================================================
-- Tennis Courts Reservation System — Database Schema
-- Uruchom: psql -U postgres -d tennis_courts -f db/schema.sql
-- =============================================================

-- Drop existing tables (clean setup)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'USER'
                CHECK (role IN ('USER', 'MOD', 'ADMIN')),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- COURTS
-- ─────────────────────────────────────────
CREATE TABLE courts (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  surface        VARCHAR(20)  NOT NULL
                 CHECK (surface IN ('clay', 'hard', 'grass')),
  price_per_hour DECIMAL(10,2) NOT NULL,
  description    TEXT,
  image_url      VARCHAR(500),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RESERVATIONS
-- ─────────────────────────────────────────
CREATE TABLE reservations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id   INTEGER NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  status     VARCHAR(20) DEFAULT 'CONFIRMED'
             CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reservations_court_date ON reservations(court_id, date);
CREATE INDEX idx_reservations_user_id    ON reservations(user_id);
CREATE INDEX idx_users_email             ON users(email);
