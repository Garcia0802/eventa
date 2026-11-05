const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

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

router.get('/me', authMiddleware, authController.me);

module.exports = router;
