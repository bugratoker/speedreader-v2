/**
 * Auth Routes
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, registerSchema, loginSchema, refreshTokenSchema, socialAuthSchema, guestConvertSchema } from '../middleware/validate.middleware';

const router = Router();

// ============ PUBLIC ROUTES ============

// Email/password auth
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

// Guest access
router.post('/guest', authController.guest);

// Social auth
router.post('/google', validateBody(socialAuthSchema), authController.googleAuth);
router.post('/apple', validateBody(socialAuthSchema), authController.appleAuth);

// Token management
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);
router.post('/logout', validateBody(refreshTokenSchema), authController.logout);

// ============ PROTECTED ROUTES ============

// Get current user
router.get('/me', requireAuth, authController.getMe);

// Convert guest to full account
router.post('/convert', requireAuth, validateBody(guestConvertSchema), authController.convertGuest);

export default router;
