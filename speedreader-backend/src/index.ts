/**
 * Speed Reader Backend - Main Entry Point
 * Express server with all middleware and routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// ============ ROUTES ============

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Speed Reader API',
        version: '1.0.0',
        status: 'running',
        docs: '/api/health',
    });
});

// ============ ERROR HANDLING ============

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============ SERVER STARTUP ============

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Speed Reader API Server                          ║
║                                                       ║
║   Status:  Running                                    ║
║   Port:    ${PORT}                                        ║
║   Mode:    ${process.env.NODE_ENV || 'development'}                               ║
║                                                       ║
║   Endpoints:                                          ║
║   - Health:   GET  /api/health                        ║
║   - Auth:     POST /api/auth/register                 ║
║   - Auth:     POST /api/auth/login                    ║
║   - Books:    GET  /api/books                         ║
║   - PDF:      POST /api/pdf/import                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
