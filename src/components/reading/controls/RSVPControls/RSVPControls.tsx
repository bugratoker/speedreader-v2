/**
 * RSVP Controls Component (v5 - Fixed Gaps & Auto-Resume)
 * Structured flex-based layout with proper spacing and undo auto-resume
 */

import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Plus, Minus, Undo2, RotateCcw } from 'lucide-react-native';
import { fontFamily, fontSize, spacing, borderRadius, glows } from '@theme';
import { useTheme } from '@theme';

export interface RSVPControlsProps {
    wpm: number;
    isPaused: boolean;
    onSpeedUp: () => void;
    onSlowDown: () => void;
    onTogglePause: () => void;
    onUndo?: () => void;
    onReload?: () => void;
    showWpmLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
    canUndo?: boolean;
}

export const RSVPControls: React.FC<RSVPControlsProps> = ({
    wpm,
    isPaused,
    onSpeedUp,
    onSlowDown,
    onTogglePause,
    onUndo,
    onReload,
    showWpmLabel = true,
    size = 'medium',
    canUndo = false,
}) => {
    const { colors, mode } = useTheme();
    const { t } = useTranslation();
    const autoResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const wasPausedBeforeUndoRef = useRef<boolean>(false);

    const sizes = {
        small: { button: 44, pause: 56, icon: 18, pauseIcon: 22, gap: 12 },
        medium: { button: 48, pause: 68, icon: 20, pauseIcon: 26, gap: 16 },
        large: { button: 52, pause: 76, icon: 22, pauseIcon: 28, gap: 20 },
    };

    const s = sizes[size];

    // Clear timer when component unmounts or isPaused changes
    useEffect(() => {
        return () => {
            if (autoResumeTimerRef.current) {
                clearTimeout(autoResumeTimerRef.current);
                autoResumeTimerRef.current = null;
            }
        };
    }, []);

    // Clear timer if user manually changes pause state
    useEffect(() => {
        if (autoResumeTimerRef.current && !wasPausedBeforeUndoRef.current) {
            // User manually interacted, clear the auto-resume
            clearTimeout(autoResumeTimerRef.current);
            autoResumeTimerRef.current = null;
        }
    }, [isPaused]);

    const handleUndo = () => {
        if (!onUndo) return;

        // Clear any existing timer
        if (autoResumeTimerRef.current) {
            clearTimeout(autoResumeTimerRef.current);
            autoResumeTimerRef.current = null;
        }

        // Store current pause state
        wasPausedBeforeUndoRef.current = isPaused;

        // If currently playing, pause it
        if (!isPaused) {
            onTogglePause(); // Pause the reading

            // Set timer to auto-resume after 1 second
            autoResumeTimerRef.current = setTimeout(() => {
                onTogglePause(); // Resume the reading
                autoResumeTimerRef.current = null;
                wasPausedBeforeUndoRef.current = false;
            }, 1000);
        }

        // Call the undo action
        onUndo();
    };

    return (
        <View style={styles.outerContainer}>
            {/* WPM Display at top when enabled */}
            {showWpmLabel && (
                <View style={styles.wpmContainer}>
                    <Text style={[styles.wpmNumber, { fontFamily: fontFamily.uiBold, color: colors.primary }]}>
                        {wpm}
                    </Text>
                    <Text style={[styles.wpmLabel, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                        {t('common.wpm')}
                    </Text>
                </View>
            )}

            {/* Main Controls Row */}
            <View style={styles.controlsRow}>
                {/* Left Secondary Button (Undo) */}
                <View style={styles.sideButtonContainer}>
                    {onUndo ? (
                        <TouchableOpacity
                            onPress={handleUndo}
                            disabled={!canUndo}
                            style={[
                                styles.secondaryButton,
                                {
                                    width: s.button,
                                    height: s.button,
                                    borderRadius: s.button / 2,
                                    backgroundColor: colors.surface,
                                    borderColor: colors.glassBorder,
                                    opacity: canUndo ? 1 : 0.35,
                                },
                            ]}
                            activeOpacity={0.7}
                        >
                            <Undo2 size={s.icon - 2} color={colors.textMuted} strokeWidth={2} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: s.button }} />
                    )}
                </View>

                {/* Center Primary Controls */}
                <View style={styles.primaryControls}>
                    {/* Slow Down */}
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
                                marginHorizontal: s.gap / 2,
                            },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Minus size={s.icon} color={colors.textMuted} strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* Play/Pause - Primary Action */}
                    <TouchableOpacity onPress={onTogglePause} activeOpacity={0.9}>
                        <View
                            style={[
                                styles.pauseButton,
                                {
                                    width: s.pause,
                                    height: s.pause,
                                    borderRadius: s.pause / 2,
                                    backgroundColor: isPaused ? (mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)') : colors.surface,
                                    borderColor: isPaused ? colors.primary : colors.glassBorder,
                                    borderWidth: isPaused ? 1.5 : 1,
                                    marginHorizontal: s.gap / 2,
                                    ...(isPaused ? {} : {}), // Removed glow for consistency with tab bar
                                },
                            ]}
                        >
                            {isPaused ? (
                                <Play size={s.pauseIcon} color={colors.primary} strokeWidth={2.5} fill={colors.primary} />
                            ) : (
                                <Pause size={s.pauseIcon} color={colors.primary} strokeWidth={2.5} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Speed Up */}
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
                                marginHorizontal: s.gap / 2,
                            },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Plus size={s.icon} color={colors.textMuted} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                {/* Right Secondary Button (Reload) */}
                <View style={styles.sideButtonContainer}>
                    {onReload ? (
                        <TouchableOpacity
                            onPress={onReload}
                            style={[
                                styles.secondaryButton,
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
                            <RotateCcw size={s.icon - 2} color={colors.textMuted} strokeWidth={2} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: s.button }} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    wpmContainer: {
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    wpmNumber: {
        fontSize: fontSize.xl,
        lineHeight: fontSize.xl * 1.2,
    },
    wpmLabel: {
        fontSize: fontSize.xs,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 400,
    },
    sideButtonContainer: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseButton: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButton: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
