// server/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Require authentication for all payroll routes
router.use(authMiddleware);

// POST /api/payroll/generate (Admins only)
router.post('/generate', authorizeRoles('admin'), payrollController.generatePayroll);

// GET /api/payroll (Everyone, but controller ensures agents only see their own)
router.get('/', payrollController.getPayroll);

module.exports = router;