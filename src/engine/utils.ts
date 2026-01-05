/**
 * Bionic Text Utilities
 * Functions for processing text in Bionic reading mode
 */

import { BionicWord } from './types';

/**
 * Calculate how many letters to bold for a word
 * Generally ~40% of the word, minimum 1
 */
export const getBoldLength = (word: string): number => {
    const cleanWord = word.replace(/[^a-zA-ZçğışöüÇĞİŞÖÜ0-9]/g, '');
    const len = cleanWord.length;

    if (len <= 1) return 1;
    if (len <= 3) return 1;
    if (len <= 5) return 2;
    if (len <= 8) return 3;
    return Math.ceil(len * 0.4);
};

/**
 * Convert a word to bionic format
 */
export const toBionicWord = (word: string): BionicWord => {
    if (!word.trim()) {
        return { bold: '', normal: '', original: word };
    }

    // Find where the actual letters start (handle punctuation at start)
    const leadingPunc = word.match(/^[^a-zA-ZçğışöüÇĞİŞÖÜ0-9]*/)?.[0] || '';
    const trailingPunc = word.match(/[^a-zA-ZçğışöüÇĞİŞÖÜ0-9]*$/)?.[0] || '';
    const cleanWord = word.slice(leadingPunc.length, word.length - (trailingPunc.length || 0));

    const boldLen = getBoldLength(cleanWord);

    return {
        bold: leadingPunc + cleanWord.slice(0, boldLen),
        normal: cleanWord.slice(boldLen) + trailingPunc,
        original: word,
    };
};

/**
 * Convert entire text to bionic words
 */
export const textToBionicWords = (text: string): BionicWord[] => {
    return text.split(/\s+/).filter(w => w.length > 0).map(toBionicWord);
};

/**
 * Split text into chunks of N words
 * Supports smart phrase-based chunking that respects natural language boundaries
 */
export const textToChunks = (
    text: string,
    chunkSize: number = 3,
    useSmartChunking: boolean = true
): string[][] => {
    const words = text.split(/\s+/).filter(w => w.length > 0);

    if (!useSmartChunking) {
        // Simple mechanical chunking
        const chunks: string[][] = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize));
        }
        return chunks;
    }

    // Smart phrase-based chunking
    const chunks: string[][] = [];
    let currentChunk: string[] = [];

    // Words that typically start new phrases (break BEFORE these)
    const phraseStarters = new Set([
        // English
        'the', 'a', 'an', 'this', 'that', 'these', 'those',
        'and', 'but', 'or', 'so', 'yet', 'for', 'nor',
        'when', 'while', 'if', 'unless', 'although', 'because', 'since',
        'who', 'which', 'that', 'where', 'what', 'how', 'why',
        'in', 'on', 'at', 'by', 'with', 'from', 'to', 'into', 'onto',
        'however', 'therefore', 'moreover', 'furthermore', 'meanwhile',
        // Turkish
        've', 'ama', 'fakat', 'veya', 'ya da', 'çünkü', 'için',
        'bu', 'şu', 'o', 'bunlar', 'şunlar', 'onlar',
        'ile', 'gibi', 'kadar', 'üzere', 'rağmen', 'dolayı',
        'ancak', 'oysa', 'halbuki', 'yani', 'öyleyse',
    ]);

    // Punctuation that ends phrases (break AFTER these)
    const endPunctuation = /[.!?,;:—–-]$/;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordLower = word.toLowerCase().replace(/[^a-zçğışöü]/g, '');
        const prevWord = i > 0 ? words[i - 1] : '';

        // Should we break before this word?
        const shouldBreakBefore =
            currentChunk.length >= chunkSize || // Hit max size
            (currentChunk.length >= 2 && phraseStarters.has(wordLower)) || // Natural phrase start
            (currentChunk.length >= 2 && endPunctuation.test(prevWord)); // Previous word ended phrase

        if (shouldBreakBefore && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
        }

        currentChunk.push(word);

        // Force break after punctuation at max size
        if (currentChunk.length >= chunkSize && endPunctuation.test(word)) {
            chunks.push(currentChunk);
            currentChunk = [];
        }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
};

/**
 * Split text into words
 */
export const textToWords = (text: string): string[] => {
    return text.split(/\s+/).filter(w => w.length > 0);
};
