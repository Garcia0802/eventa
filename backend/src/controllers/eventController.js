const pool = require('../config/database');

exports.listEvents = async (req, res, next) => {
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
};

exports.getEventById = async (req, res, next) => {
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
};

exports.searchEvents = async (req, res, next) => {
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
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, category_id, start_at, venue, city, capacity, image_url } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
      [req.user.id, category_id, title, description, start_at, venue, city, capacity, image_url || null]
    );

    res.status(201).json({ message: 'Evento criado com sucesso.', id: result.insertId });
  } catch (error) {
    next(error);
  }
};
