/**
 * Choice Grid - Glassmorphism Answer Selection Cards
 * 
 * Displays 3 choice options. Simplified animations for better UX.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@theme';

interface ChoiceGridProps {
    options: string[];
    correctAnswer: string;
    onSelect: (selected: string, isCorrect: boolean) => void;
    visible: boolean;
    disabled?: boolean;
}

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({
    options,
    correctAnswer,
    onSelect,
    visible,
    disabled = false,
}) => {
    const { colors, fontFamily, fontSize, spacing, borderRadius } = useTheme();

    const handleSelect = async (option: string) => {
        if (disabled) return;
        
        const isCorrect = option === correctAnswer;
        
        if (isCorrect) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        onSelect(option, isCorrect);
    };

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.prompt,
                    {
                        color: colors.textMuted,
                        fontFamily: fontFamily.uiMedium,
                        fontSize: fontSize.sm,
                        marginBottom: spacing.md,
                    },
                ]}
            >
                What did you see?
            </Text>

            <View style={[styles.grid, { gap: spacing.sm }]}>
                {options.map((option, index) => (
                    <Pressable
                        key={`choice-${index}`}
                        onPress={() => handleSelect(option)}
                        disabled={disabled}
                        style={({ pressed }) => [
                            styles.card,
                            {
                                backgroundColor: pressed
                                    ? colors.primaryGlow
                                    : 'rgba(20, 20, 30, 0.9)',
                                borderRadius: borderRadius.lg,
                                borderWidth: 1,
                                borderColor: pressed ? colors.primary : colors.glassBorder,
                                paddingVertical: spacing.md,
                                paddingHorizontal: spacing.lg,
                                transform: [{ scale: pressed ? 0.98 : 1 }],
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                {
                                    color: colors.text,
                                    fontFamily: fontFamily.uiBold,
                                    fontSize: fontSize.md,
                                },
                            ]}
                        >
                            {option}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    prompt: {
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    grid: {
        width: '100%',
        flexDirection: 'column',
    },
    card: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        textAlign: 'center',
        letterSpacing: 1,
    },
});
