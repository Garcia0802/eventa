const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/recommended', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.status = 'PUBLISHED'
      ORDER BY e.start_at ASC
    `);

    const interests = [req.user.category_1, req.user.category_2, req.user.category_3]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());

    const ranked = rows
      .map((event) => {
        const title = String(event.title || '').toLowerCase();
        const description = String(event.description || '').toLowerCase();
        const category = String(event.category_name || '').toLowerCase();
        const affinity = interests.reduce((score, interest) => {
          if (!interest) return score;
          return score + (title.includes(interest) || description.includes(interest) || category.includes(interest) ? 3 : 0);
        }, 0);

        return { ...event, affinityScore: affinity };
      })
      .sort((a, b) => {
        if (b.affinityScore !== a.affinityScore) {
          return b.affinityScore - a.affinityScore;
        }

        return new Date(a.start_at) - new Date(b.start_at);
      });

    res.json(ranked);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
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
      SELECT e.*, c.name AS category_name, u.name AS organizer_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
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

router.get('/my-registrations', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.id, r.status, r.created_at,
             e.id AS event_id, e.title, e.description, e.start_at, e.end_at,
             e.venue, e.city, e.capacity, e.image_url,
             c.name AS category_name, u.name AS organizer_name
      FROM registrations r
      INNER JOIN events e ON e.id = r.event_id
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/organizer/summary', authMiddleware, roleMiddleware('ORGANIZER', 'ADMIN'), async (req, res, next) => {
  try {
    const [events] = await pool.execute(`
      SELECT e.*, c.name AS category_name,
             (SELECT COUNT(*) FROM registrations r
              WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      WHERE e.organizer_id = ?
      ORDER BY e.start_at ASC
    `, [req.user.id]);

    const totalRegistrations = events.reduce((total, event) => total + Number(event.confirmed_count || 0), 0);
    res.json({ totalEvents: events.length, totalRegistrations, events });
  } catch (error) {
    next(error);
  }
});

router.get('/organizer/participants', authMiddleware, roleMiddleware('ORGANIZER', 'ADMIN'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.id AS registration_id, r.status, r.created_at,
             u.id AS user_id, u.name, u.email,
             e.id AS event_id, e.title AS event_title
      FROM registrations r
      INNER JOIN users u ON u.id = r.user_id
      INNER JOIN events e ON e.id = r.event_id
      WHERE e.organizer_id = ? AND r.status = 'CONFIRMED'
      ORDER BY e.start_at ASC, r.created_at ASC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [eventRows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.id = ?
    `, [req.params.id]);

    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    const [participantsRows] = await pool.execute(`
      SELECT u.id, u.name, u.email, r.status, r.created_at
      FROM registrations r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.event_id = ? AND r.status = 'CONFIRMED'
      ORDER BY r.created_at ASC
    `, [req.params.id]);

    const event = eventRows[0];
    event.participants = participantsRows;
    event.confirmed_count = participantsRows.length;

    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ORGANIZER', 'ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Título é obrigatório.'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória.'),
    body('category_id').isInt({ min: 1 }).withMessage('Categoria inválida.'),
    body('start_at').notEmpty().withMessage('Data e horário são obrigatórios.'),
    body('venue').trim().notEmpty().withMessage('Local é obrigatório.'),
    body('city').trim().notEmpty().withMessage('Cidade é obrigatória.'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacidade deve ser maior que zero.'),
    body('image_url').optional({ values: 'falsy' }).isURL().withMessage('URL da imagem inválida.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category_id, start_at, end_at, venue, city, capacity, image_url } = req.body;

      const eventDate = new Date(start_at);
      if (Number.isNaN(eventDate.getTime())) {
        return res.status(400).json({ message: 'Data inválida.' });
      }

      const endDate = end_at ? new Date(end_at) : null;
      if (end_at && Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Horário de término inválido.' });
      }

      if (endDate && endDate <= eventDate) {
        return res.status(400).json({ message: 'O horário de término precisa ser depois do início.' });
      }

      const [result] = await pool.execute(
        `INSERT INTO events (organizer_id, category_id, title, description, start_at, end_at, venue, city, capacity, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
        [req.user.id, category_id, title.trim(), description.trim(), start_at, end_at || null, venue.trim(), city.trim(), capacity, image_url || null]
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

router.post('/:id/register', authMiddleware, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      connection.release();
      return res.status(400).json({ message: 'ID do evento inválido.' });
    }

    await connection.beginTransaction();

    const [eventRows] = await connection.execute(
      `SELECT e.id, e.capacity, e.status,
              (SELECT COUNT(*) FROM registrations r
               WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
       FROM events e
       WHERE e.id = ? FOR UPDATE`,
      [eventId]
    );

    if (eventRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    const event = eventRows[0];
    if (event.status !== 'PUBLISHED') {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'Este evento não está disponível para inscrições.' });
    }

    if (Number(event.confirmed_count) >= Number(event.capacity)) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'Não há vagas disponíveis para este evento.' });
    }

    const [existingRows] = await connection.execute(
      'SELECT id, status FROM registrations WHERE event_id = ? AND user_id = ? FOR UPDATE',
      [eventId, req.user.id]
    );

    if (existingRows.length > 0) {
      if (existingRows[0].status === 'CONFIRMED') {
        await connection.rollback();
        connection.release();
        return res.status(409).json({ message: 'Você já confirmou presença neste evento.' });
      }

      await connection.execute(
        "UPDATE registrations SET status = 'CONFIRMED', created_at = CURRENT_TIMESTAMP WHERE id = ?",
        [existingRows[0].id]
      );
    } else {
      await connection.execute(
        "INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, 'CONFIRMED')",
        [eventId, req.user.id]
      );
    }

    await connection.commit();
    connection.release();
    res.status(201).json({ message: 'Presença confirmada com sucesso.' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {}
    connection.release();
    next(error);
  }
});

router.delete('/:id/register', authMiddleware, async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ message: 'ID do evento inválido.' });
    }

    const [result] = await pool.execute(
      "UPDATE registrations SET status = 'CANCELLED' WHERE event_id = ? AND user_id = ? AND status = 'CONFIRMED'",
      [eventId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inscrição confirmada não encontrada.' });
    }

    res.json({ message: 'Inscrição cancelada com sucesso.' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/cancel', authMiddleware, roleMiddleware('ORGANIZER', 'ADMIN'), async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ message: 'ID do evento inválido.' });
    }

    const [eventRows] = await pool.execute(
      'SELECT id, organizer_id, status FROM events WHERE id = ?',
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    const event = eventRows[0];

    if (req.user.role === 'ORGANIZER' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Você só pode cancelar eventos que criou.' });
    }

    if (event.status === 'CANCELLED') {
      return res.status(409).json({ message: 'Este evento já está cancelado.' });
    }

    await pool.execute(
      "UPDATE events SET status = 'CANCELLED' WHERE id = ?",
      [eventId]
    );

    res.json({ message: 'Evento cancelado com sucesso.' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancel', authMiddleware, roleMiddleware('ORGANIZER', 'ADMIN'), async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ message: 'ID do evento inválido.' });
    }

    let sql = "UPDATE events SET status = 'CANCELLED' WHERE id = ? AND status <> 'CANCELLED'";
    let params = [eventId];

    if (req.user.role === 'ORGANIZER') {
      sql += ' AND organizer_id = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento não encontrado, já cancelado ou não pertence a você.' });
    }

    res.json({ message: 'Evento cancelado com sucesso.', id: eventId, status: 'CANCELLED' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [eventRows] = await pool.execute(`
      SELECT e.*, c.name AS category_name, u.name AS organizer_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'CONFIRMED') AS confirmed_count
      FROM events e
      INNER JOIN categories c ON c.id = e.category_id
      INNER JOIN users u ON u.id = e.organizer_id
      WHERE e.id = ?
    `, [req.params.id]);

    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    const [participantsRows] = await pool.execute(`
      SELECT u.id, u.name, u.email, r.status, r.created_at
      FROM registrations r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.event_id = ? AND r.status = 'CONFIRMED'
      ORDER BY r.created_at ASC
    `, [req.params.id]);

    const event = eventRows[0];
    event.participants = participantsRows;
    event.confirmed_count = participantsRows.length;

    res.json(event);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
