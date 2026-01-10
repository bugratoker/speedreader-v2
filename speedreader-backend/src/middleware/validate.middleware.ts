/**
 * Request Validation Middleware
 * Uses Zod for schema validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }

        req.body = result.data;
        next();
    };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: 'Invalid parameters',
                details: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }

        next();
    };
}

/**
 * Validate request query against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }

        next();
    };
}

// ============ VALIDATION SCHEMAS ============

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const socialAuthSchema = z.object({
    idToken: z.string().min(1, 'ID token is required'),
    email: z.string().email().optional(),
    name: z.string().max(100).optional(),
    avatarUrl: z.string().url().optional(),
});

export const guestConvertSchema = z.object({
    method: z.enum(['email', 'google', 'apple']),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    name: z.string().max(100).optional(),
    idToken: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
});

export const createBookSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    author: z.string().max(200).optional(),
    sourceType: z.enum(['pdf', 'epub', 'url', 'text', 'ai']),
    originalFileName: z.string().optional(),
    totalWords: z.number().int().positive(),
    totalChunks: z.number().int().positive(),
    coverColor: z.string(),
});

export const createChunkSchema = z.object({
    chunkIndex: z.number().int().min(0),
    content: z.string().min(1),
    wordCount: z.number().int().positive(),
    startWord: z.number().int().min(0),
    endWord: z.number().int().positive(),
});

export const updateProgressSchema = z.object({
    chunkIndex: z.number().int().min(0),
    wordIndex: z.number().int().min(0),
    percentage: z.number().int().min(0).max(100),
});

export const createSessionSchema = z.object({
    bookId: z.string().min(1),
    mode: z.enum(['rsvp', 'bionic', 'chunk', 'dual']),
});

export const updateSessionSchema = z.object({
    wordsRead: z.number().int().min(0),
    wpm: z.number().int().min(0),
    endedAt: z.string().datetime().optional(),
});

export const createTrainingSessionSchema = z.object({
    exerciseType: z.enum(['schulte', 'saccadic', 'eyeStretch', 'peripheral']),
    score: z.number().int().min(0),
    duration: z.number().int().positive(),
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
    id: z.string().min(1),
});

export const bookIdParamSchema = z.object({
    bookId: z.string().min(1),
});
