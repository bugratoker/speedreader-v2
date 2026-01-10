/**
 * Session Controller
 * Handles reading session HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * GET /api/sessions
 * List all reading sessions for the user
 */
export async function listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const bookId = req.query.bookId as string | undefined;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(bookId && { bookId }),
        };

        const [sessions, total] = await Promise.all([
            prisma.readingSession.findMany({
                where,
                orderBy: { startedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    book: {
                        select: { id: true, title: true, coverColor: true },
                    },
                },
            }),
            prisma.readingSession.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                items: sessions,
                total,
                page,
                limit,
                hasMore: skip + sessions.length < total,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/sessions/stats
 * Get aggregated session stats
 */
export async function getSessionStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        // Get today's sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalSessions, todaySessions, avgWpm] = await Promise.all([
            prisma.readingSession.count({ where: { userId } }),
            prisma.readingSession.aggregate({
                where: {
                    userId,
                    startedAt: { gte: today },
                },
                _sum: { wordsRead: true },
                _avg: { wpm: true },
            }),
            prisma.readingSession.aggregate({
                where: { userId, wpm: { gt: 0 } },
                _avg: { wpm: true },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalSessions,
                todayWordsRead: todaySessions._sum.wordsRead || 0,
                todayAvgWpm: Math.round(todaySessions._avg.wpm || 0),
                overallAvgWpm: Math.round(avgWpm._avg.wpm || 0),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/sessions
 * Create a new reading session
 */
export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { bookId, mode } = req.body;

        // Verify book ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        const session = await prisma.readingSession.create({
            data: {
                userId,
                bookId,
                mode,
            },
        });

        res.status(201).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/sessions/:id
 * Update a reading session (end it, add stats)
 */
export async function updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const sessionId = req.params.id;
        const { wordsRead, wpm, endedAt } = req.body;

        // Verify ownership
        const existing = await prisma.readingSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!existing) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }

        const session = await prisma.readingSession.update({
            where: { id: sessionId },
            data: {
                wordsRead,
                wpm,
                endedAt: endedAt ? new Date(endedAt) : new Date(),
            },
        });

        // Update user stats
        await updateUserStats(userId, wordsRead, wpm);

        res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Helper to update user stats after a session
 */
async function updateUserStats(userId: string, wordsRead: number, wpm: number): Promise<void> {
    const stats = await prisma.userStats.findUnique({
        where: { userId },
    });

    if (stats) {
        await prisma.userStats.update({
            where: { userId },
            data: {
                totalWordsRead: { increment: wordsRead },
                currentWpm: wpm > 0 ? wpm : stats.currentWpm,
                bestWpm: wpm > stats.bestWpm ? wpm : stats.bestWpm,
                lastActiveAt: new Date(),
            },
        });
    }
}
