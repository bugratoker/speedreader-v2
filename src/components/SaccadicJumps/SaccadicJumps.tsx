/**
 * Saccadic Jumps - Interactive Eye Movement Training
 * 
 * Gamified training that requires users to actively tap targets,
 * training precise saccadic eye movements with immediate feedback.
 * 
 * Academic Basis: Trains "Return Sweeps" (moving from the end of one line to
 * the start of the next) and minimizes "Regressions" (involuntary backtracking).
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, Pressable, Dimensions, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import {
    Play, RotateCcw, Zap, Target,
    ArrowRight, ArrowDown, Shuffle, Crosshair
} from 'lucide-react-native';
import { InfoButton } from '../InfoButton';
import { AcademicModal } from '../AcademicModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SaccadicJumpsProps {
    onComplete?: (totalJumps: number, accuracy: number) => void;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type PatternType = 'lineScan' | 'returnSweep' | 'diagonal' | 'random';
type GameState = 'idle' | 'countdown' | 'playing' | 'completed';

interface DifficultyConfig {
    targetDuration: number;
    dotCount: number;
    rounds: number;
    label: string;
    description: string;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
    beginner: { targetDuration: 1500, dotCount: 2, rounds: 12, label: 'Beginner', description: '1.5s • 2 targets' },
    intermediate: { targetDuration: 1000, dotCount: 3, rounds: 15, label: 'Intermediate', description: '1s • 3 targets' },
    advanced: { targetDuration: 700, dotCount: 4, rounds: 18, label: 'Advanced', description: '0.7s • 4 targets' },
    expert: { targetDuration: 500, dotCount: 5, rounds: 24, label: 'Expert', description: '0.5s • 5 targets' },
};

// Target positions for different patterns
const getTargetPositions = (count: number, areaWidth: number, areaHeight: number) => {
    const padding = 40;
    const positions: { x: number; y: number }[] = [];

    if (count === 2) {
        positions.push({ x: padding, y: areaHeight / 2 });
        positions.push({ x: areaWidth - padding, y: areaHeight / 2 });
    } else if (count === 3) {
        positions.push({ x: padding, y: areaHeight / 2 });
        positions.push({ x: areaWidth / 2, y: padding });
        positions.push({ x: areaWidth - padding, y: areaHeight / 2 });
    } else if (count === 4) {
        positions.push({ x: padding, y: padding });
        positions.push({ x: areaWidth - padding, y: padding });
        positions.push({ x: areaWidth - padding, y: areaHeight - padding });
        positions.push({ x: padding, y: areaHeight - padding });
    } else {
        const centerX = areaWidth / 2;
        const centerY = areaHeight / 2;
        const radius = Math.min(areaWidth, areaHeight) / 2 - padding;
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
            positions.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            });
        }
    }

    return positions;
};

const getNextTargetIndex = (
    current: number,
    pattern: PatternType,
    dotCount: number
): number => {
    switch (pattern) {
        case 'lineScan':
            return (current + 1) % dotCount;
        case 'returnSweep':
            return (current + 1) % dotCount;
        case 'diagonal':
            return (current + 2) % dotCount;
        case 'random':
        default:
            let next;
            do {
                next = Math.floor(Math.random() * dotCount);
            } while (next === current && dotCount > 1);
            return next;
    }
};

// Single target component with its own animations
const TargetDot: React.FC<{
    index: number;
    position: { x: number; y: number };
    isActive: boolean;
    isPlaying: boolean;
    dotSize: number;
    onTap: (index: number) => void;
    colors: any;
}> = ({ index, position, isActive, isPlaying, dotSize, onTap, colors }) => {
    const scale = useSharedValue(0.8);
    const glow = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (isActive && isPlaying) {
            scale.value = withSpring(1.2, { damping: 8 });
            glow.value = withTiming(1, { duration: 150 });
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            scale.value = withSpring(0.8, { damping: 12 });
            glow.value = withTiming(0, { duration: 100 });
            pulse.value = 1;
        }
    }, [isActive, isPlaying]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    return (
        <Pressable
            onPress={() => onTap(index)}
            style={{
                position: 'absolute',
                left: position.x - dotSize / 2,
                top: position.y - dotSize / 2,
            }}
        >
            {/* Outer glow ring */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: dotSize + 24,
                        height: dotSize + 24,
                        left: -12,
                        top: -12,
                        borderRadius: (dotSize + 24) / 2,
                        backgroundColor: colors.secondaryGlow,
                    },
                    glowStyle,
                ]}
            />

            {/* Pulsing ring for active */}
            {isActive && isPlaying && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: dotSize + 16,
                            height: dotSize + 16,
                            left: -8,
                            top: -8,
                            borderRadius: (dotSize + 16) / 2,
                            borderWidth: 2,
                            borderColor: colors.secondary,
                        },
                        pulseStyle,
                    ]}
                />
            )}

            {/* Target dot */}
            <Animated.View
                style={[
                    {
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: isActive && isPlaying ? colors.secondary : colors.surface,
                        borderWidth: 2,
                        borderColor: isActive && isPlaying ? colors.secondary : colors.glassBorder,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    animatedStyle,
                ]}
            >
                <Target
                    size={24}
                    color={isActive && isPlaying ? colors.white : colors.textMuted}
                    strokeWidth={2}
                />
            </Animated.View>
        </Pressable>
    );
};

