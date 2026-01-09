/**
 * Span HUD - Bottom Stats Display
 * 
 * Shows Current Span and Neural Load metrics with
 * Cyber Violet progress bar at top.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Activity, Target } from 'lucide-react-native';

interface SpanHUDProps {
    currentSpan: number; // in cm (e.g., 3.5)
    neuralLoad: number; // percentage 0-100
    round: number;
    totalRounds: number;
    score: number;
    visible: boolean;
}

export const SpanHUD: React.FC<SpanHUDProps> = ({
    currentSpan,
    neuralLoad,
    round,
    totalRounds,
    score,
    visible,
}) => {
    const { colors, fontFamily, fontSize, spacing, borderRadius } = useTheme();

    if (!visible) return null;

    const progressPercent = (round / totalRounds) * 100;

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.container}
        >
            {/* Top Progress Bar (Cyber Violet) */}
            <View
                style={[
                    styles.progressBarContainer,
                    {
                        backgroundColor: colors.glassBorder,
                        borderRadius: 2,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        {
                            backgroundColor: colors.secondary,
                            width: `${progressPercent}%`,
                            borderRadius: 2,
                            shadowColor: colors.secondary,
                            shadowOpacity: 0.6,
                            shadowRadius: 4,
                        },
                    ]}
                />
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, { marginTop: spacing.md }]}>
                {/* Current Span */}
                <View style={styles.statItem}>
                    <View style={styles.statHeader}>
                        <Target size={14} color={colors.primary} strokeWidth={2} />
                        <Text
                            style={[
                                styles.statLabel,
                                {
                                    color: colors.textMuted,
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.xs,
                                    marginLeft: spacing.xs,
                                },
                            ]}
                        >
                            Current Span
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: colors.primary,
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.lg,
                            },
                        ]}
                    >
                        {currentSpan.toFixed(1)}cm
                    </Text>
                </View>

                {/* Neural Load */}
                <View style={styles.statItem}>
                    <View style={styles.statHeader}>
                        <Activity size={14} color={colors.secondary} strokeWidth={2} />
                        <Text
                            style={[
                                styles.statLabel,
                                {
                                    color: colors.textMuted,
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.xs,
                                    marginLeft: spacing.xs,
                                },
                            ]}
                        >
                            Neural Load
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: getNeuralLoadColor(neuralLoad, colors),
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.lg,
                            },
                        ]}
                    >
                        {Math.round(neuralLoad)}%
                    </Text>
                </View>

                {/* Score */}
                <View style={styles.statItem}>
                    <Text
                        style={[
                            styles.statLabel,
                            {
                                color: colors.textMuted,
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.xs,
                            },
                        ]}
                    >
                        Score
                    </Text>
                    <Text
                        style={[
                            styles.statValue,
                            {
                                color: colors.success,
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.lg,
                            },
                        ]}
                    >
                        {score}/{round}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

// Get color based on neural load intensity
const getNeuralLoadColor = (load: number, colors: any) => {
    if (load >= 90) return colors.error;
    if (load >= 70) return colors.warning;
    if (load >= 50) return colors.secondary;
    return colors.primary;
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
    },
    progressBarContainer: {
        width: '100%',
        height: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        shadowOffset: { width: 0, height: 0 },
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        letterSpacing: 0.5,
    },
    statValue: {
        marginTop: 2,
    },
});
