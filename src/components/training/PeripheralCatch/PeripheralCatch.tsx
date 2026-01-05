/**
 * Word Preview Recognition - Parafoveal Vision Training (v3)
 * 
 * NEW MECHANIC: Train the parafoveal preview benefit - previewing words
 * peripherally before eyes arrive, then measuring recognition speed.
 * 
 * Academic Basis: Rayner (2009) shows skilled readers process 7-9 letter
 * spaces to the right of fixation. This drill trains predictive word recognition.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
    FadeIn,
    FadeOut,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { PremiumButton } from '../../ui/PremiumButton';
import { Play, RotateCcw, Eye, Zap, Target } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PeripheralCatchProps {
    onComplete?: (score: number, total: number) => void;
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type GameState = 'ready' | 'countdown' | 'preview' | 'recognize' | 'feedback' | 'complete';

interface DifficultyConfig {
    previewTime: number;      // Time to preview the peripheral word
    recognitionTime: number;  // Max time to tap recognized word
    rounds: number;
    wordDistance: number;     // Character spaces from center (7-12)
    blurLevel: number;        // 0-1 for peripheral word blur
    description: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    beginner: { previewTime: 1200, recognitionTime: 3000, rounds: 8, wordDistance: 7, blurLevel: 0.2, description: '7 chars • 1.2s preview' },
    intermediate: { previewTime: 800, recognitionTime: 2500, rounds: 10, wordDistance: 9, blurLevel: 0.35, description: '9 chars • 0.8s preview' },
    advanced: { previewTime: 600, recognitionTime: 2000, rounds: 12, wordDistance: 11, blurLevel: 0.5, description: '11 chars • 0.6s preview' },
    expert: { previewTime: 400, recognitionTime: 1500, rounds: 15, wordDistance: 13, blurLevel: 0.6, description: '13 chars • 0.4s preview' },
};

// Word pairs: center word and peripheral words (target + distractors)
const WORD_PAIRS = [
    { center: 'FOCUS', target: 'BRAIN', distractors: ['DRAIN', 'TRAIN', 'GRAIN'] },
    { center: 'SPEED', target: 'LIGHT', distractors: ['SIGHT', 'MIGHT', 'NIGHT'] },
    { center: 'THINK', target: 'POWER', distractors: ['TOWER', 'LOWER', 'MOWER'] },
    { center: 'SKILL', target: 'SHARP', distractors: ['SHAPE', 'SHARK', 'SHARE'] },
    { center: 'QUICK', target: 'BLINK', distractors: ['DRINK', 'SHRINK', 'THINK'] },
    { center: 'LEARN', target: 'SPEED', distractors: ['STEED', 'BLEED', 'GREED'] },
    { center: 'SIGHT', target: 'MIND', distractors: ['FIND', 'BIND', 'KIND'] },
    { center: 'TRAIN', target: 'WORK', distractors: ['FORK', 'CORK', 'PORK'] },
    { center: 'POWER', target: 'CAST', distractors: ['PAST', 'FAST', 'LAST'] },
    { center: 'BLINK', target: 'MAKE', distractors: ['TAKE', 'BAKE', 'LAKE'] },
    { center: 'GREED', target: 'READ', distractors: ['LEAD', 'BEAD', 'DEAD'] },
    { center: 'SHARE', target: 'SKILL', distractors: ['STILL', 'SPILL', 'GRILL'] },
    { center: 'FORGE', target: 'BRAIN', distractors: ['TRAIN', 'DRAIN', 'GRAIN'] },
    { center: 'BLADE', target: 'THINK', distractors: ['BLINK', 'DRINK', 'SHRINK'] },
    { center: 'STORM', target: 'LIGHT', distractors: ['NIGHT', 'SIGHT', 'MIGHT'] },
];

export const PeripheralCatch: React.FC<PeripheralCatchProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    // Game state
    const [gameState, setGameState] = useState<GameState>('ready');
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [countdown, setCountdown] = useState(3);

    // Round state
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // Current round data
    const [currentPair, setCurrentPair] = useState<typeof WORD_PAIRS[0] | null>(null);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);

    // Timing
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const recognitionStartTime = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const usedPairs = useRef<Set<number>>(new Set());

    // Animation values
    const focusPulse = useSharedValue(1);
    const peripheralOpacity = useSharedValue(0);
    const peripheralBlur = useSharedValue(1);
    const centerOpacity = useSharedValue(1);
    const arrowPulse = useSharedValue(0);

    const config = DIFFICULTY_CONFIG[difficulty];
    const areaWidth = SCREEN_WIDTH - spacing.md * 2;
    const areaHeight = 320;

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Generate next pair
    const getNextPair = useCallback(() => {
        const available = WORD_PAIRS.map((_, i) => i).filter(i => !usedPairs.current.has(i));
        const pool = available.length > 0 ? available : WORD_PAIRS.map((_, i) => i);

        const randomIndex = pool[Math.floor(Math.random() * pool.length)];
        usedPairs.current.add(randomIndex);

        if (usedPairs.current.size >= WORD_PAIRS.length) {
            usedPairs.current.clear();
        }

        return WORD_PAIRS[randomIndex];
    }, []);

    // Start preview phase
    const startPreview = useCallback(() => {
        const pair = getNextPair();
        setCurrentPair(pair);

        // Shuffle options (target + distractors)
        const options = [pair.target, ...pair.distractors].sort(() => Math.random() - 0.5);
        setShuffledOptions(options);

        // Reset animations
        centerOpacity.value = 1;
        peripheralOpacity.value = 0;
        peripheralBlur.value = config.blurLevel;
        arrowPulse.value = 0;

        setGameState('preview');

        // Fade in peripheral word
        peripheralOpacity.value = withTiming(1, { duration: 200 });

        // Pulse arrow to guide attention
        arrowPulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
                withTiming(0.3, { duration: 300, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
        );

        // After preview time, transition to recognition
        timeoutRef.current = setTimeout(() => {
            // Fade center, clear peripheral
            centerOpacity.value = withTiming(0.3, { duration: 200 });
            peripheralBlur.value = withTiming(0, { duration: 150 });
            arrowPulse.value = 0;

            setGameState('recognize');
            recognitionStartTime.current = Date.now();

            // Set timeout for recognition phase
            timeoutRef.current = setTimeout(() => {
                handleTimeout();
            }, config.recognitionTime);
        }, config.previewTime);
    }, [getNextPair, config, centerOpacity, peripheralOpacity, peripheralBlur, arrowPulse]);

    // Handle answer
    const handleAnswer = useCallback((selectedWord: string) => {
        if (gameState !== 'recognize') return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const reactionTime = Date.now() - recognitionStartTime.current;
        const isCorrect = selectedWord === currentPair?.target;

        setReactionTimes(prev => [...prev, reactionTime]);
        setShowFeedback(isCorrect ? 'correct' : 'wrong');
        setGameState('feedback');

        if (isCorrect) {
            setScore(s => s + 1);
            setStreak(s => {
                const newStreak = s + 1;
                if (newStreak > bestStreak) setBestStreak(newStreak);
                return newStreak;
            });
            focusPulse.value = withSequence(
                withTiming(1.3, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
        } else {
            setStreak(0);
        }

        // Next round or complete
        timeoutRef.current = setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= config.rounds) {
                setGameState('complete');
                onComplete?.(score + (isCorrect ? 1 : 0), config.rounds);
            } else {
                setRound(nextRound);
                setShowFeedback(null);
                startPreview();
            }
        }, 800);
    }, [gameState, currentPair, round, config.rounds, score, bestStreak, onComplete, startPreview, focusPulse]);

    // Handle timeout
    const handleTimeout = useCallback(() => {
        setShowFeedback('timeout');
        setGameState('feedback');
        setStreak(0);

        timeoutRef.current = setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= config.rounds) {
                setGameState('complete');
                onComplete?.(score, config.rounds);
            } else {
                setRound(nextRound);
                setShowFeedback(null);
                startPreview();
            }
        }, 800);
    }, [round, config.rounds, score, onComplete, startPreview]);

    // Countdown effect
    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                startPreview();
            }
        }
    }, [gameState, countdown, startPreview]);

    const handleStart = () => {
        if (gameState === 'complete') handleReset();
        setCountdown(3);
        setGameState('countdown');
    };

    const handleReset = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameState('ready');
        setRound(0);
        setScore(0);
        setStreak(0);
        setReactionTimes([]);
        setCurrentPair(null);
        setShowFeedback(null);
        usedPairs.current.clear();
    };

    // Animated styles
    const focusPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: focusPulse.value }],
    }));

    const peripheralStyle = useAnimatedStyle(() => ({
        opacity: peripheralOpacity.value,
    }));

    const centerStyle = useAnimatedStyle(() => ({
        opacity: centerOpacity.value,
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        opacity: arrowPulse.value,
        transform: [{ translateX: arrowPulse.value * 5 }],
    }));

    // Performance calculations
    const avgReactionTime = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;

    const getStarRating = () => {
        const accuracy = config.rounds > 0 ? (score / config.rounds) * 100 : 0;
        if (accuracy >= 90 && avgReactionTime < 800) return 3;
        if (accuracy >= 75 && avgReactionTime < 1200) return 2;
        if (accuracy >= 50) return 1;
        return 0;
    };

    const getPerformanceMessage = () => {
        const percentage = (score / config.rounds) * 100;
        if (percentage >= 90) return { emoji: '🏆', text: t('games.peripheral.performance.elite'), color: colors.success };
        if (percentage >= 75) return { emoji: '🎯', text: t('games.peripheral.performance.excellent'), color: colors.primary };
        if (percentage >= 60) return { emoji: '👁️', text: t('games.peripheral.performance.good'), color: colors.secondary };
        if (percentage >= 40) return { emoji: '📈', text: t('games.peripheral.performance.keepGoing'), color: colors.textMuted };
        return { emoji: '💪', text: t('games.peripheral.performance.challenging'), color: colors.textMuted };
    };

    // Calculate word position based on character distance
    const getPeripheralOffset = () => {
        // Approximate 8px per character
        return config.wordDistance * 8 + 40;
    };

    return (
        <View style={{ alignItems: 'center', width: '100%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md, width: '100%' }}>
                <Eye size={18} color={colors.primary} strokeWidth={2} />
                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, marginLeft: spacing.sm, flex: 1 }}>
                    Preview peripheral word, then identify it quickly
                </Text>
            </View>

            {/* Game Area */}
            <View style={{
                width: areaWidth,
                height: areaHeight,
                backgroundColor: colors.surfaceElevated,
                borderRadius: borderRadius.bento,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
            }}>
                {/* Preview & Recognition Phase */}
                {(gameState === 'preview' || gameState === 'recognize' || gameState === 'feedback') && currentPair && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Center Word */}
                        <Animated.View style={[centerStyle, { alignItems: 'center' }]}>
                            <Animated.View style={focusPulseStyle}>
                                <View style={{
                                    paddingHorizontal: spacing.lg,
                                    paddingVertical: spacing.md,
                                    backgroundColor: colors.primaryGlow,
                                    borderRadius: borderRadius.md,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                }}>
                                    <Text style={{
                                        fontFamily: fontFamily.uiBold,
                                        fontSize: 28,
                                        color: colors.primary,
                                        letterSpacing: 2,
                                    }}>
                                        {currentPair.center}
                                    </Text>
                                </View>
                            </Animated.View>
                            <View style={{
                                marginTop: spacing.sm,
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: colors.error,
                                shadowColor: colors.error,
                                shadowOpacity: 0.8,
                                shadowRadius: 8,
                            }} />
                            <Text style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.xs,
                                color: colors.textDim,
                                marginTop: spacing.xs,
                            }}>
                                FOCUS HERE
                            </Text>
                        </Animated.View>

                        {/* Arrow indicator */}
                        {gameState === 'preview' && (
                            <Animated.View style={[arrowStyle, { marginLeft: spacing.md }]}>
                                <Zap size={24} color={colors.secondary} />
                            </Animated.View>
                        )}

                        {/* Peripheral Word */}
                        <Animated.View style={[peripheralStyle, {
                            position: 'absolute',
                            right: spacing.lg,
                            alignItems: 'center',
                        }]}>
                            <View style={{
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                backgroundColor: gameState === 'recognize' ? colors.secondaryGlow : colors.surface,
                                borderRadius: borderRadius.md,
                                borderWidth: 1,
                                borderColor: gameState === 'recognize' ? colors.secondary : colors.glassBorder,
                            }}>
                                <Text style={{
                                    fontFamily: fontFamily.uiBold,
                                    fontSize: gameState === 'recognize' ? 24 : 20,
                                    color: gameState === 'recognize' ? colors.secondary : colors.textMuted,
                                    letterSpacing: 1,
                                    opacity: gameState === 'preview' ? (1 - config.blurLevel * 0.5) : 1,
                                }}>
                                    {currentPair.target}
                                </Text>
                            </View>
                            {gameState === 'preview' && (
                                <Text style={{
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.xs,
                                    color: colors.textDim,
                                    marginTop: spacing.xs,
                                }}>
                                    peripheral
                                </Text>
                            )}
                        </Animated.View>
                    </View>
                )}

                {/* Feedback Overlay */}
                {showFeedback && (
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        style={{
                            position: 'absolute',
                            top: spacing.md,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            backgroundColor: showFeedback === 'correct' ? colors.success + '30' : colors.error + '30',
                            borderRadius: borderRadius.full,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.md,
                            color: showFeedback === 'correct' ? colors.success : colors.error,
                        }}>
                            {showFeedback === 'correct' ? '✓ Correct!' : showFeedback === 'timeout' ? '⏱ Too slow!' : `✗ Was: ${currentPair?.target}`}
                        </Text>
                    </Animated.View>
                )}

                {/* Countdown */}
                {gameState === 'countdown' && (
                    <View style={{
                        position: 'absolute',
                        zIndex: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        width: '100%',
                        height: '100%',
                    }}>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 80, color: colors.primary, ...glows.primary }}>
                            {countdown || 'GO!'}
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.text, marginTop: spacing.sm }}>
                            {t('games.peripheral.eyesLocked')}
                        </Text>
                    </View>
                )}

                {/* Ready / Complete Overlay */}
                {(gameState === 'ready' || gameState === 'complete') && (
                    <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: colors.surface + 'F5',
                        zIndex: 40,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: spacing.lg,
                        paddingHorizontal: spacing.lg,
                    }}>
                        {gameState === 'complete' ? (
                            <View style={{ alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' }}>
                                {/* Stars */}
                                <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                                    {[1, 2, 3].map((star) => (
                                        <Text key={star} style={{ fontSize: 32, marginHorizontal: 4 }}>
                                            {star <= getStarRating() ? '⭐' : '☆'}
                                        </Text>
                                    ))}
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 32, color: colors.text }}>
                                    {score}/{config.rounds}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                                    {getPerformanceMessage().text}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textDim, marginTop: spacing.sm }}>
                                    Avg reaction: {avgReactionTime}ms
                                </Text>
                                <Pressable
                                    onPress={handleStart}
                                    style={({ pressed }) => ({
                                        width: '90%',
                                        maxWidth: 280,
                                        paddingVertical: spacing.md,
                                        backgroundColor: colors.success,
                                        borderRadius: borderRadius.lg,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: spacing.lg,
                                        opacity: pressed ? 0.85 : 1,
                                    })}
                                >
                                    <RotateCcw size={24} color={colors.white} strokeWidth={2.5} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.white, marginLeft: spacing.xs }}>
                                        {t('games.common.playAgain')}
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                {/* Difficulty Selector */}
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md }}>
                                        {t('games.peripheral.selectDifficulty')}
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
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
                                                <Text style={{
                                                    fontFamily: fontFamily.uiMedium,
                                                    fontSize: fontSize.sm,
                                                    color: difficulty === level ? colors.background : colors.textMuted,
                                                }}>
                                                    {t(`games.peripheral.difficulty.${level}`)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Info */}
                                <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                                    <Target size={48} color={colors.primary} strokeWidth={1.5} />
                                    <Text style={{
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: fontSize.md,
                                        color: colors.text,
                                        marginTop: spacing.md,
                                        textAlign: 'center',
                                    }}>
                                        Preview → Recognize
                                    </Text>
                                    <Text style={{
                                        fontFamily: fontFamily.uiRegular,
                                        fontSize: fontSize.sm,
                                        color: colors.textMuted,
                                        textAlign: 'center',
                                        marginTop: spacing.xs,
                                        paddingHorizontal: spacing.lg,
                                    }}>
                                        Pre-view the peripheral word, then quickly identify it
                                    </Text>
                                    <Text style={{
                                        fontFamily: fontFamily.uiBold,
                                        fontSize: fontSize.sm,
                                        color: colors.primary,
                                        marginTop: spacing.md,
                                    }}>
                                        {config.description}
                                    </Text>
                                </View>

                                {/* Premium Start Button */}
                                <View style={{ alignItems: 'center', width: '100%', marginTop: spacing.md }}>
                                    <PremiumButton
                                        title={t('games.common.start')}
                                        onPress={handleStart}
                                        icon={Play}
                                        variant="primary"
                                        size="xl"
                                        fullWidth
                                        animatePulse
                                    />
                                </View>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Answer Options */}
            {gameState === 'recognize' && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={{
                        marginTop: spacing.lg,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: spacing.md,
                        paddingHorizontal: spacing.md,
                    }}
                >
                    <Text style={{
                        width: '100%',
                        textAlign: 'center',
                        fontFamily: fontFamily.uiMedium,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        marginBottom: spacing.xs,
                    }}>
                        Which word was in the peripheral?
                    </Text>
                    {shuffledOptions.map((word, idx) => (
                        <Pressable
                            key={idx}
                            onPress={() => handleAnswer(word)}
                        >
                            {({ pressed }) => (
                                <View style={{
                                    minWidth: 90,
                                    paddingHorizontal: spacing.lg,
                                    paddingVertical: spacing.md,
                                    backgroundColor: pressed ? colors.secondaryDim : colors.surfaceElevated,
                                    borderRadius: borderRadius.md,
                                    borderWidth: 2,
                                    borderColor: pressed ? colors.secondary : colors.glassBorder,
                                    alignItems: 'center',
                                }}>
                                    <Text style={{
                                        fontFamily: fontFamily.uiBold,
                                        fontSize: fontSize.lg,
                                        color: pressed ? colors.secondary : colors.text,
                                        letterSpacing: 1,
                                    }}>
                                        {word}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </Animated.View>
            )}

            {/* Stats Footer */}
            {(gameState === 'preview' || gameState === 'recognize' || gameState === 'feedback') && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.lg }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>{t('games.common.round')}</Text>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                            {round + 1}/{config.rounds}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>{t('games.common.score')}</Text>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.success }}>{score}</Text>
                    </View>
                    {streak > 1 && (
                        <View style={{
                            alignItems: 'center',
                            backgroundColor: colors.primaryGlow,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                            borderRadius: borderRadius.md,
                        }}>
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
