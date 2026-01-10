/**
 * FontSizeControl.tsx
 * A discrete stepper for precise font control.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, fontFamily, borderRadius, spacing } from '@theme';
import { FONT_SIZES } from '@/engine/settings';

interface FontSizeControlProps {
    currentSize: number;
    onChange: (size: number) => void;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({ currentSize, onChange }) => {
    const { colors } = useTheme();

    // Find the closest index to the current size (in case state is out of sync)
    const currentIndex = FONT_SIZES.findIndex(s => s === currentSize);
    const safeIndex = currentIndex === -1 ? 2 : currentIndex; // Default to 3rd option if not found

    const handleDecrement = () => {
        if (safeIndex > 0) onChange(FONT_SIZES[safeIndex - 1]);
    };

    const handleIncrement = () => {
        if (safeIndex < FONT_SIZES.length - 1) onChange(FONT_SIZES[safeIndex + 1]);
    };

    return (
        <View style={styles.container}>

            {/* Visual Indicator: Small A */}
            <Pressable
                onPress={handleDecrement}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
                disabled={safeIndex === 0}
            >
                <Text style={[styles.iconText, { fontSize: 14, color: safeIndex === 0 ? colors.textMuted : colors.text }]}>
                    A
                </Text>
            </Pressable>

            {/* The Track */}
            <View style={styles.trackContainer}>
                {FONT_SIZES.map((size, index) => {
                    const isActive = index <= safeIndex;
                    const isCurrent = index === safeIndex;

                    return (
                        <Pressable
                            key={size}
                            onPress={() => onChange(size)}
                            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                            style={styles.tickTouchArea}
                        >
                            <View
                                style={[
                                    styles.tick,
                                    {
                                        height: isCurrent ? 24 : 8, // Active is tall, others are short ticks
                                        width: isCurrent ? 4 : 2,
                                        borderRadius: 2,
                                        backgroundColor: isCurrent
                                            ? colors.primary
                                            : isActive
                                                ? colors.text
                                                : colors.glassBorder
                                    }
                                ]}
                            />
                        </Pressable>
                    );
                })}
            </View>

            {/* Visual Indicator: Large A */}
            <Pressable
                onPress={handleIncrement}
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
                disabled={safeIndex === FONT_SIZES.length - 1}
            >
                <Text style={[styles.iconText, { fontSize: 22, fontWeight: 'bold', color: safeIndex === FONT_SIZES.length - 1 ? colors.textMuted : colors.text }]}>
                    A
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        // Removed borders and background to blend with parent card
        height: 56,
    },
    button: {
        width: 44,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontFamily: fontFamily.uiBold, // Use a bold font for the icons
    },
    trackContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        height: '100%',
    },
    tickTouchArea: {
        height: '100%',
        justifyContent: 'center',
        width: 20, // Invisible touch width per tick
        alignItems: 'center',
    },
    tick: {
        // Dimensions handled in render based on active state
    }
});
