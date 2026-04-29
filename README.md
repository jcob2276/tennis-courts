# TennisCourts — System Rezerwacji Kortów

Pełna aplikacja (Frontend + Backend + Baza Danych) do obsługi kortów tenisowych. Zbudowana w celu zaliczenia wymagań prowadzącego z wykorzystaniem zewnętrznego API, uwierzytelniania JWT oraz bazy PostgreSQL.

---

## Technologie i Wymagania
*   **Frontend:** React, Vite, Tailwind CSS (Hosting: Vercel)
*   **Backend:** Node.js, Express.js (Hosting: Railway)
*   **Baza Danych:** PostgreSQL (wymuszana walidacja po stronie schematu SQL)
*   **Zewnętrzne API:** Integracja z *OpenWeatherMap* dostarczająca aktualne informacje pogodowe.

## Role w Systemie
Aplikacja rygorystycznie przestrzega ról zdefiniowanych w zadaniu:
1. **Gość (Niezalogowany)**: Dostęp tylko do odczytu (może przeglądać listę kortów oraz podglądać pogodę). Nie ma możliwości rezerwacji.
2. **USER (Gracz)**: Użytkownik zalogowany. Może tworzyć nowe rezerwacje i usuwać wyłącznie **swoje** rezerwacje.
3. **MOD (Moderator)**: Użytkownik posiadający uprawnienia do usuwania dowolnych rezerwacji (w ramach moderacji obiektu). Nie zarządza kortami.
4. **ADMIN**: Super-użytkownik. Ma dostęp do statystycznego *Panelu Administratora*. Oprócz usuwania dowolnych rezerwacji może dodawać i usuwać korty z systemu.

---

## Loginy Testowe
Loginy są zintegrowane w panelu szybkiego logowania na stronie głównej, ale oto dokładne dane do weryfikacji ręcznej:

| Rola | Email | Hasło |
| :--- | :--- | :--- |
| **USER** | `test_gracz@tennis.pl` | `haslo123` |
| **MOD** | `test_mod@tennis.pl` | `haslo123` |
| **ADMIN** | `test_admin@tennis.pl` | `haslo123` |

---

## Bezpieczeństwo i Raport
Aplikacja została zabezpieczona na wielu płaszczyznach (walidacja frontend, middleware express-validator, constrainty w bazie danych, haszowanie bcrypt, stateless JWT). Pełna specyfikacja została umieszczona w pliku [raport_bezpieczenstwa.md](./raport_bezpieczenstwa.md).

---

## Uruchomienie lokalne

### 1. Klonowanie repozytorium i konfiguracja
Projekt wymaga posiadania Node.js. Skopiuj plik `server/.env.example` na `server/.env` i uzupełnij:
*   `DATABASE_URL` (link do bazy PostgreSQL)
*   `WEATHER_API_KEY` (Klucz do API OpenWeatherMap)

### 2. Backend
Baza danych (tabele i seed) wygeneruje się **automatycznie** po pierwszym poprawnym połączeniu z czystym schematem Postgres.
```bash
cd server
npm install
npm run dev
# Serwer wystartuje na localhost:3001
```

### 3. Frontend
Aplikacja na start łączy się z backendem korzystając z Vite Proxy (`/api`).
```bash
cd client
npm install
npm run dev
# Klient wystartuje na localhost:5173
```
