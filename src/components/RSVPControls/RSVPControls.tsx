/**
 * RSVP Controls Component  
 * Reusable playback controls for RSVP reading
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Play, Pause, Plus, Minus } from 'lucide-react-native';
import { colors, fontFamily, fontSize, spacing, borderRadius, glows } from '../../theme';

export interface RSVPControlsProps {
    wpm: number;
    isPaused: boolean;
    onSpeedUp: () => void;
    onSlowDown: () => void;
    onTogglePause: () => void;
    showWpmLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const RSVPControls: React.FC<RSVPControlsProps> = ({
    wpm,
    isPaused,
    onSpeedUp,
    onSlowDown,
    onTogglePause,
    showWpmLabel = true,
    size = 'medium',
}) => {
    const sizes = {
        small: { button: 40, pause: 52, icon: 18, pauseIcon: 22 },
        medium: { button: 56, pause: 72, icon: 24, pauseIcon: 28 },
        large: { button: 64, pause: 84, icon: 28, pauseIcon: 32 },
    };

    const s = sizes[size];

    return (
        <View style={styles.container}>
            {/* Speed down button */}
            <TouchableOpacity
                onPress={onSlowDown}
                style={[
                    styles.controlButton,
                    {
                        width: s.button,
                        height: s.button,
                        borderRadius: s.button / 2,
                        backgroundColor: colors.surface,
                        borderColor: colors.glassBorder,
                    },
                ]}
                activeOpacity={0.7}
            >
                <Minus size={s.icon} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* WPM Display (optional) */}
            {showWpmLabel && (
                <View style={styles.wpmContainer}>
                    <Text style={[styles.wpmNumber, { fontFamily: fontFamily.uiBold, color: colors.primary }]}>
                        {wpm}
                    </Text>
                    <Text style={[styles.wpmLabel, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                        WPM
                    </Text>
                </View>
            )}

            {/* Pause/Play button */}
            <TouchableOpacity onPress={onTogglePause} activeOpacity={0.9}>
                <View
                    style={[
                        styles.pauseButton,
                        {
                            width: s.pause,
                            height: s.pause,
                            borderRadius: s.pause / 2,
                            backgroundColor: isPaused ? colors.primary : colors.surface,
                            borderColor: colors.glassBorder,
                            ...(isPaused ? glows.primary : {}),
                        },
                    ]}
                >
                    {isPaused ? (
                        <Play size={s.pauseIcon} color={colors.background} strokeWidth={2.5} fill={colors.background} />
                    ) : (
                        <Pause size={s.pauseIcon} color={colors.primary} strokeWidth={2.5} />
                    )}
                </View>
            </TouchableOpacity>

            {/* Speed up button */}
            <TouchableOpacity
                onPress={onSpeedUp}
                style={[
                    styles.controlButton,
                    {
                        width: s.button,
                        height: s.button,
                        borderRadius: s.button / 2,
                        backgroundColor: colors.surface,
                        borderColor: colors.glassBorder,
                    },
                ]}
                activeOpacity={0.7}
            >
                <Plus size={s.icon} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    controlButton: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wpmContainer: {
        alignItems: 'center',
        minWidth: 60,
    },
    wpmNumber: {
        fontSize: fontSize.xl,
    },
    wpmLabel: {
        fontSize: fontSize.xs,
    },
    pauseButton: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
