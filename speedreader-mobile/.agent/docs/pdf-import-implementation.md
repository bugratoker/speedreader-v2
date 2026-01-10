# PDF Import Feature - Implementation Guide

> **Status**: Planning document for future implementation  
> **Last Updated**: 2026-01-09  
> **Priority**: Phase 3 of Smart Library Enhancement

---

## Overview

Enable users to import PDF files, extract text content, and store locally for speed reading. Architecture designed for future backend migration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│  Tap Import → Pick PDF → Process → Store Chunks → Read          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                                │
├─────────────────────────────────────────────────────────────────┤
│  AsyncStorage                    expo-file-system                │
│  ┌─────────────┐                ┌─────────────────────┐         │
│  │ books.json  │ ◄──────────────► library/chunks/     │         │
│  │ (metadata)  │                 │  {bookId}_0.txt    │         │
│  └─────────────┘                 │  {bookId}_1.txt    │         │
│                                  │  ...               │         │
│                                  └─────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### 1. Book Metadata (stored in AsyncStorage)

```typescript
// src/types/libraryTypes.ts

export interface ImportedBook {
  id: string;                    // UUID
  title: string;                 // User can edit
  author?: string;               // Optional, extracted or manual
  sourceType: 'pdf' | 'epub' | 'url' | 'text';
  originalFileName?: string;     // For reference
  
  // Content stats
  totalWords: number;
  totalChunks: number;
  totalPages?: number;           // If available from PDF
  
  // Display
  coverColor: string;            // Generated from title hash
  
  // Timestamps
  importedAt: string;            // ISO date
  lastReadAt?: string;           // ISO date
  
  // Reading progress
  currentPosition: ReadingPosition;
  
  // Future backend sync
  syncStatus?: 'local' | 'synced' | 'pending';
  remoteId?: string;
}

export interface ReadingPosition {
  chunkIndex: number;           // Which chunk (0-indexed)
  wordIndex: number;            // Word position within chunk
  percentage: number;           // 0-100 overall progress
}

export interface TextChunk {
  bookId: string;
  chunkIndex: number;
  content: string;              // The actual text (~10K words)
  wordCount: number;
  startWord: number;            // Global word position start
  endWord: number;              // Global word position end
}
```

---

## Storage Strategy

### Why Chunked Storage?

A 400-page book ≈ 200,000 words ≈ 1.2MB of plain text.

| Approach | Memory at Startup | Read Performance | Complexity |
|----------|-------------------|------------------|------------|
| Single file | 1.2MB (bad) | Slow initial load | Simple |
| Per-page (400 files) | Low | Many file reads | Complex |
| **Chunked (10K words)** | ~60KB per chunk | Fast, predictable | Balanced |

**Decision**: 10,000 words per chunk (~40-50 pages)

### File Structure

```
<documentDirectory>/
└── library/
    ├── metadata.json          # Array of ImportedBook
    └── chunks/
        ├── abc123_0.txt       # Book abc123, chunk 0
        ├── abc123_1.txt       # Book abc123, chunk 1
        ├── abc123_2.txt       # ...
        ├── def456_0.txt       # Different book
        └── ...
```

---

## Implementation Files

### 1. Type Definitions

**File**: `src/types/libraryTypes.ts`

```typescript
export interface ImportedBook {
  id: string;
  title: string;
  author?: string;
  sourceType: 'pdf' | 'epub' | 'url' | 'text';
  originalFileName?: string;
  totalWords: number;
  totalChunks: number;
  coverColor: string;
  importedAt: string;
  lastReadAt?: string;
  currentPosition: {
    chunkIndex: number;
    wordIndex: number;
    percentage: number;
  };
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
  progress: number; // 0-100
  message?: string;
  error?: string;
}
```

---

### 2. Storage Service

**File**: `src/services/libraryStorage.ts`

