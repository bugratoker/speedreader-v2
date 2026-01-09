/**
 * Visual Mask - Post-Stimulus Noise Pattern
 * 
 * Displays a static/noise pattern for 100ms after stimulus
 * to prevent after-image cheating and force genuine visual memory.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme';

interface VisualMaskProps {
    visible: boolean;
    duration?: number; // Duration in ms (default 100)
    onComplete?: () => void;
    size?: number;
}

export const VisualMask: React.FC<VisualMaskProps> = ({
    visible,
    duration = 100,
    onComplete,
    size = 120,
}) => {
    const { colors } = useTheme();
    const opacity = useSharedValue(0);

    // Generate static noise pattern (grid of random colored pixels)
    const noiseGrid = useMemo(() => {
        const gridSize = 8;
        const pixels: { key: string; color: string; opacity: number }[] = [];
        
        for (let i = 0; i < gridSize * gridSize; i++) {
            const brightness = Math.random();
            pixels.push({
                key: `pixel-${i}`,
                color: brightness > 0.5 ? colors.primary : colors.secondary,
                opacity: 0.2 + Math.random() * 0.6,
            });
        }
        
        return pixels;
    }, [visible]); // Regenerate on each show

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 30, easing: Easing.out(Easing.quad) });

            const timer = setTimeout(() => {
                opacity.value = withTiming(0, { duration: 30 });
                setTimeout(() => {
                    onComplete?.();
                }, 30);
            }, duration);

            return () => clearTimeout(timer);
        } else {
            opacity.value = 0;
        }
    }, [visible, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!visible) return null;

    const pixelSize = size / 8;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size * 0.1,
                    backgroundColor: colors.surface,
                },
                animatedStyle,
            ]}
        >
            <View style={styles.grid}>
                {noiseGrid.map((pixel) => (
                    <View
                        key={pixel.key}
                        style={[
                            styles.pixel,
                            {
                                width: pixelSize,
                                height: pixelSize,
                                backgroundColor: pixel.color,
                                opacity: pixel.opacity,
                            },
                        ]}
                    />
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pixel: {
        // Individual pixel in the noise grid
    },
});
