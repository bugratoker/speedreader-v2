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
 */
export const textToChunks = (text: string, chunkSize: number = 3): string[][] => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks: string[][] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize));
    }

    return chunks;
};

/**
 * Split text into words
 */
export const textToWords = (text: string): string[] => {
    return text.split(/\s+/).filter(w => w.length > 0);
};
