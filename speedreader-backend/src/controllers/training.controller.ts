/**
 * Training Controller
 * Handles training session HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * GET /api/training/history
 * List training sessions for the user
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const exerciseType = req.query.exerciseType as string | undefined;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(exerciseType && { exerciseType }),
        };

        const [sessions, total] = await Promise.all([
            prisma.trainingSession.findMany({
                where,
                orderBy: { completedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.trainingSession.count({ where }),
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
 * GET /api/training/stats
 * Get training statistics per exercise type
 */
export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        const exerciseTypes = ['schulte', 'saccadic', 'eyeStretch', 'peripheral'];
        const stats: Record<string, { count: number; avgScore: number; bestScore: number; totalDuration: number }> = {};

        for (const type of exerciseTypes) {
            const result = await prisma.trainingSession.aggregate({
                where: { userId, exerciseType: type },
                _count: { id: true },
                _avg: { score: true },
                _max: { score: true },
                _sum: { duration: true },
            });

            stats[type] = {
                count: result._count.id,
                avgScore: Math.round(result._avg.score || 0),
                bestScore: result._max.score || 0,
                totalDuration: result._sum.duration || 0,
            };
        }

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/training/session
 * Log a completed training session
 */
export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { exerciseType, score, duration } = req.body;

        const session = await prisma.trainingSession.create({
            data: {
                userId,
                exerciseType,
                score,
                duration,
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
