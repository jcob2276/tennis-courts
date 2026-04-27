# 🤖 Context for AI Assistants (TennisCourts)

This file serves as the primary system prompt and context reference for any AI agent or LLM working on this repository. Read this entirely before making architectural changes.

## 🏗 System Architecture Overview

TennisCourts is a production-ready, full-stack web application designed for booking tennis courts. It strictly follows a decoupled client-server architecture.

### 1. Frontend (Client)
- **Tech Stack:** React 19, Vite, Tailwind CSS, Radix UI primitives, Lucide React (icons).
- **Directory:** `/client`
- **Hosting:** **Vercel**
  - **Why Vercel?** It provides instant CI/CD for frontend applications. 
  - **Crucial Config:** `client/vercel.json` is used to configure routing. Specifically, it uses `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]` to ensure React Router handles deep links (Single Page Application fallback) without throwing 404 errors on Vercel's edge network.
- **Key UX Patterns:** 
  - Brutalist/Dark UI (`#0a0f0d` backgrounds, neon green/tennis accents).
  - *One-Click Booking:* Native HTML inputs (`<select>`, `<input type="date">`) were intentionally replaced with modern React grids (e.g., horizontal date scrolling, duration toggle buttons).
  - *State Management:* React Router's state and local component state (`useState`) are preferred over complex state libraries like Redux to keep the MVP lightweight.

### 2. Backend (Server)
- **Tech Stack:** Node.js, Express.js, `pg` (PostgreSQL client), `jsonwebtoken`, `bcrypt`.
- **Directory:** `/server`
- **Hosting:** **Railway** (or Render/Heroku)
  - **Why Railway?** It provides a persistent Node.js environment and automatically provisions a managed PostgreSQL database. 
  - **Crucial Behavior:** Railway automatically runs `npm start` (`node index.js`). We rely on the `server/db/index.js` auto-initialization script to seed the database upon startup if the `users` table does not exist.
  - **CORS:** The backend uses `cors` middleware, strictly allowing the frontend domain (`CLIENT_URL` env variable) to make requests.

### 3. Database (PostgreSQL)
- **Schema:** Defined in `server/db/schema.sql`.
- **Logic:** The DB schema acts as the final line of defense using hard constraints:
  - `CHECK (role IN ('USER', 'MOD', 'ADMIN'))`
  - `UNIQUE (email)`
  - `ON DELETE CASCADE` for relations.
- **Connection:** Uses `DATABASE_URL` via the `pg` library. Explicitly uses `ssl: { rejectUnauthorized: false }` for production connections to managed DBs (like Railway's).

---

## 🔐 Security & Data Flow

The application implements a strict **3-Layer Validation Strategy**:
1. **Frontend:** React form validation and UI constraints (e.g., preventing selecting dates in the past).
2. **Backend Middleware:** `express-validator` on Express routes sanitizes and validates `req.body` before hitting the database.
3. **Database Constraints:** SQL schema guarantees data integrity.

### Authentication & RBAC (Role-Based Access Control)
- **Stateless JWT:** Passwords are hashed via `bcrypt` (12 rounds). The server issues a JWT token. The client stores it in `localStorage` and attaches it via the `Authorization: Bearer <token>` header.
- **Roles:**
  - `Guest` (Unauthenticated) - Can view courts and weather.
  - `USER` - Can book courts and cancel *their own* bookings.
  - `MOD` - Can cancel *any* booking.
  - `ADMIN` - Has access to the Admin Dashboard, can add/soft-delete courts, and cancel any booking.
- **Middlewares:** `server/middleware/auth.js` (`verifyToken`) handles authentication. `server/middleware/role.js` (`requireRole`) handles authorization.

---

## ☁️ External Integrations

### OpenWeatherMap API
- **Endpoint:** `server/routes/weather.js`
- **Purpose:** Fetches real-time weather for 'Warsaw'.
- **Resilience Design:** If the `WEATHER_API_KEY` is invalid, missing, or rate-limited, the server implements an **intelligent mock fallback**. It will generate pseudo-random realistic weather data and append `isMock: true` so the application never crashes due to external API failures.

---

## 🛠 AI Development Guidelines for this project

1. **Do not use native HTML form controls** (`<select>`, `<input type="date">`, `<input type="time">`) for core user flows. The app uses custom UI grids for better UX.
2. **Maintain the styling:** Use Tailwind utility classes. The primary background is `#0a0f0d`, borders are `#1e3028`, and the primary brand color is `tennis-400` / `tennis-500` (neon green defined in `tailwind.config.js`).
3. **Database Changes:** If you change the database schema, update `server/db/schema.sql` AND update the auto-initialization logic in `server/db/index.js` to drop/recreate or migrate tables. 
4. **Environment Variables:** Never hardcode API keys or DB URLs. Always use `process.env`.
5. **Reservations Logic:** `end_time` is intentionally NOT selected by the user. The frontend (`ReservationForm.jsx`) calculates `end_time` by adding the user's selected `duration` to the `start_time` and sends it to the backend. The backend enforces collision detection via SQL overlap queries.
