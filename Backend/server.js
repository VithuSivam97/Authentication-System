require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'SYSTEM_ONLINE', message: 'Auth API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('[DB] MongoDB connected successfully ✓');
        app.listen(PORT, () => {
            console.log(`[SYS] Server running on port ${PORT} ✓`);
        });
    })
    .catch((err) => {
        console.error('[DB] MongoDB connection failed:', err.message);
        process.exit(1);
    });
