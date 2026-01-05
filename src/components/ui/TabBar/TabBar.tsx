/**
 * Aesthetic Tab Bar - "Floating Icons" Design
 * Ultra-minimal: Transparent background, floating icons, center FAB
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Library, Zap, Dumbbell, User, Book, BookA, BookAIcon, BookDashedIcon, BookMarked, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily, fontSize, spacing, borderRadius } from '@theme';
import { useTheme } from '@theme';
import { ScalePressable } from '../ScalePressable';

interface TabIconProps {
    route: string;
    isFocused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ route, isFocused }) => {
    const { colors } = useTheme();
    const iconColor = isFocused ? colors.text : colors.textMuted;
    const size = 24;

    const iconProps = {
        size,
        color: iconColor,
        strokeWidth: isFocused ? 2.2 : 1.5,
    };

    switch (route) {
        case 'Home':
            return <Home {...iconProps} />;
        case 'Library':
            return <Library {...iconProps} />;
        case 'Read':
            return <BookOpen size={22} color={isFocused ? colors.primary : colors.text} strokeWidth={2.5} />;
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
    const { colors, mode } = useTheme();

    // Center "Read" FAB - floating action button
    if (route === 'Read') {
        return (
            <View style={styles.fabContainer}>
                <ScalePressable
                    onPress={onPress}
                    onLongPress={onLongPress}
                    scaleTo={0.88}
                >
                    <View
                        style={[
                            styles.fabButton,
                            {
                                backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                            }
                        ]}
                    >
                        <TabIcon route={route} isFocused={true} />
                    </View>
                </ScalePressable>
            </View>
        );
    }

    // Floating icon with subtle glow when active
    return (
        <ScalePressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            scaleTo={0.9}
        >
            <View style={[
                styles.iconButton,
                isFocused && {
                    backgroundColor: mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.02)',
                }
            ]}>
                <TabIcon route={route} isFocused={isFocused} />
            </View>
        </ScalePressable>
    );
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { colors, mode } = useTheme();

    return (
        <View style={styles.container}>
            {/* Subtle gradient fade at bottom for depth */}
            <LinearGradient
                colors={['transparent', mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)']}
                style={styles.gradientFade}
                pointerEvents="none"
            />

            {/* Floating icons row */}
            <View style={styles.tabRow}>
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
    },
    gradientFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        height: 80,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24, // Perfect circle
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabContainer: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 16, // Float above other icons
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28, // Perfect circle
        alignItems: 'center',
        justifyContent: 'center',
        // Elegant shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },
});