```typescript
import * as FileSystem from 'expo-file-system';
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
  const data = await AsyncStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveBookMetadata(book: ImportedBook): Promise<void> {
  const books = await getAllBooks();
  const existingIndex = books.findIndex(b => b.id === book.id);
  
  if (existingIndex >= 0) {
    books[existingIndex] = book;
  } else {
    books.push(book);
  }
  
  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export async function deleteBook(bookId: string): Promise<void> {
  // Delete metadata
  const books = await getAllBooks();
  const filtered = books.filter(b => b.id !== bookId);
  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
  
  // Delete chunks
  const book = books.find(b => b.id === bookId);
  if (book) {
    for (let i = 0; i < book.totalChunks; i++) {
      const chunkPath = getChunkPath(bookId, i);
      const info = await FileSystem.getInfoAsync(chunkPath);
      if (info.exists) {
        await FileSystem.deleteAsync(chunkPath);
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
  const info = await FileSystem.getInfoAsync(path);
  
  if (!info.exists) {
    throw new Error(`Chunk ${chunkIndex} not found for book ${bookId}`);
  }
  
  return FileSystem.readAsStringAsync(path, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

// ============ READING PROGRESS ============

export async function updateReadingPosition(
  bookId: string,
  chunkIndex: number,
  wordIndex: number,
  totalWords: number
): Promise<void> {
  const books = await getAllBooks();
  const book = books.find(b => b.id === bookId);
  
  if (book) {
    const globalWordPosition = book.currentPosition.chunkIndex * 10000 + wordIndex;
    book.currentPosition = {
      chunkIndex,
      wordIndex,
      percentage: Math.round((globalWordPosition / totalWords) * 100),
    };
    book.lastReadAt = new Date().toISOString();
    await saveBookMetadata(book);
  }
}
```

---

### 3. PDF Processing Service (Placeholder for Backend)

**File**: `src/services/pdfService.ts`

```typescript
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { ImportedBook, TextChunk, ImportProgress } from '../types/libraryTypes';
import { saveBookMetadata, saveTextChunk, initLibraryStorage } from './libraryStorage';

const WORDS_PER_CHUNK = 10000;

// ============ FILE PICKER ============

export async function pickPDFFile(): Promise<{ uri: string; name: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });
  
  if (result.canceled) {
    return null;
  }
  
  return {
    uri: result.assets[0].uri,
    name: result.assets[0].name,
  };
}

// ============ TEXT EXTRACTION ============
// TODO: Replace with backend API call

export async function extractTextFromPDF(
  fileUri: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<string> {
  onProgress?.({ stage: 'parsing', progress: 10, message: 'Extracting text...' });
  
  // PLACEHOLDER: For now, this would call your backend API
  // When backend is ready, implement:
  //
  // const formData = new FormData();
  // formData.append('file', {
  //   uri: fileUri,
  //   type: 'application/pdf',
  //   name: 'document.pdf',
  // });
  //
  // const response = await fetch('YOUR_BACKEND/api/parse-pdf', {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // const { text } = await response.json();
  // return text;
  
  throw new Error('PDF parsing not implemented. Backend integration required.');
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

export async function importPDF(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportedBook | null> {
  try {
    await initLibraryStorage();
    
    // Step 1: Pick file
    onProgress?.({ stage: 'picking', progress: 0, message: 'Select a PDF file' });
    const file = await pickPDFFile();
    if (!file) return null;
    
    // Step 2: Extract text (requires backend)
    onProgress?.({ stage: 'reading', progress: 5, message: 'Reading file...' });
    const text = await extractTextFromPDF(file.uri, onProgress);
    
    // Step 3: Chunk text
    onProgress?.({ stage: 'chunking', progress: 60, message: 'Processing content...' });
    const chunks = chunkText(text);
    const totalWords = text.split(/\s+/).length;
    
    // Step 4: Generate book metadata
    const bookId = generateUUID();
    const book: ImportedBook = {
      id: bookId,
      title: file.name.replace('.pdf', ''),
      sourceType: 'pdf',
      originalFileName: file.name,
      totalWords,
      totalChunks: chunks.length,
      coverColor: generateColorFromString(file.name),
      importedAt: new Date().toISOString(),
      currentPosition: { chunkIndex: 0, wordIndex: 0, percentage: 0 },
    };
    
    // Step 5: Save chunks
    onProgress?.({ stage: 'saving', progress: 70, message: 'Saving content...' });
    let wordsSaved = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunkWordCount = chunks[i].split(/\s+/).length;
      await saveTextChunk({
        bookId,
        chunkIndex: i,
        content: chunks[i],
        wordCount: chunkWordCount,
        startWord: wordsSaved,
        endWord: wordsSaved + chunkWordCount - 1,
      });
      wordsSaved += chunkWordCount;
      onProgress?.({
        stage: 'saving',
        progress: 70 + Math.round((i / chunks.length) * 25),
        message: `Saving chunk ${i + 1}/${chunks.length}`,
      });
    }
    
    // Step 6: Save metadata
    onProgress?.({ stage: 'saving', progress: 95, message: 'Finalizing...' });
    await saveBookMetadata(book);
    
    onProgress?.({ stage: 'done', progress: 100, message: 'Import complete!' });
    return book;
    
  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// ============ UTILITIES ============

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateColorFromString(str: string): string {
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
    '#fee140', '#a8edea', '#d299c2', '#89f7fe', '#6a11cb',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
```

