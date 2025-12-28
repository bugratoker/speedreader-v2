/**
 * Assessment Screen (1.2) - RSVP Style
 * Uses reusable RSVP components for word-by-word speed test
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, ChevronRight, Zap, TrendingUp, TrendingDown, Minus as MinusIcon, Plus, Minus, X } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { getCurrentLanguage } from '../../i18n';
import { useRSVP } from '../../hooks';
import { RSVPWordDisplay, RSVPControls } from '../../components';
import { ASSESSMENT_PASSAGES, getComparison } from '../../utils/assessment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AssessmentState = 'intro' | 'reading' | 'results';

const INITIAL_WPM = 200;

export const AssessmentScreen: React.FC<{ onComplete?: (wpm: number) => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, fontFamily, fontSize, spacing, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();

    const [state, setState] = useState<AssessmentState>('intro');
    const [finalWpm, setFinalWpm] = useState(INITIAL_WPM);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const resultsFadeAnim = useRef(new Animated.Value(0)).current;

    const currentLang = getCurrentLanguage();
    const passage = ASSESSMENT_PASSAGES[currentLang] || ASSESSMENT_PASSAGES.en;
    const words = passage.text.split(/\s+/);

    // Use the reusable RSVP hook
    const rsvp = useRSVP({
        words,
        initialWpm: INITIAL_WPM,
        onWordChange: () => {
            // Animate word change
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 30, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 30, useNativeDriver: true }),
            ]).start();
        },
        onComplete: (wpm) => {
            setFinalWpm(wpm);
            setState('results');
            Animated.timing(resultsFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        },
    });

    const handleStart = () => {
        setState('reading');
        rsvp.start();
    };

    const handleRetake = () => {
        setState('intro');
        rsvp.reset();
        rsvp.setWpm(INITIAL_WPM);
        resultsFadeAnim.setValue(0);
    };

    const handleContinue = () => {
        onComplete?.(finalWpm);
    };

    // Skip assessment with default WPM
    const handleSkip = () => {
        onComplete?.(INITIAL_WPM);
    };

    const comparison = getComparison(finalWpm);
    const ComparisonIcon = comparison.type === 'faster' ? TrendingUp : comparison.type === 'slower' ? TrendingDown : MinusIcon;
    const comparisonColor = comparison.type === 'faster' ? colors.success : comparison.type === 'slower' ? colors.warning : colors.textMuted;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient glows */}
            <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
            <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

            <View style={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}>
                {/* Skip Button */}
                <TouchableOpacity
                    onPress={handleSkip}
                    style={styles.skipButton}
                    activeOpacity={0.7}
                >
                    <X size={24} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { fontFamily: fontFamily.reading, color: colors.text }]}>
                        {t('assessment.title')}
                    </Text>
                    <Text style={[styles.subtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                        {state === 'intro'
                            ? t('assessment.subtitle')
                            : `${rsvp.currentWordIndex + 1} / ${rsvp.totalWords} ${t('common.words')}`}
                    </Text>
                </View>

                {/* Intro State */}
                {state === 'intro' && (
                    <View style={styles.introContainer}>
                        <Text style={[styles.instructions, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                            Words will appear one at a time. Adjust the speed until it feels comfortable. This will be your baseline reading speed.
                        </Text>

                        {/* WPM Selector */}
                        <View style={[styles.wpmSelector, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                            <TouchableOpacity onPress={rsvp.slowDown} style={styles.wpmButton} activeOpacity={0.7}>
                                <Minus size={24} color={colors.textMuted} strokeWidth={2} />
                            </TouchableOpacity>
                            <View style={styles.wpmDisplay}>
                                <Text style={[styles.wpmNumber, { fontFamily: fontFamily.uiBold, color: colors.primary }]}>
                                    {rsvp.wpm}
                                </Text>
                                <Text style={[styles.wpmLabel, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                                    {t('common.wpm')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={rsvp.speedUp} style={styles.wpmButton} activeOpacity={0.7}>
                                <Plus size={24} color={colors.textMuted} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleStart} activeOpacity={0.9}>
                            <View style={[styles.startButton, { backgroundColor: colors.primary, ...glows.primary }]}>
                                <Play size={24} color={colors.background} strokeWidth={2.5} fill={colors.background} />
                                <Text style={[styles.startButtonText, { fontFamily: fontFamily.uiBold, color: colors.background }]}>
                                    {t('assessment.tapToStart')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Skip Button */}
                        <TouchableOpacity onPress={handleSkip} style={styles.skipTextButton} activeOpacity={0.7}>
                            <Text style={[styles.skipText, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                                {t('common.skip')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reading State */}
                {state === 'reading' && (
                    <View style={styles.readingContainer}>
                        {/* Progress bar */}
                        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                            <View style={[styles.progressFill, { width: `${rsvp.progress}%`, backgroundColor: colors.primary }]} />
                        </View>

                        {/* Word Display - Using reusable component */}
                        <View style={[styles.wordDisplayContainer, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                            <RSVPWordDisplay
                                word={rsvp.currentWord}
                                fadeAnim={fadeAnim}
                                fontSize={40}
                            />
                        </View>

                        {/* Controls - Using reusable component */}
                        <View style={styles.controlsWrapper}>
                            <RSVPControls
                                wpm={rsvp.wpm}
                                isPaused={rsvp.isPaused}
                                onSpeedUp={rsvp.speedUp}
                                onSlowDown={rsvp.slowDown}
                                onTogglePause={rsvp.togglePause}
                            />
                        </View>

                        <Text style={[styles.controlHint, { fontFamily: fontFamily.uiRegular, color: colors.textDim }]}>
                            Adjust speed while reading until comfortable
                        </Text>
                    </View>
                )}

                {/* Results State */}
                {state === 'results' && (
                    <Animated.View style={[styles.resultsContainer, { opacity: resultsFadeAnim }]}>
                        {/* WPM Display */}
                        <View style={[styles.wpmCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder, ...glows.primarySubtle }]}>
                            <Zap size={32} color={colors.primary} strokeWidth={2} />
                            <Text style={[styles.resultWpmNumber, { fontFamily: fontFamily.uiBold, color: colors.primary }]}>
                                {finalWpm}
                            </Text>
                            <Text style={[styles.resultWpmLabel, { fontFamily: fontFamily.uiMedium, color: colors.text }]}>
                                {t('assessment.wordsPerMinute')}
                            </Text>
                        </View>

                        {/* Comparison */}
                        <View style={[styles.comparisonCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                            <ComparisonIcon size={24} color={comparisonColor} strokeWidth={2} />
                            <Text style={[styles.comparisonText, { fontFamily: fontFamily.uiMedium, color: comparisonColor }]}>
                                {comparison.type === 'average'
                                    ? t('assessment.comparison.average')
                                    : t(`assessment.comparison.${comparison.type}`, { percent: comparison.percent })}
                            </Text>
                            <Text style={[styles.averageNote, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {t('assessment.averageWpm')}
                            </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={handleRetake} style={styles.retakeButton} activeOpacity={0.7}>
                                <RotateCcw size={20} color={colors.textMuted} strokeWidth={2} />
                                <Text style={[styles.retakeText, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                                    {t('assessment.retakeButton')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleContinue} activeOpacity={0.9}>
                                <View style={[styles.continueButton, { backgroundColor: colors.primary, ...glows.primary }]}>
                                    <Text style={[styles.continueText, { fontFamily: fontFamily.uiBold, color: colors.background }]}>
                                        {t('assessment.continueButton')}
                                    </Text>
                                    <ChevronRight size={20} color={colors.background} strokeWidth={2.5} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
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
        paddingHorizontal: 24,
    },
    skipButton: {
        position: 'absolute',
        top: 24,
        right: 16,
        padding: 12,
        zIndex: 10,
    },
    skipTextButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    skipText: {
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    introContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructions: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    wpmSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        marginBottom: 40,
    },
    wpmButton: {
        padding: 12,
    },
    wpmDisplay: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    wpmNumber: {
        fontSize: 48,
    },
    wpmLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 16,
        gap: 12,
    },
    startButtonText: {
        fontSize: 18,
    },
    readingContainer: {
        flex: 1,
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        marginBottom: 40,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    wordDisplayContainer: {
        width: SCREEN_WIDTH - 48,
        height: 160,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    controlsWrapper: {
        marginBottom: 16,
    },
    controlHint: {
        fontSize: 13,
        textAlign: 'center',
    },
    resultsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wpmCard: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 48,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 16,
    },
    resultWpmNumber: {
        fontSize: 72,
        marginTop: 8,
    },
    resultWpmLabel: {
        fontSize: 16,
        marginTop: 4,
    },
    comparisonCard: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 32,
        gap: 8,
    },
    comparisonText: {
        fontSize: 16,
        textAlign: 'center',
    },
    averageNote: {
        fontSize: 13,
        marginTop: 4,
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    retakeText: {
        fontSize: 16,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 8,
    },
    continueText: {
        fontSize: 18,
    },
});
