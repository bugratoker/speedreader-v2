/**
 * Book Routes
 */

import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, createBookSchema } from '../middleware/validate.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Book CRUD
router.get('/', bookController.listBooks);
router.get('/:id', bookController.getBook);
router.post('/', validateBody(createBookSchema), bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Chunks
router.get('/:bookId/chunks', bookController.listChunks);
router.get('/:bookId/chunks/:index', bookController.getChunk);
router.post('/:bookId/chunks', bookController.createChunks);

export default router;
