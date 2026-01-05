import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BookOpen, Zap, Target, Activity } from 'lucide-react-native';
import { borderRadius, useTheme } from '../../theme';
import { ScalePressable } from '../../components';
import { WeeklyActivityChart } from '../../components/charts/WeeklyActivityChart';
import { SpeedProgressChart } from '../../components/charts/SpeedProgressChart';
import { StatCard } from '../../components/home/StatCard';

// Mock Data
const WEEKLY_DATA = [45, 60, 30, 90, 20, 75, 50]; // Minutes read
const WEEKLY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PROGRESS_DATA = [250, 260, 255, 270, 280, 275, 290, 310, 300, 320]; // WPM history
const PROGRESS_LABELS = ['Start', 'Week 4'];

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
            }}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={{ marginBottom: spacing.lg, paddingVertical: spacing.sm }}
                >
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize['3xl'],
                            color: colors.text,
                        }}
                    >
                        {t('home.title') || "Welcome Back, Alp"}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.md,
                            color: colors.textMuted,
                            marginTop: spacing.xs,
                        }}
                    >
                        {t('home.subtitle') || "Ready to break your reading record?"}
                    </Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: spacing.md,
                        marginBottom: spacing.lg
                    }}
                >
                    <StatCard
                        label="Books Read"
                        value="12"
                        icon={<BookOpen size={20} color={colors.primary} />}
                        trend="+2"
                        trendType="positive"
                    />
                    <StatCard
                        label="Daily Streak"
                        value="5 Days"
                        icon={<Zap size={20} color="#F59E0B" />} // Amber
                        trend="Keep it up!"
                        trendType="neutral"
                    />
                    <StatCard
                        label="Current WPM"
                        value="320"
                        icon={<Activity size={20} color={colors.secondary} />}
                        trend="+15%"
                        trendType="positive"
                    />
                    <StatCard
                        label="Goal Progress"
                        value="85%"
                        icon={<Target size={20} color="#10B981" />}
                        trend="Almost there"
                        trendType="neutral"
                    />
                </Animated.View>

                {/* Speed Progress Chart */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.lg,
                            color: colors.text,
                            marginBottom: spacing.sm,
                        }}
                    >
                        Reading Speed Progress
                    </Text>
                    <SpeedProgressChart data={PROGRESS_DATA} labels={PROGRESS_LABELS} />
                </Animated.View>

                {/* Weekly Activity Chart */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Text
                        style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.lg,
                            color: colors.text,
                            marginTop: spacing.lg,
                            marginBottom: spacing.sm,
                        }}
                    >
                        Weekly Breakdown
                    </Text>
                    <WeeklyActivityChart data={WEEKLY_DATA} labels={WEEKLY_LABELS} />
                </Animated.View>

                {/* Quick Action / CTA */}
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <ScalePressable
                        style={{
                            backgroundColor: colors.primary,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginTop: spacing.xl,
                            alignItems: 'center',
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        <Text style={{
                            fontFamily: fontFamily.uiBold,
                            fontSize: fontSize.lg,
                            color: colors.white
                        }}>
                            Continue Reading
                        </Text>
                        <Text style={{
                            fontFamily: fontFamily.uiRegular,
                            fontSize: fontSize.sm,
                            color: colors.white,
                            opacity: 0.8,
                            marginTop: 4
                        }}>
                            Atomic Habits • Page 42
                        </Text>
                    </ScalePressable>
                </Animated.View>

            </ScrollView>
        </View>
    );
};
