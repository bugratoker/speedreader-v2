import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell } from 'lucide-react-native';
import { useTheme } from '../../theme';

export const TrainingScreen: React.FC = () => {
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
            <Dumbbell size={48} color={colors.secondary} strokeWidth={1.5} />
            <Text
                style={{
                    fontFamily: fontFamily.uiBold,
                    fontSize: fontSize['2xl'],
                    color: colors.text,
                    marginTop: spacing.md,
                }}
            >
                Training Lab
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
                Eye exercises and focus drills
            </Text>
        </View>
    );
};
