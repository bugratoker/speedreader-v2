/**
 * RSVP Preview Component
 * Animated demonstration of Rapid Serial Visual Presentation
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontFamily, fontSize, spacing, borderRadius } from '../../theme';

const SAMPLE_WORDS = ['Speed', 'Reading', 'Made', 'Simple', 'and', 'Powerful'];
const WORD_DURATION = 400; // milliseconds per word

export const RSVPPreview: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                // Change word
                setCurrentIndex((prev) => (prev + 1) % SAMPLE_WORDS.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            });
        }, WORD_DURATION);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    const currentWord = SAMPLE_WORDS[currentIndex];
    // Find the ORP (Optimal Recognition Point) - typically around 1/3 of the word
    const orpIndex = Math.max(0, Math.floor(currentWord.length / 3));

    return (
        <View style={styles.container}>
            <View style={styles.previewBox}>
                <Animated.View style={[styles.wordContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.wordBefore}>
                        {currentWord.slice(0, orpIndex)}
                    </Text>
                    <Text style={styles.wordHighlight}>
                        {currentWord[orpIndex]}
                    </Text>
                    <Text style={styles.wordAfter}>
                        {currentWord.slice(orpIndex + 1)}
                    </Text>
                </Animated.View>
                <View style={styles.focusLine} />
            </View>
            <Text style={styles.wpmLabel}>350 WPM</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    previewBox: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.bento,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 280,
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wordBefore: {
        fontFamily: fontFamily.reading,
        fontSize: fontSize.readingFocus,
        color: colors.text,
    },
    wordHighlight: {
        fontFamily: fontFamily.readingBold,
        fontSize: fontSize.readingFocus,
        color: colors.primary,
    },
    wordAfter: {
        fontFamily: fontFamily.reading,
        fontSize: fontSize.readingFocus,
        color: colors.text,
    },
    focusLine: {
        position: 'absolute',
        bottom: spacing.sm,
        width: 40,
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    wpmLabel: {
        fontFamily: fontFamily.uiMedium,
        fontSize: fontSize.sm,
        color: colors.primary,
        marginTop: spacing.sm,
    },
});
