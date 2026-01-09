import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Book, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../theme';

export type LibraryTabType = 'bookshelf' | 'news';

interface LibraryTabsProps {
    activeTab: LibraryTabType;
    onTabChange: (tab: LibraryTabType) => void;
}

interface TabItemProps {
    tabKey: LibraryTabType;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ label, icon, isActive, onPress }) => {
    const { colors, fontFamily, fontSize } = useTheme();

    return (
        <TouchableOpacity
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.tabContent}>
                {icon}
                <Text
                    style={[
                        styles.tabLabel,
                        {
                            fontFamily: isActive ? fontFamily.uiBold : fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: isActive ? colors.primary : colors.textMuted,
                            marginLeft: 8,
                        },
                    ]}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export const LibraryTabs: React.FC<LibraryTabsProps> = ({ activeTab, onTabChange }) => {
    const { colors, borderRadius } = useTheme();
    const indicatorPosition = useSharedValue(activeTab === 'bookshelf' ? 0 : 1);

    const handleTabPress = (tab: LibraryTabType) => {
        if (tab !== activeTab) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            indicatorPosition.value = withSpring(tab === 'bookshelf' ? 0 : 1, {
                damping: 20,
                stiffness: 200,
            });
            onTabChange(tab);
        }
    };

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            left: `${interpolate(indicatorPosition.value, [0, 1], [0, 50])}%`,
        };
    });

    const tabs = [
        {
            key: 'bookshelf' as LibraryTabType,
            label: 'My Bookshelf',
            icon: (
                <Book
                    size={18}
                    color={activeTab === 'bookshelf' ? colors.primary : colors.textMuted}
                    strokeWidth={2}
                />
            ),
        },
        {
            key: 'news' as LibraryTabType,
            label: 'News & Trends',
            icon: (
                <Newspaper
                    size={18}
                    color={activeTab === 'news' ? colors.primary : colors.textMuted}
                    strokeWidth={2}
                />
            ),
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
            {/* Animated Indicator */}
            <Animated.View
                style={[
                    styles.indicator,
                    indicatorStyle,
                    {
                        backgroundColor: colors.primary + '15',
                        borderRadius: borderRadius.lg,
                    },
                ]}
            />

            {/* Tabs */}
            {tabs.map((tab) => (
                <TabItem
                    key={tab.key}
                    tabKey={tab.key}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.key}
                    onPress={() => handleTabPress(tab.key)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 4,
        marginHorizontal: 16,
        marginBottom: 16,
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        width: '50%',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabLabel: {
        textAlign: 'center',
    },
});