---

### 4. Import Modal Component

**File**: `src/components/library/ImportModal.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FileText, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { importPDF, ImportProgress } from '../../services/pdfService';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onClose,
  onImportComplete,
}) => {
  const { colors, fontFamily, fontSize, borderRadius } = useTheme();
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportPDF = async () => {
    setIsImporting(true);
    const result = await importPDF(setProgress);
    setIsImporting(false);
    
    if (result) {
      onImportComplete();
      setTimeout(onClose, 1500); // Show success briefly
    }
  };

  const renderContent = () => {
    if (progress?.stage === 'error') {
      return (
        <View style={styles.stateContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={[styles.message, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
            Import Failed
          </Text>
          <Text style={[styles.subMessage, { color: colors.textMuted }]}>
            {progress.error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => setProgress(null)}
          >
            <Text style={{ color: 'white', fontFamily: fontFamily.uiBold }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (progress?.stage === 'done') {
      return (
        <View style={styles.stateContainer}>
          <CheckCircle size={48} color="#22c55e" />
          <Text style={[styles.message, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
            Import Complete!
          </Text>
        </View>
      );
    }

    if (isImporting) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
            {progress?.message || 'Processing...'}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.glassBorder }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress?.progress || 0}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
          Import Content
        </Text>
        
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
          onPress={handleImportPDF}
        >
          <FileText size={24} color={colors.primary} />
          <View style={styles.optionText}>
            <Text style={{ color: colors.text, fontFamily: fontFamily.uiBold }}>
              PDF Document
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: fontFamily.uiRegular, fontSize: 12 }}>
              Import from your device
            </Text>
          </View>
        </TouchableOpacity>

        {/* Add more import options here: EPUB, URL, etc. */}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background, borderRadius: borderRadius.xl }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textMuted} />
          </TouchableOpacity>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    padding: 24,
    paddingBottom: 40,
    minHeight: 300,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 24,
  },
  optionsContainer: {
    paddingTop: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 16,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  message: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
```

---

### 5. Library Hook

**File**: `src/hooks/useLibrary.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { ImportedBook } from '../types/libraryTypes';
import { getAllBooks, deleteBook, initLibraryStorage } from '../services/libraryStorage';

export function useLibrary() {
  const [books, setBooks] = useState<ImportedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      await initLibraryStorage();
      const loadedBooks = await getAllBooks();
      setBooks(loadedBooks);
      setError(null);
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
    await deleteBook(bookId);
    setBooks(prev => prev.filter(b => b.id !== bookId));
  }, []);

  return {
    books,
    isLoading,
    error,
    refreshBooks: loadBooks,
    removeBook,
  };
}
```

---

## Dependencies Required

```bash
npx expo install expo-document-picker expo-file-system @react-native-async-storage/async-storage
```

---

## Integration Checklist

- [ ] Create `src/types/libraryTypes.ts`
- [ ] Create `src/services/libraryStorage.ts`
- [ ] Create `src/services/pdfService.ts` (with backend placeholder)
- [ ] Create `src/components/library/ImportModal.tsx`
- [ ] Create `src/hooks/useLibrary.ts`
- [ ] Update `BookshelfView.tsx` to use `useLibrary` hook
- [ ] Wire Import button to open modal
- [ ] Update `ReadScreen` to load chunks dynamically
- [ ] Test with real PDF files after backend is ready

---

## Backend API Specification (For Future)

When you build the backend, implement this endpoint:

```
POST /api/parse-pdf
Content-Type: multipart/form-data

Request:
  - file: PDF file (application/pdf)

Response:
  {
    "success": true,
    "text": "extracted text content...",
    "metadata": {
      "title": "Book Title",
      "author": "Author Name",
      "pages": 350
    }
  }
```

The `pdfService.ts` file has placeholder code ready to call this endpoint.

---

## Notes

1. **Memory Safety**: Chunked storage keeps memory low (~60KB per chunk loaded)
2. **Backend Ready**: Storage layer designed for easy API swap
3. **Progress Tracking**: Full progress callbacks for user feedback
4. **Error Handling**: Graceful error states with retry option
