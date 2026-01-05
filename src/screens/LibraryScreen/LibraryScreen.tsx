import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Book, Clock, TrendingUp, Sparkles, Search, SlidersHorizontal, Play, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Mock data types
interface BookItem {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    progress: number; // 0-100
    totalWords: number;
    currentWord: number;
    lastRead?: string;
    category: 'continue' | 'recent' | 'recommended';
}

// Mock library data
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

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Library'>;

export const LibraryScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'continue' | 'recent' | 'recommended'>('all');

    const categories = [
        { key: 'all' as const, label: t('library.categories.all'), icon: Book },
        { key: 'continue' as const, label: t('library.categories.continue'), icon: Clock },
        { key: 'recent' as const, label: t('library.categories.recent'), icon: TrendingUp },
        { key: 'recommended' as const, label: t('library.categories.recommended'), icon: Sparkles },
    ];

    const filteredBooks = selectedCategory === 'all'
        ? MOCK_BOOKS
        : MOCK_BOOKS.filter(book => book.category === selectedCategory);

    const handleBookPress = (book: BookItem) => {
        // Navigate to Read screen
        // TODO: Pass book data to ReadScreen to load specific content
        navigation.navigate('Read');
    };

    const renderBookCard = (book: BookItem, index: number) => {
        const isInProgress = book.progress > 0;

        return (
            <Animated.View
                key={book.id}
                entering={FadeInDown.delay(index * 100).springify()}
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
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
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
                                shadowColor: book.coverColor,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
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
                                        lineHeight: 24,
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {book.title}
                            </Text>
                            <Text
                                style={[
                                    styles.bookAuthor,
                                    {
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: fontSize.sm,
                                        color: colors.textMuted,
                                    },
                                ]}
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
                                            {
                                                backgroundColor: '#f0f0f0', // Fallback for surfaceAlt
                                                borderRadius: 4,
                                            },
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

                            {/* Action Icon */}
                            <TouchableOpacity
                                style={[
                                    styles.miniActionButton,
                                    {
                                        backgroundColor: isInProgress ? colors.primary + '15' : '#f0f0f0', // Fallback for surfaceAlt
                                    }
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
                        {t('library.subtitle')}
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

            {/* Category Filters - Compact & Styled */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: spacing.md,
                        alignItems: 'center',
                        height: '100%'
                    }}
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
                                <Icon
                                    size={14}
                                    color={isSelected ? 'white' : colors.textMuted}
                                    strokeWidth={2}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.categoryText,
                                        {
                                            fontFamily: fontFamily.uiMedium,
                                            fontSize: 13,
                                            color: isSelected ? 'white' : colors.textMuted,
                                            marginLeft: 6,
                                        },
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Books List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.booksList,
                    {
                        paddingHorizontal: spacing.md,
                        paddingBottom: 120, // Space for tab bar
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(renderBookCard)
                ) : (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                            <Book size={32} color={colors.textMuted} strokeWidth={1.5} />
                        </View>
                        <Text
                            style={[
                                styles.emptyText,
                                {
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.md,
                                    color: colors.text,
                                    marginTop: 16,
                                },
                            ]}
                        >
                            {t('library.empty')}
                        </Text>
                        <TouchableOpacity style={{ marginTop: 8 }}>
                            <Text style={{ fontFamily: fontFamily.uiBold, color: colors.primary }}>
                                Browse Catalog
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
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 32,
    },
    categoryText: {
        fontSize: 12,
    },
    scrollView: {
        flex: 1,
    },
    booksList: {
        gap: 16,
    },
    bookCard: {
        width: CARD_WIDTH,
        padding: 16,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 16,
    },
    bookCover: {
        width: 70,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    bookTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
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
    emptyText: {
        fontSize: 16,
    },
});
