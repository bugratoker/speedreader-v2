/**
 * Read Screen
 * Main reading experience with mode switching
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme, readingFontFamilies } from '../../theme';
import { useReadingEngine, ReadingMode } from '../../engine';
import {
    RSVPWordDisplay,
    RSVPControls,
    BionicTextDisplay,
    ChunkDisplay,
    ReadingModeSelector,
    ReadingSettingsModal,
    GuidedScrollingDisplay,
    DualColumnReading,
} from '../../components';
import { ReadingSettings, DEFAULT_READING_SETTINGS, SettingKey, BIONIC_COLORS } from '../../engine/settings';


import i18n from '../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample reading text for demo (300+ words)
const SAMPLE_TEXT = `The art of speed reading is not about rushing through words, but about training your brain to process information more efficiently. Speed reading techniques have been studied for decades, and researchers have found that the average person reads at about 200 to 250 words per minute. However, with proper training and practice, many people can double or even triple their reading speed while maintaining good comprehension.

One of the most effective techniques is called RSVP, or Rapid Serial Visual Presentation. This method displays words one at a time in a fixed position, eliminating the need for eye movements across the page. By reducing the physical effort of reading, your brain can focus entirely on processing the meaning of each word. Studies have shown that RSVP can significantly improve reading speeds without sacrificing understanding.

Another powerful approach is Bionic Reading, which highlights the beginning of each word to guide your eyes more efficiently. This technique works because your brain can recognize words from just the first few letters, filling in the rest automatically. The strategic use of bold text creates artificial fixation points that help your eyes move through text with greater precision and less effort.

The chunking method takes a different approach by grouping words into meaningful phrases. Instead of processing one word at a time, your brain learns to recognize and comprehend clusters of related words simultaneously. This mirrors how skilled readers naturally process text, reducing the number of eye movements and mental steps required to extract meaning from written content.

Dual-column saccade training helps develop efficient eye movement patterns by alternating fixation points between two vertical lines. This technique trains your peripheral vision to capture more information per glance, reducing the total number of fixations needed to read a line of text. With consistent practice, these systematic training methods can transform your reading capabilities and significantly boost your information processing speed.`;

const SAMPLE_TEXT_TR = `Hızlı okuma sanatı kelimelerin üzerinden aceleyle geçmek değil, beyninizi bilgiyi daha verimli işlemesi için eğitmektir. Hızlı okuma teknikleri on yıllardır incelenmektedir ve araştırmacılar ortalama bir insanın dakikada yaklaşık 200 ila 250 kelime okuduğunu bulmuştur. Ancak, doğru eğitim ve pratikle, birçok insan okuma hızını ikiye hatta üçe katlarken anlamayı da koruyabilir.

En etkili tekniklerden biri RSVP veya Hızlı Seri Görsel Sunum (Rapid Serial Visual Presentation) olarak adlandırılır. Bu yöntem, kelimeleri sabit bir konumda tek tek göstererek sayfa boyunca göz hareketlerine olan ihtiyacı ortadan kaldırır. Okumanın fiziksel çabasını azaltarak, beyniniz tamamen her kelimenin anlamını işlemeye odaklanabilir. Çalışmalar, RSVP'nin anlamadan ödün vermeden okuma hızlarını önemli ölçüde artırabildiğini göstermiştir.

Bir diğer güçlü yaklaşım ise, gözlerinizi daha verimli bir şekilde yönlendirmek için her kelimenin başlangıcını vurgulayan Biyonik Okuma'dır. Bu teknik işe yarar çünkü beyniniz kelimeleri sadece ilk birkaç harften tanıyabilir ve gerisini otomatik olarak tamamlar. Kalın metnin stratejik kullanımı, gözlerinizi metin üzerinde daha hassas ve daha az çabayla hareket etmesine yardımcı olan yapay odaklanma noktaları oluşturur.

Gruplama yöntemi (Chunking), kelimeleri anlamlı ifadeler halinde gruplayarak farklı bir yaklaşım benimser. Beyniniz tek bir kelimeyi işlemek yerine, ilgili kelime kümelerini aynı anda tanımayı ve kavramayı öğrenir. Bu, yetenekli okuyucuların metni doğal olarak nasıl işlediğini yansıtır ve yazılı içerikten anlam çıkarmak için gereken göz hareketlerinin ve zihinsel adımların sayısını azaltır.

Çift sütunlu seğirme (saccade) eğitimi, iki dikey çizgi arasında odak noktalarını değiştirerek verimli göz hareketi kalıpları geliştirmeye yardımcı olur. Bu teknik, çevresel görüşünüzü her bakışta daha fazla bilgi yakalamak için eğitir ve bir metin satırını okumak için gereken toplam odaklanma sayısını azaltır. Tutarlı bir pratikle, bu sistematik eğitim yöntemleri okuma yeteneklerinizi dönüştürebilir ve bilgi işleme hızınızı önemli ölçüde artırabilir.`;

export const ReadScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { colors, fontFamily, fontSize, spacing, borderRadius, glows } = useTheme();
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const wpmScaleAnim = useRef(new Animated.Value(1)).current;
    const [readingSettings, setReadingSettings] = useState<ReadingSettings>(DEFAULT_READING_SETTINGS);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    // Determine active text based on language
    const activeText = i18n.language === 'tr' ? SAMPLE_TEXT_TR : SAMPLE_TEXT;

    const handleSettingChange = (key: SettingKey, value: boolean | string | number) => {
        setReadingSettings((prev) => ({ ...prev, [key]: value }));
    };

    // Reading engine with sample text
    const engine = useReadingEngine({
        text: activeText,
        mode: 'rsvp',
        initialWpm: 300,
        chunkSize: readingSettings.chunkSize,
        useSmartChunking: readingSettings.smartChunking,
        onComplete: () => {
            console.log('Reading complete!');
        },
    });

    // Animate WPM changes
    React.useEffect(() => {
        Animated.sequence([
            Animated.timing(wpmScaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.timing(wpmScaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
    }, [engine.wpm, wpmScaleAnim]);

    // Animate word changes for RSVP and Chunking modes
    React.useEffect(() => {
        if (engine.mode !== 'bionic' && engine.isPlaying && !engine.isPaused) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 30, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 30, useNativeDriver: true }),
            ]).start();
        }
    }, [engine.currentIndex, engine.mode, engine.isPlaying, engine.isPaused, fadeAnim]);

    // Use theme fontFamily.reading as fallback if setting is somehow invalid
    const fontConfig = readingFontFamilies[readingSettings.textFont];
    const activeFontFamily = fontConfig?.regular || fontFamily.reading;
    const activeFontFamilyBold = fontConfig?.bold || fontFamily.readingBold;

    // Default text size fallback
    const currentTextSize = readingSettings.textSize || 32;

    // Render the appropriate display based on mode
    const renderModeDisplay = () => {
        switch (engine.mode) {
            case 'rsvp':
                return (
                    <View style={[
                        styles.displayContainer,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder,
                            // Add depth
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 4
                        }
                    ]}>
                        <RSVPWordDisplay
                            word={engine.currentWord || ''}
                            fadeAnim={fadeAnim}
                            fontSize={currentTextSize + 8} // RSVP is usually larger
                            fontFamily={activeFontFamily}
                            fontFamilyBold={activeFontFamilyBold}
                        />
                    </View>
                );

            case 'bionic':
                return (
                    <View style={styles.bionicContainer}>
                        <BionicTextDisplay
                            bionicWords={engine.bionicText || []}
                            currentWordIndex={engine.currentIndex}
                            isPlaying={engine.isPlaying && !engine.isPaused}
                            highlightColor={BIONIC_COLORS[readingSettings.bionicHighlightColor]}
                            textSize={currentTextSize - 8}
                            wpm={engine.wpm}
                            fontFamily={activeFontFamily}
                            fontFamilyBold={activeFontFamilyBold}
                        />
                    </View>
                );

            case 'chunk':
                return (
                    <View style={[
                        styles.displayContainer,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.glassBorder
                        }
                    ]}>
                        <ChunkDisplay
                            words={engine.currentChunk || []}
                            previousChunk={engine.previousChunk}
                            nextChunk={engine.nextChunk}
                            fontSize={currentTextSize}
                            fontFamily={activeFontFamily}
                            onTapLeft={engine.undo}
                            onTapRight={() => {
                                if (engine.currentIndex < engine.totalItems - 1) {
                                    engine.setCurrentIndex(engine.currentIndex + 1);
                                }
                            }}
                        />
                    </View>
                );

            case 'guided':
                return (
                    <View style={styles.bionicContainer}>
                        <GuidedScrollingDisplay
                            words={engine.words}
                            currentWordIndex={engine.currentIndex}
                            isPlaying={engine.isPlaying && !engine.isPaused}
                            onUserScroll={engine.pause}
                            fontFamily={activeFontFamily}
                            fontFamilyBold={activeFontFamilyBold}
                        />
                    </View>
                );

            case 'dual-column':
                return (
                    <View style={styles.bionicContainer}>
                        <DualColumnReading
                            text={activeText}
                            wpm={engine.wpm}
                            isPlaying={engine.isPlaying && !engine.isPaused}
                            onProgress={(p) => console.log('Progress:', p)}
                            onComplete={engine.reset}
                            fontFamily={activeFontFamily}
                        />
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient glows */}
            <View style={[styles.glowTopRight, { backgroundColor: colors.primaryGlow }]} />
            <View style={[styles.glowBottomLeft, { backgroundColor: colors.secondaryGlow }]} />

            <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { fontFamily: fontFamily.uiBold, color: colors.text }]}>
                        {t('read.title')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Text style={[styles.subtitle, { fontFamily: fontFamily.uiRegular, color: colors.textMuted }]}>
                            {engine.currentIndex + 1} / {engine.totalItems} • {new Date(engine.elapsedTime * 1000).toISOString().substr(14, 5)} •
                        </Text>
                        <Animated.Text
                            style={[
                                styles.wpmHighlight,
                                {
                                    fontFamily: fontFamily.uiBold,
                                    color: colors.primary,
                                    transform: [{ scale: wpmScaleAnim }],
                                }
                            ]}
                        >
                            {engine.wpm} WPM
                        </Animated.Text>
                    </View>
                </View>

                {/* Mode Selector */}
                <View style={styles.modeSelector}>
                    <ReadingModeSelector
                        currentMode={engine.mode}
                        onModeChange={engine.setMode}
                        disabled={engine.isPlaying && !engine.isPaused}
                        onSettingsPress={() => setSettingsModalVisible(true)}
                    />
                    <ReadingSettingsModal
                        visible={settingsModalVisible}
                        settings={readingSettings}
                        currentMode={engine.mode}
                        onSettingChange={handleSettingChange}
                        onClose={() => setSettingsModalVisible(false)}
                    />
                </View>

                {/* Progress Bar with Glow */}
                <View style={[
                    styles.progressBar,
                    { backgroundColor: colors.surface },
                    glows.primarySubtle // Add subtle glow to container
                ]}>
                    <View style={[
                        styles.progressFill,
                        { width: `${engine.progress}%`, backgroundColor: colors.primary },
                        glows.primary // Glow the fill
                    ]} />
                </View>

                {/* Mode Display */}
                <View style={styles.displayWrapper}>
                    {renderModeDisplay()}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <RSVPControls
                        wpm={engine.wpm}
                        isPaused={engine.isPaused || !engine.isPlaying}
                        onSpeedUp={engine.speedUp}
                        onSlowDown={engine.slowDown}
                        onTogglePause={engine.isPlaying ? engine.togglePause : engine.start}
                        onUndo={engine.undo}
                        onReload={engine.reset}
                        canUndo={engine.currentIndex > 0 && engine.isPlaying}
                        showWpmLabel={false}
                    />
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTopRight: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    glowBottomLeft: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for tab bar
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    wpmHighlight: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modeSelector: {
        marginBottom: 16,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    displayWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    displayContainer: {
        width: SCREEN_WIDTH - 32,
        minHeight: 180,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    bionicContainer: {
        flex: 1,
        maxHeight: 400,
    },
    controls: {
        marginVertical: 24,
        alignItems: 'center',
    },
    hint: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 16,
    },
});
