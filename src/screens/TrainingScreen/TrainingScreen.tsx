/**
 * Training Screen - Hub for Eye Exercises and Focus Drills
 * Redesigned with modern UI/UX (v2)
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, PanResponder, Dimensions, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation';
import { useTheme } from '../../theme';
import { PremiumButton } from '../../components/ui/PremiumButton';
import {
    Grid3X3,
    Eye,
    Focus,
    Zap,
    ChevronLeft,
    Dumbbell,
    Infinity,
    Play,
    Info,
    ExternalLink,
    Trophy,
} from 'lucide-react-native';
import {
    SchulteTable,
    SaccadicJumps,
    EyeStretch,
    PeripheralCatch
} from '../../components';

type ExerciseType = 'schulte' | 'saccadic' | 'eyestretch' | 'peripheral' | 'comprehension' | null;
type ScreenState = 'hub' | 'detail' | 'active';

interface ExerciseData {
    key: ExerciseType;
    titleKey: string;
    descriptionKey: string;
    academicKey: string;
    academicDetailKey?: string;
    academicUrl?: string;
    subtitleKey: string;
    icon: React.ReactNode;
    accentColor: string;
    glowColor: string;
    difficulty: 'warmUp' | 'training' | 'challenge';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_SIZE = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

// Enhanced Exercise Card Component
const ExerciseCard: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    difficulty: string;
    accentColor: string;
    glowColor: string;
    onPress: () => void;
    index: number;
}> = ({ title, subtitle, icon, difficulty, accentColor, glowColor, onPress, index }) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const getDifficultyInfo = () => {
        switch (difficulty) {
            case 'warmUp':
                return { label: 'Warm Up', color: colors.success || '#10b981' };
            case 'training':
                return { label: 'Training', color: colors.primary };
            case 'challenge':
                return { label: 'Challenge', color: colors.secondary };
            default:
                return { label: 'Training', color: colors.primary };
        }
    };

    const difficultyInfo = getDifficultyInfo();

    return (
        <Animated.View entering={FadeIn.delay(index * 60).duration(400)}>
            <Animated.View style={animatedStyle}>
                <Pressable
                    onPressIn={() => {
                        scale.value = withTiming(0.96, { duration: 100 });
                        opacity.value = withTiming(0.8, { duration: 100 });
                    }}
                    onPressOut={() => {
                        scale.value = withSpring(1);
                        opacity.value = withTiming(1, { duration: 100 });
                    }}
                    onPress={onPress}
                    style={{
                        width: CARD_SIZE,
                        height: CARD_SIZE * 1.1,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.sm,
                        justifyContent: 'space-between',
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                        overflow: 'hidden',
                    }}
                >
                    {/* Subtle Glow Background */}
                    <View
                        style={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: glowColor,
                            opacity: 0.3,
                        }}
                    />

                    {/* Icon Container */}
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: borderRadius.md,
                            backgroundColor: glowColor + 'CC',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {icon}
                    </View>

                    {/* Content */}
                    <View style={{ gap: spacing.xs - 2 }}>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.md,
                                color: colors.text,
                                lineHeight: fontSize.md * 1.2,
                            }}
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                        <Text
                            style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.xs,
                                color: colors.textMuted,
                                lineHeight: fontSize.xs * 1.4,
                            }}
                            numberOfLines={2}
                        >
                            {subtitle}
                        </Text>

                        {/* Difficulty Badge */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: difficultyInfo.color + '15',
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xs - 2,
                                borderRadius: borderRadius.sm,
                                alignSelf: 'flex-start',
                                marginTop: spacing.xs - 2,
                            }}
                        >
                            <View
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: difficultyInfo.color,
                                    marginRight: spacing.xs,
                                }}
                            />
                            <Text
                                style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.xs - 1,
                                    color: difficultyInfo.color,
                                }}
                            >
                                {difficultyInfo.label}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

