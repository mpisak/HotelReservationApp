const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Konfiguracja połączenia z bazą danych
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Twój password
  database: "projekt",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Połączono z bazą danych MySQL");
});

// Endpoint: Wyszukiwanie hoteli
app.post("/wyszukaj", (req, res) => {
  const { miasto, data_poczatku, data_konca, ilosc_osob, cena } = req.body;

  console.log("Wyszukiwanie:", { miasto, data_poczatku, data_konca, ilosc_osob, cena });

  const query = `
    SELECT * FROM hotele 
    WHERE LOWER(TRIM(miasto)) = LOWER(TRIM(?)) 
    AND id_hotelu NOT IN (
      SELECT id_hotelu FROM rezerwacje 
      WHERE (
        (data_poczatku BETWEEN ? AND ?) OR 
        (data_konca BETWEEN ? AND ?) OR 
        (? BETWEEN data_poczatku AND data_konca)
      )
    )
  `;

  db.query(
    query,
    [
      miasto,
      data_poczatku,
      data_konca,
      data_poczatku,
      data_konca,
      data_poczatku,
    ],
    (err, results) => {
      console.log("SQL wyniki:", results);
      if (err) {
        console.error("SQL błąd:", err);
        return res.status(500).json({ error: err });
      }
      res.json(results);
    }
  );
});

// Endpoint: Pobierz szczegóły hotelu
app.get("/hotele/:id", (req, res) => {
  const query = "SELECT * FROM hotele WHERE id_hotelu = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

// Endpoint: Dodaj rezerwację
app.post("/rezerwacje", (req, res) => {
  const { imie, nazwisko, mail, region, nr_telefonu, id_hotelu, data_poczatku, data_konca } = req.body;

  console.log("Otrzymane dane rezerwacji:", { imie, nazwisko, mail, region, nr_telefonu, id_hotelu, data_poczatku, data_konca });

  // Dodanie klienta do bazy
  const klientQuery = `
    INSERT INTO klienci (imie, nazwisko, mail, region, nr_telefonu) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(klientQuery, [imie, nazwisko, mail, region, nr_telefonu], (err, klientResult) => {
    if (err) {
      console.error("Błąd podczas dodawania klienta:", err);
      return res.status(500).json({ error: "Błąd serwera podczas dodawania klienta" });
    }

    const id_klienta = klientResult.insertId;

    // Dodanie rezerwacji do bazy
    const rezerwacjaQuery = `
      INSERT INTO rezerwacje (id_klienta, id_hotelu, data_poczatku, data_konca) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(rezerwacjaQuery, [id_klienta, id_hotelu, data_poczatku, data_konca], (err, rezerwacjaResult) => {
      if (err) {
        console.error("Błąd podczas dodawania rezerwacji:", err);
        return res.status(500).json({ error: "Błąd serwera podczas dodawania rezerwacji" });
      }

      res.json({ message: "Rezerwacja została dokonana!", id_rezerwacji: rezerwacjaResult.insertId });
    });
  });
});

// Start serwera
app.listen(3000, () => {
  console.log("Serwer działa na porcie 3000");
});
