const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
