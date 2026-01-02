import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Library as LibraryIcon } from 'lucide-react-native';
import { useTheme } from '../../theme';

export const LibraryScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
                paddingHorizontal: spacing.md,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <LibraryIcon size={48} color={colors.primary} strokeWidth={1.5} />
            <Text
                style={{
                    fontFamily: fontFamily.uiBold,
                    fontSize: fontSize['2xl'],
                    color: colors.text,
                    marginTop: spacing.md,
                }}
            >
                {t('library.title')}
            </Text>
            <Text
                style={{
                    fontFamily: fontFamily.uiRegular,
                    fontSize: fontSize.md,
                    color: colors.textMuted,
                    marginTop: spacing.xs,
                    textAlign: 'center',
                }}
            >
                {t('library.subtitle')}
            </Text>
        </View>
    );
};
