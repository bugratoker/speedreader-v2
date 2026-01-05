/**
 * BionicTextDisplay - Active Bionic Reading with Color Highlighting
 * 
 * Features:
 * - Only current word: custom colored bold letters
 * - All other words: grey bold letters
 * - WPM-based word progression
 * - Accurate auto-scroll tracking
 */

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BionicWord } from '@/engine/types';
import { fontFamily, spacing, borderRadius } from '@theme';
import { useTheme } from '@theme';
import { useTranslation } from 'react-i18next';

export interface BionicTextDisplayProps {
    bionicWords: BionicWord[];
    currentWordIndex?: number;
    isPlaying?: boolean;
    highlightColor?: string;  // Custom highlight color for current word
    containerStyle?: object;
    textSize?: number;
    showGradients?: boolean;
    wpm?: number;
    fontFamily?: string;
    fontFamilyBold?: string;
}

interface WordLayout {
    y: number;
    height: number;
}

/**
 * Get color based on WPM - used as fallback
 */
const getWpmColor = (wpm: number = 300, colors: any): string => {
    if (wpm <= 150) return colors.primary;
    if (wpm <= 250) return '#00E5FF';
    if (wpm <= 350) return '#00BFA5';
    if (wpm <= 450) return colors.secondary;
    if (wpm <= 550) return '#9C27B0';
    return '#FF4081';
};

export const BionicTextDisplay: React.FC<BionicTextDisplayProps> = ({
    bionicWords,
    currentWordIndex = 0,
    isPlaying = false,
    highlightColor,
    containerStyle,
    textSize = 18,
    showGradients = true,
    wpm = 300,
    fontFamily: customFontFamily = fontFamily.reading,
    fontFamilyBold: customFontFamilyBold = fontFamily.readingBold,
}) => {
    const { colors, mode } = useTheme();
    const isDark = mode === 'dark';
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollOffset = useRef(0);
    const [viewportHeight, setViewportHeight] = React.useState(0);
    const wordLayouts = useRef<Map<number, WordLayout>>(new Map());

    // Use custom highlight color or fallback to WPM color
    const accentColor = highlightColor || getWpmColor(wpm, colors);

    // Progress calculation
    const progress = bionicWords.length > 0
        ? ((currentWordIndex + 1) / bionicWords.length) * 100
        : 0;

    // Handle scroll events
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffset.current = event.nativeEvent.contentOffset.y;
    }, []);

    // Handle word layout
    const handleWordLayout = useCallback((index: number, event: LayoutChangeEvent) => {
        const { y, height } = event.nativeEvent.layout;
        wordLayouts.current.set(index, { y, height });
    }, []);

    // Auto-scroll to keep current word visible
    useEffect(() => {
        if (!isPlaying || bionicWords.length === 0) return;

        const layout = wordLayouts.current.get(currentWordIndex);
        if (!layout || viewportHeight === 0) return;

        // Calculate target scroll position to center the word
        // Target is line Y position minus half of viewport height
        // We add layout.height/2 to center on the line itself
        const targetScrollY = Math.max(0, layout.y - (viewportHeight * 0.4));

        // Only scroll if difference is significant to avoid jitter
        if (Math.abs(scrollOffset.current - targetScrollY) > 20) {
            scrollViewRef.current?.scrollTo({
                y: targetScrollY,
                animated: true
            });
        }
    }, [currentWordIndex, isPlaying, bionicWords.length, viewportHeight]);

    return (
        <View
            style={[styles.wrapper, containerStyle, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
        >
            {/* Top gradient - Only in Dark Mode */}
            {showGradients && isDark && (
                <LinearGradient
                    colors={[colors.surface, 'transparent']}
                    style={styles.topGradient}
                    pointerEvents="none"
                />
            )}

            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
                scrollEventThrottle={16}
                scrollEnabled={!isPlaying}
            >
                {/* WPM + Progress badge */}
                <View style={[styles.wpmBadge, { borderColor: accentColor }]}>
                    <Text style={[styles.wpmText, { color: accentColor }]}>
                        {wpm} {t('common.wpm')} • {Math.round(progress)}%
                    </Text>
                </View>

                {/* Bionic text with color-based highlighting */}
                <View style={styles.wordsContainer}>
                    {bionicWords.map((word, index) => (
                        <BionicWordItem
                            key={index}
                            word={word}
                            isCurrent={index === currentWordIndex}
                            accentColor={accentColor}
                            mutedColor={colors.textMuted}
                            textSize={textSize}
                            fontFamily={customFontFamily}
                            fontFamilyBold={customFontFamilyBold}
                            onLayout={(e) => handleWordLayout(index, e)}
                        />
                    ))}
                </View>

                {/* Bottom padding */}
                <View style={{ height: 150 }} />
            </ScrollView>

            {/* Bottom gradient - Only in Dark Mode */}
            {showGradients && isDark && (
                <LinearGradient
                    colors={['transparent', colors.surface]}
                    style={styles.bottomGradient}
                    pointerEvents="none"
                />
            )}

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progress}%`,
                            backgroundColor: accentColor
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        borderRadius: borderRadius.bento,
        borderWidth: 1,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: 100,
    },
    wpmBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    wpmText: {
        fontFamily: fontFamily.uiBold,
        fontSize: 12,
    },
    wordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boldPart: {
        lineHeight: 32,
    },
    normalPart: {
        lineHeight: 32,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 10,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 10,
    },
    progressBar: {
        height: 3,
    },
    progressFill: {
        height: '100%',
    },
});

// Optimized Word Component
const BionicWordItem = React.memo(({
    word,
    isCurrent,
    accentColor,
    mutedColor,
    textSize,
    fontFamily,
    fontFamilyBold,
    onLayout
}: {
    word: BionicWord;
    isCurrent: boolean;
    accentColor: string;
    mutedColor: string;
    textSize: number;
    fontFamily: string;
    fontFamilyBold: string;
    onLayout: (e: LayoutChangeEvent) => void;
}) => {
    // Only highlight if current
    const boldColor = isCurrent ? accentColor : mutedColor;
    const weight = isCurrent ? '700' : '700'; // Keep constant weight to avoid layout shift

    return (
        <Text onLayout={onLayout}>
            {/* Bold part */}
            <Text
                style={[
                    styles.boldPart,
                    {
                        fontSize: textSize,
                        fontFamily: fontFamilyBold,
                        color: boldColor,
                        // fontWeight: weight,
                    }
                ]}
            >
                {word.bold}
            </Text>
            {/* Normal part */}
            <Text
                style={[
                    styles.normalPart,
                    {
                        fontSize: textSize,
                        fontFamily: fontFamily,
                        color: mutedColor,
                    }
                ]}
            >
                {word.normal}
            </Text>
            <Text style={{ fontSize: textSize }}> </Text>
        </Text>
    );
}, (prev, next) => {
    // Custom comparison for performance
    return (
        prev.isCurrent === next.isCurrent &&
        prev.accentColor === next.accentColor &&
        prev.textSize === next.textSize &&
        prev.word === next.word // Reference check usually fine if word objects are stable
    );
});
