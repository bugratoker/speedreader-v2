/**
 * Utility helper functions
 */

/**
 * Generate a random color from a string (for book covers)
 */
export function generateColorFromString(str: string): string {
    const colors = [
        '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
        '#fee140', '#a8edea', '#d299c2', '#89f7fe', '#6a11cb',
        '#f5576c', '#4776E6', '#00d2ff', '#a18cd1', '#ff6b6b',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Chunk text into segments of approximately wordCount words
 */
export function chunkText(text: string, wordsPerChunk: number = 10000): string[] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunkWords = words.slice(i, i + wordsPerChunk);
        chunks.push(chunkWords.join(' '));
    }

    return chunks;
}

/**
 * Clean and normalize text extracted from PDF
 */
export function cleanText(text: string): string {
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove page numbers (common patterns)
        .replace(/\n\d+\n/g, '\n')
        // Remove very short lines (likely headers/footers)
        .split('\n')
        .filter(line => line.trim().length > 20)
        .join('\n')
        .trim();
}

/**
 * Format date for API responses
 */
export function formatDate(date: Date): string {
    return date.toISOString();
}

/**
 * Calculate reading percentage
 */
export function calculatePercentage(
    currentWord: number,
    totalWords: number
): number {
    if (totalWords === 0) return 0;
    return Math.min(100, Math.round((currentWord / totalWords) * 100));
}
