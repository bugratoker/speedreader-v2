/**
 * RSVP Word Display Component - Clean Version
 * Features: ORP highlighting with text shadow (no pulse animation)
 * The ORP (Optimal Recognition Point) letter stays FIXED at the center
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors as themeColors, fontFamily, spacing } from '../../theme';

export interface RSVPWordDisplayProps {
    word: string;
    fadeAnim?: Animated.Value;
    showFocusLine?: boolean;
    containerStyle?: ViewStyle;
    fontSize?: number;
    highlightColor?: string;
    textColor?: string;
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
    textColor = themeColors.text,
}) => {
    const { before, highlight, after } = splitWordByORP(word);
    const wordFontSize = customFontSize || 40;

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
                                fontFamily: fontFamily.reading,
                                color: textColor,
                            }
                        ]}
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
                                fontFamily: fontFamily.readingBold,
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
                                fontFamily: fontFamily.reading,
                                color: textColor,
                            }
                        ]}
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
        alignItems: 'center',
        height: 70,
        paddingBottom: 10,
    },
    beforeSection: {
        width: 120,
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    beforeText: {
        textAlign: 'right',
    },
    orpSection: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
    },
    orpText: {
        textAlign: 'center',
    },
    afterSection: {
        width: 120,
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    afterText: {
        textAlign: 'left',
    },
    centerIndicatorBottom: {
        width: 3,
        height: 12,
        marginTop: 6,
        opacity: 0.7,
        borderRadius: 1.5,
    },
});
