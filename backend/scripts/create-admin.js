require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Variável de ambiente ausente: ${key}`);
    process.exit(1);
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  try {
    const email = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
    const [existing] = await connection.execute('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);

    if (existing.length > 0) {
      if (existing[0].role === 'ADMIN') {
        console.log(`Administrador já existe para o e-mail ${email}.`);
        return;
      }

      console.log(`Usuário com e-mail ${email} já existe, mas não é administrador. Nenhuma promoção pública foi feita.`);
      return;
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, city) VALUES (?, ?, ?, "ADMIN", NULL)',
      [process.env.ADMIN_NAME, email, passwordHash]
    );

    console.log(`Administrador criado com sucesso: ${email}`);
  } catch (error) {
    console.error('Erro ao criar administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
