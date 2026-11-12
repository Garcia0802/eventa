const express = require('express');
const { body, validationResult } = require('express-validator');
const organizerRequestController = require('../controllers/organizerRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('PARTICIPANT'),
  [
    body('reason').trim().notEmpty().withMessage('A justificativa é obrigatória.'),
    body('reason').isLength({ max: 300 }).withMessage('A justificativa deve ter até 300 caracteres.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return organizerRequestController.createOrganizerRequest(req, res, next);
  }
);

router.get('/me', authMiddleware, organizerRequestController.getMyRequests);

module.exports = router;
