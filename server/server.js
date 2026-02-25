// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const usersRoute = require('./routes/users');
const ticketRoutes = require('./routes/ticketRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const ticketsRoute = require('./routes/tickets');
const shiftsRoute = require('./routes/shifts');
const payrollRoute = require('./routes/payroll');
// Import Database Connection
const supabase = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Security & Parsing)
app.use(cors()); // Allow frontend to talk to us
app.use(express.json()); // Parse JSON bodies (e.g. POST requests)

// ----------------------------------
// Basic Health Check Route
// ----------------------------------
// This is what you visit to see if the server is alive.
app.get('/', (req, res) => {
    res.json({
        status: 'Active',
        system: 'BPO Management System API',
        timestamp: new Date().toISOString()
    });
});

// ----------------------------------
// API Routes (We will add these later)
// ----------------------------------
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/tickets', ticketsRoute);
app.use('/api/shifts', shiftsRoute);
app.use('/api/users', usersRoute);
// Mount the Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payroll', payrollRoute);
// Start the Server
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER RUNNING ON: http://localhost:${PORT}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'Development'}`);
    console.log(`   - DB Connection: Initialized\n`);
});