/**
 * Saccadic Jumps - Precision Eye Movement Training
 * Two points on screen that alternate, training rapid saccadic eye movements.
 * 
 * Academic Basis: Trains "Return Sweeps" (moving from the end of one line to
 * the start of the next) and minimizes "Regressions" (involuntary backtracking).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
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
import { Play, Pause, RotateCcw, Zap, ArrowLeftRight, ArrowUpDown } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SaccadicJumpsProps {
    onComplete?: (totalJumps: number, accuracy: number) => void;
}

type SpeedLevel = 'slow' | 'medium' | 'fast';
type Direction = 'horizontal' | 'vertical';

const SPEED_CONFIG: Record<SpeedLevel, { interval: number; label: string }> = {
    slow: { interval: 1200, label: 'Slow' },
    medium: { interval: 800, label: 'Medium' },
    fast: { interval: 500, label: 'Fast' },
};

const TOTAL_JUMPS = 24;

export const SaccadicJumps: React.FC<SaccadicJumpsProps> = ({ onComplete }) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    const [isRunning, setIsRunning] = useState(false);
    const [currentSide, setCurrentSide] = useState<'first' | 'second'>('first');
    const [jumpCount, setJumpCount] = useState(0);
    const [speed, setSpeed] = useState<SpeedLevel>('medium');
    const [direction, setDirection] = useState<Direction>('horizontal');
    const [isComplete, setIsComplete] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const firstScale = useSharedValue(1.2);
    const secondScale = useSharedValue(0.8);
    const firstGlow = useSharedValue(1);
    const secondGlow = useSharedValue(0.2);
    const rhythmRing = useSharedValue(1);
    const rhythmOpacity = useSharedValue(0);

    const animateToSide = useCallback((side: 'first' | 'second') => {
        const isFirst = side === 'first';
        firstScale.value = withSpring(isFirst ? 1.3 : 0.7, { damping: 10 });
        secondScale.value = withSpring(isFirst ? 0.7 : 1.3, { damping: 10 });
        firstGlow.value = withTiming(isFirst ? 1 : 0.15, { duration: 100 });
        secondGlow.value = withTiming(isFirst ? 0.15 : 1, { duration: 100 });

        // Rhythm ring pulse on active dot
        rhythmRing.value = 1;
        rhythmOpacity.value = 1;
        rhythmRing.value = withTiming(1.8, { duration: SPEED_CONFIG[speed].interval * 0.8 });
        rhythmOpacity.value = withTiming(0, { duration: SPEED_CONFIG[speed].interval * 0.8 });
    }, [firstScale, secondScale, firstGlow, secondGlow, rhythmRing, rhythmOpacity, speed]);

    const handleJump = useCallback(() => {
        setCurrentSide((prev) => {
            const next = prev === 'first' ? 'second' : 'first';
            animateToSide(next);
            return next;
        });
        setJumpCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= TOTAL_JUMPS) {
                setIsRunning(false);
                setIsComplete(true);
                onComplete?.(newCount, 100);
            }
            return newCount;
        });
    }, [animateToSide, onComplete]);

    // Countdown effect
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCountdown(null);
            setIsRunning(true);
            animateToSide('first');
        }
    }, [countdown, animateToSide]);

    useEffect(() => {
        if (isRunning && !isComplete) {
            intervalRef.current = setInterval(handleJump, SPEED_CONFIG[speed].interval);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, speed, handleJump, isComplete]);

    const handleStart = () => {
        if (isComplete) {
            handleReset();
        }
        setCountdown(3);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setCurrentSide('first');
        setJumpCount(0);
        setIsComplete(false);
        setCountdown(null);
        firstScale.value = 1.2;
        secondScale.value = 0.8;
        firstGlow.value = 1;
        secondGlow.value = 0.2;
    };

    const firstAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: firstScale.value }],
    }));

    const secondAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: secondScale.value }],
    }));

    const firstGlowStyle = useAnimatedStyle(() => ({
        opacity: firstGlow.value,
    }));

    const secondGlowStyle = useAnimatedStyle(() => ({
        opacity: secondGlow.value,
    }));

    const firstRhythmStyle = useAnimatedStyle(() => ({
        transform: [{ scale: currentSide === 'first' ? rhythmRing.value : 1 }],
        opacity: currentSide === 'first' ? rhythmOpacity.value : 0,
    }));

    const secondRhythmStyle = useAnimatedStyle(() => ({
        transform: [{ scale: currentSide === 'second' ? rhythmRing.value : 1 }],
        opacity: currentSide === 'second' ? rhythmOpacity.value : 0,
    }));

    const dotSize = 44;
    const areaWidth = SCREEN_WIDTH - spacing.md * 4;
    const areaHeight = direction === 'horizontal' ? 180 : 280;
    const dotSpacing = direction === 'horizontal' ? areaWidth * 0.32 : areaHeight * 0.32;

    const progressPercentage = (jumpCount / TOTAL_JUMPS) * 100;

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Instructions */}
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
                    Jump eyes between dots instantly. Head still, zero overshoot!
                </Text>
            </View>

            {/* Progress Bar */}
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

            {/* Progress Stats */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.lg,
                    gap: spacing.lg,
                }}
            >
                <View style={{ alignItems: 'center' }}>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.xl,
                            color: colors.secondary,
                        }}
                    >
                        {jumpCount}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                        }}
                    >
                        / {TOTAL_JUMPS} jumps
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.md,
                        borderWidth: 1,
                        borderColor: colors.secondary,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.secondary,
                        }}
                    >
                        {SPEED_CONFIG[speed].interval}ms interval
                    </Text>
                </View>
            </View>

            {/* Dots Area */}
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
                    flexDirection: direction === 'horizontal' ? 'row' : 'column',
                    ...glows.secondarySubtle,
                }}
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
                                fontSize: 56,
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
                            Get ready to jump!
                        </Text>
                    </View>
                )}

                {/* First Dot */}
                <View
                    style={{
                        alignItems: 'center',
                        marginRight: direction === 'horizontal' ? dotSpacing : 0,
                        marginBottom: direction === 'vertical' ? dotSpacing : 0,
                    }}
                >
                    {/* Rhythm ring */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: dotSize + 30,
                                height: dotSize + 30,
                                borderRadius: (dotSize + 30) / 2,
                                borderWidth: 2,
                                borderColor: colors.secondary,
                            },
                            firstRhythmStyle,
                        ]}
                    />
                    {/* Glow */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: dotSize + 20,
                                height: dotSize + 20,
                                borderRadius: (dotSize + 20) / 2,
                                backgroundColor: colors.secondaryGlow,
                            },
                            firstGlowStyle,
                        ]}
                    />
                    {/* Dot */}
                    <Animated.View
                        style={[
                            {
                                width: dotSize,
                                height: dotSize,
                                borderRadius: dotSize / 2,
                                backgroundColor: currentSide === 'first' ? colors.secondary : colors.surface,
                                borderWidth: 2,
                                borderColor: colors.secondary,
                            },
                            firstAnimatedStyle,
                        ]}
                    />
                </View>

                {/* Center guide line */}
                <View
                    style={{
                        position: 'absolute',
                        width: direction === 'horizontal' ? dotSpacing * 1.8 : 2,
                        height: direction === 'horizontal' ? 2 : dotSpacing * 1.8,
                        backgroundColor: colors.glassBorder,
                    }}
                />

                {/* Second Dot */}
                <View
                    style={{
                        alignItems: 'center',
                        marginLeft: direction === 'horizontal' ? dotSpacing : 0,
                        marginTop: direction === 'vertical' ? dotSpacing : 0,
                    }}
                >
                    {/* Rhythm ring */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: dotSize + 30,
                                height: dotSize + 30,
                                borderRadius: (dotSize + 30) / 2,
                                borderWidth: 2,
                                borderColor: colors.secondary,
                            },
                            secondRhythmStyle,
                        ]}
                    />
                    {/* Glow */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: dotSize + 20,
                                height: dotSize + 20,
                                borderRadius: (dotSize + 20) / 2,
                                backgroundColor: colors.secondaryGlow,
                            },
                            secondGlowStyle,
                        ]}
                    />
                    {/* Dot */}
                    <Animated.View
                        style={[
                            {
                                width: dotSize,
                                height: dotSize,
                                borderRadius: dotSize / 2,
                                backgroundColor: currentSide === 'second' ? colors.secondary : colors.surface,
                                borderWidth: 2,
                                borderColor: colors.secondary,
                            },
                            secondAnimatedStyle,
                        ]}
                    />
                </View>
            </View>

            {/* Training Tip */}
            {!isRunning && !isComplete && jumpCount === 0 && (
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
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            textAlign: 'center',
                        }}
                    >
                        ⚡ This trains "Return Sweeps" for faster line-to-line reading and reduces involuntary regressions.
                    </Text>
                </View>
            )}

            {/* Completion Message */}
            {isComplete && (
                <View
                    style={{
                        marginTop: spacing.lg,
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                        borderWidth: 1,
                        borderColor: colors.secondary,
                        ...glows.secondary,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.xl,
                            color: colors.secondary,
                        }}
                    >
                        ⚡ Great Saccades!
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.md,
                            color: colors.text,
                            marginTop: spacing.xs,
                        }}
                    >
                        {TOTAL_JUMPS} precision jumps at {SPEED_CONFIG[speed].interval}ms
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginTop: spacing.xs,
                        }}
                    >
                        Anti-regression training complete ✓
                    </Text>
                </View>
            )}

            {/* Direction Toggle */}
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
                <Pressable
                    onPress={() => setDirection('horizontal')}
                    disabled={isRunning || countdown !== null}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.md,
                        backgroundColor: direction === 'horizontal' ? colors.secondary : 'transparent',
                    }}
                >
                    <ArrowLeftRight size={16} color={direction === 'horizontal' ? colors.white : colors.textMuted} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: direction === 'horizontal' ? colors.white : colors.textMuted,
                            marginLeft: spacing.xs,
                        }}
                    >
                        Horizontal
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setDirection('vertical')}
                    disabled={isRunning || countdown !== null}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.md,
                        backgroundColor: direction === 'vertical' ? colors.secondary : 'transparent',
                    }}
                >
                    <ArrowUpDown size={16} color={direction === 'vertical' ? colors.white : colors.textMuted} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: direction === 'vertical' ? colors.white : colors.textMuted,
                            marginLeft: spacing.xs,
                        }}
                    >
                        Vertical
                    </Text>
                </Pressable>
            </View>

            {/* Speed Selector */}
            <View
                style={{
                    flexDirection: 'row',
                    marginTop: spacing.md,
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.xs,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                }}
            >
                {(Object.keys(SPEED_CONFIG) as SpeedLevel[]).map((level) => (
                    <Pressable
                        key={level}
                        onPress={() => setSpeed(level)}
                        disabled={isRunning || countdown !== null}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: borderRadius.md,
                            backgroundColor: speed === level ? colors.secondary : 'transparent',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: speed === level ? colors.white : colors.textMuted,
                            }}
                        >
                            {SPEED_CONFIG[level].label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Controls */}
            <View
                style={{
                    flexDirection: 'row',
                    marginTop: spacing.lg,
                    gap: spacing.md,
                }}
            >
                <Pressable
                    onPress={isRunning ? handlePause : handleStart}
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
                    {isRunning ? (
                        <Pause size={20} color={colors.white} strokeWidth={2} />
                    ) : (
                        <Play size={20} color={colors.white} strokeWidth={2} />
                    )}
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.md,
                            color: colors.white,
                            marginLeft: spacing.sm,
                        }}
                    >
                        {isRunning ? 'Pause' : isComplete ? 'Restart' : 'Start'}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleReset}
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
        </View>
    );
};
