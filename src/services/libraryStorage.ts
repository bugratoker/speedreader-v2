/**
 * Library Storage Service
 * Handles local storage of books and text chunks using expo-file-system
 */

// Note: In SDK 54, use expo-file-system/legacy for the classic API
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImportedBook, TextChunk } from '../types/libraryTypes';

const LIBRARY_DIR = `${FileSystem.documentDirectory}library/`;
const CHUNKS_DIR = `${LIBRARY_DIR}chunks/`;
const BOOKS_KEY = '@speedreader/books';

// ============ INITIALIZATION ============

export async function initLibraryStorage(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(CHUNKS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CHUNKS_DIR, { intermediates: true });
    }
}

// ============ BOOK METADATA ============

export async function getAllBooks(): Promise<ImportedBook[]> {
    try {
        const data = await AsyncStorage.getItem(BOOKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load books:', error);
        return [];
    }
}

export async function getBook(bookId: string): Promise<ImportedBook | null> {
    const books = await getAllBooks();
    return books.find(b => b.id === bookId) || null;
}

export async function saveBookMetadata(book: ImportedBook): Promise<void> {
    const books = await getAllBooks();
    const existingIndex = books.findIndex(b => b.id === book.id);

    if (existingIndex >= 0) {
        books[existingIndex] = book;
    } else {
        books.unshift(book); // Add new books at the beginning
    }

    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export async function deleteBook(bookId: string): Promise<void> {
    // Get book first to know how many chunks to delete
    const books = await getAllBooks();
    const book = books.find(b => b.id === bookId);

    // Delete metadata
    const filtered = books.filter(b => b.id !== bookId);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));

    // Delete chunks
    if (book) {
        for (let i = 0; i < book.totalChunks; i++) {
            const chunkPath = getChunkPath(bookId, i);
            try {
                const info = await FileSystem.getInfoAsync(chunkPath);
                if (info.exists) {
                    await FileSystem.deleteAsync(chunkPath);
                }
            } catch (e) {
                console.warn(`Failed to delete chunk ${i}:`, e);
            }
        }
    }
}

// ============ TEXT CHUNKS ============

function getChunkPath(bookId: string, chunkIndex: number): string {
    return `${CHUNKS_DIR}${bookId}_${chunkIndex}.txt`;
}

export async function saveTextChunk(chunk: TextChunk): Promise<void> {
    const path = getChunkPath(chunk.bookId, chunk.chunkIndex);
    await FileSystem.writeAsStringAsync(path, chunk.content, {
        encoding: FileSystem.EncodingType.UTF8,
    });
}

export async function loadTextChunk(bookId: string, chunkIndex: number): Promise<string> {
    const path = getChunkPath(bookId, chunkIndex);

    try {
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists) {
            throw new Error(`Chunk ${chunkIndex} not found for book ${bookId}`);
        }

        return await FileSystem.readAsStringAsync(path, {
            encoding: FileSystem.EncodingType.UTF8,
        });
    } catch (error) {
        console.error(`Failed to load chunk ${chunkIndex}:`, error);
        throw error;
    }
}

export async function loadAllChunksForBook(bookId: string, totalChunks: number): Promise<string> {
    const chunks: string[] = [];
    for (let i = 0; i < totalChunks; i++) {
        const chunk = await loadTextChunk(bookId, i);
        chunks.push(chunk);
    }
    return chunks.join(' ');
}

// ============ READING PROGRESS ============

export async function updateReadingPosition(
    bookId: string,
    chunkIndex: number,
    wordIndex: number
): Promise<void> {
    const book = await getBook(bookId);

    if (book) {
        const globalWordPosition = chunkIndex * 10000 + wordIndex;
        book.currentPosition = {
            chunkIndex,
            wordIndex,
            percentage: Math.min(100, Math.round((globalWordPosition / book.totalWords) * 100)),
        };
        book.lastReadAt = new Date().toISOString();
        await saveBookMetadata(book);
    }
}

// ============ UTILITIES ============

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

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
