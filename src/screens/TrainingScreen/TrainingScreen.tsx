/**
 * Training Screen - Hub for Eye Exercises and Focus Drills
 * Neuro-Ocular Conditioning Lab
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import {
    Grid3X3,
    Eye,
    Focus,
    Zap,
    ChevronLeft,
    Trophy,
    Dumbbell,
    Infinity,
    Brain,
    Sparkles,
} from 'lucide-react-native';
import {
    SchulteTable,
    SaccadicJumps,
    EyeStretch,
    PeripheralCatch
} from '../../components';

type ExerciseType = 'schulte' | 'saccadic' | 'eyestretch' | 'peripheral' | null;

interface ExerciseCardProps {
    title: string;
    description: string;
    academicBasis: string;
    icon: React.ReactNode;
    accentColor: string;
    glowColor: string;
    difficulty: 'Warm-up' | 'Training' | 'Challenge';
    onPress: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
    title,
    description,
    academicBasis,
    icon,
    accentColor,
    glowColor,
    difficulty,
    onPress,
}) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();

    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'Warm-up': return colors.success;
            case 'Training': return colors.primary;
            case 'Challenge': return colors.secondary;
        }
    };

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                borderRadius: borderRadius.bento,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                padding: spacing.lg,
                marginBottom: spacing.md,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: pressed ? 0.4 : 0.2,
                shadowRadius: 8,
                elevation: 4,
            })}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: glowColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing.md,
                    }}
                >
                    {icon}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize.lg, color: colors.text, flex: 1 }}>
                            {title}
                        </Text>
                        <View
                            style={{
                                backgroundColor: getDifficultyColor() + '20',
                                paddingHorizontal: spacing.sm,
                                paddingVertical: 2,
                                borderRadius: borderRadius.sm,
                            }}
                        >
                            <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.xs, color: getDifficultyColor() }}>
                                {difficulty}
                            </Text>
                        </View>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xs }}>
                        {description}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: accentColor, fontStyle: 'italic' }}>
                        {academicBasis}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export const TrainingScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);

    const handleExerciseComplete = (exerciseName: string) => {
        console.log(`${exerciseName} completed`);
    };

    // Swipe Gesture Handler
    const panResponder = React.useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Trigger only on horizontal swipe from left edge (start zone < 50px)
                // and if movement is horizontal > vertical
                return (
                    gestureState.moveX > 0 && // Moving right
                    gestureState.dx > 20 && // Moved at least 20px
                    Math.abs(gestureState.dy) < 30 && // Mostly horizontal
                    evt.nativeEvent.pageX < 60 // Started near left edge
                );
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 50 && Math.abs(gestureState.vy) > 0.3) {
                    setActiveExercise(null);
                }
            },
        })
    ).current;

    if (activeExercise) {
        return (
            <View
                style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
                {...panResponder.panHandlers}
            >
                {/* Minimalist Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    zIndex: 10
                }}>
                    <Pressable
                        onPress={() => setActiveExercise(null)}
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

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
                {/* Header */}
                <View style={{ paddingVertical: spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Dumbbell size={28} color={colors.secondary} strokeWidth={1.5} />
                        <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['3xl'], color: colors.text, marginLeft: spacing.sm }}>
                            {t('training.title')}
                        </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                        {t('training.headerSubtitle')}
                    </Text>
                </View>

                {/* Recommended Flow Card */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.secondaryDim,
                        padding: spacing.md,
                        marginBottom: spacing.lg,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Sparkles size={20} color={colors.secondary} strokeWidth={2} />
                    <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.secondary }}>
                            {t('training.recommendedFlow')}
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                            {t('training.recommendedFlowText')}
                        </Text>
                    </View>
                </View>

                {/* Section 1: Warm-up Drills */}
                <View style={{ marginTop: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                        <Eye size={18} color={colors.primary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.primary, marginLeft: spacing.xs }}>
                            {t('training.musclePreConditioning')}
                        </Text>
                    </View>

                    <ExerciseCard
                        title={t('training.exercises.eyestretch.title')}
                        description={t('training.exercises.eyestretch.description')}
                        academicBasis={t('training.exercises.eyestretch.academicBasis')}
                        icon={<Infinity size={26} color={colors.secondary} strokeWidth={1.5} />}
                        accentColor={colors.secondary}
                        glowColor={colors.secondaryGlow}
                        difficulty={t('training.difficulty.warmUp') as any}
                        onPress={() => setActiveExercise('eyestretch')}
                    />

                    <ExerciseCard
                        title={t('training.exercises.schulte.title')}
                        description={t('training.exercises.schulte.description')}
                        academicBasis={t('training.exercises.schulte.academicBasis')}
                        icon={<Grid3X3 size={26} color={colors.primary} strokeWidth={1.5} />}
                        accentColor={colors.primary}
                        glowColor={colors.primaryGlow}
                        difficulty={t('training.difficulty.training') as any}
                        onPress={() => setActiveExercise('schulte')}
                    />
                </View>

                {/* Section 2: Cognitive Focus Games */}
                <View style={{ marginTop: spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                        <Brain size={18} color={colors.secondary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.secondary, marginLeft: spacing.xs }}>
                            {t('training.perceptualProcessing')}
                        </Text>
                    </View>

                    <ExerciseCard
                        title={t('training.exercises.saccadic.title')}
                        description={t('training.exercises.saccadic.description')}
                        academicBasis={t('training.exercises.saccadic.academicBasis')}
                        icon={<Zap size={26} color={colors.secondary} strokeWidth={1.5} />}
                        accentColor={colors.secondary}
                        glowColor={colors.secondaryGlow}
                        difficulty={t('training.difficulty.training') as any}
                        onPress={() => setActiveExercise('saccadic')}
                    />

                    <ExerciseCard
                        title={t('training.exercises.peripheral.title')}
                        description={t('training.exercises.peripheral.description')}
                        academicBasis={t('training.exercises.peripheral.academicBasis')}
                        icon={<Focus size={26} color={colors.primary} strokeWidth={1.5} />}
                        accentColor={colors.primary}
                        glowColor={colors.primaryGlow}
                        difficulty={t('training.difficulty.challenge') as any}
                        onPress={() => setActiveExercise('peripheral')}
                    />
                </View>

                {/* Pro Tip */}
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.bento,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        padding: spacing.lg,
                        marginTop: spacing.xl,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                        <Trophy size={18} color={colors.secondary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.sm, color: colors.secondary, marginLeft: spacing.xs }}>
                            {t('training.trainingProtocol')}
                        </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: fontSize.sm * 1.6 }}>
                        {t('training.trainingProtocolText')} <Text style={{ color: colors.text }}>before</Text> {t('training.trainingProtocolTextSuffix')}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};
