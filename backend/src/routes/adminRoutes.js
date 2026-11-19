const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/summary', adminController.getAdminSummary);

router.get(
  '/organizer-requests',
  [
    query('status')
      .optional()
      .isIn(['PENDING', 'APPROVED', 'REJECTED'])
      .withMessage('Status deve ser PENDING, APPROVED ou REJECTED.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return adminController.listOrganizerRequests(req, res, next);
  }
);

router.get(
  '/organizer-requests/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID da solicitação inválido.')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return adminController.getOrganizerRequestById(req, res, next);
  }
);

router.patch(
  '/organizer-requests/:id/review',
  [
    param('id').isInt({ min: 1 }).withMessage('ID da solicitação inválido.'),
    body('decision').isIn(['APPROVE', 'REJECT']).withMessage('Decision deve ser APPROVE ou REJECT.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return adminController.reviewOrganizerRequest(req, res, next);
  }
);

router.patch(
  '/organizer-requests/:id/approve',
  [param('id').isInt({ min: 1 }).withMessage('ID da solicitação inválido.')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    req.body = { ...(req.body || {}), decision: 'APPROVE' };
    return adminController.reviewOrganizerRequest(req, res, next);
  }
);

router.patch(
  '/organizer-requests/:id/reject',
  [param('id').isInt({ min: 1 }).withMessage('ID da solicitação inválido.')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    req.body = { ...(req.body || {}), decision: 'REJECT' };
    return adminController.reviewOrganizerRequest(req, res, next);
  }
);

module.exports = router;
