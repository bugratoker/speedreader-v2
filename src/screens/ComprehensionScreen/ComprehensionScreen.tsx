/**
 * Comprehension Training Screen
 * Dedicated screen for reading comprehension training
 * Shows passages with periodic comprehension questions
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, BookOpen, Trophy, RotateCcw } from 'lucide-react-native';
import { useTheme, readingFontFamilies } from '../../theme';
import { useReadingEngine } from '../../engine';
import {
    RSVPWordDisplay,
    RSVPControls,
    BionicTextDisplay,
    ChunkDisplay,
    ReadingModeSelector,
} from '../../components';
import { ComprehensionModal } from '../../components/training/Comprehension/ComprehensionModal';
import { PassageSelectionView } from './PassageSelectionView';
import { ReadingSettings, DEFAULT_READING_SETTINGS, BIONIC_COLORS } from '../../engine/settings';
import type { ComprehensionQuestion } from '../../data/comprehensionContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types for passages from i18n
interface ComprehensionPassage {
    id: string;
    title: string;
    content: string;
    questions: ComprehensionQuestion[];
    wordCount: number;
}

export const ComprehensionScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { colors, fontFamily, fontSize, spacing, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const wpmScaleAnim = useRef(new Animated.Value(1)).current;
    const [readingSettings] = useState<ReadingSettings>(DEFAULT_READING_SETTINGS);

    // Comprehension state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [comprehensionScore, setComprehensionScore] = useState({ correct: 0, total: 0 });
    const [trainingComplete, setTrainingComplete] = useState(false);
    const questionPointsRef = useRef<number[]>([]);

    // Passage selection state
    const [selectedPassageIndex, setSelectedPassageIndex] = useState<number | null>(null);

    // i18n question format (option1, option2, etc.)
    interface I18nQuestion {
        question: string;
        option1: string;
        option2: string;
        option3: string;
        option4: string;
        correctIndex: number;
        explanation: string;
    }

    interface I18nPassage {
        title: string;
        content: string;
        questions: I18nQuestion[];
    }

    // Convert i18n format to internal format
    const convertQuestion = (q: I18nQuestion): ComprehensionQuestion => ({
        question: q.question,
        options: [q.option1, q.option2, q.option3, q.option4],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
    });

    // Get all passages from i18n
    const allPassages = useMemo(() => {
        const passages = t('comprehension.passages', { returnObjects: true }) as I18nPassage[];
        if (Array.isArray(passages) && passages.length > 0) {
            return passages;
        }
        return [];
    }, [t, i18n.language]);

    // Get passage info for selection view
    const passageInfoList = useMemo(() => {
        return allPassages.map(p => ({
            title: p.title,
            wordCount: p.content.split(/\s+/).length,
            questionCount: p.questions.length,
        }));
    }, [allPassages]);

    // Get selected passage
    const passage = useMemo<ComprehensionPassage | null>(() => {
        if (selectedPassageIndex === null || !allPassages[selectedPassageIndex]) {
            return null;
        }

        const selectedPassage = allPassages[selectedPassageIndex];
        return {
            id: `passage-${selectedPassageIndex}`,
            title: selectedPassage.title,
            content: selectedPassage.content,
            questions: selectedPassage.questions.map(convertQuestion),
            wordCount: selectedPassage.content.split(/\s+/).length,
        };
    }, [selectedPassageIndex, allPassages]);

    // Handle passage selection
    const handleSelectPassage = (index: number) => {
        setSelectedPassageIndex(index);
        setCurrentQuestionIndex(0);
        setComprehensionScore({ correct: 0, total: 0 });
        setTrainingComplete(false);
    };

    // Handle random selection
    const handleRandomPassage = () => {
        if (allPassages.length > 0) {
            const randomIndex = Math.floor(Math.random() * allPassages.length);
            handleSelectPassage(randomIndex);
        }
    };

    // Calculate question points on passage load
    useEffect(() => {
        if (passage && passage.questions) {
            const wordCount = passage.content.split(/\s+/).length;
            const interval = Math.floor(wordCount / passage.questions.length);
            questionPointsRef.current = Array.from(
                { length: passage.questions.length },
                (_, i) => (i + 1) * interval
            );
        }
    }, [passage]);

    // Reading engine - must be called before any conditional returns
    const engine = useReadingEngine({
        text: passage?.content || '',
        mode: 'rsvp',
        initialWpm: 250,
        chunkSize: readingSettings.chunkSize,
        useSmartChunking: readingSettings.smartChunking,
        onComplete: () => {
            if (passage && currentQuestionIndex >= passage.questions.length) {
                setTrainingComplete(true);
            }
        },
    });

    // Check if we should show a comprehension question
    useEffect(() => {
        if (!passage || !engine.isPlaying || trainingComplete) return;

        const currentWordIndex = engine.currentIndex;
        const nextQuestionPoint = questionPointsRef.current[currentQuestionIndex];

        if (
            nextQuestionPoint &&
            currentWordIndex >= nextQuestionPoint &&
            currentQuestionIndex < passage.questions.length
        ) {
            engine.pause();
            setQuestionModalVisible(true);
        }
    }, [engine.currentIndex, engine.isPlaying, currentQuestionIndex, passage, trainingComplete]);

    // Animate WPM changes
    useEffect(() => {
        Animated.sequence([
            Animated.timing(wpmScaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(wpmScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [engine.wpm, wpmScaleAnim]);

    // Animate word changes
    useEffect(() => {
        if (passage && engine.mode !== 'bionic' && engine.isPlaying && !engine.isPaused) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 30, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 30, useNativeDriver: true }),
            ]).start();
        }
    }, [passage, engine.currentIndex, engine.mode, engine.isPlaying, engine.isPaused, fadeAnim]);

    // Save reading as completed when training is finished
    useEffect(() => {
        if (trainingComplete && selectedPassageIndex !== null) {
            const saveCompletion = async () => {
                try {
                    const stored = await AsyncStorage.getItem('@completed_readings');
                    const completed = stored ? JSON.parse(stored) : [];
                    const readingId = `reading-${selectedPassageIndex}`;
                    if (!completed.includes(readingId)) {
                        completed.push(readingId);
                        await AsyncStorage.setItem('@completed_readings', JSON.stringify(completed));
                    }
                } catch (e) {
                    console.log('Error saving completion');
                }
            };
            saveCompletion();
        }
    }, [trainingComplete, selectedPassageIndex]);

    // Show Passage Selection View when no passage is selected
    if (!passage) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
                <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

                <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => {
                                if (selectedPassageIndex !== null) {
                                    setSelectedPassageIndex(null);
                                    engine.reset();
                                } else {
                                    navigation.goBack();
                                }
                            }}
                            style={({ pressed }) => ({
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 22,
                                backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
                                position: 'absolute',
                                left: 0,
                                zIndex: 10,
                            })}
                        >
                            <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
                        </Pressable>
                        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 44 }}>
                            <Text style={[styles.title, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                                {t('training.exercises.comprehension.title', { defaultValue: 'Comprehension Training' })}
                            </Text>
                        </View>
                    </View>

                    {/* Reading Selection */}
                    <PassageSelectionView
                        readings={passageInfoList}
                        userWpm={250}
                        onSelectReading={handleSelectPassage}
                        onRandomReading={handleRandomPassage}
                    />
                </View>
            </View>
        );
    }

    // Handlers
    const handleAnswerQuestion = (correct: boolean) => {
        setComprehensionScore(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const handleCloseQuestion = () => {
        setQuestionModalVisible(false);
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        setTimeout(() => {
            if (nextIndex < passage.questions.length) {
                engine.resume();
            } else {
                setTrainingComplete(true);
            }
        }, 300);
    };

    const handleRestart = () => {
        engine.reset();
        setCurrentQuestionIndex(0);
        setComprehensionScore({ correct: 0, total: 0 });
        setTrainingComplete(false);
    };

    // Font settings
    const fontConfig = readingFontFamilies[readingSettings.textFont];
    const activeFontFamily = fontConfig?.regular || fontFamily.reading;
    const activeFontFamilyBold = fontConfig?.bold || fontFamily.readingBold;
    const currentTextSize = readingSettings.textSize || 32;

    // Render mode display
    const renderModeDisplay = () => {
        switch (engine.mode) {
            case 'rsvp':
                return (
                    <View style={[
                        styles.displayContainer,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                            shadowColor: colors.primary,
                        }
                    ]}>
                        <RSVPWordDisplay
                            word={engine.currentWord || ''}
                            fadeAnim={fadeAnim}
                            fontSize={currentTextSize + 8}
                            fontFamily={activeFontFamily}
                            fontFamilyBold={activeFontFamilyBold}
                        />
                    </View>
                );

            case 'bionic':
                return (
                    <View style={styles.bionicContainer}>
                        <BionicTextDisplay
                            bionicWords={engine.bionicText || []}
                            currentWordIndex={engine.currentIndex}
                            isPlaying={engine.isPlaying && !engine.isPaused}
                            highlightColor={BIONIC_COLORS[readingSettings.bionicHighlightColor]}
                            textSize={currentTextSize - 8}
                            wpm={engine.wpm}
                            fontFamily={activeFontFamily}
                            fontFamilyBold={activeFontFamilyBold}
                        />
                    </View>
                );

            case 'chunk':
                return (
                    <View style={[
                        styles.displayContainer,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder
                        }
                    ]}>
                        <ChunkDisplay
                            words={engine.currentChunk || []}
                            previousChunk={engine.previousChunk}
                            nextChunk={engine.nextChunk}
                            fontSize={currentTextSize}
                            fontFamily={activeFontFamily}
                            onTapLeft={engine.undo}
                            onTapRight={() => {
                                if (engine.currentIndex < engine.totalItems - 1) {
                                    engine.setCurrentIndex(engine.currentIndex + 1);
                                }
                            }}
                        />
                    </View>
                );

            default:
                return null;
        }
    };

    // Training Complete View
    if (trainingComplete) {
        const percentage = Math.round((comprehensionScore.correct / comprehensionScore.total) * 100);
        const isGoodScore = percentage >= 70;

        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
                <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

                <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({ pressed }) => ({
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 22,
                                backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
                                position: 'absolute',
                                left: 0,
                            })}
                        >
                            <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
                        </Pressable>
                        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 44 }}>
                            <Text style={[styles.title, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                                {t('comprehension.complete', { defaultValue: 'Training Complete!' })}
                            </Text>
                        </View>
                    </View>

                    {/* Results Card */}
                    <View style={[
                        styles.resultsCard,
                        {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.glassBorder,
                        }
                    ]}>
                        <View style={[
                            styles.trophyContainer,
                            { backgroundColor: isGoodScore ? colors.primaryGlow : colors.secondaryGlow }
                        ]}>
                            <Trophy
                                size={48}
                                color={isGoodScore ? colors.primary : colors.secondary}
                                strokeWidth={1.5}
                            />
                        </View>

                        <Text style={[
                            styles.scorePercentage,
                            {
                                fontFamily: fontFamily.uiBold,
                                color: isGoodScore ? colors.primary : colors.secondary,
                            }
                        ]}>
                            {percentage}%
                        </Text>

                        <Text style={[
                            styles.scoreText,
                            { fontFamily: fontFamily.uiRegular, color: colors.text }
                        ]}>
                            {t('comprehension.score', {
                                defaultValue: `You scored ${comprehensionScore.correct} out of ${comprehensionScore.total}`,
                                correct: comprehensionScore.correct,
                                total: comprehensionScore.total
                            })}
                        </Text>

                        <Text style={[
                            styles.encouragement,
                            { fontFamily: fontFamily.uiRegular, color: colors.textMuted }
                        ]}>
                            {isGoodScore
                                ? t('comprehension.goodJob', { defaultValue: 'Great job! Your comprehension is excellent.' })
                                : t('comprehension.keepPracticing', { defaultValue: 'Keep practicing to improve your comprehension.' })
                            }
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <Pressable
                            onPress={handleRestart}
                            style={({ pressed }) => [
                                styles.actionButton,
                                {
                                    backgroundColor: colors.primary,
                                    opacity: pressed ? 0.8 : 1,
                                }
                            ]}
                        >
                            <RotateCcw size={20} color="#ffffff" strokeWidth={2} />
                            <Text style={[
                                styles.actionButtonText,
                                { fontFamily: fontFamily.uiBold }
                            ]}>
                                {t('comprehension.tryAgain', { defaultValue: 'Try Again' })}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({ pressed }) => [
                                styles.actionButton,
                                {
                                    backgroundColor: 'transparent',
                                    borderWidth: 1,
                                    borderColor: colors.glassBorder,
                                    opacity: pressed ? 0.8 : 1,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                { fontFamily: fontFamily.uiBold, color: colors.text }
                            ]}>
                                {t('comprehension.backToTraining', { defaultValue: 'Back to Training' })}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // Training View
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
            <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

            <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() => {
                            setSelectedPassageIndex(null);
                            engine.reset();
                        }}
                        style={({ pressed }) => ({
                            width: 44,
                            height: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 22,
                            backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
                            position: 'absolute',
                            left: 0,
                            zIndex: 10,
                        })}
                    >
                        <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
                    </Pressable>

                    <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 44 }}>
                        <Text
                            style={[styles.title, { fontFamily: fontFamily.uiBold, color: colors.text }]}
                            numberOfLines={1}
                        >
                            {passage.title || t('training.exercises.comprehension.title')}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Text style={[styles.subtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {engine.currentIndex + 1} / {engine.totalItems} •
                            </Text>
                            <Animated.Text
                                style={[
                                    styles.wpmHighlight,
                                    {
                                        fontFamily: fontFamily.uiBold,
                                        color: colors.primary,
                                        transform: [{ scale: wpmScaleAnim }],
                                    }
                                ]}
                            >
                                {engine.wpm} WPM
                            </Animated.Text>
                        </View>
                    </View>

                </View>

                {/* Mode Selector */}
                <View style={styles.modeSelector}>
                    <ReadingModeSelector
                        currentMode={engine.mode}
                        onModeChange={engine.setMode}
                        disabled={engine.isPlaying && !engine.isPaused}
                    />
                </View>

                {/* Progress Bar */}
                <View style={[
                    styles.progressBar,
                    { backgroundColor: colors.surface },
                    glows.primarySubtle
                ]}>
                    <View style={[
                        styles.progressFill,
                        { width: `${engine.progress}%`, backgroundColor: colors.primary },
                        glows.primary
                    ]} />
                </View>

                {/* Mode Display */}
                <View style={styles.displayWrapper}>
                    {renderModeDisplay()}

                    {/* Score Badge */}
                    <View style={{
                        position: 'absolute',
                        bottom: -40,
                        right: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                    }}>
                        <BookOpen size={16} color={colors.textMuted} strokeWidth={2} />
                        <Text style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginLeft: spacing.xs,
                        }}>
                            {comprehensionScore.correct}/{passage.questions.length}
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <RSVPControls
                        wpm={engine.wpm}
                        isPaused={engine.isPaused || !engine.isPlaying}
                        onSpeedUp={engine.speedUp}
                        onSlowDown={engine.slowDown}
                        onTogglePause={engine.isPlaying ? engine.togglePause : engine.start}
                        onUndo={engine.undo}
                        onReload={handleRestart}
                        canUndo={engine.currentIndex > 0 && engine.isPlaying}
                        showWpmLabel={false}
                    />
                </View>
            </View>

            {/* Comprehension Modal */}
            {passage.questions[currentQuestionIndex] && (
                <ComprehensionModal
                    visible={questionModalVisible}
                    question={passage.questions[currentQuestionIndex]}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={passage.questions.length}
                    onAnswer={handleAnswerQuestion}
                    onClose={handleCloseQuestion}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTopRight: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    glowBottomLeft: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        minHeight: 44,
        position: 'relative',
    },
    title: {
        fontSize: 20,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    wpmHighlight: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modeSelector: {
        marginBottom: 16,
        alignItems: 'center',
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    displayWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    displayContainer: {
        width: '100%',
        maxWidth: SCREEN_WIDTH - 32,
        minHeight: 180,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        padding: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    bionicContainer: {
        flex: 1,
        maxHeight: 400,
    },
    controls: {
        marginVertical: 24,
        alignItems: 'center',
    },
    resultsCard: {
        marginTop: 40,
        padding: 32,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    trophyContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    scorePercentage: {
        fontSize: 56,
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 18,
        marginBottom: 8,
    },
    encouragement: {
        fontSize: 14,
        textAlign: 'center',
    },
    actionButtons: {
        marginTop: 32,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#ffffff',
    },
});
