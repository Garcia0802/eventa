const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/database');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return authController.register(req, res, next);
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').notEmpty().withMessage('Senha é obrigatória.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return authController.login(req, res, next);
  }
);

router.patch(
  '/profile/interests',
  authMiddleware,
  [
    body('category_1').optional().isString().withMessage('Interesse 1 inválido.'),
    body('category_2').optional().isString().withMessage('Interesse 2 inválido.'),
    body('category_3').optional().isString().withMessage('Interesse 3 inválido.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category_1, category_2, category_3 } = req.body;
      const interests = [category_1, category_2, category_3]
        .map((item) => (item === undefined || item === null ? null : String(item).trim()))
        .filter((item) => item && item.length > 0);

      if (interests.length > 3) {
        return res.status(400).json({ message: 'Você pode selecionar até 3 interesses.' });
      }

      const values = [null, null, null];
      interests.forEach((interest, index) => {
        values[index] = interest;
      });

      await pool.execute(
        'UPDATE users SET category_1 = ?, category_2 = ?, category_3 = ? WHERE id = ?',
        [values[0], values[1], values[2], req.user.id]
      );

      const [updatedRows] = await pool.execute(
        'SELECT id, name, email, role, city, category_1, category_2, category_3 FROM users WHERE id = ?',
        [req.user.id]
      );

      res.json({
        message: 'Interesses atualizados com sucesso.',
        user: updatedRows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
