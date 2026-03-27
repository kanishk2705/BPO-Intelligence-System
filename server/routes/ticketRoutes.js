// server/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware'); // IMPORT ADDED

// All ticket routes require the user to be logged in
router.use(authMiddleware);

// Route: POST /api/tickets
// Desc: Create a new ticket (Agents only)
router.post('/', authorizeRoles('agent'), ticketController.createTicket);

// Route: GET /api/tickets
// Desc: View tickets (Controller handles filtering logic based on role)
router.get('/', ticketController.getTickets);

// Route: PUT /api/tickets/:id
// Desc: Update a ticket's status (Agents update their own, Leads/Admins can update any)
// Note: We allow all roles here, but the controller enforces *which* tickets they can update
router.put('/:id', ticketController.updateTicketStatus);

module.exports = router;