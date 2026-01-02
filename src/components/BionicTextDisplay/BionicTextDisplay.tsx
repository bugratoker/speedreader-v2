import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BionicWord } from '../../engine/types';
import { colors, fontFamily, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BionicTextDisplayProps {
    bionicWords: BionicWord[];
    highlightIndex?: number;
    containerStyle?: object;
    textSize?: number;
    showGradients?: boolean;
    wpm?: number;
}

/**
 * Get color based on WPM - slower = cyan, faster = magenta
 */
const getWpmColor = (wpm: number = 300, colors: any): string => {
    if (wpm <= 150) return colors.primary; // Cyan
    if (wpm <= 250) return '#00E5FF';  // Light cyan
    if (wpm <= 350) return '#00BFA5';  // Teal
    if (wpm <= 450) return colors.secondary; // Violet
    if (wpm <= 550) return '#9C27B0';  // Purple
    return '#FF4081'; // Magenta
};

/**
 * Get progress-based color interpolation
 */
const getProgressColor = (progress: number, baseColor: string, colors: any): string => {
    // Progress colors from cool to warm
    const progressColors = [
        colors.primary,    // 0-20%: Cyan
        '#00E5FF',         // 20-40%: Light cyan
        '#00BFA5',         // 40-60%: Teal
        colors.secondary,  // 60-80%: Violet
        '#FF4081',         // 80-100%: Magenta
    ];

    const index = Math.min(4, Math.floor(progress / 20));
    return progressColors[index];
};

export const BionicTextDisplay: React.FC<BionicTextDisplayProps> = ({
    bionicWords,
    highlightIndex = 0,
    containerStyle,
    textSize = 18,
    showGradients = true,
    wpm = 300,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    // Calculate colors based on WPM and progress
    const boldColor = useMemo(() => getWpmColor(wpm, colors), [wpm, colors]);
    const progressColor = useMemo(() => getProgressColor(scrollProgress, boldColor, colors), [scrollProgress, boldColor, colors]);

    // Calculate which words are "read" based on scroll position
    const readWordCount = useMemo(() => {
        if (bionicWords.length === 0) return 0;
        const wordsPerPercent = bionicWords.length / 100;
        return Math.floor(scrollProgress * wordsPerPercent);
    }, [scrollProgress, bionicWords.length]);

    // Handle scroll to track progress
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollableHeight = contentSize.height - layoutMeasurement.height;
        if (scrollableHeight > 0) {
            const progress = Math.min(100, (contentOffset.y / scrollableHeight) * 100);
            setScrollProgress(progress);
        }
    };

    return (
        <View style={[styles.wrapper, containerStyle, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            {/* Top gradient */}
            {showGradients && (
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
                scrollEventThrottle={16}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
            >
                {/* WPM + Progress badge */}
                <View style={[styles.wpmBadge, { borderColor: progressColor }]}>
                    <Text style={[styles.wpmText, { color: progressColor }]}>
                        {wpm} {t('common.wpm')} • {Math.round(scrollProgress)}%
                    </Text>
                </View>

                <Text style={styles.textWrapper}>
                    {bionicWords.map((word, index) => {
                        const isRead = index < readWordCount;
                        const isReading = index >= readWordCount && index < readWordCount + 10;

                        return (
                            <Text key={index}>
                                <Text
                                    style={[
                                        styles.boldPart,
                                        {
                                            fontSize: textSize,
                                            color: isRead
                                                ? progressColor
                                                : isReading
                                                    ? boldColor
                                                    : boldColor,
                                            opacity: isRead ? 0.6 : 1,
                                        }
                                    ]}
                                >
                                    {word.bold}
                                </Text>
                                <Text
                                    style={[
                                        styles.normalPart,
                                        {
                                            fontSize: textSize,
                                            color: isRead
                                                ? colors.textDim
                                                : colors.textMuted,
                                            opacity: isRead ? 0.5 : 0.8,
                                        }
                                    ]}
                                >
                                    {word.normal}
                                </Text>
                                <Text style={{ fontSize: textSize }}> </Text>
                            </Text>
                        );
                    })}
                </Text>
            </ScrollView>

            {/* Bottom gradient */}
            {showGradients && (
                <LinearGradient
                    colors={['transparent', colors.surface]}
                    style={styles.bottomGradient}
                    pointerEvents="none"
                />
            )}

            {/* Speed bar - now shows progress color */}
            <View style={[styles.speedBar, { backgroundColor: colors.surface }]}>
                <View
                    style={[
                        styles.speedFill,
                        {
                            width: `${Math.max(scrollProgress, (wpm / 600) * 100)}%`,
                            backgroundColor: progressColor
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
        paddingBottom: spacing.xl,
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
    textWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boldPart: {
        fontFamily: fontFamily.readingBold,
        lineHeight: 32,
    },
    normalPart: {
        fontFamily: fontFamily.reading,
        lineHeight: 32,
        // color: colors.textMuted, // inline or dynamic
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
    speedBar: {
        height: 3,
        // backgroundColor: colors.surface, // inline
    },
    speedFill: {
        height: '100%',
    },
});
