require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eventa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function testarConexao() {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('Conexão com MySQL OK:', rows[0].result);
    return true;
  } catch (error) {
    console.error('Erro ao conectar no MySQL:', error.message);
    return false;
  }
}

module.exports = {
  db,
  testarConexao,
};
