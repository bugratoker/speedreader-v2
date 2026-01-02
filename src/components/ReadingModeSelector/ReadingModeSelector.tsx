/**
 * Reading Mode Selector Component
 * Pill tabs for switching between RSVP, Bionic, and Chunking modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Zap, Eye, Layers, Activity } from 'lucide-react-native';
import { ReadingMode, MODE_LABELS } from '../../engine/types';
import { colors, fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export interface ReadingModeSelectorProps {
    currentMode: ReadingMode;
    onModeChange: (mode: ReadingMode) => void;
    disabled?: boolean;
}

const ModeIcon: React.FC<{ mode: ReadingMode; isActive: boolean }> = ({ mode, isActive }) => {
    const color = isActive ? colors.background : colors.textMuted;
    const strokeWidth = isActive ? 2.5 : 2;

    switch (mode) {
        case 'rsvp':
            return <Zap size={14} color={color} strokeWidth={strokeWidth} />;
        case 'bionic':
            return <Eye size={14} color={color} strokeWidth={strokeWidth} />;
        case 'chunk':
            return <Layers size={14} color={color} strokeWidth={strokeWidth} />;
        case 'guided':
            return <Activity size={14} color={color} strokeWidth={strokeWidth} />;
    }
};

const MODES: ReadingMode[] = ['rsvp', 'bionic', 'chunk', 'guided'];

export const ReadingModeSelector: React.FC<ReadingModeSelectorProps> = ({
    currentMode,
    onModeChange,
    disabled = false,
}) => {
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'tr' ? 'tr' : 'en') as 'en' | 'tr';

    return (
        <View style={styles.container}>
            {MODES.map((mode) => {
                const isActive = mode === currentMode;
                const label = MODE_LABELS[mode][lang];

                return (
                    <TouchableOpacity
                        key={mode}
                        onPress={() => !disabled && onModeChange(mode)}
                        activeOpacity={disabled ? 1 : 0.7}
                        style={[
                            styles.tab,
                            isActive && styles.tabActive,
                            disabled && styles.tabDisabled,
                        ]}
                    >
                        <View style={styles.tabContent}>
                            <ModeIcon mode={mode} isActive={isActive} />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    {
                                        color: isActive ? colors.background : colors.textMuted,
                                        fontFamily: isActive ? fontFamily.uiBold : fontFamily.uiMedium,
                                    },
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabDisabled: {
        opacity: 0.5,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabLabel: {
        fontSize: fontSize.sm,
    },
});
