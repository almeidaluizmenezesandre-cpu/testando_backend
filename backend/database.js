const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/banco.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      mensagem TEXT,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
