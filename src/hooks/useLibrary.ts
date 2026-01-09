import { useState, useEffect, useCallback } from 'react';
import { ImportedBook } from '../types/libraryTypes';
import { getAllBooks, deleteBook, initLibraryStorage, loadTextChunk } from '../services/libraryStorage';

interface UseLibraryResult {
    books: ImportedBook[];
    isLoading: boolean;
    error: string | null;
    refreshBooks: () => Promise<void>;
    removeBook: (bookId: string) => Promise<void>;
    getBookContent: (bookId: string, chunkIndex: number) => Promise<string>;
}

export function useLibrary(): UseLibraryResult {
    const [books, setBooks] = useState<ImportedBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBooks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await initLibraryStorage();
            const loadedBooks = await getAllBooks();
            // Sort by most recently read/imported
            loadedBooks.sort((a, b) => {
                const dateA = new Date(a.lastReadAt || a.importedAt).getTime();
                const dateB = new Date(b.lastReadAt || b.importedAt).getTime();
                return dateB - dateA;
            });
            setBooks(loadedBooks);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load books');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    const removeBook = useCallback(async (bookId: string) => {
        try {
            await deleteBook(bookId);
            setBooks(prev => prev.filter(b => b.id !== bookId));
        } catch (e) {
            console.error('Failed to delete book:', e);
            throw e;
        }
    }, []);

    const getBookContent = useCallback(async (bookId: string, chunkIndex: number): Promise<string> => {
        return loadTextChunk(bookId, chunkIndex);
    }, []);

    return {
        books,
        isLoading,
        error,
        refreshBooks: loadBooks,
        removeBook,
        getBookContent,
    };
}
