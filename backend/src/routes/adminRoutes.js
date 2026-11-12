const express = require('express');
const { body, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get(
  '/organizer-requests',
  authMiddleware,
  roleMiddleware('ADMIN'),
  adminController.listOrganizerRequests
);

router.patch(
  '/organizer-requests/:id/review',
  authMiddleware,
  roleMiddleware('ADMIN'),
  [
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

module.exports = router;
