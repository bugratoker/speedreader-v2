import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, borderRadius, fontFamily, fontSize, glows } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
            }}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
            >
                {/* Header */}
                <View style={{ paddingVertical: spacing.lg }}>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize['3xl'],
                            color: colors.text,
                        }}
                    >
                        {t('home.title')}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.md,
                            color: colors.textMuted,
                            marginTop: spacing.xs,
                        }}
                    >
                        {t('home.subtitle')}
                    </Text>
                </View>

                {/* Bento Box Card Example */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.lg,
                        marginTop: spacing.md,
                        ...glows.primarySubtle,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.reading,
                            fontSize: fontSize.readingLg,
                            color: colors.text,
                            lineHeight: fontSize.readingLg * 1.8,
                        }}
                    >
                        {t('home.welcomeCard')}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginTop: spacing.sm,
                        }}
                    >
                        {t('home.features')}
                    </Text>
                </View>

                {/* Secondary Card */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.lg,
                        marginTop: spacing.md,
                        ...glows.secondarySubtle,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.lg,
                            color: colors.secondary,
                        }}
                    >
                        {t('home.aiFeatures')}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginTop: spacing.xs,
                        }}
                    >
                        {t('home.aiDescription')}
                    </Text>
                </View>

                {/* Progress Bar Example */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.lg,
                        marginTop: spacing.md,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginBottom: spacing.sm,
                        }}
                    >
                        {t('home.readingProgress')}
                    </Text>
                    <View
                        style={{
                            height: 8,
                            backgroundColor: colors.surfaceElevated,
                            borderRadius: borderRadius.full,
                            overflow: 'hidden',
                        }}
                    >
                        <View
                            style={{
                                width: '65%',
                                height: '100%',
                                backgroundColor: colors.primary,
                                borderRadius: borderRadius.full,
                            }}
                        />
                    </View>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.primary,
                            marginTop: spacing.xs,
                        }}
                    >
                        650 / 1000 {t('common.words')} • 350 {t('common.wpm')}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};
