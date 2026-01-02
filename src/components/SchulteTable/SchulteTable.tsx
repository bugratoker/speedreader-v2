/**
 * Schulte Table - Peripheral Vision Training Component
 * A grid with numbers in random positions.
 * User taps numbers in sequential order while keeping gaze fixed on center.
 * 
 * Academic Basis: Proven to improve visual search speed and stability of attention
 * by forcing the brain to process a wide visual field simultaneously.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Crosshair, Trophy, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SchulteTableProps {
    onComplete?: (timeMs: number) => void;
    onReset?: () => void;
}

type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; label: string; distractions: boolean }> = {
    easy: { size: 3, label: '3×3', distractions: false },
    normal: { size: 5, label: '5×5', distractions: false },
    hard: { size: 5, label: '5×5+', distractions: true },
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Animated Cell Component
const AnimatedCell: React.FC<{
    number: number;
    isNext: boolean;
    isCompleted: boolean;
    isWrong: boolean;
    isDistracted: boolean;
    cellSize: number;
    onPress: () => void;
}> = ({ number, isNext, isCompleted, isWrong, isDistracted, cellSize, onPress }) => {
    const { colors, fontFamily, fontSize, borderRadius } = useTheme();
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    const distractionPulse = useSharedValue(0);

    useEffect(() => {
        if (isCompleted) {
            scale.value = withSequence(
                withSpring(1.15, { damping: 8 }),
                withSpring(1, { damping: 12 })
            );
            glowOpacity.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0.3, { duration: 300 })
            );
        } else if (isWrong) {
            scale.value = withSequence(
                withSpring(0.9, { damping: 8 }),
                withSpring(1, { damping: 12 })
            );
        }
    }, [isCompleted, isWrong, scale, glowOpacity]);

    useEffect(() => {
        if (isDistracted) {
            distractionPulse.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            distractionPulse.value = withTiming(0, { duration: 200 });
        }
    }, [isDistracted, distractionPulse]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const distractionStyle = useAnimatedStyle(() => ({
        opacity: distractionPulse.value * 0.6,
    }));

    const getCellColor = () => {
        if (isCompleted) return colors.primary;
        if (isWrong) return colors.error;
        return colors.surface;
    };

    const getBorderColor = () => {
        if (isCompleted) return colors.primary;
        if (isWrong) return colors.error;
        return colors.glassBorder;
    };

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                disabled={isCompleted}
                style={{
                    width: cellSize,
                    height: cellSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 2,
                }}
            >
                {/* Glow effect for completed cells */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: cellSize + 6,
                            height: cellSize + 6,
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.primaryGlow,
                        },
                        glowStyle,
                    ]}
                />
                {/* Distraction pulse overlay */}
                {isDistracted && (
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                width: cellSize - 4,
                                height: cellSize - 4,
                                borderRadius: borderRadius.md,
                                backgroundColor: colors.secondary,
                            },
                            distractionStyle,
                        ]}
                    />
                )}
                <View
                    style={{
                        width: cellSize - 4,
                        height: cellSize - 4,
                        borderRadius: borderRadius.md,
                        backgroundColor: getCellColor(),
                        borderWidth: 1,
                        borderColor: getBorderColor(),
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: cellSize > 50 ? fontSize.lg : fontSize.md,
                            color: isCompleted ? colors.background : colors.text,
                        }}
                    >
                        {number}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

// Central Fixation Point Component
// During gameplay, this becomes semi-transparent and non-blocking so cells are tappable
const CentralFixation: React.FC<{ isActive: boolean; isPlaying?: boolean }> = ({ isActive, isPlaying = false }) => {
    const { colors } = useTheme();
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.5);

    useEffect(() => {
        if (isActive) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(isPlaying ? 0.4 : 0.8, { duration: 800 }),
                    withTiming(isPlaying ? 0.15 : 0.3, { duration: 800 })
                ),
                -1,
                true
            );
        } else {
            pulseScale.value = withTiming(1, { duration: 200 });
            pulseOpacity.value = withTiming(0.5, { duration: 200 });
        }
    }, [isActive, isPlaying, pulseScale, pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
            }}
        >
            {/* Outer pulse ring */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: colors.primary,
                    },
                    pulseStyle,
                ]}
            />
            {/* Inner crosshair - faded during play */}
            <View
                style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isPlaying ? 0.3 : 1,
                }}
            >
                <Crosshair size={24} color={colors.primary} strokeWidth={2} />
            </View>
        </View>
    );
};