export const TrainingScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);
    const [screenState, setScreenState] = useState<ScreenState>('hub');
    const [showAcademic, setShowAcademic] = useState(false);

    const exercises: ExerciseData[] = [
        {
            key: 'eyestretch',
            titleKey: 'training.exercises.eyestretch.title',
            descriptionKey: 'training.exercises.eyestretch.description',
            academicKey: 'training.exercises.eyestretch.academicBasis',
            subtitleKey: 'training.exercises.eyestretch.subtitle',
            icon: <Infinity size={24} color={colors.secondary} strokeWidth={2} />,
            accentColor: colors.secondary,
            glowColor: colors.secondaryGlow,
            difficulty: 'warmUp',
        },
        {
            key: 'schulte',
            titleKey: 'training.exercises.schulte.title',
            descriptionKey: 'training.exercises.schulte.description',
            academicKey: 'training.exercises.schulte.academicBasis',
            academicDetailKey: 'games.academic.schulte.description',
            academicUrl: 'https://pubmed.ncbi.nlm.nih.gov/8323726/',
            subtitleKey: 'training.exercises.schulte.subtitle',
            icon: <Grid3X3 size={24} color={colors.primary} strokeWidth={2} />,
            accentColor: colors.primary,
            glowColor: colors.primaryGlow,
            difficulty: 'training',
        },
        {
            key: 'saccadic',
            titleKey: 'training.exercises.saccadic.title',
            descriptionKey: 'training.exercises.saccadic.description',
            academicKey: 'training.exercises.saccadic.academicBasis',
            academicDetailKey: 'games.academic.saccadic.description',
            academicUrl: 'https://pubmed.ncbi.nlm.nih.gov/9820029/',
            subtitleKey: 'training.exercises.saccadic.subtitle',
            icon: <Zap size={24} color={colors.secondary} strokeWidth={2} />,
            accentColor: colors.secondary,
            glowColor: colors.secondaryGlow,
            difficulty: 'training',
        },
        {
            key: 'peripheral',
            titleKey: 'training.exercises.peripheral.title',
            descriptionKey: 'training.exercises.peripheral.description',
            academicKey: 'training.exercises.peripheral.academicBasis',
            subtitleKey: 'training.exercises.peripheral.subtitle',
            icon: <Focus size={24} color={colors.primary} strokeWidth={2} />,
            accentColor: colors.primary,
            glowColor: colors.primaryGlow,
            difficulty: 'challenge',
        },
        {
            key: 'comprehension',
            titleKey: 'training.exercises.comprehension.title',
            descriptionKey: 'training.exercises.comprehension.description',
            academicKey: 'training.exercises.comprehension.academicBasis',
            academicDetailKey: 'games.academic.comprehension.description',
            subtitleKey: 'training.exercises.comprehension.subtitle',
            icon: <Play size={24} color={colors.secondary} strokeWidth={2} />,
            accentColor: colors.secondary,
            glowColor: colors.secondaryGlow,
            difficulty: 'challenge',
        },
    ];

    const handleExerciseComplete = (exerciseName: string) => {
        console.log(`${exerciseName} completed`);
    };

    const currentExercise = exercises.find(e => e.key === activeExercise);

    // Swipe Gesture Handler for back navigation
    const panResponder = React.useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return (
                    gestureState.moveX > 0 &&
                    gestureState.dx > 20 &&
                    Math.abs(gestureState.dy) < 30 &&
                    evt.nativeEvent.pageX < 60
                );
            },
            onPanResponderRelease: (_evt, gestureState) => {
                if (gestureState.dx > 50 && Math.abs(gestureState.vy) > 0.3) {
                    if (screenState === 'active') {
                        setScreenState('hub');
                        setActiveExercise(null);
                    } else {
                        setScreenState('hub');
                        setActiveExercise(null);
                        setShowAcademic(false);
                    }
                }
            },
        })
    ).current;

    const { navigate } = useNavigation<NativeStackNavigationProp<MainTabParamList>>();

    const openAcademicUrl = (url?: string) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    // Handle starting an exercise
    const handleStartExercise = () => {
        if (activeExercise === 'comprehension') {
            navigate('Read', { comprehensionMode: true });
        } else {
            setScreenState('active');
        }
    };

    // Active Exercise View
    if (screenState === 'active' && activeExercise) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
                {...panResponder.panHandlers}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    zIndex: 10
                }}>
                    <Pressable
                        onPress={() => {
                            setScreenState('hub');
                            setActiveExercise(null);
                        }}
                        style={({ pressed }) => ({
                            width: 44,
                            height: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 22,
                            backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
                        })}
                    >
                        <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
                    </Pressable>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
                    {activeExercise === 'schulte' && (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Grid3X3 size={24} color={colors.primary} strokeWidth={2} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['2xl'], color: colors.text, marginLeft: spacing.sm }}>
                                        {t('training.exercises.schulte.title')}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    {t('training.exercises.schulte.subtitle')}
                                </Text>
                            </View>
                            <SchulteTable onComplete={(_time: number) => handleExerciseComplete('Schulte')} />
                        </>
                    )}

                    {activeExercise === 'saccadic' && (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Zap size={24} color={colors.secondary} strokeWidth={2} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['2xl'], color: colors.text, marginLeft: spacing.sm }}>
                                        {t('training.exercises.saccadic.title')}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    {t('training.exercises.saccadic.subtitle')}
                                </Text>
                            </View>
                            <SaccadicJumps onComplete={(_jumps: number) => handleExerciseComplete('Saccadic')} />
                        </>
                    )}

                    {activeExercise === 'eyestretch' && (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Infinity size={24} color={colors.secondary} strokeWidth={2} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['2xl'], color: colors.text, marginLeft: spacing.sm }}>
                                        {t('training.exercises.eyestretch.title')}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    {t('training.exercises.eyestretch.subtitle')}
                                </Text>
                            </View>
                            <EyeStretch onComplete={(_cycles: number) => handleExerciseComplete('EyeStretch')} />
                        </>
                    )}

                    {activeExercise === 'peripheral' && (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Focus size={24} color={colors.primary} strokeWidth={2} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['2xl'], color: colors.text, marginLeft: spacing.sm }}>
                                        {t('training.exercises.peripheral.title')}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    {t('training.exercises.peripheral.subtitle')}
                                </Text>
                            </View>
                            <PeripheralCatch onComplete={(_score: number, _total: number) => handleExerciseComplete('Peripheral')} />
                        </>
                    )}
                </ScrollView>
            </View>
        );
    }



    // Hub View - 2x2 Grid
    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: borderRadius.md,
                                backgroundColor: colors.secondaryGlow,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: spacing.sm,
                            }}
                        >
                            <Trophy size={20} color={colors.secondary} strokeWidth={2} />
                        </View>
                        <Text style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize['2xl'],
                            color: colors.text,
                        }}>
                            {t('training.title')}
                        </Text>
                    </View>
                    <Text style={{
                        fontFamily: fontFamily.uiRegular,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        marginLeft: 44,
                    }}>
                        {t('training.subtitle')}
                    </Text>
                </View>

                {/* Exercise Grid */}
                <View style={{ marginTop: spacing.sm, gap: CARD_GAP }}>
                    {/* Row 1 */}
                    <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
                        <ExerciseCard
                            title={t(exercises[0].titleKey)}
                            subtitle={t(exercises[0].subtitleKey)}
                            icon={exercises[0].icon}
                            difficulty={exercises[0].difficulty}
                            accentColor={exercises[0].accentColor}
                            glowColor={exercises[0].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[0].key);
                                setScreenState('active');
                            }}
                            index={0}
                        />
                        <ExerciseCard
                            title={t(exercises[1].titleKey)}
                            subtitle={t(exercises[1].subtitleKey)}
                            icon={exercises[1].icon}
                            difficulty={exercises[1].difficulty}
                            accentColor={exercises[1].accentColor}
                            glowColor={exercises[1].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[1].key);
                                setScreenState('active');
                            }}
                            index={1}
                        />
                    </View>

                    {/* Row 2 */}
                    <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
                        <ExerciseCard
                            title={t(exercises[2].titleKey)}
                            subtitle={t(exercises[2].subtitleKey)}
                            icon={exercises[2].icon}
                            difficulty={exercises[2].difficulty}
                            accentColor={exercises[2].accentColor}
                            glowColor={exercises[2].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[2].key);
                                setScreenState('active');
                            }}
                            index={2}
                        />
                        <ExerciseCard
                            title={t(exercises[3].titleKey)}
                            subtitle={t(exercises[3].subtitleKey)}
                            icon={exercises[3].icon}
                            difficulty={exercises[3].difficulty}
                            accentColor={exercises[3].accentColor}
                            glowColor={exercises[3].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[3].key);
                                setScreenState('active');
                            }}
                            index={3}
                        />
                    </View>

                    {/* Row 3 - Comprehension */}
                    <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
                        <ExerciseCard
                            title={t(exercises[4].titleKey)}
                            subtitle={t(exercises[4].subtitleKey)}
                            icon={exercises[4].icon}
                            difficulty={exercises[4].difficulty}
                            accentColor={exercises[4].accentColor}
                            glowColor={exercises[4].glowColor}
                            onPress={() => {
                                navigate('Read', { comprehensionMode: true });
                            }}
                            index={4}
                        />
                        {/* Empty spacer to keep grid alignment if needed, or just one card takes half width */}
                        <View style={{ width: CARD_SIZE }} /> 
                    </View>
                </View>

                {/* Training Tip Card */}
                <View
                    style={{
                        marginTop: spacing.lg,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.lg,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.md,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: borderRadius.sm,
                                backgroundColor: colors.secondaryGlow,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Eye size={16} color={colors.secondary} strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: colors.text,
                                marginBottom: spacing.xs - 2,
                            }}>
                                Daily Training Tip
                            </Text>
                            <Text style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.sm,
                                color: colors.textMuted,
                                lineHeight: fontSize.sm * 1.5,
                            }}>
                                {t('training.tip', { defaultValue: '5-10 minutes daily for 2 weeks shows measurable improvement' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
