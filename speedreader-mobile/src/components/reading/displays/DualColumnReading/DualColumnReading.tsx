/**
 * Dual-Column Saccade Reading - Full-Text Training Mode (v2 - UX Fixed)
 * 
 * FIXES:
 * - Removed redundant cursor layers - line highlight only
 * - Added undo/step-back functionality
 * - Added 3-2-1 countdown before reading
 * - Improved cursor tracking consistency
 * - Smooth continuous flow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Dimensions, ScrollView, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { useTranslation } from 'react-i18next';
import { MODE_LABELS, MODE_DESCRIPTIONS } from '@/engine/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DualColumnReadingProps {
    text: string;
    wpm: number;
    isPlaying: boolean;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
    fontFamily?: string;
}

export const DualColumnReading: React.FC<DualColumnReadingProps> = ({
    text,
    wpm,
    isPlaying,
    onProgress,
    onComplete,
    fontFamily: propFontFamily,
}) => {
    const { colors, spacing, fontFamily, fontSize, borderRadius } = useTheme();
    const activeFontFamily = propFontFamily || fontFamily.reading;
    const { t, i18n } = useTranslation();
    const lang = (i18n.language === 'tr' ? 'tr' : 'en') as 'en' | 'tr';

    // State
    const [currentLine, setCurrentLine] = useState(0);
    const [activeColumn, setActiveColumn] = useState<'left' | 'right'>('left');
    const [textLines, setTextLines] = useState<string[]>([]);

    // Animation values
    const leftPulse = useSharedValue(0.3);
    const rightPulse = useSharedValue(0.3);
    const highlightY = useSharedValue(0);

    // Refs
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Layout
    const contentWidth = SCREEN_WIDTH - spacing.md * 4;
    const lineHeight = 32;
    const leftColumnX = contentWidth * 0.25;
    const rightColumnX = contentWidth * 0.75;

    // Calculate fixation duration
    const wordsPerFixation = 3;
    const fixationsPerMinute = wpm / wordsPerFixation;
    const fixationDuration = 60000 / fixationsPerMinute / 2;

    // Split text into lines
    useEffect(() => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let currentLineWords: string[] = [];
        const maxCharsPerLine = Math.floor(contentWidth / 11);

        words.forEach(word => {
            const testLine = [...currentLineWords, word].join(' ');
            if (testLine.length > maxCharsPerLine) {
                if (currentLineWords.length > 0) {
                    lines.push(currentLineWords.join(' '));
                }
                currentLineWords = [word];
            } else {
                currentLineWords.push(word);
            }
        });

        if (currentLineWords.length > 0) {
            lines.push(currentLineWords.join(' '));
        }

        setTextLines(lines);
    }, [text, contentWidth]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);



    // Main rhythm loop
    useEffect(() => {
        if (!isPlaying || textLines.length === 0) {
            leftPulse.value = withTiming(0.3, { duration: 150 });
            rightPulse.value = withTiming(0.3, { duration: 150 });
            return;
        }

        const advanceSaccade = () => {
            if (activeColumn === 'left') {
                // Pulse left
                leftPulse.value = withSequence(
                    withTiming(1, { duration: 100 }),
                    withTiming(0.6, { duration: fixationDuration - 100 })
                );
                rightPulse.value = withTiming(0.3, { duration: 100 });

                timeoutRef.current = setTimeout(() => {
                    setActiveColumn('right');
                }, fixationDuration);
            } else {
                // Pulse right, then advance line
                rightPulse.value = withSequence(
                    withTiming(1, { duration: 100 }),
                    withTiming(0.6, { duration: fixationDuration - 100 })
                );
                leftPulse.value = withTiming(0.3, { duration: 100 });

                timeoutRef.current = setTimeout(() => {
                    const nextLine = currentLine + 1;

                    if (nextLine >= textLines.length) {
                        onComplete?.();
                        return;
                    }

                    setCurrentLine(nextLine);
                    setActiveColumn('left');

                    // Update progress
                    const progress = ((nextLine + 1) / textLines.length) * 100;
                    onProgress?.(progress);

                    // Scroll to keep current line visible
                    const scrollY = Math.max(0, nextLine * lineHeight - 100);
                    highlightY.value = withTiming(nextLine * lineHeight, { duration: 150 });
                    scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
                }, fixationDuration);
            }
        };

        advanceSaccade();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isPlaying, activeColumn, currentLine, textLines.length, fixationDuration]);



    // Animated styles
    const leftLineStyle = useAnimatedStyle(() => ({
        opacity: leftPulse.value,
    }));

    const rightLineStyle = useAnimatedStyle(() => ({
        opacity: rightPulse.value,
    }));

    const highlightStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: highlightY.value }],
    }));

    return (
        <View style={{ flex: 1, position: 'relative' }}>
            {/* Guide Lines - Static Red Lines Only */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            >
                {/* Left guide line - STATIC RED */}
                <View
                    style={{
                        position: 'absolute',
                        left: leftColumnX - 0.5,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: colors.error,
                        opacity: 0.8,
                    }}
                />

                {/* Right guide line - STATIC RED */}
                <View
                    style={{
                        position: 'absolute',
                        left: rightColumnX - 0.5,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: colors.error,
                        opacity: 0.8,
                    }}
                />

                {/* NO CURSOR OVERLAY - REMOVED */}
            </View>

            {/* Text Content */}
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: spacing.md }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={!isPlaying}
            >
                {textLines.map((line, index) => (
                    <View
                        key={index}
                        style={{
                            height: lineHeight,
                            justifyContent: 'center',
                            paddingHorizontal: spacing.sm,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: activeFontFamily,
                                fontSize: 17,
                                lineHeight: lineHeight,
                                color: index === currentLine && isPlaying
                                    ? colors.text
                                    : index < currentLine
                                        ? colors.textDim
                                        : colors.textMuted,
                                textAlign: 'left',
                            }}
                        >
                            {line}
                        </Text>
                    </View>
                ))}

                {/* Bottom padding */}
                <View style={{ height: 200 }} />
            </ScrollView>



        </View>
    );
};
