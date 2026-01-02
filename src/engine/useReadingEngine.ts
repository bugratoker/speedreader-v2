/**
 * useReadingEngine Hook
 * Unified hook for all reading modes with shared controls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ReadingMode,
    ReadingEngine,
    ReadingEngineConfig,
    BionicWord,
    DEFAULT_WPM,
    MIN_WPM,
    MAX_WPM,
    WPM_STEP,
    DEFAULT_CHUNK_SIZE,
} from './types';
import { textToWords, textToChunks, textToBionicWords } from './utils';

export const useReadingEngine = (config: ReadingEngineConfig): ReadingEngine => {
    const {
        text,
        mode: initialMode,
        initialWpm = DEFAULT_WPM,
        chunkSize = DEFAULT_CHUNK_SIZE,
        onComplete,
        onProgress,
    } = config;

    // Core state
    const [mode, setModeState] = useState<ReadingMode>(initialMode);
    const [wpm, setWpmState] = useState(initialWpm);
    const [isPaused, setIsPaused] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs for callbacks
    const onCompleteRef = useRef(onComplete);
    const onProgressRef = useRef(onProgress);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onProgressRef.current = onProgress;
    }, [onComplete, onProgress]);

    // Derived data based on mode
    const words = textToWords(text);
    const chunks = textToChunks(text, chunkSize);
    const bionicWords = textToBionicWords(text);

    // Total items depends on mode
    const totalItems = mode === 'chunk' ? chunks.length : words.length;

    // Progress calculation
    const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

    // Current display data
    const currentWord = words[currentIndex] || '';
    const currentChunk = mode === 'chunk' ? chunks[currentIndex] : undefined;

    // Calculate delay based on WPM and mode
    const getDelay = useCallback(() => {
        const baseDelay = 60000 / wpm;
        if (mode === 'chunk') {
            // Multiply by chunk size for chunking mode
            return baseDelay * chunkSize;
        }
        return baseDelay;
    }, [wpm, mode, chunkSize]);

    // Progress effect
    useEffect(() => {
        onProgressRef.current?.(progress);
    }, [progress]);

    // Timer effect for RSVP and Chunking modes
    useEffect(() => {
        if (!isPlaying || isPaused || isComplete) return;
        if (mode === 'bionic') return; // Bionic doesn't auto-advance

        const delay = getDelay();

        const timer = setTimeout(() => {
            if (currentIndex < totalItems - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsComplete(true);
                setIsPlaying(false);
                onCompleteRef.current?.();
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [isPlaying, isPaused, isComplete, currentIndex, totalItems, mode, getDelay]);

    // Actions
    const start = useCallback(() => {
        setCurrentIndex(0);
        setIsComplete(false);
        setIsPaused(false);
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        setIsPaused(false);
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const reset = useCallback(() => {
        setCurrentIndex(0);
        setIsComplete(false);
        setIsPaused(true);
        setIsPlaying(false);
    }, []);

    const setWpm = useCallback((newWpm: number) => {
        setWpmState(Math.min(MAX_WPM, Math.max(MIN_WPM, newWpm)));
    }, []);

    const speedUp = useCallback(() => {
        setWpmState(prev => Math.min(MAX_WPM, prev + WPM_STEP));
    }, []);

    const slowDown = useCallback(() => {
        setWpmState(prev => Math.max(MIN_WPM, prev - WPM_STEP));
    }, []);

    const setMode = useCallback((newMode: ReadingMode) => {
        setModeState(newMode);
        // Reset position when changing modes
        setCurrentIndex(0);
        setIsComplete(false);
    }, []);

    return {
        // State
        mode,
        wpm,
        isPaused,
        isPlaying,
        isComplete,
        progress,
        currentIndex,
        totalItems,
        words,

        // Mode-specific data
        currentWord,
        currentChunk,
        bionicText: bionicWords,

        // Actions
        start,
        pause,
        resume,
        togglePause,
        reset,
        setWpm,
        speedUp,
        slowDown,
        setMode,
    };
};
