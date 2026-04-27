# Raport Bezpieczeństwa Aplikacji TennisCourts

Poniższy raport przedstawia główne założenia oraz zaimplementowane mechanizmy bezpieczeństwa w systemie rezerwacji kortów tenisowych (React + Node.js + PostgreSQL).

## 1. Zabezpieczenie sesji użytkownika (JWT)
Aplikacja wykorzystuje **JSON Web Tokens (JWT)** do zarządzania uwierzytelnianiem i autoryzacją w trybie bezstanowym (stateless).
- **Logowanie:** Podczas poprawnego logowania serwer generuje podpisany token, który przesyłany jest do klienta.
- **Weryfikacja:** Tokeny są sprawdzane przed dostępem do każdej zabezpieczonej ścieżki za pomocą middleware'a `verifyToken`.
- **Kryptografia:** Tokeny są zabezpieczone silnym sekretem serwerowym (zmienna `JWT_SECRET`). Serwer weryfikuje poprawność podpisu i czas wygaśnięcia każdego zapytania.

## 2. Hashowanie haseł
Aplikacja kategorycznie **nie przechowuje haseł otwartym tekstem**.
- **Biblioteka:** Wykorzystywany jest algorytm `bcrypt` uznawany za standard branżowy.
- **Salt & Hash:** Podczas rejestracji hasło jest mieszane (saltowane) przed zapisem, co uniemożliwia proste ataki słownikowe czy ataki typu Rainbow Tables.
- Podczas logowania system weryfikuje, czy hasz podanego w formularzu logowania hasła pasuje do tego odczytanego z bazy danych.

## 3. Zabezpieczenie zmiennych środowiskowych i kluczy
Klucze API i poświadczenia bazy danych nie są hardkodowane w kodzie aplikacji.
- **Zmienne środowiskowe (.env):** Wszystkie sekrety (jak np. `DATABASE_URL`, `WEATHER_API_KEY`, `JWT_SECRET`) są przechowywane poza systemem kontroli wersji (plik `.env` jest ignorowany w `.gitignore`).
- W przypadku kompromitacji repozytorium kodu, dane uwierzytelniające do zewnętrznych systemów pozostają bezpieczne.

## 4. Trzypoziomowa Walidacja Danych
By zminimalizować błędy, wstrzykiwanie kodu i niespójności, dane podlegają weryfikacji na wszystkich etapach wędrówki przez aplikację:

1. **Poziom Frontendowy (React):** 
   - Wbudowana walidacja na poziomie formularzy (wymagane pola, min/max length, typy e-mail). Prowadzi to do szybszego doświadczenia (UX), eliminując niepotrzebne zapytania do serwera przy oczywistych błędach.

2. **Poziom Backendowy (API - `express-validator`):**
   - Na wejściu do głównych endpointów, takich jak rejestracja użytkownika, wszystkie dane odbierane od klienta (parametry `req.body`) są sanitizowane oraz rygorystycznie sprawdzane, zanim jakikolwiek kod związany z bazą danych zostanie w ogóle wywołany.

3. **Poziom Bazy Danych (PostgreSQL):**
   - **Twarde Ograniczenia (Constraints):** Na poziomie schematu SQL wprowadzono ostateczną warstwę chroniącą spójność:
     - Klauzule `UNIQUE` (np. na e-mail) chronią przed duplikatami.
     - Klauzule `NOT NULL` pilnują obligatoryjności pól.
     - Ograniczenia `CHECK` zabezpieczają predefiniowane wartości (np. `CHECK (role IN ('USER', 'MOD', 'ADMIN'))` oraz enumeracje typu nawierzchni czy statusu rezerwacji). Zapewnia to integralność nawet przy ominięciu walidacji backendowej.

## 5. Rygorystyczny System Ról i Dostępu
System posiada precyzyjne odcięcie uprawnień oparte na rolach przypisanych do kont (Guest, USER, MOD, ADMIN).
- **Zasada minimalnego dostępu:** Użytkownicy bez autoryzacji mogą wykonać jedynie minimalny podzbiór akcji (przeglądanie kortów).
- **Strażnicy Routing'u (Role Guards):** Middleware `requireRole('ADMIN')` hermetycznie zamyka dostęp do ścieżek zarządzających dodawaniem i usuwaniem kortów oraz wyciągających pełną listę użytkowników. Wszelkie próby ataku na endpoint bez uprawnień (lub z kontem `USER`) kończą się odrzuceniem dostępu.
- Użytkownicy mogą zarządzać własnymi rezerwacjami, bazując na sprawdzaniu tokenu (`req.user.id`), ale usunięcie dowolnej rezerwacji wymaga już uprawnień moderatora lub admina.
