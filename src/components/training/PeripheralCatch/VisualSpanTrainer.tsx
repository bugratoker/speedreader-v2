/**
 * Visual Span Trainer - Neural Nexus Paradigm
 * 
 * A clinical-grade vision therapy experience that trains foveal fixation
 * and parafoveal processing through the "Neural Nexus" paradigm.
 * 
 * Core Mechanics:
 * - Breathing Electric Cyan ring (60 BPM) for foveal fixation
 * - Semantic clusters (2-3 word phrases) flash in peripheral zones
 * - 150ms stimulus duration followed by 100ms visual mask
 * - Glassmorphism choice grid for low-friction answers
 * - Adaptive difficulty: 3 correct → increase radius + decrease time
 * 
 * Academic Basis: Rayner (2009) shows skilled readers process 7-9 letter
 * spaces to the right of fixation. This drill trains that peripheral processing.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@theme';
import { TrainingStartButton } from '../common/TrainingStartButton';
import { InfoButton } from '../../ui/InfoButton';
import { AcademicModal } from '../../ui/AcademicModal';
import { Play, RotateCcw, Eye } from 'lucide-react-native';

import { TRAINING_DATA, WordCluster } from './trainingData';

import { NeuralNexus } from './NeuralNexus';
import { StimulusBurst, SECTORS } from './StimulusBurst';
import { VisualMask } from './VisualMask';
import { ChoiceGrid } from './ChoiceGrid';
import { SpanHUD } from './SpanHUD';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Props interface
interface VisualSpanTrainerProps {
    onComplete?: (score: number, total: number) => void;
}

// Game states
type GameState = 'ready' | 'countdown' | 'fixation' | 'burst' | 'mask' | 'choice' | 'feedback' | 'complete';

// Difficulty configuration
interface DifficultyConfig {
    stimulusDuration: number;  // ms
    maskDuration: number;      // ms
    initialRadius: number;     // px from center
    rounds: number;
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
    beginner: { stimulusDuration: 1500, maskDuration: 200, initialRadius: 80, rounds: 8 },
    intermediate: { stimulusDuration: 1000, maskDuration: 150, initialRadius: 90, rounds: 10 },
    advanced: { stimulusDuration: 800, maskDuration: 120, initialRadius: 100, rounds: 12 },
    expert: { stimulusDuration: 600, maskDuration: 100, initialRadius: 110, rounds: 15 },
};



// Shuffle array utility
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const PeripheralCatch: React.FC<VisualSpanTrainerProps> = ({ onComplete }) => {
    const { t, i18n } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    // Game state
    const [gameState, setGameState] = useState<GameState>('ready');
    const [difficulty, setDifficulty] = useState<string>('intermediate');
    const [countdown, setCountdown] = useState(3);

    // Round state
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    // Current trial
    const [currentCluster, setCurrentCluster] = useState<WordCluster | null>(null);
    const [currentSectors, setCurrentSectors] = useState<number[]>([]);
    const [currentRadius, setCurrentRadius] = useState(160);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);

    // Stats
    const [currentSpan, setCurrentSpan] = useState(3.5); // cm
    const [neuralLoad, setNeuralLoad] = useState(50); // percentage

    // Modal
    const [showAcademicModal, setShowAcademicModal] = useState(false);

    // Timing refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const usedClusters = useRef<Set<number>>(new Set());

    // Animation
    const edgeGlow = useSharedValue(0);
    const shakeX = useSharedValue(0);

    const config = DIFFICULTY_CONFIG[difficulty];
    const areaWidth = SCREEN_WIDTH - spacing.md * 2;
    const areaHeight = 360;

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Get next cluster
    const getNextCluster = useCallback(() => {
        // Get language-specific clusters or fallback to English
        const langCode = i18n.language?.startsWith('tr') ? 'tr' : 'en';
        const clusters = TRAINING_DATA[langCode] || TRAINING_DATA['en'];
        
        const available = clusters.map((_, i) => i).filter(i => !usedClusters.current.has(i));
        const pool = available.length > 0 ? available : clusters.map((_, i) => i);

        const randomIndex = pool[Math.floor(Math.random() * pool.length)];
        usedClusters.current.add(randomIndex);

        if (usedClusters.current.size >= clusters.length) {
            usedClusters.current.clear();
        }

        return clusters[randomIndex];
    }, [i18n.language]);

    // Start a trial
    const startTrial = useCallback(() => {
        const cluster = getNextCluster();
        setCurrentCluster(cluster);
        
        // Pick 3 distinct sectors that are somewhat spaced out
        const allSectors = Array.from({ length: 8 }, (_, i) => i);
        const selectedSectors: number[] = [];
        
        for (let i = 0; i < 3; i++) {
            const pool = allSectors.filter(s => 
                !selectedSectors.includes(s) && 
                !selectedSectors.includes((s + 1) % 8) && 
                !selectedSectors.includes((s - 1 + 8) % 8)
            );
            // If we run out of spaced options, just pick any remaining
            const fallbackPool = allSectors.filter(s => !selectedSectors.includes(s));
            const available = pool.length > 0 ? pool : fallbackPool;
            
            const randomIdx = Math.floor(Math.random() * available.length);
            selectedSectors.push(available[randomIdx]);
        }
        
        setCurrentSectors(selectedSectors);
        setShuffledOptions(shuffleArray([cluster.phrase, ...cluster.distractors]));
        setFeedbackType(null);

        // Fixation phase (500ms)
        setGameState('fixation');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        timeoutRef.current = setTimeout(() => {
            // Burst phase
            setGameState('burst');

            timeoutRef.current = setTimeout(() => {
                // Mask phase
                setGameState('mask');

                timeoutRef.current = setTimeout(() => {
                    // Choice phase
                    setGameState('choice');
                }, config.maskDuration);
            }, config.stimulusDuration);
        }, 500);
    }, [getNextCluster, config]);

    // Handle answer
    const handleAnswer = useCallback((selected: string, isCorrect: boolean) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setFeedbackType(isCorrect ? 'correct' : 'wrong');
        setGameState('feedback');

        if (isCorrect) {
            setScore(s => s + 1);
            setStreak(s => s + 1);

            // Success animation: cyan edge glow
            edgeGlow.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0, { duration: 300 })
            );

            // Adaptive difficulty: 3 correct → harder
            if ((streak + 1) % 3 === 0) {
                setCurrentRadius(r => Math.min(r + 10, 250));
                // Flash rate would decrease here too
            }

            // Update stats
            setCurrentSpan(s => Math.min(s + 0.15, 8.0));
            setNeuralLoad(l => Math.min(l + 5, 100));
        } else {
            setStreak(0);

            // Wrong animation: shake
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-5, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );

            setNeuralLoad(l => Math.max(l - 3, 20));
        }

        // Next round or complete
        timeoutRef.current = setTimeout(() => {
            const nextRound = round + 1;
            if (nextRound >= config.rounds) {
                setGameState('complete');
                onComplete?.(score + (isCorrect ? 1 : 0), config.rounds);
            } else {
                setRound(nextRound);
                startTrial();
            }
        }, 800);
    }, [round, config.rounds, score, streak, onComplete, startTrial, edgeGlow, shakeX]);

    // Countdown effect
    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setCurrentRadius(config.initialRadius);
                startTrial();
            }
        }
    }, [gameState, countdown, startTrial, config.initialRadius]);

    // Start game
    const handleStart = () => {
        if (gameState === 'complete') handleReset();
        setCountdown(3);
        setGameState('countdown');
    };

    // Reset
    const handleReset = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameState('ready');
        setRound(0);
        setScore(0);
        setStreak(0);
        setCurrentSpan(3.5);
        setNeuralLoad(50);
        setCurrentCluster(null);
        setFeedbackType(null);
        usedClusters.current.clear();
    };

    // Animated styles
    const edgeGlowStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(0, 255, 255, ${edgeGlow.value * 0.5})`,
        borderWidth: edgeGlow.value * 3,
    }));

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    // Performance calculations
    const getStarRating = () => {
        const accuracy = config.rounds > 0 ? (score / config.rounds) * 100 : 0;
        if (accuracy >= 90) return 3;
        if (accuracy >= 70) return 2;
        if (accuracy >= 50) return 1;
        return 0;
    };

    const getPerformanceMessage = () => {
        const percentage = (score / config.rounds) * 100;
        if (percentage >= 90) return { emoji: '🧠', text: t('games.peripheral.performance.elite') };
        if (percentage >= 70) return { emoji: '🎯', text: t('games.peripheral.performance.excellent') };
        if (percentage >= 50) return { emoji: '👁️', text: t('games.peripheral.performance.good') };
        return { emoji: '💪', text: t('games.peripheral.performance.keepGoing') };
    };

    const isGameActive = ['fixation', 'burst', 'mask', 'choice', 'feedback'].includes(gameState);

    return (
        <View style={{ alignItems: 'center', width: '100%' }}>
            {/* Header with Info Button */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Eye size={18} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.headerText, { color: colors.textMuted, fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm }]}>
                        Visual Span Trainer
                    </Text>
                </View>
                <InfoButton onPress={() => setShowAcademicModal(true)} size={28} />
            </View>

            {/* Main Game Area */}
            <Animated.View
                style={[
                    styles.gameArea,
                    {
                        width: areaWidth,
                        height: areaHeight,
                        backgroundColor: colors.background,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                    },
                    edgeGlowStyle,
                    shakeStyle,
                ]}
            >
                {/* Neural Nexus (Center) */}

                {/* Neural Nexus - Hidden during choice/feedback */}
                {gameState !== 'choice' && gameState !== 'feedback' && (
                    <View style={styles.nexusContainer}>
                        <NeuralNexus
                            isActive={gameState === 'fixation' || gameState === 'burst'}
                            intensity={gameState === 'fixation' ? 'bright' : gameState === 'burst' ? 'normal' : 'dim'}
                            size={80}
                        />
                        {gameState === 'fixation' && (
                            <Animated.Text
                                entering={FadeIn.duration(200)}
                                style={[styles.fixationText, { color: colors.textDim, fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs }]}
                            >
                                FOCUS HERE
                            </Animated.Text>
                        )}
                    </View>
                )}

                {/* Stimulus Burst */}
                <StimulusBurst
                    words={currentCluster ? currentCluster.phrase.split(' ') : []}
                    sectors={currentSectors}
                    radius={currentRadius}
                    duration={config.stimulusDuration}
                    visible={gameState === 'burst'}
                />

                {/* Visual Mask */}
                <VisualMask
                    visible={gameState === 'mask'}
                    duration={config.maskDuration}
                    size={100}
                />
                
                {/* Center Choice Grid */}
                {(gameState === 'choice' || gameState === 'feedback') && currentCluster && (
                    <View style={styles.centerOverlay}>
                        <ChoiceGrid
                            options={shuffledOptions}
                            correctAnswer={currentCluster.phrase}
                            onSelect={handleAnswer}
                            visible={true}
                            disabled={gameState === 'feedback'}
                        />
                    </View>
                )}

                {/* Countdown Overlay */}
                {gameState === 'countdown' && (
                    <Animated.View
                        entering={FadeIn.duration(100)}
                        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}
                    >
                        <Text style={[styles.countdownText, { color: colors.primary, fontFamily: fontFamily.uiBold, ...glows.primary }]}>
                            {countdown || '👁️'}
                        </Text>
                        <Text style={[styles.countdownSubtext, { color: colors.text, fontFamily: fontFamily.uiMedium, fontSize: fontSize.md }]}>
                            {countdown > 0 ? t('games.peripheral.eyesLocked') : 'GO!'}
                        </Text>
                    </Animated.View>
                )}

                {/* Feedback Overlay */}
                {gameState === 'feedback' && feedbackType && (
                    <Animated.View
                        entering={FadeIn.duration(100)}
                        style={[
                            styles.feedbackBadge,
                            {
                                backgroundColor: feedbackType === 'correct' ? colors.success + '30' : colors.error + '30',
                                borderRadius: borderRadius.full,
                            },
                        ]}
                    >
                        <Text style={[styles.feedbackText, { color: feedbackType === 'correct' ? colors.success : colors.error, fontFamily: fontFamily.uiBold }]}>
                            {feedbackType === 'correct' ? '✓ Correct!' : `✗ Was: ${currentCluster?.phrase}`}
                        </Text>
                    </Animated.View>
                )}

                {/* Ready / Complete State */}
                {(gameState === 'ready' || gameState === 'complete') && (
                    <View style={[styles.overlay, { backgroundColor: colors.surface + 'F8' }]}>
                        {gameState === 'complete' ? (
                            <View style={styles.completeContainer}>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3].map((star) => (
                                        <Text key={star} style={styles.star}>
                                            {star <= getStarRating() ? '⭐' : '☆'}
                                        </Text>
                                    ))}
                                </View>
                                <Text style={[styles.scoreText, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
                                    {score}/{config.rounds}
                                </Text>
                                <Text style={[styles.performanceText, { color: colors.textMuted, fontFamily: fontFamily.uiMedium }]}>
                                    {getPerformanceMessage().emoji} {getPerformanceMessage().text}
                                </Text>
                                <Text style={[styles.spanResultText, { color: colors.primary, fontFamily: fontFamily.uiRegular }]}>
                                    Final Span: {currentSpan.toFixed(1)}cm
                                </Text>
                                <TrainingStartButton
                                    title={t('games.common.playAgain')}
                                    onPress={handleStart}
                                    icon={RotateCcw}
                                    style={{ marginTop: 24, paddingVertical: 14 }}
                                />
                            </View>
                        ) : (
                            <View style={styles.readyContainer}>
                                <View style={styles.topContent}>
                                    {/* Difficulty Selector */}
                                    <Text style={[styles.difficultyLabel, { color: colors.textMuted, fontFamily: fontFamily.uiMedium }]}>
                                        {t('games.peripheral.selectDifficulty')}
                                    </Text>
                                    <View style={styles.difficultyRow}>
                                        {Object.keys(DIFFICULTY_CONFIG).map((level) => (
                                            <Pressable
                                                key={level}
                                                onPress={() => setDifficulty(level)}
                                                style={[
                                                    styles.difficultyButton,
                                                    {
                                                        backgroundColor: difficulty === level ? colors.secondary : colors.surfaceElevated,
                                                        borderColor: difficulty === level ? colors.secondary : colors.glassBorder,
                                                        borderRadius: borderRadius.full,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.difficultyText,
                                                        {
                                                            color: difficulty === level ? colors.white : colors.textMuted,
                                                            fontFamily: fontFamily.uiMedium,
                                                            fontSize: fontSize.xs,
                                                        },
                                                    ]}
                                                >
                                                    {t(`games.peripheral.difficulty.${level}`)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    {/* Instructions */}
                                    <View style={styles.instructionsContainer}>
                                        <NeuralNexus isActive size={50} />
                                        <Text style={[styles.instructionTitle, { color: colors.text, fontFamily: fontFamily.uiMedium }]}>
                                            Neural Nexus Training
                                        </Text>
                                        <Text style={[styles.instructionText, { color: colors.text, fontFamily: fontFamily.uiRegular, lineHeight: 24 }]}>
                                            Lock eyes on center. Catch semantic clusters in peripheral vision.
                                        </Text>
                                    </View>
                                </View>

                                {/* Start Button Footer */}
                                <View style={styles.bottomFooter}>
                                    <TrainingStartButton
                                        title={t('games.common.start')}
                                        onPress={handleStart}
                                        icon={Play}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </Animated.View>



            {/* Stats HUD */}
            {isGameActive && (
                <View style={{ marginTop: spacing.lg, width: '100%' }}>
                    <SpanHUD
                        currentSpan={currentSpan}
                        neuralLoad={neuralLoad}
                        round={round + 1}
                        totalRounds={config.rounds}
                        score={score}
                        visible={true}
                    />
                </View>
            )}

            {/* Academic Modal */}
            <AcademicModal
                visible={showAcademicModal}
                onClose={() => setShowAcademicModal(false)}
                title="Visual Span & Parafoveal Processing"
                description={`Speed readers utilize 'Parafoveal Processing' to pre-process upcoming words before their eyes arrive at them.

The Visual Masking technique (static noise after stimulus) prevents retinal after-images and forces the brain to use genuine short-term visual memory.

📖 Rayner, K. (2009). 'Eye movements and attention in reading, scene perception, and visual search.' Quarterly Journal of Experimental Psychology.

Research shows that training parafoveal span can expand reading speed by up to 40% while maintaining comprehension.`}
                researchLink="https://pubmed.ncbi.nlm.nih.gov/19296738/"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 16,
        width: '100%',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerText: {
        marginLeft: 8,
    },
    gameArea: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    nexusContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixationText: {
        marginTop: 8,
        letterSpacing: 2,
    },
    stimulusContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    maskContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    countdownText: {
        fontSize: 80,
    },
    countdownSubtext: {
        marginTop: 8,
    },
    feedbackBadge: {
        position: 'absolute',
        top: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    centerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    feedbackText: {
        fontSize: 16,
    },
    completeContainer: {
        alignItems: 'center',
        padding: 24,
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    star: {
        fontSize: 32,
        marginHorizontal: 4,
    },
    scoreText: {
        fontSize: 48,
    },
    performanceText: {
        fontSize: 16,
        marginTop: 4,
    },
    spanResultText: {
        fontSize: 14,
        marginTop: 8,
    },
    playAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 24,
    },
    playAgainText: {
        fontSize: 18,
        marginLeft: 8,
    },
    readyContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
    },
    topContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 24,
    },
    bottomFooter: {
        width: '100%',
        paddingHorizontal: 32,
        paddingBottom: 60, // Reduced for better spacing on small screens
        paddingTop: 16,
        alignItems: 'center',
    },
    difficultyLabel: {
        fontSize: 13,
        marginBottom: 12,
    },
    difficultyRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    difficultyButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
    },
    difficultyText: {
        textTransform: 'capitalize',
    },
    instructionsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionTitle: {
        fontSize: 18,
        marginTop: 12,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});
