// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// IMPORT ONLY THE CLEAN ROUTE FILES
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const payrollRoutes = require('./routes/payrollRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Security & Parsing)
const allowedOrigins = [
    'http://localhost:5173',             // For your local testing
    'https://bpo-portal.vercel.app'      // For your live Vercel app
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Crucial if you are passing authorization headers/tokens
}));

// Parse JSON bodies with a strict size limit to prevent payload bloat
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------------
// Basic Health Check Route
// ----------------------------------
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Active',
        system: 'BPO Management System API',
        timestamp: new Date().toISOString()
    });
});

// ----------------------------------
// API Routes
// ----------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes); // This now completely handles what users.js used to do
app.use('/api/tickets', ticketRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/payroll', payrollRoutes);

// Start the Server
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER RUNNING ON: http://localhost:${PORT}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'Development'}`);
    console.log(`   - DB Connection: Initialized via db.js\n`);
});