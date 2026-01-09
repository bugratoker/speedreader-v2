import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { LibraryTabs, type LibraryTabType } from '../../components/library/LibraryTabs';
import { BookshelfView, type BookItem } from '../../components/library/BookshelfView';
import { NewsFeed } from '../../components/library/NewsFeed';
import { ImportModal } from '../../components/library/ImportModal';
import { useLibrary } from '../../hooks/useLibrary';

export const LibraryScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<LibraryTabType>('bookshelf');
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    
    const { books, isLoading, refreshBooks } = useLibrary();

    // Transform imported books to BookItem format for BookshelfView
    const bookItems: BookItem[] = useMemo(() => {
        return books.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author || 'Unknown Author',
            coverColor: book.coverColor,
            progress: book.currentPosition.percentage,
            totalWords: book.totalWords,
            currentWord: book.currentPosition.chunkIndex * 10000 + book.currentPosition.wordIndex,
            lastRead: book.lastReadAt 
                ? formatRelativeTime(book.lastReadAt)
                : formatRelativeTime(book.importedAt),
            category: book.currentPosition.percentage > 0 ? 'continue' : 'recent',
        }));
    }, [books]);

    const handleImportPress = () => {
        setIsImportModalVisible(true);
    };

    const handleImportComplete = () => {
        refreshBooks();
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
                        {activeTab === 'bookshelf' 
                            ? `${books.length} ${books.length === 1 ? 'book' : 'books'} in your library`
                            : 'Curated content for speed reading'}
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
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <BookshelfView books={bookItems} onImportPress={handleImportPress} />
                )
            ) : (
                <NewsFeed />
            )}

            {/* Import Modal */}
            <ImportModal
                visible={isImportModalVisible}
                onClose={() => setIsImportModalVisible(false)}
                onImportComplete={handleImportComplete}
            />
        </View>
    );
};

// Helper function to format relative time
function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
