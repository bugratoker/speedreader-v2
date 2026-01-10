import React from 'react';
import { useTheme } from '@theme';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, WithSpringConfig } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ScalePressableProps extends PressableProps {
    children: React.ReactNode;
    scaleTo?: number;
    haptic?: boolean;
    style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScalePressable: React.FC<ScalePressableProps> = ({
    children,
    scaleTo = 0.96,
    haptic = true,
    style,
    onPress,
    disabled,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
        if (haptic && !disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedPressable>
    );
};
