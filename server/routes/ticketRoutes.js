const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// All ticket routes require the user to be logged in
router.use(authMiddleware);

// Route: POST /api/tickets
// Desc: Create a new ticket
router.post('/', ticketController.createTicket);

// Route: GET /api/tickets
// Desc: View tickets (Filtered by role automatically in the controller)
router.get('/', ticketController.getTickets);

// Route: PUT /api/tickets/:id
// Desc: Update a ticket's status
router.put('/:id', ticketController.updateTicketStatus);

module.exports = router;