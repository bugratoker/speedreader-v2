/**
 * PDF Routes
 */

import { Router } from 'express';
import multer from 'multer';
import * as pdfController from '../controllers/pdf.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

// Parse PDF without auth (just returns text)
router.post('/parse', optionalAuth, upload.single('file'), pdfController.parsePdf);

// Import PDF (requires auth, creates book)
router.post('/import', requireAuth, upload.single('file'), pdfController.importPdf);

export default router;
