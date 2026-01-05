/**
 * Rhythm-Guided Reading - Saccadic Training with Real Text (v4 - UX Fixed)
 * 
 * FIXES:
 * - Longer paragraphs for sustained rhythm
 * - Fixed dot alignment to word centers
 * - Added Start/Pause/Resume controls
 * - Sticky Start button (better UX)
 * - Wider viewport for more words per line
 * - Single red dot (high contrast, minimal animation)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PremiumButton } from '../../ui/PremiumButton';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import {
    Play, Pause, RotateCcw, BookOpen, CheckCircle, XCircle
} from 'lucide-react-native';
import { InfoButton } from '../../ui/InfoButton';
import { AcademicModal } from '../../ui/AcademicModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SaccadicJumpsProps {
    onComplete?: (totalJumps: number, accuracy: number) => void;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type GameState = 'idle' | 'reading' | 'paused' | 'quiz' | 'completed';

interface DifficultyConfig {
    fixationDuration: number;
    wordsPerFixation: number;
    wpm: number;
    description: string;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
    beginner: { fixationDuration: 400, wordsPerFixation: 3, wpm: 250, description: '250 WPM' },
    intermediate: { fixationDuration: 300, wordsPerFixation: 4, wpm: 400, description: '400 WPM' },
    advanced: { fixationDuration: 200, wordsPerFixation: 5, wpm: 600, description: '600 WPM' },
    expert: { fixationDuration: 150, wordsPerFixation: 6, wpm: 800, description: '800 WPM' },
};

// LONGER paragraphs for sustained rhythm
const READING_PASSAGES = [
    {
        id: 1,
        text: `Speed reading is not about skimming or sacrificing comprehension. It's about training your brain to process visual information more efficiently. The average person reads at about 200 to 250 words per minute, but with systematic training, many people can double or triple their reading speed while maintaining or even improving their comprehension. The secret lies in reducing subvocalization, expanding your peripheral vision span, and minimizing regressions. Your eyes make rapid movements called saccades between fixation points. Skilled readers make fewer, more efficient saccades per line and reduce backward eye movements. This training helps you develop those efficient reading patterns through rhythmic practice and immediate feedback.`,
        questions: [
            {
                question: 'What is the average reading speed?',
                options: ['100-150 WPM', '200-250 WPM', '400-500 WPM', '600-700 WPM'],
                correct: 1,
            },
            {
                question: 'What are rapid eye movements called?',
                options: ['Fixations', 'Readings', 'Saccades', 'Glances'],
                correct: 2,
            },
        ],
    },
    {
        id: 2,
        text: `The human brain has remarkable capacity for visual processing that far exceeds our typical reading speeds. Research in cognitive psychology shows that the brain can recognize and process words in as little as 150 milliseconds when properly trained. However, most readers are held back by habitual subvocalization - the tendency to "speak" words internally while reading. This mental voice limits reading speed to speaking speed, typically around 250 words per minute. By training your eyes to move in efficient patterns and reducing reliance on subvocalization, you can unlock much faster reading speeds. The key is consistent practice with rhythmic fixation patterns that train your visual system to capture more information with each eye movement.`,
        questions: [
            {
                question: 'What limits most readers to 250 WPM?',
                options: ['Eye movement', 'Subvocalization', 'Comprehension', 'Vocabulary'],
                correct: 1,
            },
            {
                question: 'How fast can the brain process words when trained?',
                options: ['50ms', '100ms', '150ms', '300ms'],
                correct: 2,
            },
        ],
    },
    {
        id: 3,
        text: `Peripheral vision plays a crucial but often overlooked role in efficient reading. While your foveal vision focuses on a specific point, your parafoveal vision extends several character spaces to the right and left. Skilled speed readers leverage this peripheral awareness to pre-process upcoming words before their eyes arrive at them. This preview benefit allows the brain to anticipate and prepare for the next word, significantly reducing the fixation time needed. Training exercises that expand your functional field of view can dramatically improve reading efficiency. By practicing with guided fixation points, you develop the ability to capture more information per fixation, reducing the total number of eye movements needed to read a passage.`,
        questions: [
            {
                question: 'What do skilled readers use to pre-process words?',
                options: ['Peripheral vision', 'Memory', 'Guessing', 'Speed'],
                correct: 0,
            },
            {
                question: 'What benefit does parafoveal vision provide?',
                options: ['Color recognition', 'Preview benefit', 'Word definition', 'Line spacing'],
                correct: 1,
            },
        ],
    },
];

// Single fixed dot component
const FixationDot: React.FC<{
    x: number;
    y: number;
    isActive: boolean;
    colors: any;
}> = ({ x, y, isActive, colors }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        if (isActive) {
            scale.value = withSequence(
                withTiming(1.4, { duration: 100 }),
                withTiming(1.2, { duration: 100 })
            );
            opacity.value = withTiming(1, { duration: 100 });
        } else {
            scale.value = withTiming(1, { duration: 100 });
            opacity.value = withTiming(0.3, { duration: 100 });
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: x - 6,
                    top: y - 6,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: colors.error,
                    shadowColor: colors.error,
                    shadowOpacity: isActive ? 0.8 : 0.3,
                    shadowRadius: isActive ? 8 : 4,
                    elevation: isActive ? 8 : 2,
                },
                animatedStyle,
            ]}
        />
    );
};

export const SaccadicJumps: React.FC<SaccadicJumpsProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();

    // Game state
    const [gameState, setGameState] = useState<GameState>('idle');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
    const [showAcademicModal, setShowAcademicModal] = useState(false);

    // Reading state
    const [currentPassage, setCurrentPassage] = useState(READING_PASSAGES[0]);
    const [currentFixation, setCurrentFixation] = useState(0);
    const [fixationPositions, setFixationPositions] = useState<{ x: number; y: number }[]>([]);

    // Quiz state
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showQuizFeedback, setShowQuizFeedback] = useState<boolean | null>(null);

    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const config = DIFFICULTY_CONFIG[difficulty];
    const areaWidth = SCREEN_WIDTH - spacing.md * 2; // Wider viewport
    const areaHeight = 280; // Taller for more text

    // Calculate fixation positions with better alignment
    const calculateFixations = useCallback(() => {
        const words = currentPassage.text.split(/\s+/);
        const positions: { x: number; y: number }[] = [];

        const lineHeight = 26;
        const charWidth = 8;
        const maxCharsPerLine = Math.floor((areaWidth - spacing.md * 2) / charWidth);
        const wordsPerFix = config.wordsPerFixation;

        let currentX = spacing.md;
        let currentY = spacing.md + lineHeight / 2;
        let charsOnLine = 0;

        for (let i = 0; i < words.length; i += wordsPerFix) {
            const wordGroup = words.slice(i, i + wordsPerFix).join(' ');
            const groupLength = wordGroup.length;

            // Check if need to wrap
            if (charsOnLine + groupLength > maxCharsPerLine && charsOnLine > 0) {
                currentX = spacing.md;
                currentY += lineHeight;
                charsOnLine = 0;
            }

            // Position dot at center of word group
            const dotX = currentX + (groupLength * charWidth) / 2;
            positions.push({ x: dotX, y: currentY });

            currentX += (groupLength + 1) * charWidth;
            charsOnLine += groupLength + 1;
        }

        setFixationPositions(positions);
        return positions;
    }, [currentPassage, config.wordsPerFixation, areaWidth, spacing]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Start reading
    const startReading = useCallback(() => {
        const passage = READING_PASSAGES[Math.floor(Math.random() * READING_PASSAGES.length)];
        setCurrentPassage(passage);
        setCurrentFixation(0);
        setGameState('reading');

        setTimeout(() => {
            const positions = calculateFixations();
            advanceFixation(0, positions);
        }, 100);
    }, [calculateFixations]);

    // Advance fixation
    const advanceFixation = useCallback((index: number, positions: { x: number; y: number }[]) => {
        if (gameState === 'paused') return;

        if (index >= positions.length) {
            setGameState('quiz');
            setCurrentQuestion(0);
            setAnswers([]);
            return;
        }

        setCurrentFixation(index);

        timeoutRef.current = setTimeout(() => {
            advanceFixation(index + 1, positions);
        }, config.fixationDuration);
    }, [config.fixationDuration, gameState]);

    // Pause/Resume
    const handlePause = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameState('paused');
    }, []);

    const handleResume = useCallback(() => {
        setGameState('reading');
        advanceFixation(currentFixation + 1, fixationPositions);
    }, [currentFixation, fixationPositions, advanceFixation]);

    // Quiz handling
    const handleQuizAnswer = useCallback((answerIndex: number) => {
        const isCorrect = answerIndex === currentPassage.questions[currentQuestion].correct;
        setShowQuizFeedback(isCorrect);
        setAnswers(prev => [...prev, answerIndex]);

        setTimeout(() => {
            setShowQuizFeedback(null);

            if (currentQuestion + 1 >= currentPassage.questions.length) {
                const correctCount = [...answers, answerIndex].filter(
                    (a, i) => a === currentPassage.questions[i].correct
                ).length;
                const accuracy = (correctCount / currentPassage.questions.length) * 100;

                setGameState('completed');
                onComplete?.(fixationPositions.length, accuracy);
            } else {
                setCurrentQuestion(prev => prev + 1);
            }
        }, 1000);
    }, [currentQuestion, currentPassage, answers, fixationPositions.length, onComplete]);

    const handleStart = () => {
        resetGame();
        startReading();
    };

    const resetGame = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameState('idle');
        setCurrentFixation(0);
        setCurrentQuestion(0);
        setAnswers([]);
    };

    const getStarRating = () => {
        const correctCount = answers.filter(
            (a, i) => a === currentPassage.questions[i]?.correct
        ).length;
        const accuracy = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

        if (accuracy >= 100) return 3;
        if (accuracy >= 50) return 2;
        if (accuracy > 0) return 1;
        return 0;
    };

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Instructions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md }}>
                <BookOpen size={18} color={colors.secondary} strokeWidth={2} />
                <Text
                    style={{
                        fontFamily: fontFamily.uiRegular,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        marginLeft: spacing.sm,
                        flex: 1,
                    }}
                >
                    Follow the red dot - eyes move naturally at rhythm
                </Text>
                <InfoButton onPress={() => setShowAcademicModal(true)} size={24} />
            </View>

            {/* Reading Area */}
            <View
                style={{
                    width: areaWidth,
                    height: areaHeight,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.bento,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Idle State */}
                {gameState === 'idle' && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
                        <BookOpen size={48} color={colors.secondary} strokeWidth={1.5} />
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.text,
                                marginTop: spacing.md,
                                textAlign: 'center',
                            }}
                        >
                            Rhythm-Guided Reading
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
                            Follow the red dot naturally, then answer questions
                        </Text>
                    </View>
                )}

                {/* Reading/Paused Phase */}
                {(gameState === 'reading' || gameState === 'paused') && (
                    <View style={{ padding: spacing.md, position: 'relative' }}>
                        <Text
                            style={{
                                fontFamily: fontFamily.reading,
                                fontSize: 15,
                                lineHeight: 26,
                                color: colors.text,
                            }}
                        >
                            {currentPassage.text}
                        </Text>

                        {/* Fixation dots */}
                        {fixationPositions.map((pos, idx) => (
                            <FixationDot
                                key={idx}
                                x={pos.x}
                                y={pos.y}
                                isActive={idx === currentFixation}
                                colors={colors}
                            />
                        ))}

                        {/* Progress bar */}
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                backgroundColor: colors.surface,
                            }}
                        >
                            <View
                                style={{
                                    width: `${(currentFixation / Math.max(fixationPositions.length, 1)) * 100}%`,
                                    height: '100%',
                                    backgroundColor: colors.secondary,
                                }}
                            />
                        </View>

                        {/* Paused overlay */}
                        {gameState === 'paused' && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: spacing.sm,
                                    right: spacing.sm,
                                    backgroundColor: colors.warning + '30',
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.sm,
                                    borderRadius: borderRadius.full,
                                }}
                            >
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.sm, color: colors.warning }}>
                                    PAUSED
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Quiz Phase */}
                {gameState === 'quiz' && (
                    <View style={{ padding: spacing.md, flex: 1 }}>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.md,
                                color: colors.secondary,
                                marginBottom: spacing.sm,
                            }}
                        >
                            Question {currentQuestion + 1}/{currentPassage.questions.length}
                        </Text>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.text,
                                marginBottom: spacing.md,
                            }}
                        >
                            {currentPassage.questions[currentQuestion].question}
                        </Text>

                        <View style={{ gap: spacing.sm }}>
                            {currentPassage.questions[currentQuestion].options.map((option, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => handleQuizAnswer(idx)}
                                    disabled={showQuizFeedback !== null}
                                >
                                    {({ pressed }) => (
                                        <View
                                            style={{
                                                paddingHorizontal: spacing.md,
                                                paddingVertical: spacing.sm,
                                                backgroundColor:
                                                    showQuizFeedback !== null && idx === currentPassage.questions[currentQuestion].correct
                                                        ? colors.success + '30'
                                                        : showQuizFeedback === false && answers[currentQuestion] === idx
                                                            ? colors.error + '30'
                                                            : pressed ? colors.secondaryDim : colors.surface,
                                                borderRadius: borderRadius.md,
                                                borderWidth: 1,
                                                borderColor:
                                                    showQuizFeedback !== null && idx === currentPassage.questions[currentQuestion].correct
                                                        ? colors.success
                                                        : pressed ? colors.secondary : colors.glassBorder,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: fontFamily.uiRegular,
                                                    fontSize: fontSize.sm,
                                                    color: colors.text,
                                                }}
                                            >
                                                {option}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            ))}
                        </View>

                        {showQuizFeedback !== null && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: spacing.sm,
                                    right: spacing.sm,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: showQuizFeedback ? colors.success + '30' : colors.error + '30',
                                    paddingHorizontal: spacing.sm,
                                    paddingVertical: spacing.xs,
                                    borderRadius: borderRadius.full,
                                }}
                            >
                                {showQuizFeedback ? (
                                    <CheckCircle size={18} color={colors.success} />
                                ) : (
                                    <XCircle size={18} color={colors.error} />
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Completed State */}
                {gameState === 'completed' && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
                        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                            {[1, 2, 3].map((star) => (
                                <Text key={star} style={{ fontSize: 28, marginHorizontal: 4 }}>
                                    {star <= getStarRating() ? '⭐' : '☆'}
                                </Text>
                            ))}
                        </View>

                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.xl, color: colors.secondary }}>
                            Great Job!
                        </Text>

                        <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.lg }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text }}>
                                    {fixationPositions.length}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                                    Fixations
                                </Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.success }}>
                                    {answers.filter((a, i) => a === currentPassage.questions[i]?.correct).length}/{answers.length}
                                </Text>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted }}>
                                    Correct
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Playback Controls - Always visible when reading/paused */}
            {(gameState === 'reading' || gameState === 'paused') && (
                <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.md }}>
                    {gameState === 'reading' ? (
                        <Pressable
                            onPress={handlePause}
                            style={({ pressed }) => ({
                                paddingHorizontal: spacing.xl,
                                paddingVertical: spacing.md,
                                backgroundColor: colors.warning,
                                borderRadius: borderRadius.lg,
                                opacity: pressed ? 0.85 : 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.sm,
                            })}
                        >
                            <Pause size={20} color={colors.white} />
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.white }}>
                                Pause
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={handleResume}
                            style={({ pressed }) => ({
                                paddingHorizontal: spacing.xl,
                                paddingVertical: spacing.md,
                                backgroundColor: colors.success,
                                borderRadius: borderRadius.lg,
                                opacity: pressed ? 0.85 : 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.sm,
                            })}
                        >
                            <Play size={20} color={colors.white} />
                            <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.white }}>
                                Resume
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={resetGame}
                        style={({ pressed }) => ({
                            paddingHorizontal: spacing.lg,
                            paddingVertical: spacing.md,
                            backgroundColor: colors.surface,
                            borderRadius: borderRadius.lg,
                            borderWidth: 1,
                            borderColor: colors.glassBorder,
                            opacity: pressed ? 0.85 : 1,
                        })}
                    >
                        <RotateCcw size={20} color={colors.text} />
                    </Pressable>
                </View>
            )}

            {/* Speed indicator during reading */}
            {(gameState === 'reading' || gameState === 'paused') && (
                <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
                    <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.secondary }}>
                        {config.wpm} WPM
                    </Text>
                </View>
            )}

            {/* Difficulty Selector - COMPACT with STICKY Start */}
            {gameState === 'idle' && (
                <View style={{ marginTop: spacing.lg, width: areaWidth }}>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginBottom: spacing.sm,
                        }}
                    >
                        Select Speed
                    </Text>

                    {/* Compact 2x2 grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
                        {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => (
                            <Pressable
                                key={level}
                                onPress={() => setDifficulty(level)}
                                style={{
                                    flex: 1,
                                    minWidth: '47%',
                                    paddingVertical: spacing.md,
                                    borderRadius: borderRadius.md,
                                    backgroundColor: difficulty === level ? colors.secondary : colors.surface,
                                    borderWidth: 1,
                                    borderColor: difficulty === level ? colors.secondary : colors.glassBorder,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: fontFamily.uiBold,
                                        fontSize: fontSize.md,
                                        color: difficulty === level ? colors.white : colors.text,
                                    }}
                                >
                                    {DIFFICULTY_CONFIG[level].description}
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: fontFamily.uiRegular,
                                        fontSize: fontSize.xs,
                                        color: difficulty === level ? colors.white : colors.textMuted,
                                        marginTop: 2,
                                    }}
                                >
                                    {t(`games.saccadic.difficulty.${level}`)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Premium Start Button */}
                    <View style={{ marginTop: spacing.xl }}>
                        <PremiumButton
                            title="Start Training"
                            onPress={handleStart}
                            icon={Play}
                            variant="primary"
                            size="xl"
                            fullWidth
                            animatePulse
                        />
                    </View>
                </View>
            )}

            {/* Completed - Play Again */}
            {gameState === 'completed' && (
                <View style={{ marginTop: spacing.lg }}>
                    <PremiumButton
                        title={t('games.common.playAgain')}
                        onPress={handleStart}
                        icon={RotateCcw}
                        variant="secondary"
                        size="md"
                        animatePulse
                    />
                </View>
            )}

            {/* Academic Modal */}
            <AcademicModal
                visible={showAcademicModal}
                onClose={() => setShowAcademicModal(false)}
                title={t('games.academic.saccadic.title')}
                description={t('games.academic.saccadic.description')}
            />
        </View>
    );
};
