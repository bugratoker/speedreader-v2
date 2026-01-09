/**
 * Neural Nexus - Breathing Cyan Ring for Foveal Fixation
 * 
 * A pulsing Electric Cyan ring that serves as the central anchor point.
 * Breathes at 60 BPM to help users sync focus and lower heart rate.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme';

interface NeuralNexusProps {
    isActive: boolean;
    intensity?: 'dim' | 'normal' | 'bright';
    size?: number;
}

export const NeuralNexus: React.FC<NeuralNexusProps> = ({
    isActive,
    intensity = 'normal',
    size = 80,
}) => {
    const { colors } = useTheme();
    
    // Breathing animation at 60 BPM (1 second cycle)
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);
    const glowRadius = useSharedValue(8);

    useEffect(() => {
        if (isActive) {
            // 60 BPM = 1 second per breath cycle
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.6, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            glowRadius.value = withRepeat(
                withSequence(
                    withTiming(16, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(8, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            scale.value = withTiming(1, { duration: 300 });
            opacity.value = withTiming(0.4, { duration: 300 });
            glowRadius.value = withTiming(4, { duration: 300 });
        }
    }, [isActive]);

    const getIntensityMultiplier = () => {
        switch (intensity) {
            case 'dim': return 0.3;
            case 'bright': return 1;
            default: return 0.7;
        }
    };

    const intensityMultiplier = getIntensityMultiplier();

    const animatedRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value * intensityMultiplier,
        shadowRadius: glowRadius.value,
    }));

    const animatedInnerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value * 0.3,
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer glow ring */}
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: size * 0.05, // 5% of size
                        borderColor: colors.primary,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.8,
                    },
                    animatedRingStyle,
                ]}
            />
            
            {/* Inner subtle fill */}
            <Animated.View
                style={[
                    styles.innerFill,
                    {
                        width: size * 0.7,
                        height: size * 0.7,
                        borderRadius: size * 0.35,
                        backgroundColor: colors.primary,
                    },
                    animatedInnerStyle,
                ]}
            />
            
            {/* Center dot */}
            <View
                style={[
                    styles.centerDot,
                    {
                        width: size * 0.15,
                        height: size * 0.15,
                        borderRadius: size * 0.075,
                        backgroundColor: '#FF3B30', // Red focus anchor
                        shadowColor: colors.primary,
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
    },
    innerFill: {
        position: 'absolute',
    },
    centerDot: {
        shadowOffset: { width: 0, height: 0 },
    },
});
