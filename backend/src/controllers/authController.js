const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const normalizeInterest = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
};

const toUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  city: user.city,
  category_1: user.category_1 || null,
  category_2: user.category_2 || null,
  category_3: user.category_3 || null,
});

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'eventa_secret',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, city, category_1, category_2, category_3 } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const interestValues = [category_1, category_2, category_3]
      .map(normalizeInterest)
      .filter(Boolean);

    if (interestValues.length > 3) {
      return res.status(400).json({ message: 'Você pode selecionar até 3 interesses.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role, city, category_1, category_2, category_3) VALUES (?, ?, ?, "PARTICIPANT", ?, ?, ?, ?)',

      [
        String(name).trim(),
        normalizedEmail,
        passwordHash,
        city || null,
        normalizeInterest(category_1),
        normalizeInterest(category_2),
        normalizeInterest(category_3),
      ]
    );

    const token = createToken({ id: result.insertId, role: 'PARTICIPANT' });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso.',
      user: {
        id: result.insertId,
        name: String(name).trim(),
        email: normalizedEmail,
        role: 'PARTICIPANT',
        city: city || null,
        category_1: normalizeInterest(category_1),
        category_2: normalizeInterest(category_2),
        category_3: normalizeInterest(category_3),
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
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

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
      user: toUserPayload(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: toUserPayload(req.user) });
};
