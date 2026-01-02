/**
 * InfoButton Component
 * A small semi-transparent circle with 'i' icon that opens an academic modal
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { ScalePressable } from '../ScalePressable';

interface InfoButtonProps {
    onPress: () => void;
    size?: number;
}

export const InfoButton: React.FC<InfoButtonProps> = ({
    onPress,
    size = 32
}) => {
    const { colors, mode } = useTheme();

    return (
        <ScalePressable onPress={onPress} scaleTo={0.9}>
            <View style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    borderColor: mode === 'dark'
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.08)',
                }
            ]}>
                <Info
                    size={size * 0.5}
                    color={colors.textMuted}
                    strokeWidth={2}
                />
            </View>
        </ScalePressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
