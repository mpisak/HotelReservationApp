# Aplikacja Rezerwacji Hoteli

Prosta aplikacja oparta na Node.js, Express oraz MySQL do wyszukiwania i rezerwacji hoteli. Poniżej znajdziesz instrukcję krok po kroku, jak skonfigurować projekt, utworzyć bazę danych i uruchomić aplikację lokalnie.

## Spis treści
1. [Wymagania wstępne](#wymagania-wstępne)
2. [Instalacja](#instalacja)
3. [Konfiguracja bazy danych](#konfiguracja-bazy-danych)
4. [Uruchamianie aplikacji](#uruchamianie-aplikacji)
5. [Użytkowanie](#użytkowanie)
6. [Struktura projektu](#struktura-projektu)
7. [Możliwe ulepszenia](#możliwe-ulepszenia)
8. [Licencja](#licencja)

---

## Wymagania wstępne

- **Node.js & npm**  
  Upewnij się, że masz zainstalowane [Node.js](https://nodejs.org) (zawierające npm).

- **XAMPP (lub podobne rozwiązanie)**  
  Do uruchomienia lokalnego serwera MySQL możesz użyć [XAMPP](https://www.apachefriends.org/download.html) lub innego środowiska. Upewnij się, że serwer MySQL jest uruchomiony.

- **Klucz API do Google Maps (opcjonalnie)**  
  Jeśli chcesz, aby mapa w pliku `klient.html` wyświetlała się prawidłowo, potrzebujesz klucza API z Google Cloud Platform. W pliku `klient.html` zamień `#yourGoogleAPI` na właściwy adres z Twoim kluczem API, np.:

  ```html
  <script async src="https://maps.googleapis.com/maps/api/js?key=TWÓJ_KLUCZ_API"></script>
  ```

---

## Instalacja

1. **Sklonuj lub pobierz repozytorium**  
   ```bash
   git clone https://github.com/mpisak/HotelReservationApp.git
   cd HotelReservationApp
   ```

2. **Zainstaluj wymagane paczki**  
   W folderze projektu uruchom:
   ```bash
   npm install express cors body-parser mysql2
   ```

---

## Konfiguracja bazy danych

1. **Utwórz bazę danych MySQL**  
   - Używając phpMyAdmin (jeśli korzystasz z XAMPP) lub narzędzia wiersza poleceń MySQL, stwórz bazę danych o nazwie `projekt`:
     ```sql
     CREATE DATABASE IF NOT EXISTS projekt;
     USE projekt;
     ```

2. **Utwórz tabele**  
   - Wykonaj poniższe zapytania SQL, aby utworzyć potrzebne tabele:
     ```sql
     -- Tabela: hotele
     CREATE TABLE IF NOT EXISTS hotele (
       id_hotelu INT AUTO_INCREMENT PRIMARY KEY,
       nazwa VARCHAR(100),
       zdjecie VARCHAR(255),
       opis TEXT,
       cena DECIMAL(10,2),
       max_os INT,
       miasto VARCHAR(100),
       lokalizacja VARCHAR(100)
     );

     -- Tabela: klienci
     CREATE TABLE IF NOT EXISTS klienci (
       id_klienta INT AUTO_INCREMENT PRIMARY KEY,
       imie VARCHAR(50),
       nazwisko VARCHAR(50),
       mail VARCHAR(100),
       region VARCHAR(50),
       nr_telefonu VARCHAR(20)
     );

     -- Tabela: rezerwacje
     CREATE TABLE IF NOT EXISTS rezerwacje (
       id_rezerwacji INT AUTO_INCREMENT PRIMARY KEY,
       id_klienta INT,
       id_hotelu INT,
       data_poczatku DATE,
       data_konca DATE,
       FOREIGN KEY (id_klienta) REFERENCES klienci(id_klienta),
       FOREIGN KEY (id_hotelu) REFERENCES hotele(id_hotelu)
     );
     ```

3. **(Opcjonalnie) Wprowadź przykładowe dane**  
   - Jeśli chcesz szybko przetestować aplikację, wstaw kilka przykładowych rekordów do tabeli `hotele`:
     ```sql
     INSERT INTO hotele (nazwa, zdjecie, opis, cena, max_os, miasto, lokalizacja)
     VALUES
     ('Hotel Gdańsk', 'https://example.com/hotelGdansk.jpg', 'Przytulny hotel w centrum Gdańska.', 200, 2, 'Gdańsk', '54.3520,18.6466'),
     ('Hotel Warszawa', 'https://example.com/hotelWarszawa.jpg', 'Luksusowy hotel w stolicy.', 350, 4, 'Warszawa', '52.2297,21.0122'),
     ('Hotel Kraków', 'https://example.com/hotelKrakow.jpg', 'Komfortowy hotel niedaleko Rynku.', 280, 3, 'Kraków', '50.0647,19.9450');
     ```

4. **Sprawdź ustawienia połączenia z bazą**  
   - W pliku `app.js` skonfiguruj dane dostępowe do bazy, jeśli różnią się od domyślnych:
     ```js
     const db = mysql.createConnection({
       host: "localhost",
       user: "root",
       password: "",  // Zmień na własne hasło, jeśli jest wymagane
       database: "projekt",
     });
     ```

---

## Uruchamianie aplikacji

1. **Uruchom serwer back-end (Node.js)**  
   - W folderze projektu uruchom:
     ```bash
     node app.js
     ```
   - W konsoli powinieneś zobaczyć:
     ```
     Połączono z bazą danych MySQL
     Serwer działa na porcie 3000
     ```

2. **Otwórz plik klient.html (Front-End)**  
   - Plik `klient.html` jest interfejsem użytkownika.
   - Możesz go otworzyć bezpośrednio w przeglądarce lub umieścić w folderze np. `htdocs` (jeśli używasz XAMPP) i otworzyć przez `localhost`.
   - Upewnij się, że serwer Node.js działa pod adresem `http://localhost:3000`.

3. **Sprawdź połączenie**  
   - Front-end wysyła zapytania do `http://localhost:3000/wyszukaj` oraz `http://localhost:3000/rezerwacje`.
   - Jeśli konfiguracja jest poprawna, powinieneś móc wyszukiwać hotele po nazwie miasta, wybierać zakres dat i dokonywać rezerwacji.

---

## Użytkowanie

1. **Wyszukiwanie hoteli**  
   - W polu **Podaj miasto** wpisz nazwę miasta.
   - W polu **Wybierz daty** zaznacz zakres dat (Flatpickr blokuje daty wsteczne).
   - Wpisz liczbę gości i kliknij **Szukaj**.

2. **Szczegóły hotelu**  
   - Po wyszukaniu wyświetli się lista dostępnych hoteli.
   - Kliknij **Zobacz szczegóły**, aby zobaczyć zdjęcie hotelu, opis, cenę oraz lokalizację na mapie.

3. **Rezerwacja**  
   - Kliknij **Zarezerwuj**, aby otworzyć formularz rezerwacji.
   - Uzupełnij dane (Imię, Nazwisko, E-mail, Region, Numer telefonu) i zatwierdź.
   - Jeśli rezerwacja powiedzie się, zobaczysz komunikat potwierdzający.

4. **Endpointy back-endowe**  
   - `POST /wyszukaj` – Wyszukiwanie dostępnych hoteli na podstawie miasta i zakresu dat.
   - `GET /hotele/:id` – Pobiera szczegóły pojedynczego hotelu (internie w kodzie).
   - `POST /rezerwacje` – Tworzy nową rezerwację z podanymi danymi klienta i rezerwacji.

---

## Struktura projektu

```
HotelReservationApp/
├── app.js               # Główny plik serwera Express.js
├── klient.html          # Front-end (wyszukiwanie i rezerwacja hoteli)
├── package.json         # Plik konfiguracyjny npm
└── README.md            # Ten plik
```

---

## Możliwe ulepszenia

- **Walidacja**: Rozszerzenie walidacji formularzy po stronie front-endu i back-endu.
- **Bezpieczeństwo**: Przechowywanie danych dostępowych (hasła, klucze API) w zmiennych środowiskowych, zamiast w kodzie.
- **Obsługa błędów**: Lepsza obsługa błędów i wyjątków dla różnych przypadków brzegowych (np. brak dostępnych hoteli).
- **Interfejs użytkownika**: Rozszerzenie stylizacji i poprawienie responsywności.

---

## Licencja

Projekt jest dostarczany w formie przykładowej, do celów edukacyjnych. Możesz go dowolnie używać i modyfikować. Jeśli potrzebujesz, dodaj własną licencję (np. MIT).

---