export const SaccadicJumps: React.FC<SaccadicJumpsProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    // Game state
    const [gameState, setGameState] = useState<GameState>('idle');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
    const [pattern, setPattern] = useState<PatternType>('random');
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showAcademicModal, setShowAcademicModal] = useState(false);

    // Active target tracking
    const [activeTarget, setActiveTarget] = useState<number>(0);
    const [round, setRound] = useState(0);

    // Performance metrics
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // Timing refs
    const targetActivationTime = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const missShake = useSharedValue(0);

    const config = DIFFICULTY_CONFIG[difficulty];
    const areaWidth = SCREEN_WIDTH - spacing.md * 4;
    const areaHeight = 260;
    const dotSize = 56;

    const positions = useMemo(() =>
        getTargetPositions(config.dotCount, areaWidth, areaHeight),
        [config.dotCount, areaWidth, areaHeight]
    );

    // Countdown effect
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCountdown(null);
            setGameState('playing');
            activateTarget(0);
        }
    }, [countdown]);

    const activateTarget = useCallback((index: number) => {
        setActiveTarget(index);
        targetActivationTime.current = Date.now();

        // Set timeout for miss
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            handleMiss();
        }, config.targetDuration);
    }, [config.targetDuration]);

    const advanceRound = useCallback(() => {
        const newRound = round + 1;
        setRound(newRound);

        if (newRound >= config.rounds) {
            // Game complete
            setGameState('completed');
            const totalAttempts = hits + misses + 1;
            const accuracy = ((hits + 1) / totalAttempts) * 100;
            onComplete?.(newRound, accuracy);
        } else {
            // Next target
            const nextTarget = getNextTargetIndex(activeTarget, pattern, config.dotCount);

            // Small delay before next target
            setTimeout(() => {
                activateTarget(nextTarget);
            }, 200);
        }
    }, [round, config.rounds, config.dotCount, hits, misses, activeTarget, pattern, activateTarget]);

    const handleMiss = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setMisses(prev => prev + 1);
        setStreak(0);

        // Shake animation
        missShake.value = withSequence(
            withTiming(-5, { duration: 50 }),
            withTiming(5, { duration: 50 }),
            withTiming(-5, { duration: 50 }),
            withTiming(5, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );

        // Haptic feedback for miss
        Vibration.vibrate([0, 50, 30, 50]);

        advanceRound();
    }, [advanceRound, missShake]);

    const handleTargetTap = useCallback((index: number) => {
        if (gameState !== 'playing') return;

        if (index === activeTarget) {
            // HIT!
            const reactionTime = Date.now() - targetActivationTime.current;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Record stats
            setHits(prev => prev + 1);
            setReactionTimes(prev => [...prev, reactionTime]);
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak > bestStreak) setBestStreak(newStreak);
                return newStreak;
            });

            // Haptic feedback
            Vibration.vibrate(30);

            advanceRound();
        } else {
            // Wrong target - penalize
            handleMiss();
        }
    }, [gameState, activeTarget, bestStreak, advanceRound, handleMiss]);

    const handleStart = () => {
        resetGame();
        setCountdown(3);
    };

    const resetGame = () => {
        setGameState('idle');
        setRound(0);
        setHits(0);
        setMisses(0);
        setReactionTimes([]);
        setStreak(0);
        setActiveTarget(0);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // Calculate performance stats
    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    const avgReactionTime = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;
    const progressPercentage = (round / config.rounds) * 100;

    // Get star rating based on accuracy and reaction time
    const getStarRating = () => {
        const finalAccuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
        if (finalAccuracy >= 90 && avgReactionTime < 500) return 3;
        if (finalAccuracy >= 75 && avgReactionTime < 700) return 2;
        if (finalAccuracy >= 50) return 1;
        return 0;
    };

    const missShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: missShake.value }],
    }));

    const patternConfigs = {
        lineScan: {
            icon: <ArrowRight size={14} color={pattern === 'lineScan' ? colors.white : colors.textMuted} />,
            label: t('games.saccadic.patterns.lineScan') || 'Line',
        },
        returnSweep: {
            icon: <ArrowRight size={14} color={pattern === 'returnSweep' ? colors.white : colors.textMuted} style={{ transform: [{ scaleX: -1 }] }} />,
            label: t('games.saccadic.patterns.returnSweep') || 'Sweep',
        },
        diagonal: {
            icon: <ArrowDown size={14} color={pattern === 'diagonal' ? colors.white : colors.textMuted} style={{ transform: [{ rotate: '-45deg' }] }} />,
            label: t('games.saccadic.patterns.diagonal') || 'Diag',
        },
        random: {
            icon: <Shuffle size={14} color={pattern === 'random' ? colors.white : colors.textMuted} />,
            label: t('games.saccadic.patterns.random') || 'Random',
        },
    };

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Instructions with Info Button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Zap size={18} color={colors.secondary} strokeWidth={2} />
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
                    {t('games.saccadic.tapInstructions') || 'Tap targets as they light up!'}
                </Text>
                <InfoButton onPress={() => setShowAcademicModal(true)} size={24} />
            </View>

            {/* Progress Bar */}
            {gameState === 'playing' && (
                <View
                    style={{
                        width: areaWidth,
                        height: 6,
                        backgroundColor: colors.surface,
                        borderRadius: 3,
                        marginBottom: spacing.md,
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            width: `${progressPercentage}%`,
                            height: '100%',
                            backgroundColor: colors.secondary,
                            borderRadius: 3,
                        }}
                    />
                </View>
            )}

            {/* Live Stats - Only during gameplay */}
            {gameState === 'playing' && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: spacing.md,
                        gap: spacing.lg,
                    }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.secondary }}>
                            {round}/{config.rounds}
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                            {t('games.common.round')}
                        </Text>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: streak > 0 ? colors.success : colors.text }}>
                            {streak}🔥
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                            Streak
                        </Text>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                            {accuracy}%
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                            {t('games.saccadic.accuracy') || 'Accuracy'}
                        </Text>
                    </View>
                </View>
            )}

            {/* Target Area */}
            <Animated.View
                style={[
                    {
                        width: areaWidth,
                        height: areaHeight,
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        position: 'relative',
                        ...glows.secondarySubtle,
                    },
                    missShakeStyle,
                ]}
            >
                {/* Countdown Overlay */}
                {countdown !== null && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            width: '100%',
                            height: '100%',
                            borderRadius: borderRadius.bento,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: 64,
                                color: colors.secondary,
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
                            {t('games.saccadic.getReady')}
                        </Text>
                    </View>
                )}

                {/* Idle state message */}
                {gameState === 'idle' && countdown === null && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
                        <Crosshair size={48} color={colors.secondary} strokeWidth={1.5} />
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.text,
                                marginTop: spacing.md,
                                textAlign: 'center',
                            }}
                        >
                            {t('games.saccadic.tapToHit') || 'Tap targets as they light up!'}
                        </Text>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.sm,
                                color: colors.textMuted,
                                marginTop: spacing.xs,
                                textAlign: 'center',
                            }}
                        >
                            {t('games.saccadic.trainYourEyes') || 'Train rapid eye movements for faster reading'}
                        </Text>
                    </View>
                )}

                {/* Render targets during gameplay */}
                {(gameState === 'playing' || gameState === 'completed') &&
                    positions.map((pos, index) => (
                        <TargetDot
                            key={index}
                            index={index}
                            position={pos}
                            isActive={activeTarget === index}
                            isPlaying={gameState === 'playing'}
                            dotSize={dotSize}
                            onTap={handleTargetTap}
                            colors={colors}
                        />
                    ))
                }
            </Animated.View>

            {/* Completed Results */}
            {gameState === 'completed' && (
                <View
                    style={{
                        marginTop: spacing.lg,
                        width: areaWidth,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                        borderWidth: 1,
                        borderColor: colors.secondary,
                        ...glows.secondary,
                    }}
                >
                    {/* Stars */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md }}>
                        {[1, 2, 3].map((star) => (
                            <Text key={star} style={{ fontSize: 28, marginHorizontal: 4 }}>
                                {star <= getStarRating() ? '⭐' : '☆'}
                            </Text>
                        ))}
                    </View>

                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.xl,
                            color: colors.secondary,
                            textAlign: 'center',
                        }}
                    >
                        {t('games.saccadic.greatJob')}
                    </Text>

                    {/* Stats Grid */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                                {Math.round((hits / (hits + misses || 1)) * 100)}%
                            </Text>
                            <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                                Accuracy
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                                {avgReactionTime}ms
                            </Text>
                            <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                                Avg. Speed
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                                {bestStreak}🔥
                            </Text>
                            <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                                Best Streak
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginTop: spacing.md,
                            textAlign: 'center',
                        }}
                    >
                        {t('games.saccadic.completeMsg')}
                    </Text>
                </View>
            )}

            {/* Pattern Selector - Only in idle state */}
            {gameState === 'idle' && (
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
                    {(Object.keys(patternConfigs) as PatternType[]).map((p) => (
                        <Pressable
                            key={p}
                            onPress={() => setPattern(p)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.sm,
                                borderRadius: borderRadius.md,
                                backgroundColor: pattern === p ? colors.secondary : 'transparent',
                            }}
                        >
                            {patternConfigs[p].icon}
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.xs,
                                    color: pattern === p ? colors.white : colors.textMuted,
                                    marginLeft: 4,
                                }}
                            >
                                {patternConfigs[p].label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Difficulty Selector - Only in idle state */}
            {gameState === 'idle' && (
                <View
                    style={{
                        marginTop: spacing.md,
                        width: areaWidth,
                    }}
                >
                    {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => (
                        <Pressable
                            key={level}
                            onPress={() => setDifficulty(level)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm + 2,
                                borderRadius: borderRadius.md,
                                backgroundColor: difficulty === level ? colors.surface : 'transparent',
                                borderWidth: difficulty === level ? 1 : 0,
                                borderColor: colors.secondary,
                                marginBottom: spacing.xs,
                            }}
                        >
                            <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: difficulty === level ? colors.secondary : colors.glassBorder,
                                marginRight: spacing.sm,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {difficulty === level && (
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: fontSize.sm,
                                        color: difficulty === level ? colors.text : colors.textMuted,
                                    }}
                                >
                                    {t(`games.saccadic.difficulty.${level}`) || DIFFICULTY_CONFIG[level].label}
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: fontFamily.uiRegular,
                                        fontSize: fontSize.xs,
                                        color: colors.textMuted,
                                    }}
                                >
                                    {DIFFICULTY_CONFIG[level].description}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Controls */}
            <View
                style={{
                    flexDirection: 'row',
                    marginTop: spacing.lg,
                    gap: spacing.md,
                }}
            >
                <Pressable
                    onPress={handleStart}
                    disabled={countdown !== null}
                    style={({ pressed }) => ({
                        paddingHorizontal: spacing.xl,
                        paddingVertical: spacing.md,
                        backgroundColor: pressed ? colors.secondaryDim : colors.secondary,
                        borderRadius: borderRadius.lg,
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity: countdown !== null ? 0.5 : 1,
                    })}
                >
                    <Play size={20} color={colors.white} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.md,
                            color: colors.white,
                            marginLeft: spacing.sm,
                        }}
                    >
                        {gameState === 'completed'
                            ? t('games.common.playAgain')
                            : t('games.common.start')}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={resetGame}
                    disabled={countdown !== null}
                    style={({ pressed }) => ({
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.md,
                        backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                        borderRadius: borderRadius.lg,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        opacity: countdown !== null ? 0.5 : 1,
                    })}
                >
                    <RotateCcw size={20} color={colors.textMuted} strokeWidth={2} />
                </Pressable>
            </View>

            {/* Academic Info Modal */}
            <AcademicModal
                visible={showAcademicModal}
                onClose={() => setShowAcademicModal(false)}
                title={t('games.academic.saccadic.title')}
                description={t('games.academic.saccadic.description')}
                researchLink="https://pubmed.ncbi.nlm.nih.gov/9839353/"
            />
        </View>
    );
};
