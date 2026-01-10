import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../theme';

interface SpeedProgressChartProps {
    data: number[]; // Array of WPM values
    labels: string[]; // Array of dates or labels
}

export const SpeedProgressChart: React.FC<SpeedProgressChartProps> = ({ data, labels }) => {
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 200 });

    const onLayout = (event: LayoutChangeEvent) => {
        setDimensions({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
        });
    };

    const maxVal = Math.max(...data, 100);
    const minVal = Math.min(...data, 0);
    const range = maxVal - minVal || 1;

    // Chart area dimensions
    const chartHeight = dimensions.height - 60;
    const chartWidth = dimensions.width - (spacing.md * 2);
    const shouldRenderChart = chartWidth > 0;

    // Calculate points
    const points = shouldRenderChart ? data.map((value, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((value - minVal) / range) * chartHeight;
        return { x, y, value };
    }) : [];

    // Generate Path Data (Simple Line for now, could be smoothed)
    const linePath = points.length > 0 ? points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') : "";

    // Area Path
    const areaPath = linePath ? `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : "";

    return (
        <View
            style={{
                height: 220,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                marginTop: spacing.md
            }}
            onLayout={onLayout}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.md, color: colors.text }}>
                    Reading Speed (WPM)
                </Text>
                <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.xl, color: colors.primary }}>
                    {data[data.length - 1]} <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>wpm</Text>
                </Text>
            </View>

            <View style={{ flex: 1 }}>
                {shouldRenderChart && (
                    <Svg width={chartWidth} height={chartHeight}>
                        <Defs>
                            <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.secondary} stopOpacity="0.4" />
                                <Stop offset="1" stopColor={colors.secondary} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>

                        {/* Area Fill */}
                        <Path d={areaPath} fill="url(#lineGradient)" />

                        {/* Line Stroke */}
                        <Path d={linePath} stroke={colors.secondary} strokeWidth="3" fill="none" />

                        {/* Data Points */}
                        {points.map((p, i) => (
                            <Circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill={colors.background}
                                stroke={colors.secondary}
                                strokeWidth="2"
                            />
                        ))}
                    </Svg>
                )}
            </View>
            {/* Labels Row */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.xs,
            }}>
                {labels.map((label, index) => (
                    // Only show first, middle, and last label to avoid crowding if many points
                    (index === 0 || index === labels.length - 1 || index === Math.floor(labels.length / 2)) && (
                        <Text key={index} style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                            // Adjust alignment based on position
                            textAlign: index === 0 ? 'left' : index === labels.length - 1 ? 'right' : 'center',
                            width: 40
                        }}>
                            {label}
                        </Text>
                    )
                ))}
            </View>
        </View>
    );
};
