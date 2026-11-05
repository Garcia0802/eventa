const pool = require('../config/database');

exports.listCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
