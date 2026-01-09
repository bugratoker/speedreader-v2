import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { LibraryTabs, type LibraryTabType } from '../../components/library/LibraryTabs';
import { BookshelfView, type BookItem } from '../../components/library/BookshelfView';
import { NewsFeed } from '../../components/library/NewsFeed';

// Mock library data - will be moved to store later
const MOCK_BOOKS: BookItem[] = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        coverColor: '#667eea',
        progress: 45,
        totalWords: 89000,
        currentWord: 40050,
        lastRead: '2 hours ago',
        category: 'continue',
    },
    {
        id: '2',
        title: 'Deep Work',
        author: 'Cal Newport',
        coverColor: '#f093fb',
        progress: 78,
        totalWords: 67000,
        currentWord: 52260,
        lastRead: 'Yesterday',
        category: 'continue',
    },
    {
        id: '3',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        coverColor: '#4facfe',
        progress: 12,
        totalWords: 54000,
        currentWord: 6480,
        lastRead: '3 days ago',
        category: 'recent',
    },
    {
        id: '4',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        coverColor: '#43e97b',
        progress: 0,
        totalWords: 175000,
        currentWord: 0,
        category: 'recommended',
    },
    {
        id: '5',
        title: 'Range: Why Generalists Triumph',
        author: 'David Epstein',
        coverColor: '#fa709a',
        progress: 0,
        totalWords: 98000,
        currentWord: 0,
        category: 'recommended',
    },
    {
        id: '6',
        title: 'The Power of Now',
        author: 'Eckhart Tolle',
        coverColor: '#fee140',
        progress: 0,
        totalWords: 71000,
        currentWord: 0,
        category: 'recommended',
    },
];

export const LibraryScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<LibraryTabType>('bookshelf');

    const handleImportPress = () => {
        // TODO: Open import modal
        console.log('Import pressed');
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    paddingTop: insets.top,
                },
            ]}
        >
            {/* Subtle Gradient glows */}
            <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow, opacity: 0.1 }]} />
            <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow, opacity: 0.1 }]} />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
                <View>
                    <Text
                        style={[
                            styles.title,
                            {
                                fontFamily: fontFamily.uiBold,
                                fontSize: 28,
                                color: colors.text,
                            },
                        ]}
                    >
                        {t('library.title')}
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            {
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.sm,
                                color: colors.textMuted,
                            },
                        ]}
                    >
                        {activeTab === 'bookshelf' ? t('library.subtitle') : 'Curated content for speed reading'}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]}>
                        <Search size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]}>
                        <SlidersHorizontal size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Navigation */}
            <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            {activeTab === 'bookshelf' ? (
                <BookshelfView books={MOCK_BOOKS} onImportPress={handleImportPress} />
            ) : (
                <NewsFeed />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTopRight: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    glowBottomLeft: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
    },
});
