import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';
import { LucideIcon } from 'lucide-react-native';

interface PremiumButtonProps {
    title: string;
    onPress: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    animatePulse?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    // Optional override for custom colors (e.g., training specific accents)
    customColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PremiumButton: React.FC<PremiumButtonProps> = ({
    title,
    onPress,
    icon: Icon,
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    animatePulse = false,
    disabled = false,
    style,
    textStyle,
    customColor,
}) => {
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();

    // Animations
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (animatePulse && !disabled) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            pulse.value = withTiming(1);
        }
    }, [animatePulse, disabled]);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value * (animatePulse ? pulse.value : 1) }
        ],
    }));

    // Size configuration
    const sizeConfig = {
        sm: { py: spacing.xs, px: spacing.md, text: fontSize.sm, icon: 16 },
        md: { py: spacing.sm, px: spacing.lg, text: fontSize.md, icon: 18 },
        lg: { py: spacing.md, px: spacing.xl, text: fontSize.lg, icon: 20 },
        xl: { py: spacing.lg, px: spacing.xl * 1.5, text: fontSize.xl, icon: 24 },
    };

    const config = sizeConfig[size];

    // Color Logic with explicit return type for LinearGradient
    const getColors = (): [string, string] => {
        if (disabled) return [colors.surfaceElevated, colors.surfaceElevated];
        if (customColor) return [customColor, customColor];

        switch (variant) {
            case 'primary':
                return [colors.primary, colors.primary];
            case 'secondary':
                return [colors.secondary, colors.secondary];
            case 'outline':
            case 'ghost':
                return ['transparent', 'transparent'];
            default:
                return [colors.primary, colors.primary];
        }
    };

    // Cast to any to bypass potential type mismatch with LinearGradient props if needed, 
    // but the tuple return above should satisfy it.
    const bgColors = getColors();

    // Shadow/Glow Logic
    const getShadowStyle = () => {
        if (variant === 'outline' || variant === 'ghost' || disabled) return {};

        const shadowColor = customColor || (variant === 'secondary' ? colors.secondary : colors.primary);

        return {
            shadowColor: shadowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
        };
    };

    const containerStyles: ViewStyle = {
        width: fullWidth ? '100%' : undefined,
        maxWidth: fullWidth ? 320 : undefined,
        alignSelf: fullWidth ? 'center' : undefined,
        borderRadius: borderRadius.xl,
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: variant === 'outline' ? (customColor || colors.primary) : 'transparent',
    };

    return (
        <Animated.View style={[containerStyles, animatedStyle]}>
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[
                    {
                        overflow: 'hidden',
                        borderRadius: borderRadius.xl,
                        ...getShadowStyle(),
                    },
                    style
                ]}
            >
                <LinearGradient
                    colors={bgColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingVertical: config.py,
                        paddingHorizontal: config.px,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabled ? 0.6 : 1,
                    }}
                >
                    {Icon && (
                        <View style={{
                            marginRight: spacing.sm,
                            backgroundColor: (variant === 'primary' || variant === 'secondary' || customColor)
                                ? 'rgba(255,255,255,0.2)'
                                : 'transparent',
                            borderRadius: config.icon,
                            padding: 6,
                        }}>
                            <Icon
                                size={config.icon}
                                color={
                                    (variant === 'primary' || variant === 'secondary' || customColor)
                                        ? colors.white
                                        : (customColor || colors.primary)
                                }
                                fill={
                                    (variant === 'primary' || variant === 'secondary' || customColor)
                                        ? colors.white
                                        : (customColor || colors.primary)
                                }
                            />
                        </View>
                    )}
                    <Text style={[
                        {
                            fontFamily: fontFamily.uiBold,
                            fontSize: config.text,
                            color: (variant === 'primary' || variant === 'secondary' || customColor)
                                ? colors.white
                                : (customColor || colors.primary),
                            letterSpacing: 0.5,
                            textAlign: 'center',
                        },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </LinearGradient>
            </AnimatedPressable>
        </Animated.View>
    );
};
