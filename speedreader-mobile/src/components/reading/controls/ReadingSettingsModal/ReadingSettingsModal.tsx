import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Switch, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';

import { X, Image, HelpCircle, Timer, Vibrate, Volume2, Eye, Type, ChevronDown, Check, Layers, Sparkles } from 'lucide-react-native';
import { useTheme, readingFontFamilies } from '@theme';
import { fontFamily, fontSize, spacing, borderRadius } from '@theme';
import { ReadingSettings, SettingKey, ReadingFont, FONT_LABELS, BionicColor, BIONIC_COLORS } from '@/engine/settings';
import { ReadingMode } from '@/engine/types';
import { FontSizeControl } from './FontSizeControl';

// Enable LayoutAnimation for the dropdown toggle
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReadingSettingsModalProps {
    visible: boolean;
    settings: ReadingSettings;
    currentMode?: ReadingMode;
    onSettingChange: (key: SettingKey, value: any) => void;
    onClose: () => void;
}

interface SettingItemConfig {
    key: SettingKey;
    icon: any;
    labelKey: string;
    descKey: string;
}

const AI_ITEMS: SettingItemConfig[] = [
    {
        key: 'autoImageGeneration',
        icon: Image,
        labelKey: 'read.settings.autoImage',
        descKey: 'read.settings.autoImageDesc',
    },
    {
        key: 'autoQuestionMode',
        icon: HelpCircle,
        labelKey: 'read.settings.autoQuestion',
        descKey: 'read.settings.autoQuestionDesc',
    },
];

const GENERAL_ITEMS: SettingItemConfig[] = [
    {
        key: 'smartCountdown',
        icon: Timer,
        labelKey: 'read.settings.smartCountdown',
        descKey: 'read.settings.smartCountdownDesc',
    },
    {
        key: 'hapticFeedback',
        icon: Vibrate,
        labelKey: 'read.settings.hapticFeedback',
        descKey: 'read.settings.hapticFeedbackDesc',
    },
    {
        key: 'readingSounds',
        icon: Volume2,
        labelKey: 'read.settings.readingSounds',
        descKey: 'read.settings.readingSoundsDesc',
    },
    {
        key: 'peripheralHighlight',
        icon: Eye,
        labelKey: 'read.settings.peripheralHighlight',
        descKey: 'read.settings.peripheralHighlightDesc',
    },
];

const CHUNK_ITEMS: SettingItemConfig[] = [
    {
        key: 'smartChunking',
        icon: Sparkles,
        labelKey: 'read.settings.smartChunking',
        descKey: 'read.settings.smartChunkingDesc',
    },
];

