/**
 * Peripheral Catch - Parafoveal Vision Training
 * Identify words in EXTREME peripheral vision without breaking central focus.
 * 
 * Academic Basis: Research indicates that speed readers utilize "Parafoveal Processing"
 * to pre-process upcoming words. This drill expands the visual span beyond the foveal center.
 * 
 * Key Training Principles:
 * - Words appear at EXTREME edges (true peripheral vision, not foveal)
 * - Similar-looking distractor words to prevent letter-guessing
 * - 8-direction positioning for complete peripheral span training
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withRepeat,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Play, RotateCcw, Crosshair, CheckCircle, XCircle, Eye, TrendingUp, AlertCircle } from 'lucide-react-native';
import { HUDOverlay } from './HUDOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PeripheralCatchProps {
    onComplete?: (score: number, total: number) => void;
}

// 8 positions for complete peripheral coverage
type Position = 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

const DIFFICULTY_CONFIG: Record<Difficulty, {
    displayTime: number;
    label: string;
    description: string;
    rounds: number;
    fontSize: number;
}> = {
    beginner: { displayTime: 2000, label: 'Beginner', description: '2.0s', rounds: 8, fontSize: 20 },
    intermediate: { displayTime: 1200, label: 'Intermediate', description: '1.2s', rounds: 10, fontSize: 18 },
    advanced: { displayTime: 600, label: 'Advanced', description: '0.6s', rounds: 12, fontSize: 17 },
    expert: { displayTime: 300, label: 'Expert', description: '0.3s', rounds: 15, fontSize: 16 },
};

const FEEDBACK_TIME = 500;

export const PeripheralCatch: React.FC<PeripheralCatchProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const wordGroupsData = t('games.peripheral.wordGroups', { returnObjects: true });
    // Safety check to ensure wordGroups is an array
    const wordGroups = Array.isArray(wordGroupsData) ? (wordGroupsData as { target: string; distractors: string[] }[]) : [];

    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    const [gameState, setGameState] = useState<'ready' | 'countdown' | 'playing' | 'feedback' | 'complete'>('ready');
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [countdown, setCountdown] = useState(3);
    const [currentWord, setCurrentWord] = useState<string | null>(null);
    const [wordPosition, setWordPosition] = useState<Position>('left');



    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const correctWordRef = useRef<string>('');
    const focusPulse = useSharedValue(1);
    const focusRingScale = useSharedValue(1);
    const focusRingOpacity = useSharedValue(0.3);

    const areaWidth = SCREEN_WIDTH - spacing.md * 2; // Maximize width (only small padding)
    const areaHeight = 400; // Taller for better vertical peripheral range
    const totalRounds = DIFFICULTY_CONFIG[difficulty].rounds;
    const wordFontSize = DIFFICULTY_CONFIG[difficulty].fontSize; // Reset to base size (User feedback: "too big")

    // Animate focus ring when waiting for input
    useEffect(() => {
        if (waitingForInput) {
            focusRingScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
            focusRingOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 500 }),
                    withTiming(0.25, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            focusRingScale.value = withTiming(1, { duration: 200 });
            focusRingOpacity.value = withTiming(0.3, { duration: 200 });
        }
    }, [waitingForInput, focusRingScale, focusRingOpacity]);

    const getRandomWordGroup = useCallback(() => {
        const availableGroups = wordGroups.filter(g => !usedWords.has(g.target));
        if (availableGroups.length === 0) {
            setUsedWords(new Set()); // Reset if all words used
            return wordGroups[Math.floor(Math.random() * wordGroups.length)];
        }
        return availableGroups[Math.floor(Math.random() * availableGroups.length)];
    }, [usedWords, wordGroups]);

    const getRandomPosition = useCallback((): Position => {
        // 8 positions for complete peripheral training
        const positions: Position[] = [
            'left', 'right', 'top', 'bottom',
            'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
        ];
        return positions[Math.floor(Math.random() * positions.length)];
    }, []);

    const generateOptions = useCallback((wordGroup: { target: string; distractors: string[] }): string[] => {
        // Use the word's specific similar-looking distractors
        const allOptions = [...wordGroup.distractors.slice(0, 3), wordGroup.target];
        return allOptions.sort(() => Math.random() - 0.5);
    }, []);

    const startRound = useCallback(() => {
        const wordGroup = getRandomWordGroup();
        const position = getRandomPosition();

        correctWordRef.current = wordGroup.target;
        setCurrentWord(wordGroup.target);
        setWordPosition(position);
        setOptions(generateOptions(wordGroup));
        setWaitingForInput(false);
        setShowFeedback(null);
        setGameState('playing');
        setUsedWords(prev => new Set(prev).add(wordGroup.target));

        // Focus pulse when word appears
        focusPulse.value = withSequence(
            withTiming(1.3, { duration: 150 }), // Stronger pulse
            withTiming(1, { duration: 150 })
        );

        // Hide word after display time
        timeoutRef.current = setTimeout(() => {
            setCurrentWord(null);
            setWaitingForInput(true);
        }, DIFFICULTY_CONFIG[difficulty].displayTime);
    }, [getRandomWordGroup, getRandomPosition, generateOptions, focusPulse, difficulty]);

    const handleOptionPress = useCallback((selectedWord: string) => {
        if (!waitingForInput) return;

        setWaitingForInput(false);
        const isCorrect = selectedWord === correctWordRef.current;

        setShowFeedback(isCorrect ? 'correct' : 'wrong');
        setGameState('feedback');

        if (isCorrect) {
            setScore(s => s + 1);
            setStreak(s => {
                const newStreak = s + 1;
                if (newStreak > bestStreak) setBestStreak(newStreak);
                return newStreak;
            });
        } else {
            setStreak(0);
        }

        timeoutRef.current = setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= totalRounds) {
                setGameState('complete');
                onComplete?.(score + (isCorrect ? 1 : 0), totalRounds);
            } else {
                setRound(nextRound);
                startRound();
            }
        }, FEEDBACK_TIME);
    }, [waitingForInput, round, score, startRound, onComplete, totalRounds, bestStreak]);

    // Countdown effect
    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                startRound();
            }
        }
    }, [gameState, countdown, startRound]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleStart = () => {
        if (gameState === 'complete') {
            handleReset();
        }
        setCountdown(3);
        setGameState('countdown');
    };

    const handleReset = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setGameState('ready');
        setCurrentWord(null);
        setWordPosition('left');
        setRound(0);
        setScore(0);
        setShowFeedback(null);
        setOptions([]);
        setWaitingForInput(false);
        setStreak(0);
        setUsedWords(new Set());
        correctWordRef.current = '';
    };

    const focusPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: focusPulse.value }],
    }));

    const focusRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: focusRingScale.value }],
        opacity: focusRingOpacity.value,
    }));

    // EXTREME edge positioning for true peripheral training - PUSH TO LIMITS
    // SAFE ZONES: Ensure word center doesn't clip. Approx 40px padding used.
    const getWordStyle = (position: Position) => {
        const baseStyle = {
            position: 'absolute' as const,
            fontFamily: fontFamily.uiBold,
            fontSize: wordFontSize,
            color: colors.text, // High contrast text
            textShadowColor: colors.background, // Outline effect for clarity
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 1,
        };

        const edgePadding = 32; // Increased padding to prevent clipping (User feedback)
        const midX = areaWidth / 2;
        const midY = areaHeight / 2;

        // Coordinates calculation to ensure no overlap and extreme position
        switch (position) {
            case 'left':
                return { ...baseStyle, left: edgePadding, top: midY - 10 };
            case 'right':
                return { ...baseStyle, right: edgePadding, top: midY - 10 };
            case 'top':
                return { ...baseStyle, top: edgePadding, left: midX - 30 };
            case 'bottom':
                return { ...baseStyle, bottom: edgePadding, left: midX - 30 };
            case 'topLeft':
                return { ...baseStyle, top: edgePadding + 10, left: edgePadding };
            case 'topRight':
                return { ...baseStyle, top: edgePadding + 10, right: edgePadding };
            case 'bottomLeft':
                return { ...baseStyle, bottom: edgePadding + 10, left: edgePadding };
            case 'bottomRight':
                return { ...baseStyle, bottom: edgePadding + 10, right: edgePadding };
        }
    };

    const getPositionMarkerStyle = (position: Position) => {
        // Markers to help user map the space mentally
        const baseStyle = {
            position: 'absolute' as const,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.textMuted,
            opacity: 0.1, // Very subtle
        };

        const midX = areaWidth / 2;
        const midY = areaHeight / 2;
        const pad = 20;

        switch (position) {
            case 'left': return { ...baseStyle, left: pad, top: midY - 2 };
            case 'right': return { ...baseStyle, right: pad, top: midY - 2 };
            case 'top': return { ...baseStyle, top: pad, left: midX - 2 };
            case 'bottom': return { ...baseStyle, bottom: pad, left: midX - 2 };
            case 'topLeft': return { ...baseStyle, top: pad, left: pad };
            case 'topRight': return { ...baseStyle, top: pad, right: pad };
            case 'bottomLeft': return { ...baseStyle, bottom: pad, left: pad };
            case 'bottomRight': return { ...baseStyle, bottom: pad, right: pad };
        }
    };

    const getPerformanceMessage = () => {
        const percentage = (score / totalRounds) * 100;
        if (percentage >= 90) return { emoji: '🏆', text: t('games.peripheral.performance.elite'), color: colors.success };
        if (percentage >= 75) return { emoji: '🎯', text: t('games.peripheral.performance.excellent'), color: colors.primary };
        if (percentage >= 60) return { emoji: '👁️', text: t('games.peripheral.performance.good'), color: colors.secondary };
        if (percentage >= 40) return { emoji: '📈', text: t('games.peripheral.performance.keepGoing'), color: colors.textMuted };
        return { emoji: '💪', text: t('games.peripheral.performance.challenging'), color: colors.textMuted };
    };

    const allPositions: Position[] = ['left', 'right', 'top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

    return (
        <View style={{ alignItems: 'center', width: '100%' }}>
            {/* Header - Minimalist */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md, width: '100%' }}>
                <Eye size={18} color={colors.primary} strokeWidth={2} />
                <Text
                    style={{
                        fontFamily: fontFamily.uiRegular,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        marginLeft: spacing.sm,
                        flex: 1,
                    }}
                >
                    {t('games.peripheral.instructions')}
                </Text>
            </View>

            {/* Game Area & Controls Container */}
            <View
                style={{
                    width: areaWidth,
                    height: areaHeight,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.bento,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden', // Contain everything
                    position: 'relative',
                }}
            >
                {/* 1. Active Game Elements (Only visible when playing/countdown/feedback) */}

                {/* Position Markers (Always visible for structure, but dimmed) - Z:1 */}
                {allPositions.map((pos) => (
                    <View key={pos} style={[getPositionMarkerStyle(pos), { zIndex: 1 }]} />
                ))}

                {/* Central Focus Point - RED TARGET - Z:10 - Only show during active gameplay */}
                {(gameState === 'countdown' || gameState === 'playing' || gameState === 'feedback') && (
                    <Animated.View style={[focusPulseStyle, { zIndex: 10 }]}>
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                backgroundColor: colors.surface,
                                borderWidth: 3,
                                borderColor: '#FF4444', // Red for strong fixation
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#FF4444',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 15,
                                elevation: 8,
                            }}
                        >
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' }} />
                        </View>
                    </Animated.View>
                )}

                {/* Focus Ring Animation - Z:11 */}
                {(gameState === 'playing' || waitingForInput) && (
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: 75,
                                height: 75,
                                borderRadius: 37.5,
                                borderWidth: 1,
                                borderColor: '#FF4444',
                                opacity: 0.5,
                                zIndex: 11,
                            },
                            focusRingStyle,
                        ]}
                    />
                )}

                {/* Peripheral Word - Z:15 */}
                {currentWord && (
                    <Animated.Text
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(80)}
                        style={[getWordStyle(wordPosition), { zIndex: 15 }]}
                    >
                        {currentWord}
                    </Animated.Text>
                )}

                {/* Feedback Indicator - Z:20 */}
                {showFeedback && (
                    <View
                        style={{
                            position: 'absolute',
                            top: spacing.md,
                            right: spacing.md,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: showFeedback === 'correct' ? colors.success + '25' : colors.error + '25',
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                            borderRadius: borderRadius.md,
                            zIndex: 20,
                        }}
                    >
                        {showFeedback === 'correct' ? (
                            <>
                                <CheckCircle size={18} color={colors.success} />
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.success, marginLeft: spacing.xs }}>
                                    ✓
                                </Text>
                            </>
                        ) : (
                            <>
                                <XCircle size={18} color={colors.error} />
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.xs, color: colors.error, marginLeft: spacing.xs }}>
                                    {correctWordRef.current}
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {/* Countdown Overlay */}
                {gameState === 'countdown' && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: 80,
                                color: colors.primary,
                                ...glows.primary,
                            }}
                        >
                            {countdown || 'GO!'}
                        </Text>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.text,
                                marginTop: spacing.sm,
                            }}
                        >
                            {t('games.peripheral.eyesLocked')}
                        </Text>
                    </View>
                )}


                {/* 2. Menu / Controls Overlay (Visible when ready or complete) */}
                {(gameState === 'ready' || gameState === 'complete') && (
                    <View
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: colors.surface + 'F5', // More opaque to hide background elements
                            zIndex: 40,
                            justifyContent: 'space-between', // Use space-between for better vertical distribution
                            alignItems: 'center',
                            paddingVertical: spacing.xl,
                            paddingHorizontal: spacing.lg,
                        }}
                    >
                        {gameState === 'complete' ? (
                            // Completed State
                            <View style={{ alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 48, color: getPerformanceMessage().color, marginBottom: spacing.xs }}>
                                    {getPerformanceMessage().emoji}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 32, color: colors.text }}>
                                    {score}/{totalRounds}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.lg, textAlign: 'center' }}>
                                    {getPerformanceMessage().text}
                                </Text>

                                <Pressable
                                    onPress={handleStart}
                                    style={({ pressed }) => ({
                                        width: '90%',
                                        maxWidth: 280,
                                        paddingVertical: spacing.lg,
                                        backgroundColor: pressed ? '#1a8f3a' : '#22c55e', // Vibrant green
                                        borderRadius: borderRadius.lg,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: spacing.lg,
                                        shadowColor: '#22c55e',
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 14,
                                        elevation: 10,
                                        transform: [{ scale: pressed ? 0.97 : 1 }],
                                    })}
                                >
                                    <RotateCcw size={24} color="#fff" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: '#fff', marginLeft: spacing.xs }}>
                                        {t('games.common.playAgain')}
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            // Ready State - Redesigned layout
                            <>
                                {/* Top section - Title and Difficulty Selector */}
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md }}>
                                        {t('games.peripheral.selectDifficulty')}
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                            gap: spacing.sm,
                                            width: '100%',
                                        }}
                                    >
                                        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
                                            <Pressable
                                                key={level}
                                                onPress={() => setDifficulty(level)}
                                                style={{
                                                    paddingHorizontal: spacing.md,
                                                    paddingVertical: spacing.sm,
                                                    borderRadius: borderRadius.full,
                                                    backgroundColor: difficulty === level ? colors.primary : colors.surfaceElevated,
                                                    borderWidth: 1,
                                                    borderColor: difficulty === level ? colors.primary : colors.glassBorder,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily: fontFamily.uiMedium,
                                                        fontSize: fontSize.sm,
                                                        color: difficulty === level ? colors.background : colors.textMuted,
                                                    }}
                                                >
                                                    {t(`games.peripheral.difficulty.${level}`)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Middle section - Game Info (centered) */}
                                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <View style={{
                                        backgroundColor: colors.surfaceElevated,
                                        paddingHorizontal: spacing.xl,
                                        paddingVertical: spacing.lg,
                                        borderRadius: borderRadius.bento,
                                        borderWidth: 1,
                                        borderColor: colors.glassBorder,
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 36, color: colors.primary }}>
                                            {DIFFICULTY_CONFIG[difficulty].description}
                                        </Text>
                                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                                            {DIFFICULTY_CONFIG[difficulty].rounds} {t('games.common.round').toLowerCase()}s
                                        </Text>
                                    </View>
                                </View>

                                {/* Bottom section - Start Button */}
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Pressable
                                        onPress={handleStart}
                                        style={({ pressed }) => ({
                                            width: '100%',
                                            maxWidth: 280,
                                            paddingVertical: spacing.lg,
                                            backgroundColor: pressed ? '#1a8f3a' : '#22c55e', // Vibrant green
                                            borderRadius: borderRadius.lg,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: '#22c55e',
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 14,
                                            elevation: 10,
                                            transform: [{ scale: pressed ? 0.97 : 1 }],
                                        })}
                                    >
                                        <Play size={28} color="#fff" fill="#fff" />
                                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.xl, color: '#fff', marginLeft: spacing.xs }}>
                                            {t('games.common.start')}
                                        </Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Answer Options Overlay - Cyber HUD style (Kept same logic, just checked it overlays correctly) */}
            <HUDOverlay
                visible={waitingForInput && options.length > 0}
                options={options}
                onSelect={(word) => handleOptionPress(word)}
            />

            {/* Stats Footer - Z:50 to ensure it's above other elements */}
            {(gameState === 'playing' || gameState === 'feedback') && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.lg, zIndex: 50, position: 'relative' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>{t('games.common.round')}</Text>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                            {round + 1}/{totalRounds}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>{t('games.common.score')}</Text>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.success }}>{score}</Text>
                    </View>
                    {streak > 1 && (
                        <View
                            style={{
                                alignItems: 'center',
                                backgroundColor: colors.primaryGlow,
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xs,
                                borderRadius: borderRadius.md,
                            }}
                        >
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.sm, color: colors.primary }}>
                                🔥 {streak}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
