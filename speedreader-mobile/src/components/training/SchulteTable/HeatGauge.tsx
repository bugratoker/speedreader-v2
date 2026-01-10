import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    interpolate,
    Extrapolate,
    interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Flame } from 'lucide-react-native';

interface HeatGaugeProps {
    combo: number;
    maxCombo: number; // The combo count needed to reach "MAX" heat
}

export const HeatGauge: React.FC<HeatGaugeProps> = ({ combo, maxCombo = 10 }) => {
    const { colors, spacing, borderRadius, glows } = useTheme();

    // Animation values
    const progress = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        const targetProgress = Math.min(combo / maxCombo, 1);
        progress.value = withSpring(targetProgress, { damping: 15 });

        // Pulse on combo increase
        if (combo > 0) {
            scale.value = withSequence(
                withTiming(1.2, { duration: 100 }),
                withTiming(1, { duration: 200 })
            );
        }
    }, [combo, maxCombo]);

    const barStyle = useAnimatedStyle(() => {
        const widthPercent = interpolate(progress.value, [0, 1], [0, 100]);
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 0.5, 1],
            [colors.primary, '#FFD700', '#FF3B30'] // Cyan -> Gold -> Red
        );

        return {
            width: `${widthPercent}%`,
            backgroundColor,
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            borderColor: interpolateColor(
                progress.value,
                [0, 1],
                [colors.glassBorder, '#FF3B30']
            ),
        };
    });

    const glowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0.5, 1], [0, 0.8]),
            shadowColor: '#FF3B30',
            shadowRadius: interpolate(progress.value, [0.5, 1], [0, 15]),
            shadowOpacity: interpolate(progress.value, [0.5, 1], [0, 0.6]),
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Animated.View style={containerStyle}>
                    <Flame
                        size={20}
                        color={combo > 5 ? '#FF3B30' : colors.textMuted}
                        style={{ opacity: combo > 0 ? 1 : 0.5 }}
                    />
                </Animated.View>
            </View>

            <View style={styles.barContainer}>
                <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
                    <Animated.View style={[styles.fill, barStyle, glowStyle]} />
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.comboText, { color: colors.text, fontFamily: 'System' }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{combo}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}> COMBO</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        marginBottom: 8,
        width: '100%',
        paddingHorizontal: 12,
    },
    iconContainer: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
    },
    barContainer: {
        flex: 1,
        height: 8,
        justifyContent: 'center',
    },
    track: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
    textContainer: {
        marginLeft: 12,
        minWidth: 50,
        alignItems: 'flex-end',
    },
    comboText: {
        // Font family handled inline for now or via theme
    },
});
