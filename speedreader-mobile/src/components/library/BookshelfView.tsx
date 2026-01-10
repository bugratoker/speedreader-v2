import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Book, Clock, TrendingUp, Sparkles, Play, ChevronRight, Grid3X3, List, Plus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Types
export interface BookItem {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    progress: number;
    totalWords: number;
    currentWord: number;
    lastRead?: string;
    category: 'continue' | 'recent' | 'recommended';
}

interface BookshelfViewProps {
    books: BookItem[];
    onImportPress?: () => void;
}

type ViewMode = 'list' | 'grid';
type CategoryFilter = 'all' | 'continue' | 'recent' | 'recommended';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Library'>;

export const BookshelfView: React.FC<BookshelfViewProps> = ({ books, onImportPress }) => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

    const categories = [
        { key: 'all' as const, label: t('library.categories.all'), icon: Book },
        { key: 'continue' as const, label: t('library.categories.continue'), icon: Clock },
        { key: 'recent' as const, label: t('library.categories.recent'), icon: TrendingUp },
        { key: 'recommended' as const, label: t('library.categories.recommended'), icon: Sparkles },
    ];

    const filteredBooks = selectedCategory === 'all'
        ? books
        : books.filter(book => book.category === selectedCategory);

    const handleBookPress = (book: BookItem) => {
        navigation.navigate('Read', { bookId: book.id, bookTitle: book.title });
    };

    const renderListCard = (book: BookItem, index: number) => {
        const isInProgress = book.progress > 0;

        return (
            <Animated.View
                key={book.id}
                entering={FadeInDown.delay(index * 80).springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleBookPress(book)}
                    style={[
                        styles.bookCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                            borderRadius: borderRadius.xl,
                        },
                    ]}
                >
                    {/* Book Cover */}
                    <View
                        style={[
                            styles.bookCover,
                            {
                                backgroundColor: book.coverColor,
                                borderRadius: borderRadius.lg,
                            },
                        ]}
                    >
                        <Book size={28} color="white" strokeWidth={1.5} />
                    </View>

                    {/* Book Info */}
                    <View style={styles.bookInfo}>
                        <View>
                            <Text
                                style={[
                                    styles.bookTitle,
                                    {
                                        fontFamily: fontFamily.uiBold,
                                        fontSize: fontSize.lg,
                                        color: colors.text,
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {book.title}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.sm,
                                    color: colors.textMuted,
                                }}
                            >
                                {book.author}
                            </Text>
                        </View>

                        {/* Progress or Actions */}
                        <View style={styles.bottomSection}>
                            {isInProgress ? (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressHeader}>
                                        <Text
                                            style={{
                                                fontFamily: fontFamily.uiBold,
                                                fontSize: 11,
                                                color: colors.primary,
                                            }}
                                        >
                                            {book.progress}%
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: fontFamily.uiRegular,
                                                fontSize: 11,
                                                color: colors.textMuted,
                                            }}
                                        >
                                            {Math.ceil((book.totalWords - book.currentWord) / 300)} min {t('library.remaining')}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            { backgroundColor: colors.surface, borderRadius: 4 },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${book.progress}%`,
                                                    backgroundColor: colors.primary,
                                                    borderRadius: 4,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.statsRow}>
                                    <Clock size={14} color={colors.textMuted} />
                                    <Text
                                        style={{
                                            fontFamily: fontFamily.uiMedium,
                                            fontSize: fontSize.xs,
                                            color: colors.textMuted,
                                        }}
                                    >
                                        {(book.totalWords / 1000).toFixed(0)}k {t('library.words')}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.miniActionButton,
                                    { backgroundColor: isInProgress ? colors.primary + '15' : colors.surface },
                                ]}
                                onPress={() => handleBookPress(book)}
                            >
                                {isInProgress ? (
                                    <Play size={18} color={colors.primary} fill={colors.primary} />
                                ) : (
                                    <ChevronRight size={20} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderGridCard = (book: BookItem, index: number) => {
        return (
            <Animated.View
                key={book.id}
                entering={FadeInDown.delay(index * 60).springify()}
                style={{ width: GRID_CARD_WIDTH }}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleBookPress(book)}
                    style={[
                        styles.gridCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                            borderRadius: borderRadius.xl,
                        },
                    ]}
                >
                    {/* Book Cover */}
                    <View
                        style={[
                            styles.gridBookCover,
                            {
                                backgroundColor: book.coverColor,
                                borderRadius: borderRadius.lg,
                            },
                        ]}
                    >
                        <Book size={32} color="white" strokeWidth={1.5} />
                    </View>

                    {/* Book Info */}
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.sm,
                            color: colors.text,
                            marginTop: 12,
                        }}
                        numberOfLines={2}
                    >
                        {book.title}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                            marginTop: 2,
                        }}
                        numberOfLines={1}
                    >
                        {book.author}
                    </Text>

                    {/* Progress */}
                    {book.progress > 0 && (
                        <View style={[styles.gridProgressBar, { backgroundColor: colors.glassBorder, marginTop: 10 }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${book.progress}%`,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Toolbar */}
            <View style={[styles.toolbar, { paddingHorizontal: spacing.md }]}>
                {/* View Mode Toggle */}
                <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            viewMode === 'list' && { backgroundColor: colors.primary + '20' },
                        ]}
                        onPress={() => setViewMode('list')}
                    >
                        <List size={18} color={viewMode === 'list' ? colors.primary : colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            viewMode === 'grid' && { backgroundColor: colors.primary + '20' },
                        ]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Grid3X3 size={18} color={viewMode === 'grid' ? colors.primary : colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Import Button - Subtle ghost style */}
                <TouchableOpacity
                    style={[
                        styles.importButton,
                        { 
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                            borderWidth: 1,
                            borderRadius: borderRadius.lg,
                        },
                    ]}
                    onPress={onImportPress}
                >
                    <Plus size={16} color={colors.textMuted} strokeWidth={2} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            marginLeft: 6,
                        }}
                    >
                        Import
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Category Filters */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, alignItems: 'center', height: '100%' }}
                >
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.key;
                        return (
                            <TouchableOpacity
                                key={category.key}
                                onPress={() => setSelectedCategory(category.key)}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: isSelected ? colors.primary : 'transparent',
                                        borderColor: isSelected ? colors.primary : colors.glassBorder,
                                        borderWidth: isSelected ? 0 : 1,
                                        borderRadius: 20,
                                        marginRight: index < categories.length - 1 ? 8 : 0,
                                    },
                                ]}
                            >
                                <Icon size={14} color={isSelected ? 'white' : colors.textMuted} strokeWidth={2} />
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: 13,
                                        color: isSelected ? 'white' : colors.textMuted,
                                        marginLeft: 6,
                                    }}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Books List/Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    viewMode === 'list' ? styles.booksList : styles.booksGrid,
                    { paddingHorizontal: spacing.md, paddingBottom: 120 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {filteredBooks.length > 0 ? (
                    viewMode === 'list'
                        ? filteredBooks.map((book, index) => renderListCard(book, index))
                        : filteredBooks.map((book, index) => renderGridCard(book, index))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                            <Book size={32} color={colors.textMuted} strokeWidth={1.5} />
                        </View>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.md,
                                color: colors.text,
                                marginTop: 16,
                            }}
                        >
                            {t('library.empty')}
                        </Text>
                        <TouchableOpacity style={{ marginTop: 8 }} onPress={onImportPress}>
                            <Text style={{ fontFamily: fontFamily.uiBold, color: colors.primary }}>
                                Import Content
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewToggle: {
        flexDirection: 'row',
        padding: 4,
    },
    toggleButton: {
        width: 36,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    importButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 32,
    },
    scrollView: {
        flex: 1,
    },
    booksList: {
        gap: 16,
    },
    booksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    bookCard: {
        width: CARD_WIDTH,
        padding: 16,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 16,
    },
    gridCard: {
        padding: 12,
        borderWidth: 1,
    },
    bookCover: {
        width: 70,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridBookCover: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    bookTitle: {
        marginBottom: 4,
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    progressContainer: {
        flex: 1,
        marginRight: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressBar: {
        height: 6,
        width: '100%',
    },
    gridProgressBar: {
        height: 4,
        width: '100%',
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
