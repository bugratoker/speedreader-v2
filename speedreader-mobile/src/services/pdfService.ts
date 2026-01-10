/**
 * PDF Processing Service
 * Handles PDF file picking, text extraction placeholder, and chunking
 */

import * as DocumentPicker from 'expo-document-picker';
// Note: In SDK 54, use expo-file-system/legacy for the classic API
import * as FileSystem from 'expo-file-system/legacy';
import { ImportedBook, TextChunk, ImportProgress } from '../types/libraryTypes';
import {
    saveBookMetadata,
    saveTextChunk,
    initLibraryStorage,
    generateUUID,
    generateColorFromString,
} from './libraryStorage';

const WORDS_PER_CHUNK = 10000;

// ============ FILE PICKER ============

export async function pickPDFFile(): Promise<{ uri: string; name: string } | null> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'text/plain'],
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return null;
        }

        return {
            uri: result.assets[0].uri,
            name: result.assets[0].name,
        };
    } catch (error) {
        console.error('Document picker error:', error);
        return null;
    }
}

// ============ TEXT EXTRACTION ============

// OCR.space Free API - supports PDF text extraction
// Free tier: 5MB max file size, 25,000 requests/month
const OCR_SPACE_API_KEY = 'K85858773788957'; // Free API key (limited)
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Extract text from files using OCR.space API for PDFs
 */
export async function extractTextFromFile(
    fileUri: string,
    fileName: string,
    onProgress?: (progress: ImportProgress) => void
): Promise<string> {
    onProgress?.({ stage: 'reading', progress: 10, message: 'Reading file...' });

    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    const isTxt = fileName.toLowerCase().endsWith('.txt');

    if (isTxt) {
        // Plain text files can be read directly
        const content = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        onProgress?.({ stage: 'parsing', progress: 50, message: 'Processing text...' });
        return content;
    }

    if (isPDF) {
        onProgress?.({ stage: 'parsing', progress: 15, message: 'Uploading PDF...' });

        try {
            // Get file info to check size
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            const fileSizeMB = (fileInfo.size || 0) / (1024 * 1024);
            console.log('[PDF Import] File size:', fileSizeMB.toFixed(2), 'MB');

            // OCR.space free API limit is strict (1MB for some regions/keys, 5MB for others)
            // We use uploadAsync to avoid base64 overhead (which adds ~33% size)
            if (fileSizeMB > 5) {
                throw new Error(
                    `PDF is too large (${fileSizeMB.toFixed(1)}MB). Free API limit is 5MB. ` +
                    'Please use a smaller file or the "Paste Text" option.'
                );
            }

            onProgress?.({ stage: 'parsing', progress: 30, message: 'Processing PDF...' });
            console.log('[PDF Import] Uploading via FileSystem.uploadAsync...');

            const response = await FileSystem.uploadAsync(OCR_SPACE_API_URL, fileUri, {
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'file',
                mimeType: 'application/pdf',
                parameters: {
                    apikey: OCR_SPACE_API_KEY,
                    language: 'eng',
                    isOverlayRequired: 'false',
                    filetype: 'PDF',
                    detectOrientation: 'true',
                    scale: 'true',
                    OCREngine: '1', // Engine 1 supports PDF parsing better than 2 for some docs
                },
            });

            console.log('[PDF Import] Response status:', response.status);

            if (response.status !== 200) {
                console.error('[PDF Import] Upload failed:', response.body);
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const result = JSON.parse(response.body);
            // console.log('[PDF Import] API result:', JSON.stringify(result, null, 2));

            if (result.IsErroredOnProcessing) {
                const errorMessage = result.ErrorMessage?.[0] || result.ErrorDetails || 'Processing failed';
                console.error('[PDF Import] API Error:', errorMessage);

                if (errorMessage.includes('size limit')) {
                    throw new Error(
                        'File too large for free API (max 1MB). ' +
                        'Please use "Paste Text" for this document.'
                    );
                }
                throw new Error(errorMessage);
            }

            const parsedResults = result.ParsedResults || [];
            console.log('[PDF Import] Parsed pages:', parsedResults.length);

            const extractedText = parsedResults
                .map((r: { ParsedText?: string }) => r.ParsedText || '')
                .join('\n\n')
                .trim();

            console.log('[PDF Import] Extracted text length:', extractedText.length);

            if (!extractedText || extractedText.length < 10) {
                throw new Error(
                    'No text found in PDF. It might be scanned/image-based. ' +
                    'Please use "Paste Text" instead.'
                );
            }

            onProgress?.({ stage: 'parsing', progress: 70, message: 'Text extracted!' });
            return extractedText;

        } catch (error) {
            console.error('[PDF Import] Error:', error);
            if (error instanceof Error) {
                // Pass through readable errors
                throw error;
            }
            throw new Error('Import failed. Please try "Paste Text" instead.');
        }
    }

    throw new Error('Unsupported file type. Please use PDF or TXT files.');
}

/**
 * Basic PDF text extraction from raw content
 * This works for simple text-based PDFs but not scanned documents
 */
function extractTextFromPDFContent(rawContent: string): string {
    const textParts: string[] = [];

    // Try to find text between BT (begin text) and ET (end text) markers
    const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
    let match;

    while ((match = btEtRegex.exec(rawContent)) !== null) {
        const textBlock = match[1];
        // Extract text within parentheses (PDF text strings)
        const textRegex = /\(([^)]+)\)/g;
        let textMatch;
        while ((textMatch = textRegex.exec(textBlock)) !== null) {
            const text = textMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '')
                .replace(/\\/g, '');
            if (text.trim()) {
                textParts.push(text);
            }
        }
    }

    // Also try to find text in Tj operators
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    while ((match = tjRegex.exec(rawContent)) !== null) {
        const text = match[1].replace(/\\/g, '').trim();
        if (text && !textParts.includes(text)) {
            textParts.push(text);
        }
    }

    return textParts.join(' ').replace(/\s+/g, ' ').trim();
}

