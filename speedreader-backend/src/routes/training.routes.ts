/**
 * Training Routes
 */

import { Router } from 'express';
import * as trainingController from '../controllers/training.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, createTrainingSessionSchema } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth);

router.get('/history', trainingController.getHistory);
router.get('/stats', trainingController.getStats);
router.post('/session', validateBody(createTrainingSessionSchema), trainingController.createSession);

export default router;
