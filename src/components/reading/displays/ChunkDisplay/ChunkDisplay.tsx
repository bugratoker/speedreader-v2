/**
 * Chunk Display Component - Clean Version
 * Features: Context preview, touch navigation, center word highlight
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, GestureResponderEvent } from 'react-native';
import { fontFamily, spacing, useTheme } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ChunkDisplayProps {
    words: string[];
    previousChunk?: string[];
    nextChunk?: string[];
    containerStyle?: object;
    fontSize?: number;
    highlightColor?: string;
    fontFamily?: string;
    onTapLeft?: () => void;
    onTapRight?: () => void;
}

export const ChunkDisplay: React.FC<ChunkDisplayProps> = ({
    words,
    previousChunk,
    nextChunk,
    containerStyle,
    fontSize: customFontSize = 36,
    highlightColor = '#FF4444',
    fontFamily: customFontFamily = fontFamily.reading,
    onTapLeft,
    onTapRight,
}) => {
    const { colors } = useTheme();

    // Handle touch events for navigation
    const handlePress = (event: GestureResponderEvent) => {
        const { locationX } = event.nativeEvent;
        const containerWidth = SCREEN_WIDTH - 32;
        const midpoint = containerWidth / 2;

        if (locationX < midpoint) {
            onTapLeft?.();
        } else {
            onTapRight?.();
        }
    };

    // Find center word index
    const centerIndex = Math.floor(words.length / 2);

    return (
        <Pressable onPress={handlePress} style={styles.pressableContainer}>
            <View style={[styles.container, containerStyle]}>
                {/* Previous chunk context (dimmed) */}
                {previousChunk && previousChunk.length > 0 && (
                    <View style={styles.contextContainer}>
                        <Text style={[
                            styles.contextText,
                            {
                                fontFamily: customFontFamily,
                                fontSize: customFontSize * 0.45,
                                color: colors.textMuted
                            }
                        ]}>
                            {previousChunk.join(' ')}
                        </Text>
                    </View>
                )}

                {/* Current chunk words - Main display (single line) */}
                <View style={styles.chunkContainer}>
                    {words.map((word, index) => (
                        <Text
                            key={index}
                            style={[
                                styles.word,
                                {
                                    fontSize: customFontSize,
                                    fontFamily: customFontFamily,
                                    color: index === centerIndex ? highlightColor : colors.text,
                                    fontWeight: index === centerIndex ? '700' : '400',
                                }
                            ]}
                        >
                            {word}
                            {index < words.length - 1 ? ' ' : ''}
                        </Text>
                    ))}
                </View>

                {/* Next chunk context (dimmed) */}
                {nextChunk && nextChunk.length > 0 && (
                    <View style={styles.contextContainer}>
                        <Text style={[
                            styles.contextText,
                            {
                                fontFamily: customFontFamily,
                                fontSize: customFontSize * 0.45,
                                color: colors.textMuted
                            }
                        ]}>
                            {nextChunk.join(' ')}
                        </Text>
                    </View>
                )}

                {/* Touch hint indicators */}
                <View style={styles.touchHintContainer} pointerEvents="none">
                    <Text style={[styles.touchHint, { color: colors.textMuted }]}>◀</Text>
                    <Text style={[styles.touchHint, { color: colors.textMuted }]}>▶</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressableContainer: {
        width: '100%',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 120,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    contextContainer: {
        marginVertical: spacing.xs,
        opacity: 0.35,
    },
    contextText: {
        textAlign: 'center',
    },
    chunkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        marginVertical: spacing.sm,
    },
    word: {
        textAlign: 'center',
    },
    touchHintContainer: {
        position: 'absolute',
        bottom: spacing.xs,
        left: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.25,
    },
    touchHint: {
        fontSize: 10,
    },
});

