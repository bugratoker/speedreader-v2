/**
 * Guided Scrolling Display Component - Word-by-Word with Finger Cursor
 * Features: Finger pointer below each word (with gap), glow effect, cursor toggle
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, LayoutChangeEvent, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hand, Eye, EyeOff } from 'lucide-react-native';
import { fontFamily, spacing, borderRadius } from '@theme';
import { useTheme } from '@theme';

export interface GuidedScrollingDisplayProps {
    words: string[];
    currentWordIndex: number;
    isPlaying: boolean;
    containerStyle?: object;
    textSize?: number;
    cursorColor?: string;
    onUserScroll?: () => void; // Called when user manually scrolls - should pause reading
    fontFamily?: string;
    fontFamilyBold?: string;
}

interface WordLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const GuidedScrollingDisplay: React.FC<GuidedScrollingDisplayProps> = ({
    words,
    currentWordIndex,
    isPlaying,
    containerStyle,
    textSize = 16,
    cursorColor: propCursorColor,
    onUserScroll,
    fontFamily: customFontFamily = fontFamily.reading,
    fontFamilyBold: customFontFamilyBold = fontFamily.readingBold,
}) => {
    const { colors, mode } = useTheme();
    const isDark = mode === 'dark';
    const cursorColor = propCursorColor || colors.primary;

    const scrollViewRef = useRef<ScrollView>(null);
    const wordLayouts = useRef<Map<number, WordLayout>>(new Map());
    const scrollOffset = useRef(0);
    const cursorX = useRef(new Animated.Value(20)).current;
    const cursorY = useRef(new Animated.Value(50)).current;
    const [showCursor, setShowCursor] = useState(true);
    const [viewportHeight, setViewportHeight] = useState(0);

    // Track which word layouts have been measured
    const measuredWords = useRef<Set<number>>(new Set());

    // Handle scroll events - just track offset
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffset.current = event.nativeEvent.contentOffset.y;
    }, []);

    // Handle scroll begin - detect if user started scrolling
    const handleScrollBeginDrag = useCallback(() => {
        // User started dragging - pause reading
        if (isPlaying) {
            onUserScroll?.();
        }
    }, [isPlaying, onUserScroll]);

    // Position cursor function - called when we need to update cursor position
    const positionCursor = useCallback((index: number, forceScrollOffset?: number) => {
        const layout = wordLayouts.current.get(index);
        if (!layout || !showCursor) return;

        // Use provided offset or current offset
        const currentScrollOffset = forceScrollOffset ?? scrollOffset.current;

        // Calculate screen-relative position
        // layout.y is relative to wordsContainer
        // screenY = paddingTop + layout.y - scrollOffset + wordHeight + cursorGap
        const screenY = spacing.xl + layout.y - currentScrollOffset + layout.height + 8;

        Animated.parallel([
            Animated.spring(cursorX, {
                toValue: spacing.lg + layout.x + layout.width / 2 - 10,
                useNativeDriver: true,
                tension: 120,
                friction: 12,
            }),
            Animated.spring(cursorY, {
                toValue: screenY,
                useNativeDriver: true,
                tension: 120,
                friction: 12,
            }),
        ]).start();
    }, [cursorX, cursorY, showCursor]);

    // Auto-scroll to keep word visible and centered
    const autoScrollToWord = useCallback((layout: WordLayout) => {
        if (!scrollViewRef.current || viewportHeight === 0) return;

        // Calculate target scroll position to center the word
        // Target is line Y position minus 40% of viewport height (reading sweet spot)
        const targetScrollY = Math.max(0, layout.y - (viewportHeight * 0.4));

        // Only scroll if difference is significant to avoid jitter
        // and only if we are actually moving forward/down
        if (Math.abs(scrollOffset.current - targetScrollY) > 20) {
            // Update our local offset expectation immediately so cursor calc knows where we ARE going
            // But real update happens on scroll event
            // scrollOffset.current = targetScrollY; // Don't force this, let event handle it naturally

            scrollViewRef.current.scrollTo({
                y: targetScrollY,
                animated: true,
            });
        }
    }, [viewportHeight]);

    // Move cursor when currentWordIndex changes
    useEffect(() => {
        const layout = wordLayouts.current.get(currentWordIndex);

        if (layout) {
            autoScrollToWord(layout);
            // We use current scroll offset for cursor because logic inside autoScrollToWord
            // handles the scrolling asynchronously. The cursor will animate to new position 
            // relative to the view.
            positionCursor(currentWordIndex);
        } else {
            // Layout not ready yet, wait for it
            const timer = setTimeout(() => {
                positionCursor(currentWordIndex);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [currentWordIndex, positionCursor, autoScrollToWord]);

    // Handle word layout - called when each word's dimensions are measured
    const handleWordLayout = useCallback((index: number, event: LayoutChangeEvent) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const prevLayout = wordLayouts.current.get(index);

        // Check if layout actually changed
        const hasChanged = !prevLayout ||
            Math.abs(prevLayout.x - x) > 1 ||
            Math.abs(prevLayout.y - y) > 1 ||
            Math.abs(prevLayout.width - width) > 1;

        wordLayouts.current.set(index, { x, y, width, height });

        // Track that this word has been measured
        const wasMeasured = measuredWords.current.has(index);
        measuredWords.current.add(index);

        // If this is the current word and layout changed, reposition cursor
        if (index === currentWordIndex && (hasChanged || !wasMeasured)) {
            requestAnimationFrame(() => {
                positionCursor(index);
            });
        }
    }, [currentWordIndex, positionCursor]);

    return (
        <View style={[styles.wrapper, containerStyle, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            {/* Top gradient - Only in Dark Mode */}
            {isDark && (
                <LinearGradient
                    colors={[colors.surface, 'transparent']}
                    style={styles.topGradient}
                    pointerEvents="none"
                />
            )}

            {/* Cursor toggle button */}
            <TouchableOpacity
                style={[styles.cursorToggle, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
                onPress={() => setShowCursor(!showCursor)}
                activeOpacity={0.7}
            >
                {showCursor ? (
                    <Eye size={18} color={cursorColor} strokeWidth={2} />
                ) : (
                    <EyeOff size={18} color={colors.textMuted} strokeWidth={2} />
                )}
            </TouchableOpacity>

            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
                onScrollBeginDrag={handleScrollBeginDrag}
                scrollEventThrottle={16}
            >
                {/* Words */}
                <View style={styles.wordsContainer}>
                    {words.map((word, index) => {
                        const isCurrentWord = index === currentWordIndex;
                        const isPastWord = index < currentWordIndex;

                        return (
                            <Text
                                key={index}
                                onLayout={(e) => handleWordLayout(index, e)}
                                style={[
                                    styles.word,
                                    {
                                        fontSize: textSize,
                                        fontFamily: customFontFamily, // Keep same font family to prevent width jump
                                        color: isCurrentWord
                                            ? colors.text
                                            : isPastWord
                                                ? colors.textMuted
                                                : colors.textDim,
                                        // Use opacity or color for highlighting instead of font-weight change
                                        fontWeight: isCurrentWord ? '500' : 'normal', // Subtle weight change if supported
                                        textShadowColor: isCurrentWord ? cursorColor : 'transparent',
                                        textShadowOffset: { width: 0, height: 0 },
                                        textShadowRadius: isCurrentWord ? 6 : 0,
                                    }
                                ]}
                            >
                                {word}{' '}
                            </Text>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Finger Cursor - positioned as overlay outside ScrollView */}
            {showCursor && (
                <Animated.View
                    style={[
                        styles.cursor,
                        {
                            transform: [
                                { translateX: cursorX },
                                { translateY: cursorY },
                            ],
                        }
                    ]}
                    pointerEvents="none"
                >
                    <View style={[styles.cursorGlow, { backgroundColor: cursorColor }]} />
                    <Hand size={18} color={cursorColor} strokeWidth={2} />
                </Animated.View>
            )}

            {/* Bottom gradient - Only in Dark Mode */}
            {isDark && (
                <LinearGradient
                    colors={['transparent', colors.surface]}
                    style={styles.bottomGradient}
                    pointerEvents="none"
                />
            )}

            {/* Progress bar */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0}%`,
                            backgroundColor: cursorColor,
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
        // borderColor: colors.glassBorder, // inline
        // backgroundColor: colors.surface, // inline
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
    cursorToggle: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 20,
        padding: 8,
        // backgroundColor: colors.surface, // inline
        borderRadius: 16,
        borderWidth: 1,
        // borderColor: colors.glassBorder, // inline
    },
    wordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    word: {
        lineHeight: 28,
    },
    cursor: {
        position: 'absolute',
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
    },
    cursorGlow: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        opacity: 0.2,
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
        // backgroundColor: colors.surface, // inline
    },
    progressFill: {
        height: '100%',
    },
});
