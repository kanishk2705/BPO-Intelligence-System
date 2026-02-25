const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// ALL routes here require the user to be logged in
router.use(authMiddleware);

// Route: GET /api/employees
// Desc:  Get all employees
// Access: Admins and Leads only
router.get('/', authorizeRoles('admin', 'lead'), employeeController.getAllEmployees);

// Route: PUT /api/employees/:id
// Desc:  Update an employee's details
// Access: Admins only
router.put('/:id', authorizeRoles('admin'), employeeController.updateEmployee);

// Route: DELETE /api/employees/:id
// Desc:  Remove an employee completely
// Access: Admins only
router.delete('/:id', authorizeRoles('admin'), employeeController.deleteEmployee);

module.exports = router;