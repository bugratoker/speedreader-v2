/**
 * Comprehension Check Modal
 * Displays multiple choice questions during reading
 */

import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, X, AlertCircle, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useTheme } from '@theme';
import type { ComprehensionQuestion } from '@/data/comprehensionContent';

interface ComprehensionModalProps {
    visible: boolean;
    question: ComprehensionQuestion;
    questionNumber: number;
    totalQuestions: number;
    onAnswer: (correct: boolean) => void;
    onClose: () => void;
}

export const ComprehensionModal: React.FC<ComprehensionModalProps> = ({
    visible,
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
    onClose,
}) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (index: number) => {
        if (!submitted) {
            setSelectedIndex(index);
        }
    };

    const handleSubmit = () => {
        if (selectedIndex === null) return;

        const correct = selectedIndex === question.correctIndex;
        setIsCorrect(correct);
        setSubmitted(true);
        onAnswer(correct);
    };

    const handleContinue = () => {
        // Reset state
        setSelectedIndex(null);
        setSubmitted(false);
        setIsCorrect(false);
        onClose();
    };

    const getOptionStyle = (index: number) => {
        if (!submitted) {
            return selectedIndex === index ? 'selected' : 'default';
        }
        if (index === question.correctIndex) {
            return 'correct';
        }
        if (index === selectedIndex && !isCorrect) {
            return 'incorrect';
        }
        return 'default';
    };

    const getOptionColor = (style: string) => {
        switch (style) {
            case 'selected':
                return colors.primary;
            case 'correct':
                return colors.success || '#10b981';
            case 'incorrect':
                return '#ef4444';
            default:
                return colors.glassBorder;
        }
    };

    // Early return if no valid question
    if (!question || !question.options) {
        return null;
    }

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            {visible && (
                <Animated.View entering={FadeIn.duration(150)} style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={submitted ? handleContinue : undefined} />
                    <Animated.View
                        entering={SlideInDown.duration(250)}
                        style={[
                            styles.modalContainer,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.glassBorder,
                            },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor: colors.primaryGlow,
                                    },
                                ]}
                            >
                                <AlertCircle size={16} color={colors.primary} strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                <Text
                                    style={[
                                        styles.headerTitle,
                                        {
                                            fontFamily: fontFamily.uiBold,
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    {t('comprehension.title', { defaultValue: 'Comprehension Check' })}
                                </Text>
                                <Text
                                    style={[
                                        styles.headerSubtitle,
                                        {
                                            fontFamily: fontFamily.uiRegular,
                                            color: colors.textMuted,
                                        },
                                    ]}
                                >
                                    {t('comprehension.progress', {
                                        defaultValue: `Question ${questionNumber} of ${totalQuestions}`,
                                        current: questionNumber,
                                        total: totalQuestions,
                                    })}
                                </Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(questionNumber / totalQuestions) * 100}%`,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        </View>

                        {/* Question */}
                        <ScrollView
                            style={styles.content}
                            contentContainerStyle={{ paddingBottom: spacing.lg }}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text
                                style={[
                                    styles.questionText,
                                    {
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: fontSize.md,
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {question.question}
                            </Text>

                            {/* Options */}
                            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                                {question.options.map((option, index) => {
                                    const optionStyle = getOptionStyle(index);
                                    const borderColor = getOptionColor(optionStyle);
                                    const isSelected = selectedIndex === index;
                                    const showIcon = submitted && (index === question.correctIndex || (index === selectedIndex && !isCorrect));

                                    return (
                                        <Pressable
                                            key={index}
                                            onPress={() => handleSelect(index)}
                                            disabled={submitted}
                                            style={({ pressed }) => [
                                                styles.optionButton,
                                                {
                                                    backgroundColor: isSelected && !submitted
                                                        ? colors.primary + '10'
                                                        : pressed
                                                            ? colors.surface
                                                            : 'transparent',
                                                    borderColor: borderColor,
                                                    borderWidth: optionStyle === 'default' ? 1 : 2,
                                                    opacity: submitted && optionStyle === 'default' ? 0.5 : 1,
                                                },
                                            ]}
                                        >
                                            <View style={styles.optionContent}>
                                                <View
                                                    style={[
                                                        styles.optionLetter,
                                                        {
                                                            backgroundColor:
                                                                optionStyle === 'correct'
                                                                    ? (colors.success || '#10b981') + '20'
                                                                    : optionStyle === 'incorrect'
                                                                        ? '#ef444420'
                                                                        : isSelected
                                                                            ? colors.primary + '20'
                                                                            : colors.surface,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={{
                                                            fontFamily: fontFamily.uiBold,
                                                            fontSize: fontSize.sm,
                                                            color: borderColor,
                                                        }}
                                                    >
                                                        {String.fromCharCode(65 + index)}
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        {
                                                            fontFamily: fontFamily.uiRegular,
                                                            fontSize: fontSize.sm,
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                                {showIcon && (
                                                    <View style={{ marginLeft: spacing.xs }}>
                                                        {index === question.correctIndex ? (
                                                            <Check size={20} color={colors.success || '#10b981'} strokeWidth={2.5} />
                                                        ) : (
                                                            <X size={20} color="#ef4444" strokeWidth={2.5} />
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            {/* Explanation (after submission) */}
                            {submitted && question.explanation && (
                                <View
                                    style={[
                                        styles.explanation,
                                        {
                                            backgroundColor: isCorrect
                                                ? (colors.success || '#10b981') + '15'
                                                : '#ef444415',
                                            borderColor: isCorrect ? colors.success || '#10b981' : '#ef4444',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            fontFamily: fontFamily.uiMedium,
                                            fontSize: fontSize.sm,
                                            color: isCorrect ? colors.success || '#10b981' : '#ef4444',
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        {isCorrect
                                            ? t('comprehension.correct', { defaultValue: '✓ Correct!' })
                                            : t('comprehension.incorrect', { defaultValue: '✗ Incorrect' })}
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: fontFamily.uiRegular,
                                            fontSize: fontSize.sm,
                                            color: colors.text,
                                            lineHeight: fontSize.sm * 1.5,
                                        }}
                                    >
                                        {question.explanation}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Action Button */}
                        <View style={styles.footer}>
                            {!submitted ? (
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={selectedIndex === null}
                                    style={({ pressed }) => [
                                        styles.submitButton,
                                        {
                                            backgroundColor: selectedIndex !== null ? colors.primary : colors.surface,
                                            opacity: pressed ? 0.8 : 1,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            fontFamily: fontFamily.uiBold,
                                            fontSize: fontSize.md,
                                            color: selectedIndex !== null ? '#ffffff' : colors.textMuted,
                                        }}
                                    >
                                        {t('comprehension.submit', { defaultValue: 'Submit Answer' })}
                                    </Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={handleContinue}
                                    style={({ pressed }) => [
                                        styles.submitButton,
                                        {
                                            backgroundColor: colors.primary,
                                            opacity: pressed ? 0.8 : 1,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            fontFamily: fontFamily.uiBold,
                                            fontSize: fontSize.md,
                                            color: '#ffffff',
                                        }}
                                    >
                                        {t('comprehension.continue', { defaultValue: 'Continue Reading' })}
                                    </Text>
                                    <ChevronRight size={20} color="#ffffff" strokeWidth={2.5} />
                                </Pressable>
                            )}
                        </View>
                    </Animated.View>
                </Animated.View>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
        minHeight: 400,
        maxHeight: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
    },
    progressContainer: {
        height: 3,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    content: {
        flexGrow: 1,
        flexShrink: 1,
        paddingHorizontal: 20,
    },
    questionText: {
        lineHeight: 24,
        marginBottom: 4,
    },
    optionButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    optionLetter: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        lineHeight: 20,
    },
    explanation: {
        marginTop: 16,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    footer: {
        padding: 20,
        paddingBottom: 24,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
});