// ============ TEXT CHUNKING ============

export function chunkText(text: string): string[] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
        const chunkWords = words.slice(i, i + WORDS_PER_CHUNK);
        chunks.push(chunkWords.join(' '));
    }

    return chunks;
}

// ============ FULL IMPORT FLOW ============

export async function importDocument(
    onProgress?: (progress: ImportProgress) => void
): Promise<ImportedBook | null> {
    try {
        await initLibraryStorage();

        // Step 1: Pick file
        onProgress?.({ stage: 'picking', progress: 0, message: 'Select a file...' });
        const file = await pickPDFFile();
        if (!file) {
            return null; // User cancelled
        }

        // Step 2: Extract text
        const text = await extractTextFromFile(file.uri, file.name, onProgress);

        if (!text || text.trim().length < 10) {
            throw new Error('Could not extract any text from this file.');
        }

        // Step 3: Chunk text
        onProgress?.({ stage: 'chunking', progress: 60, message: 'Processing content...' });
        const chunks = chunkText(text);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;

        // Step 4: Generate book metadata
        const bookId = generateUUID();
        const title = file.name
            .replace(/\.(pdf|txt)$/i, '')
            .replace(/[-_]/g, ' ')
            .trim();

        const book: ImportedBook = {
            id: bookId,
            title: title,
            sourceType: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
            originalFileName: file.name,
            totalWords,
            totalChunks: chunks.length,
            coverColor: generateColorFromString(title),
            importedAt: new Date().toISOString(),
            currentPosition: { chunkIndex: 0, wordIndex: 0, percentage: 0 },
        };

        // Step 5: Save chunks
        onProgress?.({ stage: 'saving', progress: 70, message: 'Saving content...' });
        let wordsSaved = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunkWords = chunks[i].split(/\s+/).filter(w => w.length > 0);
            const chunkWordCount = chunkWords.length;

            await saveTextChunk({
                bookId,
                chunkIndex: i,
                content: chunks[i],
                wordCount: chunkWordCount,
                startWord: wordsSaved,
                endWord: wordsSaved + chunkWordCount - 1,
            });

            wordsSaved += chunkWordCount;

            const saveProgress = 70 + Math.round((i / chunks.length) * 25);
            onProgress?.({
                stage: 'saving',
                progress: saveProgress,
                message: `Saving ${i + 1}/${chunks.length}...`,
            });
        }

        // Step 6: Save metadata
        onProgress?.({ stage: 'saving', progress: 95, message: 'Finalizing...' });
        await saveBookMetadata(book);

        onProgress?.({ stage: 'done', progress: 100, message: 'Import complete!' });
        return book;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onProgress?.({
            stage: 'error',
            progress: 0,
            error: errorMessage,
        });
        return null;
    }
}

// ============ IMPORT TEXT DIRECTLY ============

export async function importTextContent(
    content: string,
    title: string,
    onProgress?: (progress: ImportProgress) => void
): Promise<ImportedBook | null> {
    try {
        await initLibraryStorage();

        onProgress?.({ stage: 'chunking', progress: 30, message: 'Processing content...' });

        const chunks = chunkText(content);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;

        const bookId = generateUUID();

        const book: ImportedBook = {
            id: bookId,
            title: title,
            sourceType: 'text',
            totalWords,
            totalChunks: chunks.length,
            coverColor: generateColorFromString(title),
            importedAt: new Date().toISOString(),
            currentPosition: { chunkIndex: 0, wordIndex: 0, percentage: 0 },
        };

        // Save chunks
        onProgress?.({ stage: 'saving', progress: 50, message: 'Saving content...' });
        let wordsSaved = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunkWords = chunks[i].split(/\s+/).filter(w => w.length > 0);
            await saveTextChunk({
                bookId,
                chunkIndex: i,
                content: chunks[i],
                wordCount: chunkWords.length,
                startWord: wordsSaved,
                endWord: wordsSaved + chunkWords.length - 1,
            });
            wordsSaved += chunkWords.length;
        }

        // Save metadata
        await saveBookMetadata(book);

        onProgress?.({ stage: 'done', progress: 100, message: 'Import complete!' });
        return book;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onProgress?.({ stage: 'error', progress: 0, error: errorMessage });
        return null;
    }
}
