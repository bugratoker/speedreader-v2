/**
 * Type definitions for Speed Reader Backend
 */

// ============ AUTH TYPES ============

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface SocialAuthInput {
    idToken: string;           // Google/Apple ID token
    email?: string;
    name?: string;
    avatarUrl?: string;
}

export interface GuestConvertInput {
    method: 'email' | 'google' | 'apple';
    email?: string;
    password?: string;
    name?: string;
    idToken?: string;          // For social auth
    avatarUrl?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// ============ USER TYPES ============

export type AuthMethod = 'email' | 'google' | 'apple' | 'guest';

export interface UserProfile {
    id: string;
    email: string | null;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
    authMethod: AuthMethod;
    isGuest: boolean;
}

export interface UpdateProfileInput {
    name?: string;
    avatarUrl?: string;
}

// ============ BOOK TYPES ============

export type SourceType = 'pdf' | 'epub' | 'url' | 'text' | 'ai';

export interface CreateBookInput {
    title: string;
    author?: string;
    sourceType: SourceType;
    originalFileName?: string;
    totalWords: number;
    totalChunks: number;
    coverColor: string;
}

export interface BookWithProgress {
    id: string;
    title: string;
    author: string | null;
    sourceType: string;
    totalWords: number;
    totalChunks: number;
    coverColor: string;
    importedAt: Date;
    lastReadAt: Date | null;
    progress: {
        chunkIndex: number;
        wordIndex: number;
        percentage: number;
    } | null;
}

// ============ CHUNK TYPES ============

export interface CreateChunkInput {
    chunkIndex: number;
    content: string;
    wordCount: number;
    startWord: number;
    endWord: number;
}

// ============ PROGRESS TYPES ============

export interface UpdateProgressInput {
    chunkIndex: number;
    wordIndex: number;
    percentage: number;
}

// ============ SESSION TYPES ============

export type ReadingMode = 'rsvp' | 'bionic' | 'chunk' | 'dual';

export interface CreateSessionInput {
    bookId: string;
    mode: ReadingMode;
}

export interface UpdateSessionInput {
    wordsRead: number;
    wpm: number;
    endedAt?: Date;
}

// ============ STATS TYPES ============

export interface UserStatsResponse {
    totalBooksRead: number;
    totalWordsRead: number;
    currentStreak: number;
    longestStreak: number;
    currentWpm: number;
    bestWpm: number;
    lastActiveAt: Date;
}

export interface WeeklyActivity {
    day: string;
    minutesRead: number;
    wordsRead: number;
}

// ============ TRAINING TYPES ============

export type ExerciseType = 'schulte' | 'saccadic' | 'eyeStretch' | 'peripheral';

export interface CreateTrainingSessionInput {
    exerciseType: ExerciseType;
    score: number;
    duration: number;
}

// ============ PDF TYPES ============

export interface PdfParseResult {
    text: string;
    metadata: {
        title?: string;
        author?: string;
        pages?: number;
    };
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
