/**
 * Reading Engine Types
 * Core type definitions for all reading modes
 */

// Available reading modes
export type ReadingMode = 'rsvp' | 'bionic' | 'chunk' | 'guided';

// Reading engine configuration
export interface ReadingEngineConfig {
    text: string;
    mode: ReadingMode;
    initialWpm?: number;
    chunkSize?: number; // For chunking mode (default: 3)
    onComplete?: () => void;
    onProgress?: (progress: number) => void;
}

// Shared state across all modes
export interface ReadingEngineState {
    mode: ReadingMode;
    wpm: number;
    isPaused: boolean;
    isPlaying: boolean;
    isComplete: boolean;
    progress: number;
    currentIndex: number;
    totalItems: number; // words for RSVP, chunks for chunking, lines for bionic
}

// Actions available on all modes
export interface ReadingEngineActions {
    start: () => void;
    pause: () => void;
    resume: () => void;
    togglePause: () => void;
    reset: () => void;
    setWpm: (wpm: number) => void;
    speedUp: () => void;
    slowDown: () => void;
    setMode: (mode: ReadingMode) => void;
}

// Combined engine interface
export interface ReadingEngine extends ReadingEngineState, ReadingEngineActions {
    // Mode-specific data
    currentWord?: string;      // RSVP
    currentChunk?: string[];   // Chunk
    bionicText?: BionicWord[]; // Bionic
    words: string[];
}

// Bionic mode specific types
export interface BionicWord {
    bold: string;    // First part to bold
    normal: string;  // Rest of the word
    original: string; // Full original word
}

// Default values
export const DEFAULT_WPM = 300;
export const MIN_WPM = 100;
export const MAX_WPM = 800;
export const WPM_STEP = 25;
export const DEFAULT_CHUNK_SIZE = 3;

// Mode labels for UI
export const MODE_LABELS: Record<ReadingMode, { en: string; tr: string }> = {
    rsvp: { en: 'RSVP', tr: 'RSVP' },
    bionic: { en: 'Bionic', tr: 'Biyonik' },
    chunk: { en: 'Chunk', tr: 'Parçalama' },
    guided: { en: 'Guided', tr: 'Rehberli' },
};

// Mode descriptions
export const MODE_DESCRIPTIONS: Record<ReadingMode, { en: string; tr: string }> = {
    rsvp: {
        en: 'One word at a time with focus point',
        tr: 'Odak noktası ile tek tek kelime'
    },
    bionic: {
        en: 'Bold first letters for faster reading',
        tr: 'Daha hızlı okuma için kalın ilk harfler'
    },
    chunk: {
        en: 'Groups of 2-3 words together',
        tr: '2-3 kelimelik gruplar halinde'
    },
    guided: {
        en: 'Neon pacer guides your reading',
        tr: 'Neon işaretçi okumana rehberlik eder'
    },
};
