/**
 * Reading Mode Selector Component (v5 - Enhanced UX)
 * Dropdown selector for all 5 modes with settings button next to it
 * Features: mode descriptions, better animations, improved visual hierarchy
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Zap, Eye, Layers, Activity, Columns2, Settings, ChevronDown, Check } from 'lucide-react-native';
import { ReadingMode, MODE_LABELS, MODE_DESCRIPTIONS } from '@/engine/types';
import { fontFamily, fontSize, spacing, borderRadius } from '@theme';
import { useTheme } from '@theme';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

export interface ReadingModeSelectorProps {
    currentMode: ReadingMode;
    onModeChange: (mode: ReadingMode) => void;
    disabled?: boolean;
    onSettingsPress?: () => void;
}

const ModeIcon: React.FC<{ mode: ReadingMode; size?: number; color: string; strokeWidth?: number }> = ({
    mode,
    size = 18,
    color,
    strokeWidth = 2
}) => {
    switch (mode) {
        case 'rsvp':
            return <Zap size={size} color={color} strokeWidth={strokeWidth} />;
        case 'bionic':
            return <Eye size={size} color={color} strokeWidth={strokeWidth} />;
        case 'chunk':
            return <Layers size={size} color={color} strokeWidth={strokeWidth} />;
        case 'guided':
            return <Activity size={size} color={color} strokeWidth={strokeWidth} />;
        case 'dual-column':
            return <Columns2 size={size} color={color} strokeWidth={strokeWidth} />;
        default:
            return <Zap size={size} color={color} strokeWidth={strokeWidth} />;
    }
};

const ALL_MODES: ReadingMode[] = ['rsvp', 'bionic', 'chunk', 'guided', 'dual-column'];

export const ReadingModeSelector: React.FC<ReadingModeSelectorProps> = ({
    currentMode,
    onModeChange,
    disabled = false,
    onSettingsPress,
}) => {
    const { colors } = useTheme();
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'tr' ? 'tr' : 'en') as 'en' | 'tr';

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const currentLabel = MODE_LABELS[currentMode][lang];

    return (
        <View style={styles.container}>
            {/* Mode Dropdown */}
            <TouchableOpacity
                onPress={() => !disabled && setDropdownVisible(true)}
                disabled={disabled}
                style={[
                    styles.dropdown,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.glassBorder,
                        opacity: disabled ? 0.5 : 1,
                        flex: 1,
                    },
                ]}
                activeOpacity={0.7}
            >
                <ModeIcon mode={currentMode} color={colors.primary} />
                <Text
                    style={{
                        fontFamily: fontFamily.uiMedium,
                        fontSize: fontSize.md,
                        color: colors.text,
                        flex: 1,
                        marginLeft: spacing.sm,
                    }}
                >
                    {currentLabel}
                </Text>
                <ChevronDown size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Settings Button */}
            {onSettingsPress && (
                <TouchableOpacity
                    onPress={onSettingsPress}
                    style={[
                        styles.settingsButton,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                        },
                    ]}
                    activeOpacity={0.7}
                >
                    <Settings
                        size={20}
                        color={colors.textMuted}
                        strokeWidth={2}
                    />
                </TouchableOpacity>
            )}

            {/* Enhanced Dropdown Modal */}
            <Modal
                visible={dropdownVisible}
                transparent
                animationType="none"
                onRequestClose={() => setDropdownVisible(false)}
            >
                {dropdownVisible && (
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={styles.modalOverlay}
                    >
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => setDropdownVisible(false)}
                        />
                        <Animated.View
                            entering={SlideInDown.duration(250)}
                            exiting={SlideOutDown.duration(150)}
                            style={[
                                styles.dropdownMenu,
                                {
                                    backgroundColor: colors.surfaceElevated,
                                    borderColor: colors.glassBorder,
                                },
                            ]}
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={[
                                    styles.modalTitle,
                                    {
                                        fontFamily: fontFamily.uiBold,
                                        color: colors.text
                                    }
                                ]}>
                                    Reading Modes
                                </Text>
                                <Text style={[
                                    styles.modalSubtitle,
                                    {
                                        fontFamily: fontFamily.uiRegular,
                                        color: colors.textMuted
                                    }
                                ]}>
                                    Choose your preferred reading style
                                </Text>
                            </View>

                            {/* Mode Options */}
                            <ScrollView
                                style={styles.modesContainer}
                                showsVerticalScrollIndicator={false}
                            >
                                {ALL_MODES.map((mode) => {
                                    const isActive = mode === currentMode;
                                    const label = MODE_LABELS[mode][lang];
                                    const description = MODE_DESCRIPTIONS[mode][lang];

                                    return (
                                        <View key={mode}>
                                            <Pressable
                                                onPress={() => {
                                                    onModeChange(mode);
                                                    setDropdownVisible(false);
                                                }}
                                                style={({ pressed }) => [
                                                    styles.modeCard,
                                                    {
                                                        backgroundColor: isActive
                                                            ? colors.primary + '15'
                                                            : pressed
                                                                ? colors.surface
                                                                : 'transparent',
                                                        borderColor: isActive
                                                            ? colors.primary
                                                            : 'transparent',
                                                        borderWidth: isActive ? 2 : 0,
                                                    },
                                                ]}
                                            >
                                                <View style={styles.modeCardContent}>
                                                    {/* Icon Container */}
                                                    <View style={[
                                                        styles.iconContainer,
                                                        {
                                                            backgroundColor: isActive
                                                                ? colors.primary + '20'
                                                                : colors.surface,
                                                        }
                                                    ]}>
                                                        <ModeIcon
                                                            mode={mode}
                                                            color={isActive ? colors.primary : colors.textMuted}
                                                            size={22}
                                                            strokeWidth={2.5}
                                                        />
                                                    </View>

                                                    {/* Text Content */}
                                                    <View style={styles.modeTextContent}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={[
                                                                styles.modeLabel,
                                                                {
                                                                    fontFamily: isActive ? fontFamily.uiBold : fontFamily.uiMedium,
                                                                    color: isActive ? colors.primary : colors.text,
                                                                }
                                                            ]}
                                                        >
                                                            {label}
                                                        </Text>
                                                        <Text
                                                            numberOfLines={2}
                                                            style={[
                                                                styles.modeDescription,
                                                                {
                                                                    fontFamily: fontFamily.uiRegular,
                                                                    color: colors.textMuted,
                                                                }
                                                            ]}
                                                        >
                                                            {description}
                                                        </Text>
                                                    </View>

                                                    {/* Active Indicator */}
                                                    {isActive && (
                                                        <View style={[
                                                            styles.checkmarkContainer,
                                                            { backgroundColor: colors.primary }
                                                        ]}>
                                                            <Check
                                                                size={16}
                                                                color="#ffffff"
                                                                strokeWidth={3}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            </Pressable>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </Animated.View>
                    </Animated.View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'stretch',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        minHeight: 52,
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        minHeight: 52,
        minWidth: 52,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '100%',
        maxHeight: '80%',
        borderTopLeftRadius: borderRadius.bento,
        borderTopRightRadius: borderRadius.bento,
        borderWidth: 1,
        paddingBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 16,
    },
    modalHeader: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: spacing.sm,
    },
    modalTitle: {
        fontSize: 22,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: 13,
    },
    modesContainer: {
        paddingHorizontal: spacing.md,
    },
    modeCard: {
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    modeCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeTextContent: {
        flex: 1,
        gap: spacing.xs - 2,
    },
    modeLabel: {
        fontSize: 17,
        lineHeight: 20,
    },
    modeDescription: {
        fontSize: 13,
        lineHeight: 17,
    },
    checkmarkContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
});
