/**
 * Statistics Controller
 * Handles user stats and analytics HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * GET /api/stats/overview
 * Get overall user statistics
 */
export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        const stats = await prisma.userStats.findUnique({
            where: { userId },
        });

        if (!stats) {
            // Return default stats if not found
            res.status(200).json({
                success: true,
                data: {
                    totalBooksRead: 0,
                    totalWordsRead: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    currentWpm: 250,
                    bestWpm: 250,
                },
            });
            return;
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
 * GET /api/stats/weekly
 * Get weekly activity data
 */
export async function getWeeklyActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        // Get sessions from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const sessions = await prisma.readingSession.findMany({
            where: {
                userId,
                startedAt: { gte: sevenDaysAgo },
            },
            select: {
                startedAt: true,
                endedAt: true,
                wordsRead: true,
            },
        });

        // Group by day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData: { day: string; minutesRead: number; wordsRead: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const daySessions = sessions.filter(s =>
                s.startedAt >= date && s.startedAt < nextDate
            );

            const minutesRead = daySessions.reduce((sum, s) => {
                if (s.endedAt) {
                    return sum + (s.endedAt.getTime() - s.startedAt.getTime()) / 60000;
                }
                return sum;
            }, 0);

            const wordsRead = daySessions.reduce((sum, s) => sum + s.wordsRead, 0);

            weeklyData.push({
                day: days[date.getDay()],
                minutesRead: Math.round(minutesRead),
                wordsRead,
            });
        }

        res.status(200).json({
            success: true,
            data: weeklyData,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/stats/progress
 * Get WPM progress over time
 */
export async function getWpmProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        // Get last 10 sessions with WPM > 0
        const sessions = await prisma.readingSession.findMany({
            where: {
                userId,
                wpm: { gt: 0 },
            },
            orderBy: { startedAt: 'asc' },
            take: 20,
            select: {
                startedAt: true,
                wpm: true,
            },
        });

        const progressData = sessions.map((s, index) => ({
            index,
            date: s.startedAt.toISOString().split('T')[0],
            wpm: s.wpm,
        }));

        res.status(200).json({
            success: true,
            data: progressData,
        });
    } catch (error) {
        next(error);
    }
}
