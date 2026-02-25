const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /api/payroll (Admins only)
router.post('/', authorizeRoles('admin'), payrollController.generatePayroll);

// GET /api/payroll (Everyone, but agents only see their own)
router.get('/', payrollController.getPayroll);

module.exports = router;