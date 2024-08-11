if(process.env.NODE_ENV != "production"){
    require('dotenv').config();    
}

const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 5000;
const cors=require('cors');

app.use(cors());
//
app.use(express.json());

const db=mysql.createConnection({
  host: process.env.db_host,
  port: porcess.env.db_port,
user: process.env.db_user,
password: process.env.db_password,
database: process.env.db,
})

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the AWS RDS MySQL database.');

  // Create the flashcards table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS flashcards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      link VARCHAR(255) NOT NULL,
      timer INT NOT NULL
    );
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Flashcards table created or already exists.');
    }
  });
});

app.get('/api/flashcards', (req, res) => {
  db.query('SELECT * FROM flashcards', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/flashcards', (req, res) => {
  const { description, link, timer } = req.body;
  db.query('INSERT INTO flashcards (description, link, timer) VALUES (?, ?, ?)', [description, link, timer], (err) => {
  console.log("working well");
    if (err) throw err;
    res.status(201).send('Flashcard added');
  });
});

app.delete('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM flashcards WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Flashcard deleted' });
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
