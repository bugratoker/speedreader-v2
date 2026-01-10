/**
 * Session Routes
 */

import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, createSessionSchema, updateSessionSchema } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', sessionController.listSessions);
router.get('/stats', sessionController.getSessionStats);
router.post('/', validateBody(createSessionSchema), sessionController.createSession);
router.put('/:id', validateBody(updateSessionSchema), sessionController.updateSession);

export default router;
