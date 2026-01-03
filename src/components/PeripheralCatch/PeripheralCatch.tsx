/**
 * Peripheral Catch - Parafoveal Vision Training (v2 - Sequence Mode)
 * 
 * NEW MECHANIC: Show 2-3 words sequentially in peripheral vision,
 * then ask user to recall them in the correct order.
 * 
 * Academic Basis: Research indicates that speed readers utilize "Parafoveal Processing"
 * to pre-process upcoming words. This drill expands the visual span beyond the foveal center.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
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
import { Play, RotateCcw, CheckCircle, XCircle, Eye } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PeripheralCatchProps {
    onComplete?: (score: number, total: number) => void;
}

type Position = 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface DifficultyConfig {
    displayTime: number;
    wordsPerRound: number;
    rounds: number;
    fontSize: number;
    description: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    beginner: { displayTime: 1000, wordsPerRound: 2, rounds: 8, fontSize: 17, description: '2 kelime • 1.0s' },
    intermediate: { displayTime: 600, wordsPerRound: 2, rounds: 10, fontSize: 16, description: '2 kelime • 0.6s' },
    advanced: { displayTime: 500, wordsPerRound: 3, rounds: 12, fontSize: 15, description: '3 kelime • 0.5s' },
    expert: { displayTime: 300, wordsPerRound: 3, rounds: 15, fontSize: 14, description: '3 kelime • 0.3s' },
};

const FEEDBACK_TIME = 600;
const WORD_GAP_TIME = 300; // Gap between words

// All 8 positions for peripheral placement
const ALL_POSITIONS: Position[] = ['left', 'right', 'top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export const PeripheralCatch: React.FC<PeripheralCatchProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const wordPoolData = t('games.peripheral.wordPool', { returnObjects: true });
    const wordPool = Array.isArray(wordPoolData) ? (wordPoolData as string[]) : [];

    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    // Game states
    const [gameState, setGameState] = useState<'ready' | 'countdown' | 'showing' | 'answering' | 'feedback' | 'complete'>('ready');
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [countdown, setCountdown] = useState(3);

    // Round state
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // Sequence state
    const [sequenceWords, setSequenceWords] = useState<string[]>([]);
    const [sequencePositions, setSequencePositions] = useState<Position[]>([]);
    const [currentShowingIndex, setCurrentShowingIndex] = useState(-1);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const focusPulse = useSharedValue(1);
    const focusRingScale = useSharedValue(1);
    const focusRingOpacity = useSharedValue(0.3);

    // Layout
    const areaWidth = SCREEN_WIDTH - spacing.md * 2;
    const areaHeight = 400;
    const config = DIFFICULTY_CONFIG[difficulty];
    const totalRounds = config.rounds;
    const wordsNeeded = config.wordsPerRound;

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Animate focus ring during answering
    useEffect(() => {
        if (gameState === 'answering') {
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
    }, [gameState, focusRingScale, focusRingOpacity]);

    // Generate random words for sequence
    const generateSequence = useCallback(() => {
        const available = wordPool.filter(w => !usedWords.has(w));
        const pool = available.length >= wordsNeeded ? available : wordPool;

        const words: string[] = [];
        const positions: Position[] = [];
        const usedPositions = new Set<Position>();

        for (let i = 0; i < wordsNeeded; i++) {
            // Pick random word
            const randomIndex = Math.floor(Math.random() * pool.length);
            const word = pool.splice(randomIndex, 1)[0] || wordPool[i];
            words.push(word);

            // Pick unique position
            const availablePositions = ALL_POSITIONS.filter(p => !usedPositions.has(p));
            const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
            positions.push(pos);
            usedPositions.add(pos);
        }

        return { words, positions };
    }, [wordPool, usedWords, wordsNeeded]);

    // Show words one by one
    const showNextWord = useCallback((index: number, words: string[], positions: Position[]) => {
        if (index >= words.length) {
            // All words shown, switch to answering
            setCurrentShowingIndex(-1);
            setGameState('answering');
            return;
        }

        setCurrentShowingIndex(index);
        focusPulse.value = withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );

        // Hide after display time, then show next
        timeoutRef.current = setTimeout(() => {
            setCurrentShowingIndex(-1);
            timeoutRef.current = setTimeout(() => {
                showNextWord(index + 1, words, positions);
            }, WORD_GAP_TIME);
        }, config.displayTime);
    }, [config.displayTime, focusPulse]);

    // Start a round
    const startRound = useCallback(() => {
        const { words, positions } = generateSequence();
        setSequenceWords(words);
        setSequencePositions(positions);
        setUserAnswers([]);
        setShowFeedback(null);
        setGameState('showing');

        // Mark words as used
        setUsedWords(prev => {
            const next = new Set(prev);
            words.forEach(w => next.add(w));
            return next;
        });

        // Start showing sequence
        showNextWord(0, words, positions);
    }, [generateSequence, showNextWord]);

    // Handle user answer
    const handleAnswerPress = useCallback((word: string) => {
        if (gameState !== 'answering') return;

        const newAnswers = [...userAnswers, word];
        setUserAnswers(newAnswers);

        // Check if all answers given
        if (newAnswers.length >= sequenceWords.length) {
            const isCorrect = newAnswers.every((ans, idx) => ans === sequenceWords[idx]);
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

            // Next round or complete
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
        }
    }, [gameState, userAnswers, sequenceWords, round, totalRounds, score, bestStreak, onComplete, startRound]);

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
        setSequenceWords([]);
        setSequencePositions([]);
        setCurrentShowingIndex(-1);
        setUserAnswers([]);
        setShowFeedback(null);
        setUsedWords(new Set());
    };

    // Animated styles
    const focusPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: focusPulse.value }],
    }));

    const focusRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: focusRingScale.value }],
        opacity: focusRingOpacity.value,
    }));

    // Position styling - EXTREME edges
    const getWordStyle = (position: Position) => {
        const edgePadding = 8;
        const midX = areaWidth / 2;
        const midY = areaHeight / 2;
        const baseStyle = {
            position: 'absolute' as const,
            fontFamily: fontFamily.uiBold,
            fontSize: config.fontSize,
            color: colors.text,
            textShadowColor: colors.background,
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
        };

        switch (position) {
            case 'left': return { ...baseStyle, left: edgePadding, top: midY - 10 };
            case 'right': return { ...baseStyle, right: edgePadding, top: midY - 10 };
            case 'top': return { ...baseStyle, top: edgePadding, left: midX - 30 };
            case 'bottom': return { ...baseStyle, bottom: edgePadding, left: midX - 30 };
            case 'topLeft': return { ...baseStyle, top: edgePadding, left: edgePadding };
            case 'topRight': return { ...baseStyle, top: edgePadding, right: edgePadding };
            case 'bottomLeft': return { ...baseStyle, bottom: edgePadding, left: edgePadding };
            case 'bottomRight': return { ...baseStyle, bottom: edgePadding, right: edgePadding };
        }
    };

    // Performance message
    const getPerformanceMessage = () => {
        const percentage = (score / totalRounds) * 100;
        if (percentage >= 90) return { emoji: '🏆', text: t('games.peripheral.performance.elite'), color: colors.success };
        if (percentage >= 75) return { emoji: '🎯', text: t('games.peripheral.performance.excellent'), color: colors.primary };
        if (percentage >= 60) return { emoji: '👁️', text: t('games.peripheral.performance.good'), color: colors.secondary };
        if (percentage >= 40) return { emoji: '📈', text: t('games.peripheral.performance.keepGoing'), color: colors.textMuted };
        return { emoji: '💪', text: t('games.peripheral.performance.challenging'), color: colors.textMuted };
    };

    // Show current word in sequence
    const currentWord = currentShowingIndex >= 0 ? sequenceWords[currentShowingIndex] : null;
    const currentPosition = currentShowingIndex >= 0 ? sequencePositions[currentShowingIndex] : null;

    // Shuffle options for answering (all sequence words shuffled)
    const shuffledOptions = [...sequenceWords].sort(() => Math.random() - 0.5);

    return (
        <View style={{ alignItems: 'center', width: '100%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md, width: '100%' }}>
                <Eye size={18} color={colors.primary} strokeWidth={2} />
                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, marginLeft: spacing.sm, flex: 1 }}>
                    {t('games.peripheral.instructionsSequence')}
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
                {/* Central Focus Point - RED TARGET */}
                {(gameState === 'countdown' || gameState === 'showing' || gameState === 'answering' || gameState === 'feedback') && (
                    <Animated.View style={[focusPulseStyle, { zIndex: 10 }]}>
                        <View style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: colors.surface,
                            borderWidth: 3,
                            borderColor: '#FF4444',
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#FF4444',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 15,
                            elevation: 8,
                        }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' }} />
                        </View>
                    </Animated.View>
                )}

                {/* Focus Ring */}
                {(gameState === 'showing' || gameState === 'answering') && (
                    <Animated.View style={[{
                        position: 'absolute',
                        width: 75,
                        height: 75,
                        borderRadius: 37.5,
                        borderWidth: 1,
                        borderColor: '#FF4444',
                        zIndex: 11,
                    }, focusRingStyle]} />
                )}

                {/* Word Display */}
                {currentWord && currentPosition && (
                    <Animated.Text
                        entering={FadeIn.duration(80)}
                        exiting={FadeOut.duration(80)}
                        style={[getWordStyle(currentPosition), { zIndex: 15 }]}
                    >
                        {currentWord}
                    </Animated.Text>
                )}

                {/* Sequence Progress Indicator */}
                {gameState === 'showing' && (
                    <View style={{ position: 'absolute', bottom: spacing.md, flexDirection: 'row', gap: 6, zIndex: 20 }}>
                        {sequenceWords.map((_, idx) => (
                            <View
                                key={idx}
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: idx <= currentShowingIndex ? colors.primary : colors.textDim,
                                }}
                            />
                        ))}
                    </View>
                )}

                {/* Answer Progress */}
                {gameState === 'answering' && (
                    <View style={{ position: 'absolute', bottom: spacing.md, flexDirection: 'row', gap: 8, zIndex: 20 }}>
                        {sequenceWords.map((_, idx) => (
                            <View
                                key={idx}
                                style={{
                                    minWidth: 60,
                                    paddingHorizontal: spacing.sm,
                                    paddingVertical: spacing.xs,
                                    borderRadius: borderRadius.sm,
                                    backgroundColor: userAnswers[idx] ? colors.primaryGlow : colors.surfaceOverlay,
                                    borderWidth: 1,
                                    borderColor: userAnswers[idx] ? colors.primary : colors.glassBorder,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: userAnswers[idx] ? colors.primary : colors.textDim }}>
                                    {userAnswers[idx] || `${idx + 1}.`}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Feedback */}
                {showFeedback && (
                    <View style={{
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
                    }}>
                        {showFeedback === 'correct' ? (
                            <>
                                <CheckCircle size={18} color={colors.success} />
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.success, marginLeft: spacing.xs }}>✓</Text>
                            </>
                        ) : (
                            <>
                                <XCircle size={18} color={colors.error} />
                                <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.xs, color: colors.error, marginLeft: spacing.xs }}>
                                    {sequenceWords.join(' → ')}
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {/* Countdown */}
                {gameState === 'countdown' && (
                    <View style={{
                        position: 'absolute',
                        zIndex: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.85)',
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
                        paddingVertical: spacing.xl,
                        paddingHorizontal: spacing.lg,
                    }}>
                        {gameState === 'complete' ? (
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
                                        backgroundColor: pressed ? colors.success : colors.success,
                                        borderRadius: borderRadius.lg,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: spacing.lg,
                                        shadowColor: colors.success,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 14,
                                        elevation: 10,
                                        opacity: pressed ? 0.85 : 1,
                                    })}
                                >
                                    <RotateCcw size={24} color="#fff" strokeWidth={2.5} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: '#fff', marginLeft: spacing.xs }}>
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
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, width: '100%' }}>
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

                                {/* Game Info */}
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
                                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: 24, color: colors.primary }}>
                                            {config.description}
                                        </Text>
                                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                                            {config.rounds} {t('games.common.round').toLowerCase()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Start Button */}
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Pressable
                                        onPress={handleStart}
                                        style={({ pressed }) => ({
                                            width: '100%',
                                            maxWidth: 280,
                                            paddingVertical: spacing.lg,
                                            backgroundColor: colors.success,
                                            borderRadius: borderRadius.lg,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: colors.success,
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 14,
                                            elevation: 10,
                                            opacity: pressed ? 0.85 : 1,
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

            {/* Answer Options HUD */}
            {gameState === 'answering' && (
                <View style={{
                    marginTop: spacing.lg,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: spacing.md,
                    paddingHorizontal: spacing.md,
                }}>
                    {shuffledOptions.map((word, idx) => {
                        const isSelected = userAnswers.includes(word);
                        return (
                            <Pressable
                                key={idx}
                                onPress={() => !isSelected && handleAnswerPress(word)}
                                disabled={isSelected}
                            >
                                {({ pressed }) => (
                                    <View style={{
                                        minWidth: 100,
                                        paddingHorizontal: spacing.lg,
                                        paddingVertical: spacing.md,
                                        backgroundColor: isSelected ? colors.textDim : (pressed ? colors.primaryDim : colors.surfaceElevated),
                                        borderRadius: borderRadius.md,
                                        borderWidth: 2,
                                        borderColor: isSelected ? colors.textDim : (pressed ? colors.primary : colors.glassBorder),
                                        alignItems: 'center',
                                        opacity: isSelected ? 0.4 : 1,
                                    }}>
                                        <Text style={{
                                            fontFamily: fontFamily.uiBold,
                                            fontSize: fontSize.lg,
                                            color: isSelected ? colors.textMuted : (pressed ? colors.primary : colors.text),
                                            textTransform: 'uppercase',
                                            letterSpacing: 1,
                                        }}>
                                            {word}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {/* Stats Footer */}
            {(gameState === 'showing' || gameState === 'answering' || gameState === 'feedback') && (
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
