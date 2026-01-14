import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, initSchema } from './config/database.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emails.js';
import requestRoutes from './routes/requests.js';
import productRoutes from './routes/products.js';
import quotationRoutes from './routes/quotations.js';
import { startEmailPolling } from './services/emailPoller.js';

// Load environment variables
dotenv.config();

// Initialize database (async)
await initDatabase();
await initSchema();

// Start email polling service
startEmailPolling();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotations', quotationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
