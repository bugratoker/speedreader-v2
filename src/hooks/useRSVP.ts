/**
 * useRSVP Hook
 * Reusable logic for RSVP (Rapid Serial Visual Presentation) reading
 * Single Responsibility: Manages word progression and timing
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseRSVPOptions {
    words: string[];
    initialWpm?: number;
    minWpm?: number;
    maxWpm?: number;
    wpmStep?: number;
    autoStart?: boolean;
    onWordChange?: (index: number, word: string) => void;
    onComplete?: (finalWpm: number) => void;
}

export interface UseRSVPReturn {
    // State
    currentWordIndex: number;
    currentWord: string;
    wpm: number;
    isPaused: boolean;
    isPlaying: boolean;
    isComplete: boolean;
    progress: number;
    totalWords: number;

    // Actions
    start: () => void;
    pause: () => void;
    resume: () => void;
    togglePause: () => void;
    reset: () => void;
    speedUp: () => void;
    slowDown: () => void;
    setWpm: (wpm: number) => void;
    goToWord: (index: number) => void;
}

const DEFAULT_WPM = 200;
const DEFAULT_MIN_WPM = 100;
const DEFAULT_MAX_WPM = 800;
const DEFAULT_WPM_STEP = 25;

export const useRSVP = (options: UseRSVPOptions): UseRSVPReturn => {
    const {
        words,
        initialWpm = DEFAULT_WPM,
        minWpm = DEFAULT_MIN_WPM,
        maxWpm = DEFAULT_MAX_WPM,
        wpmStep = DEFAULT_WPM_STEP,
        autoStart = false,
        onWordChange,
        onComplete,
    } = options;

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [wpm, setWpmState] = useState(initialWpm);
    const [isPaused, setIsPaused] = useState(!autoStart);
    const [isPlaying, setIsPlaying] = useState(autoStart);
    const [isComplete, setIsComplete] = useState(false);

    const onCompleteRef = useRef(onComplete);
    const onWordChangeRef = useRef(onWordChange);

    // Update refs when callbacks change
    useEffect(() => {
        onCompleteRef.current = onComplete;
        onWordChangeRef.current = onWordChange;
    }, [onComplete, onWordChange]);

    const totalWords = words.length;
    const currentWord = words[currentWordIndex] || '';
    const progress = totalWords > 0 ? ((currentWordIndex + 1) / totalWords) * 100 : 0;

    // Calculate delay between words based on WPM
    const wordDelay = wpm > 0 ? 60000 / wpm : 1000;

    // Word progression effect
    useEffect(() => {
        if (!isPlaying || isPaused || isComplete || totalWords === 0) return;

        const timer = setTimeout(() => {
            if (currentWordIndex < totalWords - 1) {
                const nextIndex = currentWordIndex + 1;
                setCurrentWordIndex(nextIndex);
                onWordChangeRef.current?.(nextIndex, words[nextIndex]);
            } else {
                setIsComplete(true);
                setIsPlaying(false);
                onCompleteRef.current?.(wpm);
            }
        }, wordDelay);

        return () => clearTimeout(timer);
    }, [isPlaying, isPaused, isComplete, currentWordIndex, totalWords, wordDelay, words, wpm]);

    // Actions
    const start = useCallback(() => {
        setCurrentWordIndex(0);
        setIsComplete(false);
        setIsPaused(false);
        setIsPlaying(true);
        onWordChangeRef.current?.(0, words[0]);
    }, [words]);

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
        setCurrentWordIndex(0);
        setIsComplete(false);
        setIsPaused(true);
        setIsPlaying(false);
    }, []);

    const speedUp = useCallback(() => {
        setWpmState(prev => Math.min(maxWpm, prev + wpmStep));
    }, [maxWpm, wpmStep]);

    const slowDown = useCallback(() => {
        setWpmState(prev => Math.max(minWpm, prev - wpmStep));
    }, [minWpm, wpmStep]);

    const setWpm = useCallback((newWpm: number) => {
        setWpmState(Math.min(maxWpm, Math.max(minWpm, newWpm)));
    }, [minWpm, maxWpm]);

    const goToWord = useCallback((index: number) => {
        if (index >= 0 && index < totalWords) {
            setCurrentWordIndex(index);
            setIsComplete(false);
            onWordChangeRef.current?.(index, words[index]);
        }
    }, [totalWords, words]);

    return {
        currentWordIndex,
        currentWord,
        wpm,
        isPaused,
        isPlaying,
        isComplete,
        progress,
        totalWords,
        start,
        pause,
        resume,
        togglePause,
        reset,
        speedUp,
        slowDown,
        setWpm,
        goToWord,
    };
};
