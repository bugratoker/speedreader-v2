/**
 * Library Types - Book and Content Management
 */

export interface ImportedBook {
    id: string;
    title: string;
    author?: string;
    sourceType: 'pdf' | 'epub' | 'url' | 'text';
    originalFileName?: string;

    // Content stats
    totalWords: number;
    totalChunks: number;

    // Display
    coverColor: string;

    // Timestamps
    importedAt: string;
    lastReadAt?: string;

    // Reading progress
    currentPosition: ReadingPosition;
}

export interface ReadingPosition {
    chunkIndex: number;
    wordIndex: number;
    percentage: number;
}

export interface TextChunk {
    bookId: string;
    chunkIndex: number;
    content: string;
    wordCount: number;
    startWord: number;
    endWord: number;
}

export interface ImportProgress {
    stage: 'picking' | 'reading' | 'parsing' | 'chunking' | 'saving' | 'done' | 'error';
    progress: number;
    message?: string;
    error?: string;
}

// For mapping mock books to imported books
export function mockToImportedBook(mockBook: {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    progress: number;
    totalWords: number;
    currentWord: number;
}): ImportedBook {
    const percentage = Math.round((mockBook.currentWord / mockBook.totalWords) * 100);
    const wordsPerChunk = 10000;
    const chunkIndex = Math.floor(mockBook.currentWord / wordsPerChunk);
    const wordIndex = mockBook.currentWord % wordsPerChunk;

    return {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        sourceType: 'text',
        totalWords: mockBook.totalWords,
        totalChunks: Math.ceil(mockBook.totalWords / wordsPerChunk),
        coverColor: mockBook.coverColor,
        importedAt: new Date().toISOString(),
        currentPosition: {
            chunkIndex,
            wordIndex,
            percentage,
        },
    };
}
