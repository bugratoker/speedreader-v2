/**
 * Read Screen
 * Main reading experience with mode switching
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { useReadingEngine, ReadingMode } from '../../engine';
import {
    RSVPWordDisplay,
    RSVPControls,
    BionicTextDisplay,
    ChunkDisplay,
    ReadingModeSelector,
    GuidedScrollingDisplay,
} from '../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample reading text for demo
const SAMPLE_TEXT = `The art of speed reading is not about rushing through words, but about training your brain to process information more efficiently. Speed reading techniques have been studied for decades, and researchers have found that the average person reads at about 200 to 250 words per minute. However, with proper training and practice, many people can double or even triple their reading speed while maintaining good comprehension.

One of the most effective techniques is called RSVP, or Rapid Serial Visual Presentation. This method displays words one at a time in a fixed position, eliminating the need for eye movements across the page. By reducing the physical effort of reading, your brain can focus entirely on processing the meaning of each word.

Another powerful approach is Bionic Reading, which highlights the beginning of each word to guide your eyes more efficiently. This technique works because your brain can recognize words from just the first few letters, filling in the rest automatically.`;

export const ReadScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, fontFamily, fontSize, spacing, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Reading engine with sample text
    const engine = useReadingEngine({
        text: SAMPLE_TEXT,
        mode: 'rsvp',
        initialWpm: 300,
        onComplete: () => {
            console.log('Reading complete!');
        },
    });

    // Animate word changes for RSVP and Chunking modes
    React.useEffect(() => {
        if (engine.mode !== 'bionic' && engine.isPlaying && !engine.isPaused) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 30, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 30, useNativeDriver: true }),
            ]).start();
        }
    }, [engine.currentIndex, engine.mode, engine.isPlaying, engine.isPaused, fadeAnim]);

    // Render the appropriate display based on mode
    const renderModeDisplay = () => {
        switch (engine.mode) {
            case 'rsvp':
                return (
                    <View style={[styles.displayContainer, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <RSVPWordDisplay
                            word={engine.currentWord || ''}
                            fadeAnim={fadeAnim}
                            fontSize={40}
                        />
                    </View>
                );

            case 'bionic':
                return (
                    <View style={styles.bionicContainer}>
                        <BionicTextDisplay
                            bionicWords={engine.bionicText || []}
                            textSize={18}
                            wpm={engine.wpm}
                            highlightIndex={engine.currentIndex}
                        />
                    </View>
                );

            case 'chunking':
                return (
                    <View style={[styles.displayContainer, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <ChunkDisplay
                            words={engine.currentChunk || []}
                            fadeAnim={fadeAnim}
                            fontSize={32}
                        />
                    </View>
                );

            case 'guided':
                return (
                    <View style={styles.bionicContainer}>
                        <GuidedScrollingDisplay
                            words={engine.words}
                            currentWordIndex={engine.currentIndex}
                            isPlaying={engine.isPlaying && !engine.isPaused}
                            onUserScroll={engine.pause}
                        />
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient glows */}
            <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
            <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

            <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                        {t('read.title')}
                    </Text>
                    <Text style={[styles.subtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                        {engine.currentIndex + 1} / {engine.totalItems} • {engine.wpm} WPM
                    </Text>
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
                <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                    <View style={[styles.progressFill, { width: `${engine.progress}%`, backgroundColor: colors.primary }]} />
                </View>

                {/* Mode Display */}
                <View style={styles.displayWrapper}>
                    {renderModeDisplay()}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <RSVPControls
                        wpm={engine.wpm}
                        isPaused={engine.isPaused || !engine.isPlaying}
                        onSpeedUp={engine.speedUp}
                        onSlowDown={engine.slowDown}
                        onTogglePause={engine.isPlaying ? engine.togglePause : engine.start}
                    />
                </View>

                {/* Mode hint */}
                <Text style={[styles.hint, { fontFamily: fontFamily.uiRegular, color: colors.textDim }]}>
                    {engine.mode === 'bionic'
                        ? 'Scroll to read with bolded fixations'
                        : 'Tap play and adjust speed as needed'}
                </Text>
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
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for tab bar
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    modeSelector: {
        marginBottom: 16,
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
    },
    displayContainer: {
        width: SCREEN_WIDTH - 32,
        minHeight: 180,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    bionicContainer: {
        flex: 1,
        maxHeight: 400,
    },
    controls: {
        marginVertical: 24,
        alignItems: 'center',
    },
    hint: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 16,
    },
});
