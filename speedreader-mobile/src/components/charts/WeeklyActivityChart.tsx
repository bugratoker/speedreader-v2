import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';

interface WeeklyActivityChartProps {
    data: number[]; // Array of 7 numbers representing minutes read per day
    labels: string[]; // Array of 7 strings representing day names (e.g., 'Mon')
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data, labels }) => {
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 200 });
    const maxVal = Math.max(...data, 60); // Minimum scale of 60 mins if data is lower

    const onLayout = (event: LayoutChangeEvent) => {
        setDimensions({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
        });
    };

    const contentWidth = dimensions.width - (spacing.md * 2);
    // Ensure we don't calculate on invalid width
    const shouldRenderChart = contentWidth > 0;

    const barWidth = shouldRenderChart ? (contentWidth / 7) * 0.6 : 0;
    const gap = shouldRenderChart ? contentWidth / 7 : 0;

    return (
        <View
            style={{
                height: 220,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.glassBorder,
            }}
            onLayout={onLayout}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.text }}>
                    Weekly Activity
                </Text>
                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted }}>
                    Last 7 Days
                </Text>
            </View>

            <View style={{ flex: 1 }}>
                {shouldRenderChart && (
                    <Svg width={contentWidth} height="100%">
                        <Defs>
                            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                                <Stop offset="1" stopColor={colors.primary} stopOpacity="0.6" />
                            </LinearGradient>
                        </Defs>
                        {data.map((value, index) => {
                            const barHeight = (value / maxVal) * (dimensions.height - 60);
                            const x = index * gap + (gap - barWidth) / 2;
                            const y = (dimensions.height - 60) - barHeight;

                            return (
                                <Rect
                                    key={index}
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx={4}
                                    fill="url(#barGradient)"
                                />
                            );
                        })}
                    </Svg>
                )}
            </View>

            {/* Labels Row */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.xs,
                height: 20
            }}>
                {labels.map((label, index) => (
                    <View key={index} style={{ width: gap, alignItems: 'center' }}>
                        <Text style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.textMuted
                        }}>
                            {label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};
