const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 5000;
const cors=require('cors');

app.use(cors());

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mahesh@123',
  database: 'flashcard_db'
});

db.connect((err)=>{
  if(err){
    throw err;
  }
  console.log("connected");
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
