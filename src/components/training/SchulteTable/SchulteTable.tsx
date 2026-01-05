/**
 * Schulte Table - Peripheral Vision Training Component
 * 
 * Enhanced UX Version 5.0 (Scientific Standard):
 * - Center Red Dot (ALWAYS) - No number in middle
 * - 3x3 (8 nums), 5x5 (24 nums), 7x7 (48 nums)
 * - Instant Load (No distracting animations)
 * - Proper Reset Logic
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, useWindowDimensions, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    FadeIn,
    ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';
import { RotateCcw, X, Target, BarChart2 } from 'lucide-react-native';
import { HeatGauge } from './HeatGauge';
import { VictoryOverlay } from './VictoryOverlay';
import { InfoButton } from '../../ui/InfoButton';
import { AcademicModal } from '../../ui/AcademicModal';

interface SchulteTableProps {
    onComplete?: (timeMs: number) => void;
    onReset?: () => void;
}

type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; label: string }> = {
    easy: { size: 3, label: '3×3' },
    normal: { size: 5, label: '5×5' },
    hard: { size: 7, label: '7×7' },
};

// Shuffle array
const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- Rank Logic ---
// Updated for larger grids
const calculateRank = (timeMs: number, gridSize: number): { rank: string; color: string; messageKey: string } => {
    // Effective cells are total - 1 (center is red dot)
    const activeCells = (gridSize * gridSize) - 1;
    const secondsPerCell = (timeMs / 1000) / activeCells;

    if (secondsPerCell < 0.7) return { rank: 'S+', color: '#FFD700', messageKey: 'games.schulte.ranks.sPlus' };
    if (secondsPerCell < 1.0) return { rank: 'S', color: '#00E5FF', messageKey: 'games.schulte.ranks.s' };
    if (secondsPerCell < 1.5) return { rank: 'A', color: '#00FF9D', messageKey: 'games.schulte.ranks.a' };
    if (secondsPerCell < 2.0) return { rank: 'B', color: '#B026FF', messageKey: 'games.schulte.ranks.b' };
    if (secondsPerCell < 2.5) return { rank: 'C', color: '#FF2E93', messageKey: 'games.schulte.ranks.c' };
    return { rank: 'D', color: '#888', messageKey: 'games.schulte.ranks.d' };
};

// Normal Number Cell
const NumberCell: React.FC<{
    number: number;
    isNext: boolean;
    isCompleted: boolean;
    isWrong: boolean;
    cellSize: number;
    onPress: () => void;
    disabled: boolean;
}> = React.memo(({ number, isNext, isCompleted, isWrong, cellSize, onPress, disabled }) => {
    const { colors, borderRadius } = useTheme();
    const scale = useSharedValue(1);

    // Simple state animation
    useEffect(() => {
        if (isCompleted) {
            scale.value = withSpring(0.95); // Slight press in
        } else if (isWrong) {
            scale.value = withSequence(
                withTiming(1.1, { duration: 50 }),
                withTiming(1, { duration: 50 })
            );
        } else {
            scale.value = withSpring(1);
        }
    }, [isCompleted, isWrong]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[{ width: cellSize, height: cellSize, padding: 2 }, animatedStyle]}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: borderRadius.sm,
                    backgroundColor: isCompleted ? colors.surface : colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: isNext ? colors.primary : colors.glassBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.8 : 1,
                })}
            >
                <Text
                    style={{
                        fontWeight: isNext ? 'bold' : '600',
                        fontSize: cellSize * 0.4,
                        color: isCompleted ? colors.textDim : colors.text,
                        opacity: isCompleted ? 0.5 : 1,
                    }}
                >
                    {number}
                </Text>
            </Pressable>
        </Animated.View>
    );
});

// Red Dot Center Cell
const RedDotCell: React.FC<{ cellSize: number; errorColor: string }> = ({ cellSize, errorColor }) => {
    return (
        <View style={{ width: cellSize, height: cellSize, padding: 2 }}>
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                // No background, just the dot
            }}>
                <View style={{
                    width: cellSize * 0.25,
                    height: cellSize * 0.25,
                    borderRadius: cellSize,
                    backgroundColor: errorColor,
                    shadowColor: errorColor,
                    shadowOpacity: 0.6,
                    shadowRadius: 10,
                    elevation: 5
                }} />
            </View>
        </View>
    );
};

export const SchulteTable: React.FC<SchulteTableProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, spacing, borderRadius, glows } = useTheme();
    const { width: windowWidth } = useWindowDimensions();

    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>('ready');
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    // Grid Config
    const gridSize = DIFFICULTY_CONFIG[difficulty].size;
    const totalCells = gridSize * gridSize;
    const maxNumber = totalCells - 1; // Center is skipped
    const centerIndex = Math.floor(totalCells / 2);

    // Layout
    const availableWidth = Math.min(windowWidth - (spacing.md * 2), 500);
    const cellSize = availableWidth / gridSize;

    // Game Logic
    const [numbers, setNumbers] = useState<number[]>([]);
    const [currentTarget, setCurrentTarget] = useState(1);
    const [wrongCell, setWrongCell] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showAcademicModal, setShowAcademicModal] = useState(false);

    // Initialization
    const initGame = useCallback(() => {
        // Generate numbers 1 to maxNumber
        const nums = Array.from({ length: maxNumber }, (_, i) => i + 1);
        const shuffled = shuffleArray(nums);

        // Insert '0' at middle to represent Red Dot (or handle by index)
        // Actually clearer to just use the shuffled array and render RedDot at specific index
        setNumbers(shuffled);

        setCurrentTarget(1);
        setElapsed(0);
        setStartTime(null);
        setWrongCell(null);
        setCombo(0); // Reset combo
        setGameState('ready');
        setShowResults(false);
    }, [maxNumber]);

    // Reset when difficulty changes
    useEffect(() => {
        initGame();
        setBestTime(null); // Optional: Reset best time on difficulty switch? 
    }, [initGame, difficulty]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing' && startTime) {
            interval = setInterval(() => setElapsed(Date.now() - startTime), 100);
        }
        return () => clearInterval(interval);
    }, [startTime, gameState]);

    const handleCellPress = useCallback((number: number) => {
        // Auto-Start
        if (gameState === 'ready') {
            if (number === 1) {
                setGameState('playing');
                setStartTime(Date.now());
                setCurrentTarget(2);
                setCombo(1); // Start combo
                setMaxCombo(1);
            } else {
                setWrongCell(number);
                setTimeout(() => setWrongCell(null), 300);
            }
            return;
        }

        if (gameState !== 'playing') return;

        if (number === currentTarget) {
            // Correct
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });

            if (currentTarget === maxNumber) {
                // Victory
                const finalTime = Date.now() - (startTime || Date.now());
                setGameState('complete');
                setElapsed(finalTime);
                if (!bestTime || finalTime < bestTime) setBestTime(finalTime);
                setShowResults(true);
                onComplete?.(finalTime);
            } else {
                setCurrentTarget(t => t + 1);
            }
        } else {
            // Wrong
            setCombo(0); // Reset combo
            setWrongCell(number);
            if (startTime) setStartTime(t => (t ? t - 500 : t));
            setTimeout(() => setWrongCell(null), 300);
        }
    }, [gameState, currentTarget, maxNumber, startTime, bestTime, onComplete, maxCombo]);

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const t = Math.floor((ms % 1000) / 100);
        return `${s}.${t}s`;
    };

    // Render Logic
    const renderCells = () => {
        const grid = [];
        let numIndex = 0;

        for (let i = 0; i < totalCells; i++) {
            if (i === centerIndex) {
                grid.push(<RedDotCell key={`cell-center-${i}`} cellSize={cellSize} errorColor={colors.error} />);
            } else {
                const num = numbers[numIndex];
                if (num !== undefined) {
                    grid.push(
                        <View key={`cell-${i}-${num}`} style={{ width: cellSize, height: cellSize }}>
                            <NumberCell
                                number={num}
                                isNext={num === currentTarget || (gameState === 'ready' && num === 1)}
                                isCompleted={num < currentTarget && gameState !== 'ready'}
                                isWrong={num === wrongCell}
                                cellSize={cellSize}
                                onPress={() => handleCellPress(num)}
                                disabled={false}
                            />
                        </View>
                    );
                }
                numIndex++;
            }
        }
        return grid;
    };

    const rankInfo = calculateRank(elapsed, gridSize);

    return (
        <View style={{ width: '100%', alignItems: 'center' }}>

            {/* HUD */}
            <LinearGradient
                colors={[colors.surfaceElevated, colors.surface]}
                style={{
                    width: '100%', maxWidth: 500,
                    borderRadius: borderRadius.lg, padding: spacing.sm,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}
            >
                {/* Left side - Target info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
                        alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
                        shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8
                    }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.background }}>
                            {currentTarget <= maxNumber ? currentTarget : '✓'}
                        </Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 1, fontWeight: '600' }}>{t('games.schulte.target')}</Text>
                        <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>
                            {gameState === 'ready' ? `${t('games.schulte.find')} 1` : currentTarget <= maxNumber ? `${t('games.schulte.find')} ${currentTarget}` : t('games.schulte.complete')}
                        </Text>
                    </View>
                </View>

                {/* Right side - Time and Info Button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 1, fontWeight: '600' }}>{t('games.common.time')}</Text>
                        <Text style={{ fontSize: 20, color: colors.text, fontVariant: ['tabular-nums'] }}>{formatTime(elapsed)}</Text>
                    </View>
                    <InfoButton onPress={() => setShowAcademicModal(true)} size={24} />
                </View>
            </LinearGradient>

            {/* Heat Gauge */}
            {
                (gameState === 'playing' || gameState === 'complete') && (
                    <View style={{ width: '100%', maxWidth: 500, marginBottom: spacing.sm }}>
                        <HeatGauge combo={combo} maxCombo={maxNumber} />
                    </View>
                )
            }

            {/* Game Board (Instant Entry) */}
            <Animated.View
                entering={FadeIn.duration(300)}
                key={difficulty}
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: availableWidth,
                    height: availableWidth,
                    alignSelf: 'center',
                    marginBottom: spacing.lg
                }}
            >
                {renderCells()}
            </Animated.View>

            {/* Difficulty Tabs */}
            {
                gameState === 'ready' && (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
                            <Pressable
                                key={d}
                                onPress={() => setDifficulty(d)}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 8,
                                    backgroundColor: difficulty === d ? 'rgba(0,255,255,0.15)' : 'transparent',
                                    borderRadius: 8, borderWidth: 1, borderColor: difficulty === d ? colors.primary : '#333'
                                }}
                            >
                                <Text style={{ fontSize: 13, color: difficulty === d ? colors.primary : '#666', fontWeight: 'bold' }}>
                                    {DIFFICULTY_CONFIG[d].label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )
            }

            {/* Victory Overlay */}
            <Modal visible={showResults} transparent animationType="none" onRequestClose={() => setShowResults(false)}>
                <VictoryOverlay
                    visible={showResults}
                    rankInfo={rankInfo}
                    elapsed={elapsed}
                    gridSize={gridSize}
                    onRestart={initGame}
                    onClose={() => setShowResults(false)}
                />
            </Modal>

            {/* Academic Info Modal */}
            <AcademicModal
                visible={showAcademicModal}
                onClose={() => setShowAcademicModal(false)}
                title={t('games.academic.schulte.title')}
                description={t('games.academic.schulte.description')}
                researchLink="https://pubmed.ncbi.nlm.nih.gov/8233345/"
            />
        </View >
    );
};
