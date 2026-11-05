const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'eventa_secret',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, city } = req.body;

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, city) VALUES (?, ?, ?, ?, ?)',
      [name, String(email).toLowerCase(), passwordHash, 'ORGANIZER', city || null]
    );

    const token = createToken({ id: result.insertId, role: 'ORGANIZER' });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso.',
      user: {
        id: result.insertId,
        name,
        email: String(email).toLowerCase(),
        role: 'ORGANIZER',
        city: city || null,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
