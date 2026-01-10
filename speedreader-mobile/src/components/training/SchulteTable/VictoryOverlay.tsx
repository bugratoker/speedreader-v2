import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    FadeIn,
    ZoomIn,
    runOnJS
} from 'react-native-reanimated';
import { RotateCcw, X, Trophy } from 'lucide-react-native';
import { useTheme } from '@theme';
import { PremiumButton } from '../../ui/PremiumButton';
import { useTranslation } from 'react-i18next';

interface VictoryOverlayProps {
    visible: boolean;
    rankInfo: { rank: string; color: string; messageKey: string };
    elapsed: number;
    gridSize: number;
    onRestart: () => void;
    onClose: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
    visible,
    rankInfo,
    elapsed,
    gridSize,
    onRestart,
    onClose
}) => {
    const { colors, spacing, borderRadius } = useTheme();
    const { t } = useTranslation();

    if (!visible) return null;

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const t = Math.floor((ms % 1000) / 100);
        return `${s}.${t}s`;
    };

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />

            <View style={styles.container}>
                <Animated.View
                    entering={ZoomIn.duration(400).springify()}
                    style={[styles.card, { borderColor: rankInfo.color }]}
                >
                    {/* Rank Burst */}
                    <Animated.View
                        entering={ZoomIn.delay(300).springify()}
                        style={styles.rankContainer}
                    >
                        <Text style={[styles.rankText, { color: rankInfo.color, textShadowColor: rankInfo.color }]}>
                            {rankInfo.rank}
                        </Text>
                    </Animated.View>

                    <Animated.Text
                        entering={FadeIn.delay(600)}
                        style={styles.rankMessage}
                    >
                        {t(rankInfo.messageKey)}
                    </Animated.Text>

                    <View style={styles.statsRow}>
                        <Animated.View entering={FadeIn.delay(800).duration(400)} style={styles.statBox}>
                            <Text style={styles.statLabel}>{t('games.common.time').toUpperCase()}</Text>
                            <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
                        </Animated.View>
                        <View style={styles.separator} />
                        <Animated.View entering={FadeIn.delay(900).duration(400)} style={styles.statBox}>
                            <Text style={styles.statLabel}>{t('games.common.grid').toUpperCase()}</Text>
                            <Text style={styles.statValue}>{gridSize}×{gridSize}</Text>
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeIn.delay(1000)} style={styles.buttonContainer}>
                        <PremiumButton
                            title={t('games.common.playAgain')}
                            onPress={onRestart}
                            icon={RotateCcw}
                            variant="primary"
                            size="lg"
                            fullWidth
                            animatePulse
                        />

                        <PremiumButton
                            title={t('common.close', { defaultValue: 'Kapat' })}
                            onPress={onClose}
                            variant="secondary"
                            size="lg"
                            fullWidth
                        />
                    </Animated.View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: 'rgba(0,0,0,0.95)',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    rankContainer: {
        marginBottom: 16,
    },
    rankText: {
        fontSize: 90,
        fontWeight: '900',
        lineHeight: 100,
        textShadowRadius: 20,
    },
    rankMessage: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    separator: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 1,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#00E5FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 16,
        marginLeft: 8,
    },
    secondaryButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    secondaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
