/**
 * Progress Controller
 * Handles reading progress HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * GET /api/progress/:bookId
 * Get current reading progress for a book
 */
export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.bookId;

        // Verify book ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        const progress = await prisma.readingProgress.findUnique({
            where: {
                userId_bookId: { userId, bookId },
            },
        });

        res.status(200).json({
            success: true,
            data: progress || { chunkIndex: 0, wordIndex: 0, percentage: 0 },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/progress/:bookId
 * Update reading progress for a book
 */
export async function updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.bookId;
        const { chunkIndex, wordIndex, percentage } = req.body;

        // Verify book ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        // Upsert progress
        const progress = await prisma.readingProgress.upsert({
            where: {
                userId_bookId: { userId, bookId },
            },
            create: {
                userId,
                bookId,
                chunkIndex,
                wordIndex,
                percentage,
            },
            update: {
                chunkIndex,
                wordIndex,
                percentage,
                lastReadAt: new Date(),
            },
        });

        // Update book's lastReadAt
        await prisma.book.update({
            where: { id: bookId },
            data: { lastReadAt: new Date() },
        });

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        next(error);
    }
}
