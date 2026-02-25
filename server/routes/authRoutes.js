const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: GET /api/auth/me
// Desc:  Get current user's profile
// Access: Private (Requires Token)
router.get('/me', authMiddleware, authController.getMe);

// Route: POST /api/auth/register
// Desc:  Create a new employee
// Access: Private (Admin Only)
router.post('/register', authMiddleware, authController.registerEmployee);

module.exports = router;