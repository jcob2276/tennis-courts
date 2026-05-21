# Raport Bezpieczeństwa — TennisCourts

Dokument opisuje zastosowane mechanizmy bezpieczeństwa w aplikacji do rezerwacji kortów tenisowych (React + Node.js + PostgreSQL).

---

## 1. Uwierzytelnianie — JWT

Do zarządzania sesjami użytkowników użyto tokenów JWT (JSON Web Token). Po zalogowaniu serwer generuje token podpisany kluczem `JWT_SECRET` i zwraca go klientowi. Token jest przechowywany w `localStorage` i dołączany do każdego kolejnego żądania w nagłówku `Authorization: Bearer <token>`.

Po stronie serwera middleware `verifyToken` sprawdza poprawność podpisu oraz datę wygaśnięcia przy każdym żądaniu do chronionych endpointów. Token jest ważny 7 dni.

---

## 2. Hashowanie haseł — bcrypt

Hasła użytkowników nie są nigdy przechowywane w postaci jawnej. Przy rejestracji hasło jest hashowane przez `bcrypt` z 12 rundami solenia. Przy logowaniu porównywany jest hash z bazy z hashem podanego hasła — oryginał nigdy nie trafia do bazy.

---

## 3. Klucze i dane wrażliwe

Wszystkie sekrety (`DATABASE_URL`, `JWT_SECRET`, `WEATHER_API_KEY`) są przechowywane w zmiennych środowiskowych (plik `.env`), który jest wykluczony z repozytorium przez `.gitignore`. Na platformach Railway i Vercel wartości te są ustawiane bezpośrednio w panelu i wstrzykiwane do środowiska uruchomieniowego — nie ma ich w kodzie.

---

## 4. Walidacja danych wejściowych

Dane od użytkownika są weryfikowane na trzech poziomach:

- **Frontend** — podstawowa walidacja w formularzach (wymagane pola, format email, minimalna długość hasła), żeby odciąć oczywiste błędy przed wysłaniem żądania.
- **Backend** — biblioteka `express-validator` sprawdza i oczyszcza dane w `req.body` zanim cokolwiek trafi do bazy. Np. przy rejestracji weryfikowany jest format emaila, długość hasła i imienia.
- **Baza danych** — schemat SQL zawiera ograniczenia `NOT NULL`, `UNIQUE` (email), `CHECK` (dozwolone wartości roli, nawierzchni, statusu rezerwacji). To ostatnia linia obrony, niezależna od logiki aplikacji.

---

## 5. Kontrola dostępu oparta na rolach (RBAC)

System definiuje trzy role: `USER`, `MOD`, `ADMIN`. Dostęp do chronionych endpointów jest kontrolowany przez middleware `requireRole()` działający po stronie serwera.

Przykład — tylko ADMIN może dodawać lub usuwać korty:

```js
router.post('/courts', verifyToken, requireRole('ADMIN'), handler)
router.delete('/courts/:id', verifyToken, requireRole('ADMIN'), handler)
```

Próba dostępu z niższą rolą skutkuje odpowiedzią `403 Forbidden`. Nawet jeśli użytkownik zmodyfikuje token po stronie klienta, serwer i tak zweryfikuje rolę na podstawie własnego klucza podpisu.

Użytkownicy mogą zarządzać wyłącznie swoimi rezerwacjami — sprawdzane przez `req.user.id` w middleware.

---

## 6. Ochrona przed SQL Injection

Wszystkie zapytania do bazy korzystają z parametryzowanych zapytań przez bibliotekę `pg`:

```js
pool.query('SELECT * FROM users WHERE email = $1', [email])
```

Dane od użytkownika nigdy nie są bezpośrednio konkatenowane z treścią zapytania SQL, co wyklucza możliwość wstrzyknięcia kodu.

---

## 7. CORS

Serwer Express przyjmuje żądania tylko z domeny frontendu (skonfigurowanej w zmiennej `CLIENT_URL`). Żądania z innych źródeł są odrzucane na poziomie middleware CORS.
