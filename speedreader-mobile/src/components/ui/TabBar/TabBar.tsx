/**
 * Aesthetic Tab Bar - "Floating Icons" Design
 * Ultra-minimal: Transparent background, floating icons, center FAB
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Library, Zap, Dumbbell, User, Book, BookA, BookAIcon, BookDashedIcon, BookMarked, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

    // Center "Read" FAB - floating action button with its own blur
    if (route === 'Read') {
        return (
            <View style={styles.fabContainer}>
                <ScalePressable
                    onPress={onPress}
                    onLongPress={onLongPress}
                    scaleTo={0.88}
                >
                    <View style={styles.fabWrapper}>
                        <BlurView
                            intensity={50}
                            tint={mode === 'dark' ? 'dark' : 'light'}
                            style={styles.fabBlur}
                        />
                        <View
                            style={[
                                styles.fabButton,
                                {
                                    borderWidth: 1,
                                    borderColor: mode === 'dark'
                                        ? 'rgba(255,255,255,0.15)'
                                        : 'rgba(0,0,0,0.08)',
                                }
                            ]}
                        >
                            <TabIcon route={route} isFocused={true} />
                        </View>
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
            {/* Blur background for frosted glass effect */}
            <BlurView
                intensity={40}
                tint={mode === 'dark' ? 'dark' : 'light'}
                style={styles.blurBackground}
            />

            {/* Subtle top border for definition */}
            <View style={[
                styles.topBorder,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
            ]} />

            {/* Subtle gradient fade at bottom for depth */}
            <LinearGradient
                colors={['transparent', mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)']}
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
    blurBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
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
        marginBottom: 8,
    },
    fabWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    fabBlur: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 0.5,
    },
});
