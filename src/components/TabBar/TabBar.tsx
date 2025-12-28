/**
 * Custom Tab Bar Component
 * Features: Deep Nebula styling, center action button with glow
 * Note: Using basic animations compatible with Expo Go
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Library, Zap, Dumbbell, User } from 'lucide-react-native';
import { colors, spacing, borderRadius, glows } from '../../theme';

interface TabIconProps {
    route: string;
    isFocused: boolean;
    size?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ route, isFocused, size = 24 }) => {
    const iconColor = isFocused ? colors.primary : colors.textMuted;

    const iconProps = {
        size,
        color: iconColor,
        strokeWidth: isFocused ? 2.5 : 2,
    };

    switch (route) {
        case 'Home':
            return <Home {...iconProps} />;
        case 'Library':
            return <Library {...iconProps} />;
        case 'Read':
            return <Zap size={28} color={colors.background} strokeWidth={2.5} />;
        case 'Training':
            return <Dumbbell {...iconProps} />;
        case 'Profile':
            return <User {...iconProps} />;
        default:
            return <Home {...iconProps} />;
    }
};

interface TabItemProps {
    route: string;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ route, isFocused, onPress, onLongPress }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Center "Read" button with special styling
    if (route === 'Read') {
        return (
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.centerButton}
                activeOpacity={0.8}
            >
                <Animated.View style={[styles.centerButtonInner, { transform: [{ scale: scaleAnim }] }]}>
                    <TabIcon route={route} isFocused={true} />
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabItem}
            activeOpacity={0.7}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TabIcon route={route} isFocused={isFocused} />
            </Animated.View>
            {isFocused && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
    );
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabItem
                            key={route.key}
                            route={route.name}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.bento,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        height: 64,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.sm,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
    centerButton: {
        marginTop: -30,
        zIndex: 10,
    },
    centerButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...glows.primary,
    },
});
