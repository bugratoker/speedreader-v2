import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { User, Globe } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { LanguageSelector } from '../../components/LanguageSelector';

export const ProfileScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();
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
                {/* Profile Header */}
                <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: colors.surface,
                            borderWidth: 2,
                            borderColor: colors.secondary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...glows.secondarySubtle,
                        }}
                    >
                        <User size={40} color={colors.secondary} strokeWidth={1.5} />
                    </View>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize['2xl'],
                            color: colors.text,
                            marginTop: spacing.md,
                        }}
                    >
                        {t('profile.title')}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.md,
                            color: colors.textMuted,
                            marginTop: spacing.xs,
                        }}
                    >
                        {t('profile.subtitle')}
                    </Text>
                </View>

                {/* Settings Section */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.md,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginBottom: spacing.md,
                        }}
                    >
                        SETTINGS
                    </Text>

                    {/* Language Setting */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: spacing.sm,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                            <Globe size={20} color={colors.textMuted} />
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.md,
                                    color: colors.text,
                                }}
                            >
                                Language
                            </Text>
                        </View>
                        <LanguageSelector />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
