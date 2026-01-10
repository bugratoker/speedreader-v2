/**
 * Book Controller
 * Handles book and chunk related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import type { CreateBookInput, CreateChunkInput, BookWithProgress } from '../types';

/**
 * GET /api/books
 * List all books for the authenticated user
 */
export async function listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where: { userId },
                orderBy: { importedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    progress: {
                        where: { userId },
                        select: { chunkIndex: true, wordIndex: true, percentage: true },
                    },
                },
            }),
            prisma.book.count({ where: { userId } }),
        ]);

        const booksWithProgress: BookWithProgress[] = books.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            sourceType: book.sourceType,
            totalWords: book.totalWords,
            totalChunks: book.totalChunks,
            coverColor: book.coverColor,
            importedAt: book.importedAt,
            lastReadAt: book.lastReadAt,
            progress: book.progress[0] || null,
        }));

        res.status(200).json({
            success: true,
            data: {
                items: booksWithProgress,
                total,
                page,
                limit,
                hasMore: skip + books.length < total,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/books/:id
 * Get a single book by ID
 */
export async function getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.id;

        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
            include: {
                progress: {
                    where: { userId },
                    select: { chunkIndex: true, wordIndex: true, percentage: true },
                },
            },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                ...book,
                progress: book.progress[0] || null,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/books
 * Create a new book
 */
export async function createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const input: CreateBookInput = req.body;

        const book = await prisma.book.create({
            data: {
                userId,
                title: input.title,
                author: input.author,
                sourceType: input.sourceType,
                originalFileName: input.originalFileName,
                totalWords: input.totalWords,
                totalChunks: input.totalChunks,
                coverColor: input.coverColor,
            },
        });

        // Create initial progress
        await prisma.readingProgress.create({
            data: {
                userId,
                bookId: book.id,
                chunkIndex: 0,
                wordIndex: 0,
                percentage: 0,
            },
        });

        res.status(201).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/books/:id
 * Update a book
 */
export async function updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.id;
        const { title, author } = req.body;

        // Verify ownership
        const existing = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!existing) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        const book = await prisma.book.update({
            where: { id: bookId },
            data: { title, author },
        });

        res.status(200).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/books/:id
 * Delete a book and its chunks
 */
export async function deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.id;

        // Verify ownership
        const existing = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!existing) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        // Delete book (cascades to chunks, progress, sessions)
        await prisma.book.delete({
            where: { id: bookId },
        });

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/books/:bookId/chunks
 * Get all chunks for a book
 */
export async function listChunks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.bookId;

        // Verify ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        const chunks = await prisma.textChunk.findMany({
            where: { bookId },
            orderBy: { chunkIndex: 'asc' },
            select: {
                id: true,
                chunkIndex: true,
                wordCount: true,
                startWord: true,
                endWord: true,
            },
        });

        res.status(200).json({
            success: true,
            data: chunks,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/books/:bookId/chunks/:index
 * Get a specific chunk by index
 */
export async function getChunk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.bookId;
        const chunkIndex = parseInt(req.params.index);

        // Verify ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        const chunk = await prisma.textChunk.findUnique({
            where: {
                bookId_chunkIndex: { bookId, chunkIndex },
            },
        });

        if (!chunk) {
            res.status(404).json({ success: false, error: 'Chunk not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: chunk,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/books/:bookId/chunks
 * Upload chunks for a book (batch)
 */
export async function createChunks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;
        const bookId = req.params.bookId;
        const chunks: CreateChunkInput[] = req.body.chunks;

        // Verify ownership
        const book = await prisma.book.findFirst({
            where: { id: bookId, userId },
        });

        if (!book) {
            res.status(404).json({ success: false, error: 'Book not found' });
            return;
        }

        // Create chunks in transaction
        await prisma.$transaction(
            chunks.map(chunk =>
                prisma.textChunk.create({
                    data: {
                        bookId,
                        chunkIndex: chunk.chunkIndex,
                        content: chunk.content,
                        wordCount: chunk.wordCount,
                        startWord: chunk.startWord,
                        endWord: chunk.endWord,
                    },
                })
            )
        );

        res.status(201).json({
            success: true,
            message: `Created ${chunks.length} chunks`,
        });
    } catch (error) {
        next(error);
    }
}
