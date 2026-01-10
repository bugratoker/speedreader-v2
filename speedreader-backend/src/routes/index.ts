/**
 * Main Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import progressRoutes from './progress.routes';
import sessionRoutes from './session.routes';
import statsRoutes from './stats.routes';
import trainingRoutes from './training.routes';
import pdfRoutes from './pdf.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/progress', progressRoutes);
router.use('/sessions', sessionRoutes);
router.use('/stats', statsRoutes);
router.use('/training', trainingRoutes);
router.use('/pdf', pdfRoutes);

export default router;
