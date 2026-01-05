import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Target } from 'lucide-react-native';

interface HUDOverlayProps {
    options: string[];
    onSelect: (word: string) => void;
    visible: boolean;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ options, onSelect, visible }) => {
    const { colors, spacing, borderRadius, fontFamily, fontSize } = useTheme();

    if (!visible) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Semi-transparent backdrop - does NOT block touches outside the modal */}
            <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.75)' }]} pointerEvents="none" />

            {/* Centered modal container */}
            <View style={styles.modalWrapper} pointerEvents="box-none">
                <Animated.View
                    entering={ZoomIn.duration(250).springify()}
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.surface,
                            borderRadius: borderRadius.bento,
                            borderWidth: 1,
                            borderColor: colors.glassBorder,
                            padding: spacing.xl,
                            maxWidth: 380,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 24,
                            elevation: 12,
                        }
                    ]}
                >
                    {/* Decorative target icon in background */}
                    <View style={styles.backgroundIcon} pointerEvents="none">
                        <Target size={120} color={colors.primary} strokeWidth={0.5} opacity={0.08} />
                    </View>

                    {/* Options Grid - 2x2 layout */}
                    <View style={[styles.optionsGrid, { gap: spacing.md }]}>
                        {options.map((word, index) => (
                            <Pressable
                                key={index}
                                onPress={() => onSelect(word)}
                            >
                                {({ pressed }) => (
                                    <View style={{
                                        width: 160,
                                        height: 70,
                                        backgroundColor: pressed ? colors.primaryDim : colors.surfaceElevated,
                                        borderRadius: borderRadius.md,
                                        borderWidth: 2,
                                        borderColor: pressed ? colors.primary : colors.glassBorder,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: colors.primary,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: pressed ? 0.5 : 0.15,
                                        shadowRadius: pressed ? 12 : 6,
                                        elevation: pressed ? 6 : 2,
                                        transform: [{ scale: pressed ? 0.96 : 1 }],
                                    }}>
                                        <Text style={{
                                            fontFamily: fontFamily.uiBold,
                                            fontSize: fontSize.lg,
                                            color: pressed ? colors.primary : colors.text,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5,
                                            textAlign: 'center',
                                        }}>
                                            {word}
                                        </Text>

                                        {/* HUD corner decorations */}
                                        <View style={[styles.hudCorner, styles.topLeft, { borderColor: colors.primary }]} />
                                        <View style={[styles.hudCorner, styles.bottomRight, { borderColor: colors.primary }]} />
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000, // Ensure it's above everything
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    modalWrapper: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    modalContent: {
        position: 'relative',
        alignItems: 'center',
    },
    backgroundIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -60 }, { translateY: -60 }],
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
    },
    hudCorner: {
        position: 'absolute',
        width: 8,
        height: 8,
        opacity: 0.6,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
});
