/**
 * Chunk Display Component - Enhanced Version
 * Features: Glassmorphism container, fade animation, shimmer effect
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamily, spacing, borderRadius } from '../../theme';

export interface ChunkDisplayProps {
    words: string[];
    fadeAnim?: Animated.Value;
    containerStyle?: object;
    fontSize?: number;
    highlightColor?: string;
    showShimmer?: boolean;
}

export const ChunkDisplay: React.FC<ChunkDisplayProps> = ({
    words,
    fadeAnim,
    containerStyle,
    fontSize: customFontSize = 36,
    highlightColor = colors.primary,
    showShimmer = true,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    // Shimmer animation
    useEffect(() => {
        if (showShimmer) {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [showShimmer, shimmerAnim]);

    // Pulse effect on chunk change
    useEffect(() => {
        if (words.length > 0) {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.03, duration: 100, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 0.6, duration: 100, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
                ]),
            ]).start();
        }
    }, [words, pulseAnim, glowAnim]);

    // Shimmer translateX
    const shimmerTranslateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const content = (
        <Animated.View style={[styles.container, containerStyle, { transform: [{ scale: pulseAnim }] }]}>
            {/* Background glow */}
            <Animated.View style={[styles.backgroundGlow, { opacity: glowAnim }]}>
                <View style={[styles.glowCircle, { backgroundColor: highlightColor }]} />
            </Animated.View>

            {/* Chunk words */}
            <View style={styles.chunkContainer}>
                {words.map((word, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.word,
                            {
                                fontSize: customFontSize,
                                fontFamily: fontFamily.reading,
                                color: colors.text,
                                textShadowColor: 'rgba(255, 255, 255, 0.15)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 3,
                            }
                        ]}
                    >
                        {word}
                        {index < words.length - 1 ? '  ' : ''}
                    </Text>
                ))}
            </View>

            {/* Shimmer overlay */}
            {showShimmer && (
                <Animated.View
                    style={[
                        styles.shimmerContainer,
                        { transform: [{ translateX: shimmerTranslateX }] }
                    ]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            )}

            {/* Glassmorphism border glow */}
            <View style={styles.borderGlow} pointerEvents="none">
                <View style={[styles.borderGlowInner, { borderColor: highlightColor }]} />
            </View>
        </Animated.View>
    );

    if (fadeAnim) {
        return (
            <Animated.View style={{ opacity: fadeAnim }}>
                {content}
            </Animated.View>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 100,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        overflow: 'hidden',
    },
    backgroundGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -80,
        marginTop: -40,
        width: 160,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowCircle: {
        width: 120,
        height: 60,
        borderRadius: 30,
        opacity: 0.1,
    },
    chunkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    word: {
        textAlign: 'center',
    },
    shimmerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    shimmerGradient: {
        flex: 1,
        width: 100,
    },
    borderGlow: {
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderRadius: borderRadius.bento + 1,
    },
    borderGlowInner: {
        flex: 1,
        borderRadius: borderRadius.bento,
        borderWidth: 1,
        opacity: 0.2,
    },
});
