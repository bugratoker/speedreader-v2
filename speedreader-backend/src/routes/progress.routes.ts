/**
 * Progress Routes
 */

import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, updateProgressSchema } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:bookId', progressController.getProgress);
router.put('/:bookId', validateBody(updateProgressSchema), progressController.updateProgress);

export default router;