export const ReadingSettingsModal: React.FC<ReadingSettingsModalProps> = ({
    visible,
    settings,
    currentMode,
    onSettingChange,
    onClose,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);

    const toggleFontPicker = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsFontPickerOpen(!isFontPickerOpen);
    };

    const renderSettingRow = (item: SettingItemConfig, isLast: boolean) => {
        const Icon = item.icon;
        const isEnabled = settings[item.key] as boolean;

        return (
            <View key={item.key}>
                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: isEnabled ? colors.primary + '15' : colors.surfaceElevated }]}>
                        <Icon size={20} color={isEnabled ? colors.primary : colors.textMuted} />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fontFamily.uiMedium }]}>
                            {t(item.labelKey)}
                        </Text>
                        <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
                            {t(item.descKey)}
                        </Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={(val) => onSettingChange(item.key, val)}
                        trackColor={{ false: colors.surfaceElevated, true: colors.primary + '80' }}
                        thumbColor={isEnabled ? colors.primary : colors.textMuted}
                    />
                </View>
                {!isLast && <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />}
            </View>
        );
    };

    const lang = (t('common.next') === 'Next' ? 'en' : 'tr') as 'en' | 'tr';
    const activeFontLabel = FONT_LABELS[settings.textFont as ReadingFont][lang];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} onPress={onClose} />

                <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
                            {t('read.settings.title')}
                        </Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>

                        {/* Section: AI Features (New) */}
                        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fontFamily.uiBold }]}>
                            {t('read.settings.ai').toUpperCase()}
                        </Text>
                        <View style={[styles.groupedCard, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated + '50' }]}>
                            {AI_ITEMS.map((item, index) => renderSettingRow(item, index === AI_ITEMS.length - 1))}
                        </View>

                        {/* Section: General */}
                        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fontFamily.uiBold, marginTop: spacing.lg }]}>
                            {t('read.settings.general').toUpperCase()}
                        </Text>
                        <View style={[styles.groupedCard, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated + '50' }]}>
                            {GENERAL_ITEMS.map((item, index) => renderSettingRow(item, index === GENERAL_ITEMS.length - 1))}
                        </View>

                        {/* Section: Chunk Reading - Only show when chunk mode */}
                        {currentMode === 'chunk' && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fontFamily.uiBold, marginTop: spacing.lg }]}>
                                    {t('read.settings.chunkSettings').toUpperCase()}
                                </Text>
                                <View style={[styles.groupedCard, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated + '50' }]}>
                                    {/* Chunk Size Slider */}
                                    <View style={styles.row}>
                                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                            <Layers size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.rowContent}>
                                            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fontFamily.uiMedium }]}>
                                                {t('read.settings.chunkSize')}
                                            </Text>
                                            <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
                                                {t('read.settings.chunkSizeDesc')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.chunkSizeRow}>
                                        {[2, 3, 4, 5].map((size) => (
                                            <Pressable
                                                key={size}
                                                style={[
                                                    styles.chunkSizeButton,
                                                    {
                                                        backgroundColor: settings.chunkSize === size ? colors.primary : colors.surface,
                                                        borderColor: settings.chunkSize === size ? colors.primary : colors.glassBorder,
                                                    }
                                                ]}
                                                onPress={() => onSettingChange('chunkSize', size)}
                                            >
                                                <Text style={[
                                                    styles.chunkSizeText,
                                                    {
                                                        color: settings.chunkSize === size ? colors.white : colors.text,
                                                        fontFamily: fontFamily.uiMedium,
                                                    }
                                                ]}>
                                                    {size}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                    <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
                                    {CHUNK_ITEMS.map((item, index) => renderSettingRow(item, index === CHUNK_ITEMS.length - 1))}
                                </View>
                            </>
                        )}

                        {/* Section: Appearance */}
                        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fontFamily.uiBold, marginTop: spacing.lg }]}>
                            {t('read.settings.appearance').toUpperCase()}
                        </Text>

                        <View style={[styles.groupedCard, { borderColor: colors.glassBorder }]}>
                            {/* Font Size Selector Row */}
                            {/* Font Size Control (Stepper) */}
                            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.md, paddingHorizontal: spacing.md }]}>
                                {t('read.settings.textSize').toUpperCase()}
                            </Text>

                            <FontSizeControl
                                currentSize={settings.textSize}
                                onChange={(val) => onSettingChange('textSize', val)}
                            />

                            <View style={{ height: spacing.md }} />

                            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

                            {/* Font Family Selector */}
                            <Pressable style={styles.dropdownTrigger} onPress={toggleFontPicker}>
                                <View style={styles.iconBox}>
                                    <Type size={20} color={colors.primary} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fontFamily.uiMedium }]}>
                                        {t('read.settings.fontSelection')}
                                    </Text>
                                    <Text style={[styles.rowDesc, { color: colors.primary }]}>{activeFontLabel}</Text>
                                </View>
                                <ChevronDown size={20} color={colors.textMuted} style={{ transform: [{ rotate: isFontPickerOpen ? '180deg' : '0deg' }] }} />
                            </Pressable>

                            {isFontPickerOpen && (
                                <View style={styles.pickerOptions}>
                                    {(Object.keys(FONT_LABELS) as ReadingFont[]).map((font) => (
                                        <Pressable
                                            key={font}
                                            style={styles.pickerItem}
                                            onPress={() => {
                                                onSettingChange('textFont', font);
                                                toggleFontPicker();
                                            }}
                                        >
                                            <Text style={[
                                                styles.pickerText,
                                                {
                                                    color: settings.textFont === font ? colors.primary : colors.text,
                                                    fontFamily: readingFontFamilies[font].regular
                                                }
                                            ]}>
                                                {FONT_LABELS[font][lang]}
                                            </Text>
                                            {settings.textFont === font && <Check size={18} color={colors.primary} />}
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {/* Bionic Highlight Color - Only show when bionic mode */}
                            {currentMode === 'bionic' && (
                                <>
                                    <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

                                    <View style={styles.row}>
                                        <View style={[styles.iconBox, { backgroundColor: BIONIC_COLORS[settings.bionicHighlightColor] + '15' }]}>
                                            <Eye size={20} color={BIONIC_COLORS[settings.bionicHighlightColor]} />
                                        </View>
                                        <View style={styles.rowContent}>
                                            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fontFamily.uiMedium }]}>
                                                Bionic Highlight Color
                                            </Text>
                                            <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
                                                Color for current word in bionic mode
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.colorPickerRow}>
                                        {(Object.keys(BIONIC_COLORS) as BionicColor[]).map((colorKey) => (
                                            <Pressable
                                                key={colorKey}
                                                style={[
                                                    styles.colorButton,
                                                    {
                                                        backgroundColor: BIONIC_COLORS[colorKey],
                                                        borderColor: settings.bionicHighlightColor === colorKey ? colors.text : 'transparent',
                                                        borderWidth: settings.bionicHighlightColor === colorKey ? 2 : 0,
                                                    }
                                                ]}
                                                onPress={() => onSettingChange('bionicHighlightColor', colorKey)}
                                            >
                                                {settings.bionicHighlightColor === colorKey && (
                                                    <Check size={16} color={colors.white} strokeWidth={3} />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    modalContent: {
        width: '92%',
        maxHeight: '85%',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        marginBottom: spacing.xl, // Gap from bottom
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
    title: { fontSize: 22 },
    closeButton: { padding: spacing.xs },
    sectionTitle: { fontSize: 12, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
    groupedCard: { borderRadius: borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    iconBox: { width: 36, height: 36, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: fontSize.md, marginBottom: 2 },
    rowDesc: { fontSize: fontSize.sm, lineHeight: 16 },
    divider: { height: 1, marginLeft: spacing.md + 36 + spacing.md }, // Aligned with text start
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    pickerOptions: { paddingBottom: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    pickerItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    pickerText: { fontSize: fontSize.md },
    chunkSizeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    chunkSizeButton: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chunkSizeText: {
        fontSize: fontSize.lg,
    },
    colorPickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    colorButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});