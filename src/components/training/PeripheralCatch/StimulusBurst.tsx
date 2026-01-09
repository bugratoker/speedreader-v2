/**
 * Stimulus Burst - Peripheral Word/Phrase Display
 * 
 * Displays semantic clusters in peripheral vision zones with
 * "warp in" animation for 150ms.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    SharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 8 peripheral sectors (in degrees from center)
export const SECTORS = [
    { angle: 0, label: 'right' },
    { angle: 45, label: 'bottom-right' },
    { angle: 90, label: 'bottom' },
    { angle: 135, label: 'bottom-left' },
    { angle: 180, label: 'left' },
    { angle: 225, label: 'top-left' },
    { angle: 270, label: 'top' },
    { angle: 315, label: 'top-right' },
];

interface StimulusBurstProps {
    words: string[];
    sectors: number[]; // Indices into SECTORS
    radius: number; // Distance from center in pixels
    duration?: number; // Display duration in ms
    onComplete?: () => void;
    visible: boolean;
}

export const StimulusBurst: React.FC<StimulusBurstProps> = ({
    words,
    sectors,
    radius,
    duration = 150,
    onComplete,
    visible,
}) => {
    const { colors, fontFamily, fontSize, spacing, borderRadius } = useTheme();
    
    // Shared animation values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    useEffect(() => {
        if (visible) {
            // Warp in animation
            opacity.value = withTiming(1, { duration: 50, easing: Easing.out(Easing.quad) });
            scale.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.back(1.5)) });

            // Auto-hide after duration
            const timer = setTimeout(() => {
                opacity.value = withTiming(0, { duration: 50 });
                scale.value = withTiming(0.8, { duration: 50 });
                
                setTimeout(() => {
                    onComplete?.();
                }, 50);
            }, duration);

            return () => clearTimeout(timer);
        } else {
            opacity.value = 0;
            scale.value = 0.5;
        }
    }, [visible, duration]);

    if (!visible) return null;

    return (
        <>
            {words.map((word, index) => {
                // Calculate position for this specific word
                const sectorIndex = sectors[index % sectors.length];
                const sectorConfig = SECTORS[sectorIndex % SECTORS.length];
                const angleRad = (sectorConfig.angle * Math.PI) / 180;
                
                // Static calculation for this render cycle
                const tx = Math.cos(angleRad) * radius;
                const ty = Math.sin(angleRad) * radius;

                // Create a specific animated style for this word's position
                // We use an inline style for the transform to avoid creating hooks in a loop
                // But we need to combine it with the shared animation values
                
                return (
                    <WordBubble 
                        key={`${index}-${word}`}
                        word={word}
                        translateX={tx}
                        translateY={ty}
                        opacity={opacity}
                        scale={scale}
                    />
                );
            })}
        </>
    );
};

// Sub-component for individual word bubbles to handle styles clearly
const WordBubble: React.FC<{
    word: string;
    translateX: number;
    translateY: number;
    opacity: SharedValue<number>;
    scale: SharedValue<number>;
}> = ({ word, translateX, translateY, opacity, scale }) => {
    const { colors, fontFamily, fontSize, spacing, borderRadius } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX },
            { translateY },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.sm,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                },
                animatedStyle,
            ]}
        >
            <Text
                style={[
                    styles.phrase,
                    {
                        color: colors.text,
                        fontFamily: fontFamily.uiBold,
                        fontSize: fontSize.sm,
                    },
                ]}
            >
                {word}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
    },
    phrase: {
        textAlign: 'center',
        letterSpacing: 1,
    },
});
