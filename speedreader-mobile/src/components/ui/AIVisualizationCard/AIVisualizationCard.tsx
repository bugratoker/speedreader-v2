/**
 * AI Visualization Card Component
 * Glassmorphism placeholder for cinematic AI-generated images
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Sparkles, Image as ImageIcon } from 'lucide-react-native';
import { colors, fontFamily, fontSize, spacing, borderRadius, glows } from '@theme';

import { useTranslation } from 'react-i18next';
// ... other imports

export const AIVisualizationCard: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {/* Placeholder gradient background */}
            <View style={styles.imageContainer}>
                <View style={styles.gradientPlaceholder}>
                    <View style={styles.iconContainer}>
                        <ImageIcon size={48} color={colors.secondary} strokeWidth={1} />
                    </View>
                </View>

                {/* Glassmorphism overlay */}
                <View style={styles.glassOverlay}>
                    <View style={styles.aiLabel}>
                        <Sparkles size={14} color={colors.secondary} strokeWidth={2} />
                        <Text style={styles.aiLabelText}>{t('aiCard.label')}</Text>
                    </View>
                    <Text style={styles.overlayTitle}>{t('aiCard.title')}</Text>
                    <Text style={styles.overlaySubtitle}>
                        {t('aiCard.subtitle')}
                    </Text>
                </View>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>{t('aiCard.progress', { current: 245, total: 300 })}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    imageContainer: {
        width: 300,
        height: 200,
        borderRadius: borderRadius.bento,
        overflow: 'hidden',
        position: 'relative',
    },
    gradientPlaceholder: {
        flex: 1,
        backgroundColor: colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.secondaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
        padding: spacing.md,
    },
    aiLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    aiLabelText: {
        fontFamily: fontFamily.uiMedium,
        fontSize: fontSize.xs,
        color: colors.secondary,
        marginLeft: spacing.xs,
    },
    overlayTitle: {
        fontFamily: fontFamily.uiBold,
        fontSize: fontSize.md,
        color: colors.text,
    },
    overlaySubtitle: {
        fontFamily: fontFamily.uiRegular,
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    progressContainer: {
        width: 300,
        marginTop: spacing.sm,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.surface,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        width: '82%',
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 2,
    },
    progressText: {
        fontFamily: fontFamily.uiRegular,
        fontSize: fontSize.xs,
        color: colors.secondary,
        marginTop: spacing.xs,
        textAlign: 'right',
    },
});
