import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Newspaper, Cpu, FlaskConical, TrendingUp, Lightbulb, Clock, Zap, Play } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';

export type NewsCategory = 'all' | 'tech' | 'science' | 'finance' | 'personal-dev';

interface NewsArticle {
    id: string;
    title: string;
    source: string;
    category: NewsCategory;
    readTime: number;
    imageColor: string;
    summary: string;
    publishedAt: string;
}

interface NewsFeedProps {
    onArticlePress?: (articleId: string) => void;
}

const CATEGORIES = [
    { key: 'all' as const, label: 'All', icon: Newspaper },
    { key: 'tech' as const, label: 'Tech', icon: Cpu },
    { key: 'science' as const, label: 'Science', icon: FlaskConical },
    { key: 'finance' as const, label: 'Finance', icon: TrendingUp },
    { key: 'personal-dev' as const, label: 'Growth', icon: Lightbulb },
];

// Professional mock data - curated content examples
const MOCK_ARTICLES: NewsArticle[] = [
    {
        id: '1',
        title: 'The Science of Deep Focus: How Top Performers Achieve Flow State',
        source: 'Harvard Business Review',
        category: 'personal-dev',
        readTime: 4,
        imageColor: '#8A2BE2',
        summary: 'New research reveals the neurological patterns behind sustained concentration and practical techniques to enter flow state more consistently.',
        publishedAt: '2 hours ago',
    },
    {
        id: '2',
        title: 'AI Chips Race Heats Up as New Architectures Challenge NVIDIA',
        source: 'MIT Technology Review',
        category: 'tech',
        readTime: 5,
        imageColor: '#00FFFF',
        summary: 'Emerging semiconductor designs promise 10x efficiency gains for AI workloads, potentially reshaping the competitive landscape.',
        publishedAt: '4 hours ago',
    },
    {
        id: '3',
        title: 'Fusion Energy Breakthrough: First Net-Positive Reaction Sustained',
        source: 'Nature',
        category: 'science',
        readTime: 6,
        imageColor: '#43e97b',
        summary: 'Scientists achieve a major milestone in fusion research, sustaining a net-positive energy reaction for over 5 seconds.',
        publishedAt: '6 hours ago',
    },
    {
        id: '4',
        title: 'The New Psychology of Wealth Building in Uncertain Markets',
        source: 'The Economist',
        category: 'finance',
        readTime: 5,
        imageColor: '#4facfe',
        summary: 'Behavioral economists identify key mental models that differentiate successful long-term investors from the crowd.',
        publishedAt: '8 hours ago',
    },
    {
        id: '5',
        title: 'Speed Reading Techniques Validated by Neuroscience Research',
        source: 'Scientific American',
        category: 'science',
        readTime: 4,
        imageColor: '#f093fb',
        summary: 'Brain imaging studies confirm that trained speed readers process information differently, with enhanced visual cortex activity.',
        publishedAt: '12 hours ago',
    },
];

export const NewsFeed: React.FC<NewsFeedProps> = ({ onArticlePress }) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
    const [refreshing, setRefreshing] = useState(false);

    const filteredArticles = selectedCategory === 'all'
        ? MOCK_ARTICLES
        : MOCK_ARTICLES.filter(article => article.category === selectedCategory);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const renderArticleCard = (article: NewsArticle, index: number) => (
        <Animated.View
            key={article.id}
            entering={FadeInDown.delay(index * 80).springify()}
        >
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onArticlePress?.(article.id)}
                style={[
                    styles.articleCard,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.glassBorder,
                        borderRadius: borderRadius.xl,
                    },
                ]}
            >
                {/* Article Image Placeholder */}
                <View
                    style={[
                        styles.articleImage,
                        {
                            backgroundColor: article.imageColor + '20',
                            borderRadius: borderRadius.lg,
                        },
                    ]}
                >
                    <Newspaper size={24} color={article.imageColor} strokeWidth={1.5} />
                </View>

                {/* Article Content */}
                <View style={styles.articleContent}>
                    {/* Source & Time */}
                    <View style={styles.articleMeta}>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: 11,
                                color: colors.primary,
                            }}
                        >
                            {article.source}
                        </Text>
                        <View style={styles.metaDot} />
                        <Text
                            style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: 11,
                                color: colors.textMuted,
                            }}
                        >
                            {article.publishedAt}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.md,
                            color: colors.text,
                            lineHeight: 22,
                            marginTop: 6,
                        }}
                        numberOfLines={2}
                    >
                        {article.title}
                    </Text>

                    {/* Summary */}
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            lineHeight: 20,
                            marginTop: 6,
                        }}
                        numberOfLines={2}
                    >
                        {article.summary}
                    </Text>

                    {/* Footer */}
                    <View style={styles.articleFooter}>
                        <View style={styles.readTimeContainer}>
                            <Clock size={12} color={colors.textMuted} />
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: 11,
                                    color: colors.textMuted,
                                    marginLeft: 4,
                                }}
                            >
                                {article.readTime} min read
                            </Text>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.quickActionButton,
                                    { backgroundColor: colors.secondary + '15' },
                                ]}
                            >
                                <Zap size={14} color={colors.secondary} />
                                <Text
                                    style={{
                                        fontFamily: fontFamily.uiMedium,
                                        fontSize: 11,
                                        color: colors.secondary,
                                        marginLeft: 4,
                                    }}
                                >
                                    AI Summary
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.playButton,
                                    { backgroundColor: colors.primary + '15' },
                                ]}
                            >
                                <Play size={14} color={colors.primary} fill={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Category Filters */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, alignItems: 'center', height: '100%' }}
                >
                    {CATEGORIES.map((category, index) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.key;
                        return (
                            <TouchableOpacity
                                key={category.key}
                                onPress={() => setSelectedCategory(category.key)}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: isSelected ? colors.secondary : 'transparent',
                                        borderColor: isSelected ? colors.secondary : colors.glassBorder,
                                        borderWidth: isSelected ? 0 : 1,
                                        borderRadius: 20,
                                        marginRight: index < CATEGORIES.length - 1 ? 8 : 0,
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

            {/* Articles List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.articlesList,
                    { paddingHorizontal: spacing.md, paddingBottom: 120 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Header Badge */}
                <Animated.View
                    entering={FadeIn.delay(100)}
                    style={[
                        styles.headerBadge,
                        { backgroundColor: colors.surface, borderColor: colors.glassBorder },
                    ]}
                >
                    <Zap size={14} color={colors.secondary} />
                    <Text
                        style={{
                            fontFamily: fontFamily.uiMedium,
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                            marginLeft: 6,
                        }}
                    >
                        Curated articles • AI-summarized for speed reading
                    </Text>
                </Animated.View>

                {/* Articles */}
                {filteredArticles.map((article, index) => renderArticleCard(article, index))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    articlesList: {
        gap: 16,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    articleCard: {
        flexDirection: 'row',
        padding: 14,
        borderWidth: 1,
        gap: 14,
    },
    articleImage: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    articleContent: {
        flex: 1,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#666',
        marginHorizontal: 6,
    },
    articleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    readTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    playButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
