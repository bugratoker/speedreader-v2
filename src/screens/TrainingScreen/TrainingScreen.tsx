/**
 * Training Screen - Hub for Eye Exercises and Focus Drills
 * Neuro-Ocular Conditioning Lab
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const { colors, spacing, fontFamily, fontSize, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);

    const handleExerciseComplete = (exerciseName: string) => {
        console.log(`${exerciseName} completed`);
    };

    if (activeExercise) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                    <Pressable
                        onPress={() => setActiveExercise(null)}
                        style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1,
                            backgroundColor: colors.surface,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: borderRadius.lg,
                        })}
                    >
                        <ChevronLeft size={20} color={colors.primary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.primary }}>Back</Text>
                    </Pressable>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
                    {activeExercise === 'schulte' && (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Grid3X3 size={24} color={colors.primary} strokeWidth={2} />
                                    <Text style={{ fontFamily: fontFamily.uiBold, fontSize: fontSize['2xl'], color: colors.text, marginLeft: spacing.sm }}>
                                        Schulte Table
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    Attentional Stability Training
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
                                        Saccadic Jumps
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    Anti-Regression & Return Sweep Training
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
                                        Infinity Stretch
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    Ocular Flexibility Training
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
                                        Peripheral Catch
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>
                                    Parafoveal Processing Training
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
                            Training Lab
                        </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs }}>
                        Neuro-Ocular Conditioning for Speed Reading
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
                            Recommended Flow
                        </Text>
                        <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                            Eye Stretch → Schulte → Saccadic → Peripheral
                        </Text>
                    </View>
                </View>

                {/* Section 1: Warm-up Drills */}
                <View style={{ marginTop: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                        <Eye size={18} color={colors.primary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.primary, marginLeft: spacing.xs }}>
                            Muscle Pre-conditioning
                        </Text>
                    </View>

                    <ExerciseCard
                        title="Infinity Stretch"
                        description="Follow the Lazy-8 pattern to exercise all six extraocular muscles"
                        academicBasis="Improves smooth pursuit and ciliary muscle flexibility"
                        icon={<Infinity size={26} color={colors.secondary} strokeWidth={1.5} />}
                        accentColor={colors.secondary}
                        glowColor={colors.secondaryGlow}
                        difficulty="Warm-up"
                        onPress={() => setActiveExercise('eyestretch')}
                    />

                    <ExerciseCard
                        title="Schulte Table"
                        description="Find numbers while keeping gaze fixed on center point"
                        academicBasis="Improves visual search and attentional stability"
                        icon={<Grid3X3 size={26} color={colors.primary} strokeWidth={1.5} />}
                        accentColor={colors.primary}
                        glowColor={colors.primaryGlow}
                        difficulty="Training"
                        onPress={() => setActiveExercise('schulte')}
                    />
                </View>

                {/* Section 2: Cognitive Focus Games */}
                <View style={{ marginTop: spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                        <Brain size={18} color={colors.secondary} strokeWidth={2} />
                        <Text style={{ fontFamily: fontFamily.uiMedium, fontSize: fontSize.md, color: colors.secondary, marginLeft: spacing.xs }}>
                            Perceptual Processing
                        </Text>
                    </View>

                    <ExerciseCard
                        title="Saccadic Jumps"
                        description="Rapid eye movement training for precise line-to-line jumps"
                        academicBasis="Trains Return Sweeps, minimizes regressions"
                        icon={<Zap size={26} color={colors.secondary} strokeWidth={1.5} />}
                        accentColor={colors.secondary}
                        glowColor={colors.secondaryGlow}
                        difficulty="Training"
                        onPress={() => setActiveExercise('saccadic')}
                    />

                    <ExerciseCard
                        title="Peripheral Catch"
                        description="Identify words using only peripheral vision"
                        academicBasis="Expands parafoveal span for faster reading"
                        icon={<Focus size={26} color={colors.primary} strokeWidth={1.5} />}
                        accentColor={colors.primary}
                        glowColor={colors.primaryGlow}
                        difficulty="Challenge"
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
                            Training Protocol
                        </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: fontSize.sm * 1.6 }}>
                        Practice for 5-10 minutes daily <Text style={{ color: colors.text }}>before</Text> reading sessions.
                        Research shows significant improvement in peripheral vision and eye movement speed after 2-3 weeks of consistent training.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};
