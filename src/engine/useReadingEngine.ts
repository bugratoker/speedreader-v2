/**
 * useReadingEngine Hook
 * Unified hook for all reading modes with shared controls
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
        useSmartChunking = true,
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
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds

    // Refs for callbacks
    const onCompleteRef = useRef(onComplete);
    const onProgressRef = useRef(onProgress);

    // Refs for timer logic
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const expectedTimeRef = useRef<number>(0);
    const currentIndexRef = useRef(currentIndex);

    // Keep currentIndex ref in sync
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onProgressRef.current = onProgress;
    }, [onComplete, onProgress]);

    // Derived data based on mode - Memoized to prevent recalculation on every tick
    const words = useMemo(() => textToWords(text), [text]);

    const chunks = useMemo(() =>
        textToChunks(text, chunkSize, useSmartChunking),
        [text, chunkSize, useSmartChunking]
    );

    const bionicWords = useMemo(() => textToBionicWords(text), [text]);

    // Total items depends on mode
    const totalItems = mode === 'chunk' ? chunks.length : words.length;

    // Progress calculation
    const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

    // Current display data
    const currentWord = words[currentIndex] || '';
    const currentChunk = mode === 'chunk' ? chunks[currentIndex] : undefined;
    const previousChunk = mode === 'chunk' && currentIndex > 0 ? chunks[currentIndex - 1] : undefined;
    const nextChunk = mode === 'chunk' && currentIndex < chunks.length - 1 ? chunks[currentIndex + 1] : undefined;

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

    // Timer loop with drift correction
    // Timer loop with drift correction
    useEffect(() => {
        if (!isPlaying || isPaused || isComplete) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        const delay = getDelay();
        // Set initial expected time
        expectedTimeRef.current = Date.now() + delay;

        const tick = () => {
            const now = Date.now();

            // Check if we reached the end
            if (currentIndexRef.current >= totalItems - 1) {
                setIsComplete(true);
                setIsPlaying(false);
                onCompleteRef.current?.();
                return;
            }

            // Move to next word
            setCurrentIndex(prev => prev + 1);

            // Calculate next expected time
            expectedTimeRef.current += delay;

            // Calculate drift and set next timeout
            // If we are behind (now > expectedTimeRef.current), this will be small or 0
            const nextDelay = Math.max(0, expectedTimeRef.current - now);

            timerRef.current = setTimeout(tick, nextDelay);
        };

        timerRef.current = setTimeout(tick, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isPlaying, isPaused, isComplete, getDelay, totalItems]);

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
        setElapsedTime(0); // Reset timer on mode change
    }, []);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Elapsed time timer (1s interval)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !isPaused && !isComplete) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isPaused, isComplete]);

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
        previousChunk,
        nextChunk,
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
        setCurrentIndex,
        undo,
        elapsedTime, // Exposed for UI
    };
};
