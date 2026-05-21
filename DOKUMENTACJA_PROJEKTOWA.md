# Dokumentacja Projektowa — System TennisCourts

## 1. Wymagania Funkcjonalne

Aplikacja służy do rezerwacji kortów tenisowych online. Funkcje dostępne zależą od roli użytkownika:

- **Gość (niezalogowany):** przeglądanie listy kortów, podgląd nawierzchni i cen, podgląd pogody.
- **Gracz (USER):** rejestracja konta, logowanie, rezerwacja kortu w wybranym przedziale czasowym, podgląd i anulowanie własnych rezerwacji.
- **Moderator (MOD):** wszystko co USER + widok rezerwacji wszystkich użytkowników w systemie.
- **Administrator (ADMIN):** wszystko co MOD + dodawanie nowych kortów, dezaktywacja kortów, anulowanie dowolnej rezerwacji, dostęp do panelu statystyk.

---

## 2. Architektura Systemu

Aplikacja podzielona jest na dwie niezależnie wdrożone warstwy:

- **Frontend:** React + Vite + Tailwind CSS — hostowany na **Vercel**
- **Backend:** Node.js + Express.js — hostowany na **Railway**
- **Baza danych:** PostgreSQL — hostowana na **Railway** (managed)
- **Komunikacja:** REST API, format JSON, biblioteka Axios po stronie klienta
- **Autoryzacja:** tokeny JWT (bezstanowa, stateless)
- **Zewnętrzne API:** OpenWeatherMap — aktualna pogoda dla lokalizacji kortów

Każdy `git push` na branch `main` automatycznie uruchamia deployment na obu platformach (CI/CD przez GitHub webhooks).

---

## 3. Schemat bazy danych

```
USERS
  id, email (UNIQUE), password_hash, name, role (USER/MOD/ADMIN), created_at

COURTS
  id, name, surface (clay/hard/grass), price_per_hour, description, is_active, created_at

RESERVATIONS
  id, user_id (FK), court_id (FK), date, start_time, end_time,
  status (CONFIRMED/CANCELLED), created_at
```

Relacje: jeden użytkownik może mieć wiele rezerwacji, jeden kort może mieć wiele rezerwacji.

Tabele używają soft delete — rekordy nie są fizycznie usuwane, tylko oznaczane jako nieaktywne (`is_active = false`) lub anulowane (`status = CANCELLED`).

---

## 4. Bezpieczeństwo

- **SQL Injection:** parametryzowane zapytania (`$1`, `$2`) przez bibliotekę `pg`
- **Hasła:** hashowanie bcrypt, 12 rund solenia, nigdy plain text w bazie
- **Autoryzacja:** middleware `verifyToken` + `requireRole()` na każdym chronionym endpoincie
- **Sekrety:** zmienne środowiskowe (`.env`), wykluczone z repo przez `.gitignore`
- **CORS:** serwer akceptuje żądania tylko z domeny frontendu

---

## 5. Uruchomienie lokalne

Wymagania: Node.js, dostęp do bazy PostgreSQL.

**Backend:**
```bash
cd server
npm install
# skopiuj server/.env.example do server/.env i uzupełnij DATABASE_URL, JWT_SECRET, WEATHER_API_KEY
npm run dev
# serwer: http://localhost:3001
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# klient: http://localhost:5173
```

Baza danych (tabele + dane testowe) tworzy się automatycznie przy pierwszym uruchomieniu serwera.

---

## 6. Konta testowe

| Rola | Email | Hasło |
|------|-------|-------|
| USER | `test_gracz@tennis.pl` | `haslo123` |
| MOD | `test_mod@tennis.pl` | `haslo123` |
| ADMIN | `test_admin@tennis.pl` | `haslo123` |
