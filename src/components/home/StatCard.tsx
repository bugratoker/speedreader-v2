import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { ScalePressable } from '../ui/ScalePressable';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string; // e.g., "+5%"
    trendType?: 'positive' | 'negative' | 'neutral';
    onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendType = 'neutral', onPress }) => {
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();

    const getTrendColor = () => {
        switch (trendType) {
            case 'positive': return '#10B981'; // Green
            case 'negative': return '#EF4444'; // Red
            default: return colors.textMuted;
        }
    };

    return (
        <ScalePressable
            onPress={onPress}
            style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                flex: 1, // Allow it to fill grid space
                minWidth: '45%', // Ensure 2 per row
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                {icon && <View style={{ opacity: 0.8 }}>{icon}</View>}
                {trend && (
                    <Text style={{
                        fontFamily: fontFamily.uiMedium,
                        fontSize: fontSize.xs,
                        color: getTrendColor()
                    }}>
                        {trend}
                    </Text>
                )}
            </View>

            <Text style={{
                fontFamily: fontFamily.uiBold,
                fontSize: fontSize['2xl'],
                color: colors.text,
                marginTop: spacing.xs
            }}>
                {value}
            </Text>

            <Text style={{
                fontFamily: fontFamily.uiRegular,
                fontSize: fontSize.xs,
                color: colors.textMuted,
                marginTop: 2
            }}>
                {label}
            </Text>
        </ScalePressable>
    );
};
