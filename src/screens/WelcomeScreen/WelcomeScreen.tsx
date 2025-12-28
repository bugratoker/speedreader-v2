/**
 * Welcome Screen (1.1)
 * Interactive onboarding slider introducing Speed Reader features
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Zap, Brain, Target, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { RSVPPreview } from '../../components/RSVPPreview';
import { AIVisualizationCard } from '../../components/AIVisualizationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
    id: number;
    icon: React.ReactNode;
    headlineKey: string;
    subheadlineKey: string;
    content: React.ReactNode;
}

export const WelcomeScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    const { colors, fontFamily, fontSize, spacing, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const buttonScale = useRef(new Animated.Value(1)).current;

    const slides: SlideData[] = [
        {
            id: 1,
            icon: <Zap size={32} color={colors.primary} strokeWidth={2} />,
            headlineKey: 'welcome.slide1.headline',
            subheadlineKey: 'welcome.slide1.subheadline',
            content: <RSVPPreview />,
        },
        {
            id: 2,
            icon: <Brain size={32} color={colors.secondary} strokeWidth={2} />,
            headlineKey: 'welcome.slide2.headline',
            subheadlineKey: 'welcome.slide2.subheadline',
            content: <AIVisualizationCard />,
        },
        {
            id: 3,
            icon: <Target size={32} color={colors.primary} strokeWidth={2} />,
            headlineKey: 'welcome.slide3.headline',
            subheadlineKey: 'welcome.slide3.subheadline',
            content: (
                <View style={styles.slide3Content}>
                    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.primaryGlow }]}>
                            <Zap size={24} color={colors.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={[styles.featureTitle, { fontFamily: fontFamily.uiMedium, color: colors.text }]}>
                                {t('welcome.slide3.trainingLab')}
                            </Text>
                            <Text style={[styles.featureSubtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {t('welcome.slide3.trainingLabDesc')}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.secondaryGlow }]}>
                            <Brain size={24} color={colors.secondary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={[styles.featureTitle, { fontFamily: fontFamily.uiMedium, color: colors.text }]}>
                                {t('welcome.slide3.dailyNews')}
                            </Text>
                            <Text style={[styles.featureSubtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {t('welcome.slide3.dailyNewsDesc')}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.primaryGlow }]}>
                            <Target size={24} color={colors.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={[styles.featureTitle, { fontFamily: fontFamily.uiMedium, color: colors.text }]}>
                                {t('welcome.slide3.streakSystem')}
                            </Text>
                            <Text style={[styles.featureSubtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {t('welcome.slide3.streakSystemDesc')}
                            </Text>
                        </View>
                    </View>
                </View>
            ),
        },
    ];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setActiveIndex(index);
    };

    const handleNext = () => {
        if (activeIndex < slides.length - 1) {
            scrollRef.current?.scrollTo({
                x: (activeIndex + 1) * SCREEN_WIDTH,
                animated: true,
            });
        } else {
            onComplete?.();
        }
    };

    const handleButtonPressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const isLastSlide = activeIndex === slides.length - 1;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient glow corners */}
            <View style={[styles.glowTopLeft, { backgroundColor: colors.secondaryGlow }]} />
            <View style={[styles.glowBottomRight, { backgroundColor: colors.primaryGlow }]} />

            {/* Carousel */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.carousel}
                contentContainerStyle={styles.carouselContent}
            >
                {slides.map((slide) => (
                    <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
                        <View style={[styles.slideInner, { paddingTop: insets.top + spacing.xl }]}>
                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                                {slide.icon}
                            </View>

                            {/* Headline */}
                            <Text style={[styles.headline, { fontFamily: fontFamily.reading, color: colors.text }]}>
                                {t(slide.headlineKey)}
                            </Text>

                            {/* Subheadline */}
                            <Text style={[styles.subheadline, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                                {t(slide.subheadlineKey)}
                            </Text>

                            {/* Content */}
                            {slide.content}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom section */}
            <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.lg }]}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === activeIndex ? colors.primary : colors.textDim,
                                    width: index === activeIndex ? 24 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    activeOpacity={0.9}
                >
                    <Animated.View
                        style={[
                            styles.ctaButton,
                            {
                                backgroundColor: colors.primary,
                                transform: [{ scale: buttonScale }],
                                ...glows.primary,
                            },
                        ]}
                    >
                        <Text style={[styles.ctaText, { fontFamily: fontFamily.uiBold, color: colors.background }]}>
                            {isLastSlide ? t('common.startJourney') : t('common.next')}
                        </Text>
                        {!isLastSlide && <ChevronRight size={20} color={colors.background} strokeWidth={2.5} />}
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTopLeft: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    glowBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    carousel: {
        flex: 1,
    },
    carouselContent: {
        alignItems: 'flex-start',
    },
    slide: {
        flex: 1,
    },
    slideInner: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 24,
    },
    headline: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 12,
    },
    subheadline: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 20,
    },
    slide3Content: {
        width: '100%',
        marginTop: 32,
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        marginBottom: 2,
    },
    featureSubtitle: {
        fontSize: 14,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 8,
    },
    ctaText: {
        fontSize: 18,
    },
});
