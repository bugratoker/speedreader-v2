import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
}

const variantStyles = {
    primary: { button: { backgroundColor: colors.primary }, text: { color: colors.background } },
    secondary: { button: { backgroundColor: colors.secondary }, text: { color: colors.white } },
    outline: { button: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary }, text: { color: colors.primary } },
    ghost: { button: { backgroundColor: 'transparent' }, text: { color: colors.primary } },
};

const sizeStyles = {
    sm: { button: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }, text: { fontSize: fontSize.sm } },
    md: { button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }, text: { fontSize: fontSize.md } },
    lg: { button: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }, text: { fontSize: fontSize.lg } },
};

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    style,
    ...props
}) => {
    const isDisabled = disabled || loading;

    const buttonStyles: ViewStyle[] = [
        styles.base,
        variantStyles[variant].button,
        sizeStyles[size].button,
        fullWidth ? styles.fullWidth : undefined,
        isDisabled ? styles.disabled : undefined,
        style as ViewStyle,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        variantStyles[variant].text,
        sizeStyles[size].text,
        isDisabled ? styles.disabledText : undefined,
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            style={buttonStyles}
            disabled={isDisabled}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.bento,
    },
    text: {
        fontWeight: fontWeight.semibold,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.5,
    },
});
