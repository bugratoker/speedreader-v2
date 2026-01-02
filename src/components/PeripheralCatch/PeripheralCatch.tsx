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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PeripheralCatchProps {
    onComplete?: (score: number, total: number) => void;
}

// Word groups with similar-looking distractors for authentic training
const WORD_GROUPS = [
    { target: 'FOCUS', distractors: ['LOCUS', 'FOGUS', 'FOUND'] },
    { target: 'SPEED', distractors: ['SPIED', 'STEED', 'SPELL'] },
    { target: 'BRAIN', distractors: ['DRAIN', 'BRAID', 'TRAIN'] },
    { target: 'LEARN', distractors: ['YEARN', 'LEANT', 'LEAN'] },
    { target: 'THINK', distractors: ['THICK', 'THUNK', 'BLINK'] },
    { target: 'POWER', distractors: ['TOWER', 'PORER', 'POKER'] },
    { target: 'SHARP', distractors: ['SHAPE', 'SHARK', 'SHARD'] },
    { target: 'QUICK', distractors: ['QUIET', 'QUACK', 'THICK'] },
    { target: 'ALERT', distractors: ['ALTER', 'AVERT', 'ALOFT'] },
    { target: 'SKILL', distractors: ['SKULL', 'SPILL', 'STILL'] },
    { target: 'VISION', distractors: ['FUSION', 'VISON', 'VISUAL'] },
    { target: 'EXPAND', distractors: ['EXPEND', 'EXTEND', 'EXPLND'] },
    { target: 'DECODE', distractors: ['RECODE', 'ENCODE', 'DECOBE'] },
    { target: 'ABSORB', distractors: ['ABSORV', 'ADSORB', 'ABSURD'] },
];

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

    const areaWidth = SCREEN_WIDTH - spacing.md * 4;
    const areaHeight = 300; // Slightly taller for diagonal positions
    const totalRounds = DIFFICULTY_CONFIG[difficulty].rounds;
    const wordFontSize = DIFFICULTY_CONFIG[difficulty].fontSize;

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
        const availableGroups = WORD_GROUPS.filter(g => !usedWords.has(g.target));
        if (availableGroups.length === 0) {
            setUsedWords(new Set()); // Reset if all words used
            return WORD_GROUPS[Math.floor(Math.random() * WORD_GROUPS.length)];
        }
        return availableGroups[Math.floor(Math.random() * availableGroups.length)];
    }, [usedWords]);

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
            withTiming(1.1, { duration: 150 }),
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

    // EXTREME edge positioning for true peripheral training
    const getWordStyle = (position: Position) => {
        const baseStyle = {
            position: 'absolute' as const,
            fontFamily: fontFamily.uiBold,
            fontSize: wordFontSize,
            color: colors.primary,
            textShadowColor: colors.primaryGlow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
        };

        // Position words at EXTREME edges - within 8px of border
        switch (position) {
            case 'left':
                return { ...baseStyle, left: 8, top: areaHeight / 2 - 10 };
            case 'right':
                return { ...baseStyle, right: 8, top: areaHeight / 2 - 10 };
            case 'top':
                return { ...baseStyle, top: 8, left: areaWidth / 2 - 30 };
            case 'bottom':
                return { ...baseStyle, bottom: 8, left: areaWidth / 2 - 30 };
            case 'topLeft':
                return { ...baseStyle, top: 12, left: 8 };
            case 'topRight':
                return { ...baseStyle, top: 12, right: 8 };
            case 'bottomLeft':
                return { ...baseStyle, bottom: 12, left: 8 };
            case 'bottomRight':
                return { ...baseStyle, bottom: 12, right: 8 };
        }
    };

    const getPositionMarkerStyle = (position: Position) => {
        const baseStyle = {
            position: 'absolute' as const,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.glassBorder,
            opacity: 0.25,
        };

        switch (position) {
            case 'left':
                return { ...baseStyle, left: 12, top: areaHeight / 2 - 3 };
            case 'right':
                return { ...baseStyle, right: 12, top: areaHeight / 2 - 3 };
            case 'top':
                return { ...baseStyle, top: 12, left: areaWidth / 2 - 3 };
            case 'bottom':
                return { ...baseStyle, bottom: 12, left: areaWidth / 2 - 3 };
            case 'topLeft':
                return { ...baseStyle, top: 15, left: 12 };
            case 'topRight':
                return { ...baseStyle, top: 15, right: 12 };
            case 'bottomLeft':
                return { ...baseStyle, bottom: 15, left: 12 };
            case 'bottomRight':
                return { ...baseStyle, bottom: 15, right: 12 };
        }
    };

    const getPerformanceMessage = () => {
        const percentage = (score / totalRounds) * 100;
        if (percentage >= 90) return { emoji: '🏆', text: 'Elite peripheral vision!', color: colors.success };
        if (percentage >= 75) return { emoji: '🎯', text: 'Excellent parafoveal span!', color: colors.primary };
        if (percentage >= 60) return { emoji: '👁️', text: 'Good peripheral awareness!', color: colors.secondary };
        if (percentage >= 40) return { emoji: '📈', text: 'Keep training, improving!', color: colors.textMuted };
        return { emoji: '💪', text: 'This is challenging! Practice more.', color: colors.textMuted };
    };

    const allPositions: Position[] = ['left', 'right', 'top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Eye size={18} color={colors.primary} strokeWidth={2} />
                <Text
                    style={{
                        fontFamily: fontFamily.uiRegular,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        textAlign: 'center',
                        marginLeft: spacing.sm,
                        flex: 1,
                    }}
                >
                    Lock eyes on ⊕ center. Catch words in extreme peripheral vision.
                </Text>
            </View>

            {/* Stats Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.lg }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>Round</Text>
                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                        {round + 1}/{totalRounds}
                    </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>Score</Text>
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

            {/* Game Area */}
            <View
                style={{
                    width: areaWidth,
                    height: areaHeight,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.bento,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}
            >
                {/* Countdown Overlay */}
                {gameState === 'countdown' && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.92)',
                            width: '100%',
                            height: '100%',
                            borderRadius: borderRadius.bento,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: 56,
                                color: colors.primary,
                            }}
                        >
                            {countdown || 'GO!'}
                        </Text>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.sm,
                                color: colors.textMuted,
                                marginTop: spacing.sm,
                            }}
                        >
                            Eyes LOCKED on center!
                        </Text>
                    </View>
                )}

                {/* Position Markers (all 8 positions) */}
                {allPositions.map((pos) => (
                    <View key={pos} style={getPositionMarkerStyle(pos)} />
                ))}

                {/* Focus Ring Animation */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: 85,
                            height: 85,
                            borderRadius: 42.5,
                            borderWidth: 2,
                            borderColor: colors.primary,
                        },
                        focusRingStyle,
                    ]}
                />

                {/* Central Focus Point */}
                <Animated.View style={focusPulseStyle}>
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: colors.surface,
                            borderWidth: 2,
                            borderColor: colors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            ...glows.primarySubtle,
                        }}
                    >
                        <Crosshair size={26} color={colors.primary} strokeWidth={2} />
                    </View>
                </Animated.View>

                {/* Peripheral Word - at EXTREME edges */}
                {currentWord && (
                    <Animated.Text
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(80)}
                        style={getWordStyle(wordPosition)}
                    >
                        {currentWord}
                    </Animated.Text>
                )}

                {/* Feedback Indicator */}
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
            </View>

            {/* Answer Options - Similar-looking words */}
            {waitingForInput && options.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
                        <AlertCircle size={14} color={colors.secondary} strokeWidth={2} />
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: colors.secondary,
                                marginLeft: spacing.xs,
                            }}
                        >
                            Which word did you catch?
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
                        {options.map((word, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleOptionPress(word)}
                                style={({ pressed }) => ({
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.sm,
                                    backgroundColor: pressed ? colors.primaryDim : colors.surface,
                                    borderRadius: borderRadius.md,
                                    borderWidth: 2,
                                    borderColor: pressed ? colors.primary : colors.glassBorder,
                                    minWidth: 80,
                                    alignItems: 'center',
                                })}
                            >
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.text }}>{word}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            {/* Completion Screen */}
            {gameState === 'complete' && (
                <View
                    style={{
                        marginTop: spacing.lg,
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                        borderWidth: 1,
                        borderColor: getPerformanceMessage().color,
                        width: areaWidth,
                    }}
                >
                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 32, color: getPerformanceMessage().color }}>
                        {getPerformanceMessage().emoji} {score}/{totalRounds}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.text, marginTop: spacing.xs }}>
                        {getPerformanceMessage().text}
                    </Text>
                    {bestStreak > 1 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                            <TrendingUp size={16} color={colors.secondary} strokeWidth={2} />
                            <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.secondary, marginLeft: spacing.xs }}>
                                Best streak: {bestStreak} in a row
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Difficulty Selector */}
            {(gameState === 'ready' || gameState === 'complete') && (
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: spacing.lg,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.xs,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                    }}
                >
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
                        <Pressable
                            key={level}
                            onPress={() => setDifficulty(level)}
                            style={{
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.sm,
                                borderRadius: borderRadius.md,
                                backgroundColor: difficulty === level ? colors.primary : 'transparent',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.xs,
                                    color: difficulty === level ? colors.background : colors.textMuted,
                                }}
                            >
                                {DIFFICULTY_CONFIG[level].label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Ready State Instructions */}
            {gameState === 'ready' && (
                <View
                    style={{
                        marginTop: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        width: areaWidth,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.secondary,
                            textAlign: 'center',
                            marginBottom: spacing.xs,
                        }}
                    >
                        ⚡ {DIFFICULTY_CONFIG[difficulty].description} flash • {DIFFICULTY_CONFIG[difficulty].rounds} rounds
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                            textAlign: 'center',
                        }}
                    >
                        Words flash at EXTREME edges. Keep eyes locked on center. Choose from similar-looking options.
                    </Text>
                </View>
            )}

            {/* Controls */}
            {(gameState === 'ready' || gameState === 'complete') && (
                <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md }}>
                    <Pressable
                        onPress={handleStart}
                        style={({ pressed }) => ({
                            paddingHorizontal: spacing.xl,
                            paddingVertical: spacing.md,
                            backgroundColor: pressed ? colors.primaryDim : colors.primary,
                            borderRadius: borderRadius.lg,
                            flexDirection: 'row',
                            alignItems: 'center',
                        })}
                    >
                        <Play size={20} color={colors.background} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.background, marginLeft: spacing.sm }}>
                            {gameState === 'complete' ? 'Play Again' : 'Start'}
                        </Text>
                    </Pressable>

                    {gameState === 'complete' && (
                        <Pressable
                            onPress={handleReset}
                            style={({ pressed }) => ({
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.md,
                                backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                                borderRadius: borderRadius.lg,
                                borderWidth: 1,
                                borderColor: colors.glassBorder,
                            })}
                        >
                            <RotateCcw size={20} color={colors.textMuted} strokeWidth={2} />
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    );
};
