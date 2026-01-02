/**
 * Language Selector Component
 * Allows users to switch between available languages
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react-native';
import { LANGUAGES, LanguageCode, changeLanguage, getCurrentLanguage } from '../../i18n';
import { colors as _colors, fontFamily, fontSize, spacing, borderRadius, glows } from '../../theme';
import { useTheme } from '../../theme';

export const LanguageSelector: React.FC = () => {
    const { colors } = useTheme();
    const { i18n } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const currentLang = getCurrentLanguage();

    const handleLanguageChange = async (langCode: LanguageCode) => {
        await changeLanguage(langCode);
        setIsModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.7}
            >
                <Globe size={20} color={colors.textMuted} strokeWidth={2} />
                <Text style={[styles.triggerText, { color: colors.textMuted }]}>
                    {LANGUAGES[currentLang].nativeName}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                >
                    <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
                        {Object.values(LANGUAGES).map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    currentLang === lang.code && [styles.languageOptionActive, { backgroundColor: colors.primaryGlow }],
                                ]}
                                onPress={() => handleLanguageChange(lang.code as LanguageCode)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.languageInfo}>
                                    <Text style={[
                                        styles.languageName,
                                        { color: colors.text },
                                        currentLang === lang.code && [styles.languageNameActive, { color: colors.primary }],
                                    ]}>
                                        {lang.nativeName}
                                    </Text>
                                    <Text style={[styles.languageNameEn, { color: colors.textMuted }]}>{lang.name}</Text>
                                </View>
                                {currentLang === lang.code && (
                                    <Check size={20} color={colors.primary} strokeWidth={2.5} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
        // backgroundColor: colors.surface, // Moved to inline style
        borderRadius: borderRadius.md,
        borderWidth: 1,
        // borderColor: colors.glassBorder, // Moved to inline style
    },
    triggerText: {
        fontFamily: fontFamily.uiMedium,
        fontSize: fontSize.sm,
        // color: colors.textMuted, // Moved to inline style
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modal: {
        // backgroundColor: colors.surface, // Moved to inline style
        borderRadius: borderRadius.bento,
        borderWidth: 1,
        // borderColor: colors.glassBorder, // Moved to inline style
        padding: spacing.lg,
        width: '100%',
        maxWidth: 320,
    },
    modalTitle: {
        fontFamily: fontFamily.uiBold,
        fontSize: fontSize.lg,
        // color: colors.text, // Moved to inline style
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    languageOptionActive: {
        // backgroundColor: colors.primaryGlow, // Moved to inline style
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontFamily: fontFamily.uiMedium,
        fontSize: fontSize.md,
        // color: colors.text, // Moved to inline style
    },
    languageNameActive: {
        // color: colors.primary, // Moved to inline style
    },
    languageNameEn: {
        fontFamily: fontFamily.uiRegular,
        fontSize: fontSize.sm,
        // color: colors.textMuted, // Moved to inline style
        marginTop: 2,
    },
});
