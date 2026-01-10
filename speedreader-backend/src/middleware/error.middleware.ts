/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}

/**
 * Error handler middleware
 */
export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}

/**
 * Create an API error with status code
 */
export function createError(message: string, statusCode: number = 400): ApiError {
    const error: ApiError = new Error(message);
    error.statusCode = statusCode;
    return error;
}
