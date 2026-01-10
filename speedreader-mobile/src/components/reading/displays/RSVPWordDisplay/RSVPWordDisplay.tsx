/**
 * RSVP Word Display Component - Clean Version
 * Features: ORP highlighting with text shadow (no pulse animation)
 * The ORP (Optimal Recognition Point) letter stays FIXED at the center
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors as themeColors, fontFamily, spacing, useTheme } from '@theme';

export interface RSVPWordDisplayProps {
    word: string;
    fadeAnim?: Animated.Value;
    showFocusLine?: boolean;
    containerStyle?: ViewStyle;
    fontSize?: number;
    highlightColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontFamilyBold?: string;
}

/**
 * Get ORP (Optimal Recognition Point) index for a word
 * True middle letter: even length → n/2 - 1, odd length → floor(n/2)
 */
export const getORPIndex = (word: string): number => {
    const cleanWord = word.replace(/[^a-zA-ZçğışöüÇĞİŞÖÜ0-9]/g, '');
    const len = cleanWord.length;

    if (len <= 1) return 0;

    if (len % 2 === 0) {
        return (len / 2) - 1;
    } else {
        return Math.floor(len / 2);
    }
};

/**
 * Split word into parts: before ORP, ORP character, after ORP
 */
export const splitWordByORP = (word: string): { before: string; highlight: string; after: string } => {
    if (!word) return { before: '', highlight: '', after: '' };

    const orpIndex = getORPIndex(word);
    return {
        before: word.slice(0, orpIndex),
        highlight: word[orpIndex] || '',
        after: word.slice(orpIndex + 1),
    };
};

export const RSVPWordDisplay: React.FC<RSVPWordDisplayProps> = ({
    word,
    fadeAnim,
    showFocusLine = true,
    containerStyle,
    fontSize: customFontSize,
    highlightColor = '#FF3B30',
    textColor: customTextColor,
    fontFamily: customFontFamily = fontFamily.reading,
    fontFamilyBold: customFontFamilyBold = fontFamily.readingBold,
}) => {
    const { colors } = useTheme();
    const textColor = customTextColor || colors.text;

    const { before, highlight, after } = splitWordByORP(word);

    // Auto-scale font size for long words
    // Base heuristic: if word length > 10, scale down
    const scaleFactor = word.length > 10 ? Math.max(0.6, 10 / word.length) : 1;
    const wordFontSize = (customFontSize || 40) * scaleFactor;

    const content = (
        <View style={styles.outerContainer}>
            {/* Fixed center indicator - top */}
            <View style={[styles.centerIndicatorTop, { backgroundColor: highlightColor }]} />

            {/* Word container with fixed center */}
            <View style={styles.wordContainer}>
                {/* Before ORP */}
                <View style={styles.beforeSection}>
                    <Text
                        style={[
                            styles.beforeText,
                            {
                                fontSize: wordFontSize,
                                fontFamily: customFontFamily,
                                color: textColor,
                            }
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {before}
                    </Text>
                </View>

                {/* ORP character - FIXED at center with glow */}
                <View style={styles.orpSection}>
                    <Text
                        style={[
                            styles.orpText,
                            {
                                fontSize: wordFontSize,
                                fontFamily: customFontFamilyBold,
                                color: highlightColor,
                                textShadowColor: highlightColor,
                                textShadowOffset: { width: 0, height: 0 },
                                textShadowRadius: 6,
                            }
                        ]}
                    >
                        {highlight}
                    </Text>
                </View>

                {/* After ORP */}
                <View style={styles.afterSection}>
                    <Text
                        style={[
                            styles.afterText,
                            {
                                fontSize: wordFontSize,
                                fontFamily: customFontFamily,
                                color: textColor,
                            }
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {after}
                    </Text>
                </View>
            </View>

            {/* Fixed center indicator - bottom */}
            {showFocusLine && (
                <View style={[styles.centerIndicatorBottom, { backgroundColor: highlightColor }]} />
            )}
        </View>
    );

    if (fadeAnim) {
        return (
            <Animated.View style={[styles.container, containerStyle, { opacity: fadeAnim }]}>
                {content}
            </Animated.View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 120,
    },
    outerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    centerIndicatorTop: {
        width: 3,
        height: 12,
        marginBottom: 6,
        opacity: 0.7,
        borderRadius: 1.5,
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Center text vertically
        height: 100,
        width: '100%',
        justifyContent: 'center',
    },
    beforeSection: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingRight: 0, // Removed padding to prevent gaps
    },
    beforeText: {
        textAlign: 'right',
        includeFontPadding: false, // Android fix for vertical alignment
        textAlignVertical: 'center',
    },
    orpSection: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 10, // Minimized width to prevent gaps
        paddingHorizontal: 0,
    },
    orpText: {
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    afterSection: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingLeft: 0, // Removed padding
    },
    afterText: {
        textAlign: 'left',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    centerIndicatorBottom: {
        width: 3,
        height: 12,
        marginTop: 6,
        opacity: 0.7,
        borderRadius: 1.5,
    },
});
