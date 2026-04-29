# 🎾 Ściąga na Obronę — Projekt TennisCourts

Ten dokument to Twój "plan bitwy". Znajdziesz tu najważniejsze informacje o projekcie, które pozwolą Ci pewnie odpowiedzieć na pytania komisji.

---

## 1. Architektura Systemu (Analogia Restauracji)
*   **Frontend (Vercel):** Sala restauracyjna i menu. To, co widzi użytkownik. Technologia: **React + Vite**.
*   **Backend (Railway):** Kuchnia, w której kucharz (serwer) przetwarza zamówienia. Technologia: **Node.js + Express**.
*   **Baza danych (PostgreSQL):** Spiżarnia z danymi. Tu trzymamy użytkowników i rezerwacje.
*   **API (REST):** Kelner, który przenosi dane między Salą (Vercel) a Kuchnią (Railway).

---

## 2. Top 5 Plików (Musisz wiedzieć, gdzie są!)

### Backend (Mózg):
1.  `server/index.js` — **Główny włącznik**. Tu startuje serwer i podpinane są wszystkie trasy.
2.  `server/routes/reservations.js` — **Logika biznesowa**. Tu jest kod sprawdzający, czy kort nie jest już zajęty w danej godzinie.
3.  `server/db/schema.sql` — **Plan bazy danych**. Tu widać, jak wyglądają tabele (users, courts, reservations).

### Frontend (Twarz):
4.  `client/src/App.jsx` — **Mapa strony**. Tu zdefiniowane są wszystkie podstrony i system uprawnień (kto gdzie może wejść).
5.  `client/src/api/index.js` — **Telefon do bazy**. Tu jest konfiguracja Axios, która automatycznie dokleja token JWT do każdego zapytania.

---

## 3. Bezpieczeństwo (Pytania pułapki)

**Q: Jak zabezpieczył Pan hasła?**
*   **A:** Hasła nigdy nie są zapisywane czystym tekstem. Używam biblioteki **Bcrypt**, która haszuje hasło z "solą" (salt). Nawet jeśli ktoś wykradnie bazę, nie odczyta haseł.

**Q: Co to jest JWT i po co go Pan użył?**
*   **A:** **JSON Web Token**. To bilet, który użytkownik dostaje po zalogowaniu. Dzięki niemu serwer wie, kim jesteś, bez konieczności ponownego logowania przy każdym kliknięciu.

**Q: Jak chroni Pan aplikację przed SQL Injection?**
*   **A:** Używam **parametryzowanych zapytań** (czyli symboli `$1`, `$2` w kodzie). Dzięki temu dane od użytkownika nigdy nie są bezpośrednio łączone z kodem SQL, co blokuje próby ataku na bazę.

---

## 4. Role w systemie (Zgodnie z wymaganiami)
1.  **Gość (Guest):** Tylko podgląd kortów i pogody.
2.  **Gracz (USER):** Może rezerwować korty i widzieć swoją historię.
3.  **Moderator (MOD):** Może zarządzać rezerwacjami innych osób.
4.  **Administrator (ADMIN):** Zarządza kortami i ma pełny wgląd w system.

---

## 5. Jak to działa w internecie? (CI/CD)
Każdy `git push` wysyła kod na **GitHub**. GitHub informuje **Vercela** i **Railway**, które automatycznie pobierają nową wersję i ją wdrażają. To się nazywa **Continuous Deployment**.

---

## 6. Integracja z zewnętrznym API
Aplikacja łączy się z **OpenWeatherMap**. Pobieramy aktualną temperaturę i warunki pogodowe dla lokalizacji kortów, aby poinformować graczy, czy warunki sprzyjają grze (logika `isPlayable`).
