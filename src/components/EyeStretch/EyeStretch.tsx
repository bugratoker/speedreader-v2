/**
 * Eye Stretch - Infinity Pattern Training
 * Animated dot guiding focus in a Lazy-8 (∞) pattern.
 * 
 * Academic Basis: Uses the "Follow the Target" method to improve smooth pursuit
 * movements and flexibility of the six extraocular muscles.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    cancelAnimation,
    runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Play, Pause, RotateCcw, Infinity } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EyeStretchProps {
    onComplete?: (cycles: number) => void;
}

type SpeedLevel = 'slow' | 'medium' | 'fast';

const SPEED_CONFIG: Record<SpeedLevel, { duration: number; label: string; description: string }> = {
    slow: { duration: 6000, label: 'Relaxed', description: 'Gentle stretch' },
    medium: { duration: 4000, label: 'Training', description: 'Standard pace' },
    fast: { duration: 2500, label: 'Challenge', description: 'Quick tracking' },
};

const TOTAL_CYCLES = 5;

export const EyeStretch: React.FC<EyeStretchProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState<SpeedLevel>('medium');
    const [cycleCount, setCycleCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(t('games.common.directions.center'));

    const progress = useSharedValue(0);
    const dotScale = useSharedValue(1);
    const glowIntensity = useSharedValue(0.5);
    const trailOpacity = useSharedValue(0);

    const cycleCountRef = useRef(0);
    const areaWidth = SCREEN_WIDTH - spacing.md * 4;
    const areaHeight = 280;
    const dotSize = 32;

    // Worklet for infinity path calculation
    const getInfinityPosition = (t: number, width: number, height: number): { x: number; y: number } => {
        'worklet';
        // t goes from 0 to 1 for one complete figure-8
        const angle = t * 2 * Math.PI;

        // Scale factors for the infinity shape
        const scaleX = (width / 2) - 40;
        const scaleY = (height / 2) - 40;

        // Lemniscate parametric equations
        const denominator = 1 + Math.sin(angle) * Math.sin(angle);
        const x = (scaleX * Math.cos(angle)) / denominator;
        const y = (scaleY * Math.sin(angle) * Math.cos(angle)) / denominator;

        return { x, y };
    };

    const handleCycleComplete = useCallback(() => {
        cycleCountRef.current += 1;
        setCycleCount(cycleCountRef.current);

        if (cycleCountRef.current >= TOTAL_CYCLES) {
            setIsComplete(true);
            setIsRunning(false);
            onComplete?.(cycleCountRef.current);
        }
    }, [onComplete]);

    // Start/stop animation
    useEffect(() => {
        if (isRunning && !isComplete) {
            const cycleDuration = SPEED_CONFIG[speed].duration;

            // Reset progress
            progress.value = 0;

            // Animate through the infinity pattern
            progress.value = withRepeat(
                withTiming(1, {
                    duration: cycleDuration,
                    easing: Easing.linear,
                }),
                TOTAL_CYCLES - cycleCountRef.current,
                false,
                (finished) => {
                    if (finished) {
                        runOnJS(handleCycleComplete)();
                    }
                }
            );

            // Subtle scale pulse
            dotScale.value = withRepeat(
                withTiming(1.15, { duration: cycleDuration / 2 }),
                -1,
                true
            );

            // Glow intensity animation
            glowIntensity.value = withRepeat(
                withTiming(0.9, { duration: cycleDuration / 4 }),
                -1,
                true
            );

            // Trail visibility
            trailOpacity.value = withTiming(0.4, { duration: 500 });
        } else {
            cancelAnimation(progress);
            cancelAnimation(dotScale);
            cancelAnimation(glowIntensity);
            dotScale.value = withTiming(1, { duration: 200 });
            glowIntensity.value = withTiming(0.5, { duration: 200 });
            trailOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [isRunning, speed, isComplete, progress, dotScale, glowIntensity, trailOpacity, handleCycleComplete]);

    // Update position label
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            // Read progress (approximation for UI)
            const currentProgress = Math.abs((Date.now() % SPEED_CONFIG[speed].duration) / SPEED_CONFIG[speed].duration);

            let label = t('games.common.directions.center');
            if (currentProgress < 0.125) label = `${t('games.common.directions.right')} →`;
            else if (currentProgress < 0.25) label = `${t('games.common.directions.topRight')} ↗`;
            else if (currentProgress < 0.375) label = t('games.common.directions.center');
            else if (currentProgress < 0.5) label = `${t('games.common.directions.bottomRight')} ↘`;
            else if (currentProgress < 0.625) label = `${t('games.common.directions.left')} ←`;
            else if (currentProgress < 0.75) label = `${t('games.common.directions.topLeft')} ↖`;
            else if (currentProgress < 0.875) label = t('games.common.directions.center');
            else label = `${t('games.common.directions.bottomLeft')} ↙`;

            setCurrentPosition(label);
        }, 100);

        return () => clearInterval(interval);
    }, [isRunning, speed]);

    const handleStart = () => {
        if (isComplete) {
            handleReset();
        }
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setCycleCount(0);
        cycleCountRef.current = 0;
        setIsComplete(false);
        setCurrentPosition(t('games.common.directions.center'));
        progress.value = 0;
        dotScale.value = 1;
        glowIntensity.value = 0.5;
        trailOpacity.value = 0;
    };

    const dotAnimatedStyle = useAnimatedStyle(() => {
        const pos = getInfinityPosition(progress.value, areaWidth, areaHeight);
        return {
            transform: [
                { translateX: pos.x },
                { translateY: pos.y },
                { scale: dotScale.value },
            ],
        };
    });

    const glowAnimatedStyle = useAnimatedStyle(() => {
        const pos = getInfinityPosition(progress.value, areaWidth, areaHeight);
        return {
            opacity: glowIntensity.value,
            transform: [
                { translateX: pos.x },
                { translateY: pos.y },
            ],
        };
    });

    // Trail dots at various positions along the path
    const trailPositions = [0.05, 0.1, 0.15, 0.2];

    const createTrailStyle = (offset: number) => {
        return useAnimatedStyle(() => {
            const trailProgress = (progress.value - offset + 1) % 1;
            const pos = getInfinityPosition(trailProgress, areaWidth, areaHeight);
            return {
                opacity: trailOpacity.value * (1 - offset * 4),
                transform: [
                    { translateX: pos.x },
                    { translateY: pos.y },
                    { scale: 0.6 - offset },
                ],
            };
        });
    };

    const trail1Style = createTrailStyle(0.05);
    const trail2Style = createTrailStyle(0.1);
    const trail3Style = createTrailStyle(0.15);

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Header with icon */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Infinity size={22} color={colors.secondary} strokeWidth={2} />
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
                    {t('games.eyestretch.instructions')}
                </Text>
            </View>

            {/* Progress and Position */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.lg }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.xl, color: colors.secondary }}>
                        {cycleCount}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                        / {TOTAL_CYCLES} {t('games.common.cycles')}
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
                        minWidth: 100,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.secondary }}>
                        {currentPosition}
                    </Text>
                </View>
            </View>

            {/* Animation Area */}
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
                {/* Infinity path guide (subtle) */}
                <View
                    style={{
                        position: 'absolute',
                        width: areaWidth - 60,
                        height: areaHeight - 60,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        borderStyle: 'dashed',
                        borderRadius: 100,
                        opacity: 0.3,
                    }}
                />

                {/* Center marker */}
                <View
                    style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.glassBorder,
                    }}
                />

                {/* Trail dots */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: dotSize * 0.6,
                            height: dotSize * 0.6,
                            borderRadius: dotSize * 0.3,
                            backgroundColor: colors.secondary,
                        },
                        trail3Style,
                    ]}
                />
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: dotSize * 0.7,
                            height: dotSize * 0.7,
                            borderRadius: dotSize * 0.35,
                            backgroundColor: colors.secondary,
                        },
                        trail2Style,
                    ]}
                />
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: dotSize * 0.8,
                            height: dotSize * 0.8,
                            borderRadius: dotSize * 0.4,
                            backgroundColor: colors.secondary,
                        },
                        trail1Style,
                    ]}
                />

                {/* Glow effect */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: dotSize + 24,
                            height: dotSize + 24,
                            borderRadius: (dotSize + 24) / 2,
                            backgroundColor: colors.secondaryGlow,
                        },
                        glowAnimatedStyle,
                    ]}
                />

                {/* Main dot */}
                <Animated.View
                    style={[
                        {
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: colors.secondary,
                            ...glows.secondary,
                        },
                        dotAnimatedStyle,
                    ]}
                />
            </View>

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
                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.xl, color: colors.secondary }}>
                        ∞ {t('games.eyestretch.titleComplete')}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.md, color: colors.text, marginTop: spacing.xs }}>
                        {TOTAL_CYCLES} infinity {t('games.common.cycles')} {t('games.schulte.complete')}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs }}>
                        {t('games.eyestretch.completeMsg')}
                    </Text>
                </View>
            )}

            {/* Speed Selector */}
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
                {(Object.keys(SPEED_CONFIG) as SpeedLevel[]).map((level) => (
                    <Pressable
                        key={level}
                        onPress={() => setSpeed(level)}
                        disabled={isRunning}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: borderRadius.md,
                            backgroundColor: speed === level ? colors.secondary : 'transparent',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: speed === level ? colors.white : colors.textMuted,
                            }}
                        >
                            {t(`games.eyestretch.speed.${level}`)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md }}>
                <Pressable
                    onPress={isRunning ? handlePause : handleStart}
                    style={({ pressed }) => ({
                        paddingHorizontal: spacing.xl,
                        paddingVertical: spacing.md,
                        backgroundColor: pressed ? colors.secondaryDim : colors.secondary,
                        borderRadius: borderRadius.lg,
                        flexDirection: 'row',
                        alignItems: 'center',
                    })}
                >
                    {isRunning ? (
                        <Pause size={20} color={colors.white} strokeWidth={2} />
                    ) : (
                        <Play size={20} color={colors.white} strokeWidth={2} />
                    )}
                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.white, marginLeft: spacing.sm }}>
                        {isRunning ? t('games.common.pause') : isComplete ? t('games.common.restart') : t('games.common.start')}
                    </Text>
                </Pressable>

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
            </View>
        </View>
    );
};
