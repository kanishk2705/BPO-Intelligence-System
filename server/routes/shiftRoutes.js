const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /api/shifts (Admins & Leads only)
router.post('/', authorizeRoles('admin', 'lead'), shiftController.createShift);

// GET /api/shifts (Everyone, but agents only see their own)
router.get('/', shiftController.getShifts);

module.exports = router;