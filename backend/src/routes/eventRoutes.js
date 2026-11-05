const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.status = 'PUBLISHED'
      ORDER BY e.start_at ASC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const query = `%${(req.query.q || '').trim()}%`;

    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.status = 'PUBLISHED' AND (
        e.title LIKE ? OR e.description LIKE ? OR e.city LIKE ?
      )
      ORDER BY e.start_at ASC
    `, [query, query, query]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ORGANIZER'),
  [
    body('title').trim().notEmpty().withMessage('Título é obrigatório.'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória.'),
    body('category_id').isInt({ min: 1 }).withMessage('Categoria inválida.'),
    body('start_at').notEmpty().withMessage('Data e horário são obrigatórios.'),
    body('venue').trim().notEmpty().withMessage('Local é obrigatório.'),
    body('city').trim().notEmpty().withMessage('Cidade é obrigatória.'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacidade deve ser maior que zero.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category_id, start_at, venue, city, capacity, image_url } = req.body;

      const eventDate = new Date(start_at);
      if (Number.isNaN(eventDate.getTime())) {
        return res.status(400).json({ message: 'Data inválida.' });
      }

      const [result] = await pool.execute(
        `INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
        [req.user.id, category_id, title.trim(), description.trim(), start_at, venue.trim(), city.trim(), capacity, image_url || null]
      );

      res.status(201).json({
        message: 'Evento criado com sucesso.',
        id: result.insertId,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
