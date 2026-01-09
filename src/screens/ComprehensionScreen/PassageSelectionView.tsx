/**
 * Reading Selection View
 * Enhanced UI with categories, today's text, completed status, and AI generation
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Clock, HelpCircle, Shuffle, Sparkles, Star, Check, X, Brain, Lightbulb, Atom, Monitor, Type, Play, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 16; // Parent padding
const GAP = 12;
// Adjust calc: Parent (32) + Gap (12) = 44. Width = (Screen - 44) / 2
const CARD_WIDTH = (SCREEN_WIDTH - 32 - GAP) / 2;
const STORAGE_KEY = '@completed_readings';

// Categories for filtering
const CATEGORIES = [
    { id: 'all', icon: null, labelKey: 'comprehension.categories.all' },
    { id: 'science', icon: Atom, labelKey: 'comprehension.categories.science' },
    { id: 'psychology', icon: Brain, labelKey: 'comprehension.categories.psychology' },
    { id: 'technology', icon: Monitor, labelKey: 'comprehension.categories.technology' },
];

interface ReadingInfo {
    title: string;
    wordCount: number;
    questionCount: number;
    category?: string;
    generated?: boolean;
}

interface ReadingSelectionViewProps {
    readings: ReadingInfo[];
    userWpm?: number;
    onSelectReading: (index: number) => void;
    onRandomReading: () => void;
    onAIGenerate?: (reading: ReadingInfo) => void;
}

export const PassageSelectionView: React.FC<ReadingSelectionViewProps> = ({
    readings,
    userWpm = 250,
    onSelectReading,
    onRandomReading,
    onAIGenerate,
}) => {
    const { t } = useTranslation();
    const { colors, fontFamily } = useTheme();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [completedReadings, setCompletedReadings] = useState<string[]>([]);

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiLoading, setAILoading] = useState(false);
    const [customTopic, setCustomTopic] = useState('');
    const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');

    // Load completed readings from storage
    useEffect(() => {
        loadCompletedReadings();
    }, []);

    const loadCompletedReadings = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCompletedReadings(JSON.parse(stored));
            }
        } catch (e) {
            console.log('Error loading completed readings');
        }
    };

    const isCompleted = (index: number) => completedReadings.includes(`reading-${index}`);

    // Get today's reading based on date
    const getTodaysReadingIndex = () => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return dayOfYear % readings.length;
    };

    const todaysIndex = getTodaysReadingIndex();

    // Filter readings by category
    const filteredReadings = readings.filter((reading, index) => {
        if (selectedCategory === 'all') return true;
        // For now, assign category based on index (can be enhanced with actual category data)
        const categories = ['science', 'psychology', 'technology'];
        const category = categories[index % categories.length];
        return category === selectedCategory;
    });

    const getReadingTime = (wordCount: number): string => {
        const minutes = Math.ceil(wordCount / userWpm);
        return `${minutes} min`;
    };

    const getDifficulty = (wordCount: number): { label: string; color: string } => {
        if (wordCount < 300) {
            return { label: t('comprehension.difficulty.short', { defaultValue: 'Short' }), color: colors.success || '#4CAF50' };
        } else if (wordCount < 500) {
            return { label: t('comprehension.difficulty.medium', { defaultValue: 'Medium' }), color: colors.warning || '#FF9800' };
        } else {
            return { label: t('comprehension.difficulty.long', { defaultValue: 'Long' }), color: colors.error || '#f44336' };
        }
    };

    // Handle AI generation with mock data
    const handleAIGenerate = async () => {
        if (!customTopic.trim()) return;

        setAILoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock length multipliers
        const lengthMultipliers = {
            short: 250,
            medium: 500,
            long: 850
        };

        // Mock generated reading
        const mockReading: ReadingInfo = {
            title: `AI: ${customTopic}`,
            wordCount: lengthMultipliers[selectedLength],
            questionCount: selectedLength === 'short' ? 3 : selectedLength === 'medium' ? 5 : 7,
            category: 'AI Generated',
            generated: true,
        };

        setAILoading(false);
        setShowAIModal(false);
        // Reset form
        setCustomTopic('');
        setSelectedLength('medium');

        if (onAIGenerate) {
            onAIGenerate(mockReading);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <Pressable
                        onPress={onRandomReading}
                        style={({ pressed }) => [
                            styles.actionButton,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.glassBorder,
                                borderWidth: 1,
                                opacity: pressed ? 0.9 : 1,
                            }
                        ]}
                    >
                        <Shuffle size={20} color={colors.text} strokeWidth={2} />
                        <Text style={[styles.actionButtonText, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                            {t('comprehension.random', { defaultValue: 'Random' })}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setShowAIModal(true)}
                        style={({ pressed }) => [
                            styles.actionButton,
                            {
                                backgroundColor: colors.primary,
                                opacity: pressed ? 0.9 : 1,
                                shadowColor: colors.primary,
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 4,
                            }
                        ]}
                    >
                        <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                        <Text style={[styles.actionButtonText, { fontFamily: fontFamily.uiBold, color: '#fff' }]}>
                            {t('comprehension.aiGenerate', { defaultValue: 'Generate' })}
                        </Text>
                    </Pressable>
                </View>

                {/* Today's Reading */}
                {readings[todaysIndex] && (
                    <Pressable
                        onPress={() => onSelectReading(todaysIndex)}
                        style={({ pressed }) => [
                            styles.todayCardWrapper,
                            {
                                transform: [{ scale: pressed ? 0.99 : 1 }],
                                elevation: 4, // Reduced elevation
                                shadowColor: colors.primary,
                                shadowOpacity: 0.15, // Reduced opacity
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 },
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.primary, '#1a1a1a']} // Gradient from primary to dark
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.todayCardGradient}
                        >
                            {/* Shiny Effect Overlay */}
                            <View style={styles.shineOverlay} />

                            <View style={styles.todayHeader}>
                                <View style={styles.todayBadge}>
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Star size={14} color="#fff" strokeWidth={2.5} fill="rgba(255,255,255,0.2)" />
                                    </View>
                                    <Text style={[styles.todayLabel, { fontFamily: fontFamily.uiBold, color: 'rgba(255,255,255,0.8)' }]}>
                                        {t('comprehension.todaysReading', { defaultValue: "Today's Reading" })}
                                    </Text>
                                </View>
                                {isCompleted(todaysIndex) ? (
                                    <View style={[styles.completedBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Check size={12} color="#fff" strokeWidth={3} />
                                        <Text style={[styles.completedText, { fontFamily: fontFamily.uiBold, color: '#fff' }]}>
                                            {t('comprehension.completed', { defaultValue: 'Completed' })}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={[styles.playButton]}>
                                        <Play size={12} color={colors.primary} fill={colors.primary} />
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.todayTitle, { fontFamily: fontFamily.uiBold, color: '#fff' }]} numberOfLines={2}>
                                {readings[todaysIndex].title}
                            </Text>
                            <View style={styles.metaContainer}>
                                <View style={[styles.metaPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                    <BookOpen size={12} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                                    <Text style={[styles.metaText, { fontFamily: fontFamily.uiMedium, color: 'rgba(255,255,255,0.9)' }]}>
                                        {readings[todaysIndex].wordCount} {t('common.words', { defaultValue: 'words' })}
                                    </Text>
                                </View>
                                <View style={[styles.metaPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                    <Clock size={12} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                                    <Text style={[styles.metaText, { fontFamily: fontFamily.uiMedium, color: 'rgba(255,255,255,0.9)' }]}>
                                        {getReadingTime(readings[todaysIndex].wordCount)}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Pressable>
                )}

                {/* Category Tabs */}
                <View style={styles.categoryHeader}>
                    <Text style={[styles.sectionTitle, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                        {t('comprehension.allReadings', { defaultValue: 'All Readings' })}
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            const IconComponent = cat.icon;
                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    style={[
                                        styles.categoryTab,
                                        {
                                            backgroundColor: isActive ? colors.primary : colors.surface,
                                            borderColor: isActive ? colors.primary : colors.glassBorder,
                                        }
                                    ]}
                                >
                                    {IconComponent && <IconComponent size={14} color={isActive ? '#fff' : colors.textMuted} strokeWidth={2} />}
                                    <Text style={[
                                        styles.categoryText,
                                        {
                                            fontFamily: fontFamily.uiMedium,
                                            color: isActive ? '#fff' : colors.textMuted
                                        }
                                    ]}>
                                        {t(cat.labelKey, { defaultValue: cat.id })}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Reading Cards Grid */}
                <View style={styles.cardsContainer}>
                    {filteredReadings.map((reading, index) => {
                        const originalIndex = readings.indexOf(reading);
                        const difficulty = getDifficulty(reading.wordCount);
                        const completed = isCompleted(originalIndex);

                        return (
                            <Pressable
                                key={originalIndex}
                                onPress={() => onSelectReading(originalIndex)}
                                style={({ pressed }) => [
                                    styles.card,
                                    {
                                        backgroundColor: colors.surface, // Standard surface
                                        borderColor: colors.glassBorder,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.05,
                                        shadowRadius: 8,
                                        shadowOffset: { width: 0, height: 2 },
                                        elevation: 2,
                                        transform: [{ scale: pressed ? 0.98 : 1 }],
                                    }
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + '15' }]}>
                                        <Text style={[styles.difficultyText, { color: difficulty.color, fontFamily: fontFamily.uiBold }]}>
                                            {difficulty.label}
                                        </Text>
                                    </View>

                                    {completed && (
                                        <View style={[styles.cardCompletedBadge, { backgroundColor: colors.success }]}>
                                            <Check size={10} color="#fff" strokeWidth={3} />
                                        </View>
                                    )}
                                </View>

                                <Text
                                    style={[styles.cardTitle, { fontFamily: fontFamily.uiBold, color: colors.text }]}
                                    numberOfLines={3}
                                >
                                    {reading.title}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <Text style={[styles.metaText, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                                        {reading.wordCount} w
                                    </Text>
                                    <View style={styles.dotSeparator} />
                                    <Text style={[styles.metaText, { fontFamily: fontFamily.uiMedium, color: colors.textMuted }]}>
                                        {getReadingTime(reading.wordCount)}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* AI Generate Modal */}
            <Modal
                visible={showAIModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAIModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15', width: 40, height: 40, borderRadius: 12 }]}>
                                    <Sparkles size={20} color={colors.primary} strokeWidth={2.5} />
                                </View>
                                <View>
                                    <Text style={[styles.modalTitle, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                                        {t('comprehension.ai.title', { defaultValue: 'Custom Reading' })}
                                    </Text>
                                    <Text style={[styles.modalSubtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                        {t('comprehension.ai.subtitle', { defaultValue: 'Customize your experience' })}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setShowAIModal(false)}
                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            >
                                <X size={24} color={colors.textMuted} strokeWidth={2} />
                            </Pressable>
                        </View>

                        {/* Input Form */}
                        <View style={styles.formContainer}>

                            {/* Topic Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
                                    {t('comprehension.ai.topicLabel', { defaultValue: 'Topic' })}
                                </Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder }]}>
                                    <Lightbulb size={18} color={colors.textMuted} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text, fontFamily: fontFamily.uiRegular }]}
                                        placeholder={t('comprehension.ai.topicPlaceholder', { defaultValue: 'e.g. History of Jazz...' })}
                                        placeholderTextColor={colors.textMuted}
                                        value={customTopic}
                                        onChangeText={setCustomTopic}
                                    />
                                </View>
                                {/* Suggestions */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.suggestionsScroll}
                                    contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                                >
                                    {['Space', 'History', 'Biology', 'Art', 'Tech', 'Nature'].map(topic => (
                                        <Pressable
                                            key={topic}
                                            onPress={() => setCustomTopic(topic)}
                                            style={({ pressed }) => [
                                                styles.suggestionChip,
                                                {
                                                    backgroundColor: colors.surfaceElevated,
                                                    borderColor: colors.glassBorder,
                                                    opacity: pressed ? 0.8 : 1
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.suggestionText, { color: colors.textMuted, fontFamily: fontFamily.uiMedium }]}>{topic}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Length Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
                                    {t('comprehension.ai.lengthLabel', { defaultValue: 'Length' })}
                                </Text>
                                <View style={styles.lengthOptionsRow}>
                                    {[
                                        { id: 'short', label: 'Short', words: '~250w' },
                                        { id: 'medium', label: 'Medium', words: '~500w' },
                                        { id: 'long', label: 'Long', words: '~850w' }
                                    ].map((opt) => {
                                        const isSelected = selectedLength === opt.id;
                                        return (
                                            <Pressable
                                                key={opt.id}
                                                onPress={() => setSelectedLength(opt.id as any)}
                                                style={[
                                                    styles.lengthOption,
                                                    {
                                                        backgroundColor: 'transparent',
                                                        borderColor: isSelected ? colors.primary : colors.glassBorder,
                                                        borderWidth: isSelected ? 2 : 1,
                                                    }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.lengthLabel,
                                                    {
                                                        color: isSelected ? colors.primary : colors.text,
                                                        fontFamily: fontFamily.uiBold
                                                    }
                                                ]}>
                                                    {t(`comprehension.difficulty.${opt.id}`, { defaultValue: opt.label })}
                                                </Text>
                                                <Text style={[
                                                    styles.lengthWords,
                                                    {
                                                        color: isSelected ? colors.primary : colors.textMuted,
                                                        fontFamily: fontFamily.uiRegular,
                                                        opacity: isSelected ? 0.8 : 1
                                                    }
                                                ]}>
                                                    {opt.words}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Spacer for button separation */}
                        <View style={{ height: 40 }} />

                        {/* Generate Button */}
                        <Pressable
                            onPress={handleAIGenerate}
                            disabled={!customTopic.trim() || aiLoading}
                            style={({ pressed }) => [
                                styles.generateButton,
                                {
                                    backgroundColor: customTopic.trim() ? colors.primary : colors.surfaceElevated,
                                    opacity: pressed ? 0.9 : 1,
                                    shadowColor: customTopic.trim() ? colors.primary : 'transparent',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: customTopic.trim() ? 4 : 0,
                                    alignSelf: 'flex-end', // Right align
                                    paddingHorizontal: 24,
                                    minWidth: 140,
                                }
                            ]}
                        >
                            {aiLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Sparkles size={18} color={customTopic.trim() ? '#fff' : colors.textMuted} strokeWidth={2.5} />
                                    <Text style={[
                                        styles.generateButtonText,
                                        { fontFamily: fontFamily.uiBold, color: customTopic.trim() ? '#fff' : colors.textMuted }
                                    ]}>
                                        {t('comprehension.ai.generate', { defaultValue: 'Generate Reading' })}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#fff',
    },
    todayCardWrapper: {
        borderRadius: 18, // Reduced from 20 for sleeker look
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    todayCardGradient: {
        padding: 18, // Adjusted padding
        borderRadius: 18,
        overflow: 'hidden',
    },
    todayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    todayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconBox: {
        width: 28, // Reduced from 32
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayLabel: {
        fontSize: 12,
        letterSpacing: 0.5,
    },
    todayTitle: {
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    playButton: {
        width: 28, // Matches iconBox
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    completedText: {
        fontSize: 10,
        textTransform: 'uppercase',
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    metaText: {
        fontSize: 11,
    },
    categoryHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
    },
    categoryScroll: {
        maxHeight: 44,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 16,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        gap: 8,
    },
    categoryText: {
        fontSize: 13,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    card: {
        width: CARD_WIDTH,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 9,
        textTransform: 'uppercase',
    },
    cardCompletedBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        minHeight: 40,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ccc',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    modalTitleRow: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 13,
    },
    formContainer: {
        gap: 24,
    },
    inputGroup: {
        gap: 10,
    },
    label: {
        fontSize: 14,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        height: 24, // Fix for TextInput height
    },
    suggestionsScroll: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
        maxHeight: 34,
    },
    suggestionChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 12,
    },
    lengthOptionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    shineOverlay: {
        position: 'absolute',
        top: -50,
        left: -50,
        right: -50,
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.05)', // Reduced opacity for subtle shine
        transform: [{ rotate: '25deg' }],
        zIndex: 0,
    },
    lengthOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 4,
    },
    lengthLabel: {
        fontSize: 14,
    },
    lengthWords: {
        fontSize: 11,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14, // Reduced vertical padding
        paddingHorizontal: 20,
        borderRadius: 16, // Matching radius
        gap: 8,
    },
    generateButtonText: {
        fontSize: 16,
    },
});
