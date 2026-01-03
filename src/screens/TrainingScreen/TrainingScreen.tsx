/**
 * Training Screen - Hub for Eye Exercises and Focus Drills
 * Neuro-Ocular Conditioning Lab - Simplified UI
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, PanResponder, Dimensions, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';
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
} from 'lucide-react-native';
import {
    SchulteTable,
    SaccadicJumps,
    EyeStretch,
    PeripheralCatch
} from '../../components';

type ExerciseType = 'schulte' | 'saccadic' | 'eyestretch' | 'peripheral' | null;
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
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 48 - CARD_GAP) / 2;

// Minimal Grid Card Component
const MinimalCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    difficulty: string;
    accentColor: string;
    glowColor: string;
    onPress: () => void;
    index: number;
}> = ({ title, icon, difficulty, accentColor, glowColor, onPress, index }) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'warmUp': return colors.success;
            case 'training': return colors.primary;
            case 'challenge': return colors.secondary;
            default: return colors.primary;
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 80).springify()}
            style={animatedStyle}
        >
            <Pressable
                onPressIn={() => { scale.value = withSpring(0.95); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={onPress}
                style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.bento,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    padding: spacing.md,
                    justifyContent: 'space-between',
                    shadowColor: accentColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 4,
                    overflow: 'hidden',
                }}
            >
                {/* Glow Background */}
                <View
                    style={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: glowColor,
                        opacity: 0.5,
                    }}
                />

                {/* Icon */}
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: glowColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {icon}
                </View>

                {/* Bottom Content */}
                <View>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.md,
                            color: colors.text,
                            marginBottom: 4,
                        }}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    <View
                        style={{
                            backgroundColor: getDifficultyColor() + '20',
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 2,
                            borderRadius: borderRadius.sm,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.xs,
                                color: getDifficultyColor(),
                            }}
                        >
                            {difficulty === 'warmUp' ? '🔥 Isınma' : difficulty === 'training' ? '💪 Antrenman' : '⚡ Meydan Okuma'}
                        </Text>
                    </View>
                </View>
            </Pressable>
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
            icon: <Infinity size={28} color={colors.secondary} strokeWidth={1.5} />,
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
            icon: <Grid3X3 size={28} color={colors.primary} strokeWidth={1.5} />,
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
            icon: <Zap size={28} color={colors.secondary} strokeWidth={1.5} />,
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
            icon: <Focus size={28} color={colors.primary} strokeWidth={1.5} />,
            accentColor: colors.primary,
            glowColor: colors.primaryGlow,
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
                        setScreenState('detail');
                    } else {
                        setScreenState('hub');
                        setActiveExercise(null);
                        setShowAcademic(false);
                    }
                }
            },
        })
    ).current;

    const openAcademicUrl = (url?: string) => {
        if (url) {
            Linking.openURL(url);
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
                        onPress={() => setScreenState('detail')}
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

    // Detail View - Shows exercise info before starting
    if (screenState === 'detail' && activeExercise && currentExercise) {
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
                    paddingVertical: spacing.sm,
                }}>
                    <Pressable
                        onPress={() => {
                            setScreenState('hub');
                            setActiveExercise(null);
                            setShowAcademic(false);
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

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Exercise Hero */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: currentExercise.glowColor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: spacing.md,
                                shadowColor: currentExercise.accentColor,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                            }}
                        >
                            {currentExercise.icon}
                        </View>
                        <Text style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize['2xl'],
                            color: colors.text,
                            textAlign: 'center',
                        }}>
                            {t(currentExercise.titleKey)}
                        </Text>
                        <Text style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.textMuted,
                            textAlign: 'center',
                            marginTop: spacing.xs,
                        }}>
                            {t(currentExercise.subtitleKey)}
                        </Text>
                    </Animated.View>

                    {/* Description Card */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <View
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: borderRadius.bento,
                                borderWidth: 1,
                                borderColor: colors.glassBorder,
                                padding: spacing.md,
                                marginBottom: spacing.md,
                            }}
                        >
                            <Text style={{
                                fontFamily: fontFamily.uiMedium,
                                fontSize: fontSize.sm,
                                color: currentExercise.accentColor,
                                marginBottom: spacing.sm,
                            }}>
                                {t('common.howItWorks', { defaultValue: 'Nasıl Çalışır?' })}
                            </Text>
                            <Text style={{
                                fontFamily: fontFamily.uiRegular,
                                fontSize: fontSize.md,
                                color: colors.text,
                                lineHeight: fontSize.md * 1.5,
                            }}>
                                {t(currentExercise.descriptionKey)}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Academic Basis - Collapsible */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <Pressable
                            onPress={() => setShowAcademic(!showAcademic)}
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: borderRadius.bento,
                                borderWidth: 1,
                                borderColor: colors.glassBorder,
                                padding: spacing.md,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: currentExercise.glowColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: spacing.sm,
                                }}
                            >
                                <Info size={18} color={currentExercise.accentColor} strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontFamily: fontFamily.uiMedium,
                                    fontSize: fontSize.sm,
                                    color: colors.text,
                                }}>
                                    {t('common.scientificBasis', { defaultValue: 'Bilimsel Temel' })}
                                </Text>
                                <Text style={{
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.xs,
                                    color: colors.textMuted,
                                }}>
                                    {showAcademic ? t('common.tapToHide', { defaultValue: 'Gizlemek için dokun' }) : t('common.tapForMore', { defaultValue: 'Daha fazla bilgi için dokun' })}
                                </Text>
                            </View>
                        </Pressable>

                        {showAcademic && (
                            <Animated.View
                                entering={FadeIn.duration(200)}
                                style={{
                                    backgroundColor: colors.surfaceElevated,
                                    borderRadius: borderRadius.md,
                                    padding: spacing.md,
                                    marginTop: spacing.sm,
                                }}
                            >
                                <Text style={{
                                    fontFamily: fontFamily.uiRegular,
                                    fontSize: fontSize.sm,
                                    color: colors.text,
                                    lineHeight: fontSize.sm * 1.5,
                                    marginBottom: currentExercise.academicDetailKey ? spacing.sm : 0,
                                }}>
                                    {currentExercise.academicDetailKey
                                        ? t(currentExercise.academicDetailKey)
                                        : t(currentExercise.academicKey)}
                                </Text>

                                {currentExercise.academicUrl && (
                                    <Pressable
                                        onPress={() => openAcademicUrl(currentExercise.academicUrl)}
                                        style={({ pressed }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: spacing.sm,
                                            paddingHorizontal: spacing.md,
                                            backgroundColor: pressed ? currentExercise.accentColor + '20' : currentExercise.glowColor,
                                            borderRadius: borderRadius.md,
                                            marginTop: spacing.sm,
                                            alignSelf: 'flex-start',
                                        })}
                                    >
                                        <ExternalLink size={16} color={currentExercise.accentColor} strokeWidth={2} />
                                        <Text style={{
                                            fontFamily: fontFamily.uiMedium,
                                            fontSize: fontSize.sm,
                                            color: currentExercise.accentColor,
                                            marginLeft: spacing.xs,
                                        }}>
                                            {t('games.academic.learnMore', { defaultValue: 'Makaleyi Görüntüle' })}
                                        </Text>
                                    </Pressable>
                                )}
                            </Animated.View>
                        )}
                    </Animated.View>

                    {/* Start Button - Now inside ScrollView */}
                    <Animated.View
                        entering={FadeInUp.delay(400).springify()}
                        style={{ marginTop: spacing.xl }}
                    >
                        <Pressable
                            onPress={() => setScreenState('active')}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? currentExercise.accentColor + 'DD' : currentExercise.accentColor,
                                borderRadius: borderRadius.lg,
                                paddingVertical: spacing.md,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: currentExercise.accentColor,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.4,
                                shadowRadius: 12,
                                elevation: 8,
                            })}
                        >
                            <Play size={22} color="#ffffff" fill="#ffffff" strokeWidth={2} />
                            <Text style={{
                                fontFamily: fontFamily.uiBold,
                                fontSize: fontSize.lg,
                                color: '#ffffff',
                                marginLeft: spacing.sm,
                            }}>
                                {t('games.common.start', { defaultValue: 'Antrenmana Başla' })}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }

    // Hub View - 2x2 Grid
    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(50).springify()} style={{ paddingVertical: spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Dumbbell size={28} color={colors.secondary} strokeWidth={1.5} />
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['3xl'], color: colors.text, marginLeft: spacing.sm }}>
                            {t('training.title')}
                        </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                        {t('training.subtitle')}
                    </Text>
                </Animated.View>

                {/* 2x2 Grid */}
                <View style={{ marginTop: spacing.md }}>
                    {/* Row 1 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: CARD_GAP }}>
                        <MinimalCard
                            title={t(exercises[0].titleKey)}
                            icon={exercises[0].icon}
                            difficulty={exercises[0].difficulty}
                            accentColor={exercises[0].accentColor}
                            glowColor={exercises[0].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[0].key);
                                setScreenState('detail');
                            }}
                            index={0}
                        />
                        <MinimalCard
                            title={t(exercises[1].titleKey)}
                            icon={exercises[1].icon}
                            difficulty={exercises[1].difficulty}
                            accentColor={exercises[1].accentColor}
                            glowColor={exercises[1].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[1].key);
                                setScreenState('detail');
                            }}
                            index={1}
                        />
                    </View>

                    {/* Row 2 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <MinimalCard
                            title={t(exercises[2].titleKey)}
                            icon={exercises[2].icon}
                            difficulty={exercises[2].difficulty}
                            accentColor={exercises[2].accentColor}
                            glowColor={exercises[2].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[2].key);
                                setScreenState('detail');
                            }}
                            index={2}
                        />
                        <MinimalCard
                            title={t(exercises[3].titleKey)}
                            icon={exercises[3].icon}
                            difficulty={exercises[3].difficulty}
                            accentColor={exercises[3].accentColor}
                            glowColor={exercises[3].glowColor}
                            onPress={() => {
                                setActiveExercise(exercises[3].key);
                                setScreenState('detail');
                            }}
                            index={3}
                        />
                    </View>
                </View>

                {/* Quick Tip */}
                <Animated.View
                    entering={FadeInUp.delay(400).springify()}
                    style={{
                        marginTop: spacing.xl,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Eye size={20} color={colors.secondary} strokeWidth={2} />
                    <Text style={{
                        fontFamily: fontFamily.uiRegular,
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                        marginLeft: spacing.sm,
                        flex: 1,
                    }}>
                        {t('training.tip', { defaultValue: 'Günde 5-10 dakika antrenman, 2 hafta içinde fark yaratır!' })}
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
};