export const SchulteTable: React.FC<SchulteTableProps> = ({
    onComplete,
    onReset,
}) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [gameState, setGameState] = useState<'ready' | 'countdown' | 'playing' | 'complete'>('ready');
    const [countdown, setCountdown] = useState(3);
    const [bestTime, setBestTime] = useState<number | null>(null);

    const gridSize = DIFFICULTY_CONFIG[difficulty].size;
    const totalCells = gridSize * gridSize;

    const cellSize = Math.min(
        (SCREEN_WIDTH - spacing.md * 2 - 4 * gridSize) / gridSize,
        gridSize === 3 ? 90 : 64
    );

    // Generate shuffled numbers
    const [numbers, setNumbers] = useState<number[]>(() =>
        shuffleArray(Array.from({ length: totalCells }, (_, i) => i + 1))
    );
    const [currentTarget, setCurrentTarget] = useState(1);
    const [wrongCell, setWrongCell] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [distractedCells, setDistractedCells] = useState<Set<number>>(new Set());

    const distractionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Reset when difficulty changes
    useEffect(() => {
        const newTotal = DIFFICULTY_CONFIG[difficulty].size ** 2;
        setNumbers(shuffleArray(Array.from({ length: newTotal }, (_, i) => i + 1)));
        setCurrentTarget(1);
        setGameState('ready');
        setElapsed(0);
        setStartTime(null);
        setDistractedCells(new Set());
    }, [difficulty]);

    // Countdown effect
    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('playing');
                setStartTime(Date.now());
            }
        }
    }, [gameState, countdown]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (startTime && gameState === 'playing') {
            interval = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [startTime, gameState]);

    // Distraction mode
    useEffect(() => {
        if (gameState === 'playing' && DIFFICULTY_CONFIG[difficulty].distractions) {
            distractionIntervalRef.current = setInterval(() => {
                const numDistractions = Math.floor(Math.random() * 3) + 1;
                const newDistracted = new Set<number>();
                for (let i = 0; i < numDistractions; i++) {
                    const randomNum = Math.floor(Math.random() * totalCells) + 1;
                    if (randomNum >= currentTarget) {
                        newDistracted.add(randomNum);
                    }
                }
                setDistractedCells(newDistracted);
            }, 1500);
        }
        return () => {
            if (distractionIntervalRef.current) {
                clearInterval(distractionIntervalRef.current);
            }
        };
    }, [gameState, difficulty, currentTarget, totalCells]);

    const handleCellPress = useCallback(
        (number: number) => {
            if (gameState !== 'playing') return;

            if (number === currentTarget) {
                setWrongCell(null);
                if (currentTarget === totalCells) {
                    const finalTime = Date.now() - (startTime || Date.now());
                    setGameState('complete');
                    setElapsed(finalTime);
                    setDistractedCells(new Set());

                    // Update best time
                    if (!bestTime || finalTime < bestTime) {
                        setBestTime(finalTime);
                    }

                    onComplete?.(finalTime);
                } else {
                    setCurrentTarget(currentTarget + 1);
                }
            } else {
                // Wrong tap - add 0.5s penalty and flash cell
                setWrongCell(number);
                if (startTime) {
                    setStartTime(startTime - 500); // Effectively adds 500ms to elapsed time
                }
                setTimeout(() => setWrongCell(null), 300);
            }
        },
        [currentTarget, startTime, totalCells, onComplete, gameState, bestTime]
    );

    const handleStart = useCallback(() => {
        setNumbers(shuffleArray(Array.from({ length: totalCells }, (_, i) => i + 1)));
        setCurrentTarget(1);
        setWrongCell(null);
        setElapsed(0);
        setCountdown(3);
        setGameState('countdown');
        setDistractedCells(new Set());
    }, [totalCells]);

    const handleReset = useCallback(() => {
        setNumbers(shuffleArray(Array.from({ length: totalCells }, (_, i) => i + 1)));
        setCurrentTarget(1);
        setWrongCell(null);
        setStartTime(null);
        setElapsed(0);
        setGameState('ready');
        setDistractedCells(new Set());
        onReset?.();
    }, [totalCells, onReset]);

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}s`;
    };

    // Create grid rows
    const rows = useMemo(() => {
        const result: number[][] = [];
        for (let i = 0; i < gridSize; i++) {
            result.push(numbers.slice(i * gridSize, (i + 1) * gridSize));
        }
        return result;
    }, [numbers, gridSize]);

    const gridWidth = cellSize * gridSize + 4 * gridSize;

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Difficulty Selector */}
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: spacing.md,
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
                        disabled={gameState === 'playing' || gameState === 'countdown'}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: borderRadius.md,
                            backgroundColor: difficulty === level ? colors.primary : 'transparent',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: difficulty === level ? colors.background : colors.textMuted,
                            }}
                        >
                            {DIFFICULTY_CONFIG[level].label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Timer and Progress */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: spacing.md,
                    paddingHorizontal: spacing.sm,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Zap size={16} color={colors.primary} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginLeft: spacing.xs,
                        }}
                    >
                        Next: {currentTarget <= totalCells ? currentTarget : '✓'}
                    </Text>
                </View>
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                        borderWidth: 1,
                        borderColor: colors.primary,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.lg,
                            color: colors.primary,
                        }}
                    >
                        {formatTime(elapsed)}
                    </Text>
                </View>
            </View>

            {/* Best Time Display */}
            {bestTime && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: spacing.sm,
                    }}
                >
                    <Trophy size={14} color={colors.secondary} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.xs,
                            color: colors.secondary,
                            marginLeft: spacing.xs,
                        }}
                    >
                        Best: {formatTime(bestTime)}
                    </Text>
                </View>
            )}

            {/* Grid Container */}
            <View
                style={{
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.bento,
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    ...glows.primarySubtle,
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            width: gridWidth + spacing.md * 2,
                            height: gridWidth + spacing.md * 2,
                            borderRadius: borderRadius.bento,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: 64,
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
                            Keep eyes on center ⊕
                        </Text>
                    </View>
                )}

                {/* Central Fixation Point - semi-transparent during gameplay */}
                <CentralFixation isActive={gameState === 'playing'} isPlaying={gameState === 'playing'} />

                {/* Grid */}
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row' }}>
                        {row.map((number) => (
                            <AnimatedCell
                                key={number}
                                number={number}
                                isNext={number === currentTarget}
                                isCompleted={number < currentTarget}
                                isWrong={number === wrongCell}
                                isDistracted={distractedCells.has(number)}
                                cellSize={cellSize}
                                onPress={() => handleCellPress(number)}
                            />
                        ))}
                    </View>
                ))}
            </View>

            {/* Instructions */}
            {gameState === 'ready' && (
                <View
                    style={{
                        marginTop: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
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
                        🎯 Keep your gaze fixed on the center crosshair.{'\n'}
                        Use peripheral vision to find and tap numbers 1-{totalCells} in order.
                    </Text>
                </View>
            )}

            {/* Completion Message */}
            {gameState === 'complete' && (
                <View
                    style={{
                        marginTop: spacing.lg,
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                        borderWidth: 1,
                        borderColor: bestTime === elapsed ? colors.secondary : colors.primary,
                        ...(bestTime === elapsed ? glows.secondary : glows.primary),
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.xl,
                            color: bestTime === elapsed ? colors.secondary : colors.primary,
                        }}
                    >
                        {bestTime === elapsed ? '🏆 New Record!' : '🎉 Complete!'}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.md,
                            color: colors.text,
                            marginTop: spacing.xs,
                        }}
                    >
                        Time: {formatTime(elapsed)}
                    </Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md }}>
                {gameState === 'ready' && (
                    <Pressable
                        onPress={handleStart}
                        style={({ pressed }) => ({
                            paddingHorizontal: spacing.xl,
                            paddingVertical: spacing.md,
                            backgroundColor: pressed ? colors.primaryDim : colors.primary,
                            borderRadius: borderRadius.lg,
                        })}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.md,
                                color: colors.background,
                            }}
                        >
                            Start
                        </Text>
                    </Pressable>
                )}

                {gameState === 'complete' && (
                    <Pressable
                        onPress={handleStart}
                        style={({ pressed }) => ({
                            paddingHorizontal: spacing.xl,
                            paddingVertical: spacing.md,
                            backgroundColor: pressed ? colors.primaryDim : colors.primary,
                            borderRadius: borderRadius.lg,
                        })}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.md,
                                color: colors.background,
                            }}
                        >
                            Play Again
                        </Text>
                    </Pressable>
                )}

                {(gameState === 'playing' || gameState === 'complete') && (
                    <Pressable
                        onPress={handleReset}
                        style={({ pressed }) => ({
                            paddingHorizontal: spacing.lg,
                            paddingVertical: spacing.md,
                            backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                            borderRadius: borderRadius.lg,
                            borderWidth: 1,
                            borderColor: colors.glassBorder,
                        })}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.textMuted,
                            }}
                        >
                            Reset
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};
