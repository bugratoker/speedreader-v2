/**
 * PDF Controller
 * Handles PDF parsing and text extraction
 */

import { Request, Response, NextFunction } from 'express';
import pdfParse from 'pdf-parse';
import { cleanText, countWords, chunkText, generateColorFromString } from '../utils/helpers';
import { prisma } from '../utils/prisma';
import { storageService } from '../services/storage.service';
import { generateCoverImage } from '../utils/pdf-to-image';
import type { PdfParseResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/pdf/parse
 * Upload and parse a PDF file
 */
export async function parsePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }

        const buffer = req.file.buffer;

        // Parse PDF
        const pdfData = await pdfParse(buffer);

        // Clean and process text
        const text = cleanText(pdfData.text);
        const wordCount = countWords(text);

        // Extract metadata
        const metadata = {
            title: pdfData.info?.Title || req.file.originalname?.replace('.pdf', '') || 'Untitled',
            author: pdfData.info?.Author || undefined,
            pages: pdfData.numpages,
        };

        const result: PdfParseResult = {
            text,
            metadata,
        };

        res.status(200).json({
            success: true,
            data: {
                ...result,
                wordCount,
                chunkCount: Math.ceil(wordCount / 10000),
            },
        });
    } catch (error) {
        const err = error as Error;
        console.error('PDF parsing error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to parse PDF: ' + err.message,
        });
    }
}

/**
 * POST /api/pdf/import
 * Upload PDF, parse it, and create a book with chunks
 */
export async function importPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!.userId;

        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }

        const buffer = req.file.buffer;
        const originalFileName = req.file.originalname || 'document.pdf';
        const fileUuid = uuidv4();

        // Parse PDF
        const pdfData = await pdfParse(buffer);
        const text = cleanText(pdfData.text);
        const wordCount = countWords(text);

        if (wordCount < 10) {
            res.status(400).json({
                success: false,
                error: 'PDF contains too little text. It may be scanned or image-based.',
            });
            return;
        }

        // Upload PDF to R2
        let pdfUrl: string | undefined;
        try {
            const fileKey = `pdfs/${userId}/${fileUuid}.pdf`;
            pdfUrl = await storageService.uploadFile(fileKey, buffer, 'application/pdf');
        } catch (error) {
            console.error('Failed to upload PDF to storage:', error);
        }

        // Generate and Upload Cover Image
        let coverUrl: string | undefined;
        try {
            const coverBuffer = await generateCoverImage(buffer);
            const coverKey = `covers/${userId}/${fileUuid}.png`;
            coverUrl = await storageService.uploadFile(coverKey, coverBuffer, 'image/png');
        } catch (error) {
            console.error('Failed to generate or upload cover image:', error);
            // Non-critical, continue without cover
        }

        // Create chunks
        const chunks = chunkText(text, 10000);

        // Create book
        const book = await prisma.book.create({
            data: {
                userId,
                title: pdfData.info?.Title || originalFileName.replace('.pdf', ''),
                author: pdfData.info?.Author,
                sourceType: 'pdf',
                originalFileName,
                totalWords: wordCount,
                totalChunks: chunks.length,
                coverColor: generateColorFromString(originalFileName),
                pdfUrl: pdfUrl,
                coverUrl: coverUrl,
            },
        });

        // Create chunks
        let wordsSaved = 0;
        for (let i = 0; i < chunks.length; i++) {
            const chunkWordCount = countWords(chunks[i]);
            await prisma.textChunk.create({
                data: {
                    bookId: book.id,
                    chunkIndex: i,
                    content: chunks[i],
                    wordCount: chunkWordCount,
                    startWord: wordsSaved,
                    endWord: wordsSaved + chunkWordCount - 1,
                },
            });
            wordsSaved += chunkWordCount;
        }

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
            data: {
                book,
                chunksCreated: chunks.length,
                totalWords: wordCount,
            },
        });
    } catch (error) {
        next(error);
    }
}
