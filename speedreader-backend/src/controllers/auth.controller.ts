/**
 * Authentication Controller
 * Handles auth-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password, name } = req.body;
        const result = await authService.register({ email, password, name });

        res.status(201).json({
            success: true,
            data: result,
            message: 'Registration successful',
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes('already exists')) {
            res.status(409).json({ success: false, error: err.message });
        } else {
            next(error);
        }
    }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });

        res.status(200).json({
            success: true,
            data: result,
            message: 'Login successful',
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes('Invalid')) {
            res.status(401).json({ success: false, error: err.message });
        } else {
            next(error);
        }
    }
}

/**
 * POST /api/auth/guest
 * Create a guest account (no email/password needed)
 */
export async function guest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const result = await authService.createGuestUser();

        res.status(201).json({
            success: true,
            data: result,
            message: 'Guest account created',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/google
 * Authenticate with Google
 */
export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { idToken, email, name, avatarUrl } = req.body;
        const result = await authService.googleAuth({ idToken, email, name, avatarUrl });

        res.status(200).json({
            success: true,
            data: result,
            message: result.isNewUser ? 'Account created with Google' : 'Logged in with Google',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/apple
 * Authenticate with Apple
 */
export async function appleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { idToken, email, name, avatarUrl } = req.body;
        const result = await authService.appleAuth({ idToken, email, name, avatarUrl });

        res.status(200).json({
            success: true,
            data: result,
            message: result.isNewUser ? 'Account created with Apple' : 'Logged in with Apple',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/convert
 * Convert guest account to full account
 */
export async function convertGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await authService.convertGuestToAccount(req.user.userId, req.body);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Account upgraded successfully',
        });
    } catch (error) {
        const err = error as Error;
        if (err.message.includes('not a guest') || err.message.includes('already in use')) {
            res.status(400).json({ success: false, error: err.message });
        } else {
            next(error);
        }
    }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            data: tokens,
        });
    } catch (error) {
        const err = error as Error;
        res.status(401).json({ success: false, error: err.message });
    }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const profile = await authService.getUserProfile(req.user.userId);

        if (!profile) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
}
