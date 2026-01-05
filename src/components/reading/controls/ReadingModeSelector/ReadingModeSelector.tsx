/**
 * Reading Mode Selector Component (v4 - With Settings)
 * Dropdown selector for all 5 modes with settings button next to it
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Zap, Eye, Layers, Activity, Columns2, Settings, ChevronDown } from 'lucide-react-native';
import { ReadingMode, MODE_LABELS } from '@/engine/types';
import { fontFamily, fontSize, spacing, borderRadius } from '@theme';
import { useTheme } from '@theme';

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

            {/* Dropdown Modal */}
            <Modal
                visible={dropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownMenu,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.glassBorder,
                            },
                        ]}
                    >
                        {ALL_MODES.map((mode) => {
                            const isActive = mode === currentMode;
                            const label = MODE_LABELS[mode][lang];

                            return (
                                <Pressable
                                    key={mode}
                                    onPress={() => {
                                        onModeChange(mode);
                                        setDropdownVisible(false);
                                    }}
                                    style={({ pressed }) => [
                                        styles.dropdownItem,
                                        {
                                            backgroundColor: pressed
                                                ? colors.primaryGlow
                                                : isActive
                                                    ? colors.primary + '20'
                                                    : 'transparent',
                                        },
                                    ]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={isActive ? {
                                            shadowColor: colors.primary,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.6,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        } : {}}>
                                            <ModeIcon
                                                mode={mode}
                                                color={isActive ? colors.primary : colors.text}
                                                size={20}
                                            />
                                        </View>
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                fontFamily: isActive ? fontFamily.uiBold : fontFamily.uiMedium,
                                                fontSize: 18,
                                                color: isActive ? colors.primary : colors.text,
                                                marginLeft: spacing.sm,
                                            }}
                                        >
                                            {label}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'stretch', // Changed to stretch for equal heights
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2, // Matched height
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        minHeight: 52, // Explicit height
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        minHeight: 52, // Same as dropdown
        minWidth: 52, // Square button
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    dropdownMenu: {
        width: '90%',
        minWidth: 320,
        maxWidth: 400,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
});
