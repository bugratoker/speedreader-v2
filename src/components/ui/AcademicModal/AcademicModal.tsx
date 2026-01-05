/**
 * AcademicModal Component
 * Glassmorphism modal showing academic research behind training techniques
 */

import React from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ExternalLink, GraduationCap } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme';
import { ScalePressable } from '../ScalePressable';

interface AcademicModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description: string;
    researchLink?: string;
}

export const AcademicModal: React.FC<AcademicModalProps> = ({
    visible,
    onClose,
    title,
    description,
    researchLink,
}) => {
    const { t } = useTranslation();
    const { colors, mode, fontFamily, fontSize, spacing, borderRadius } = useTheme();

    const handleLearnMore = () => {
        if (researchLink) {
            Linking.openURL(researchLink);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[
                            styles.modalContainer,
                            {
                                backgroundColor: mode === 'dark'
                                    ? 'rgba(20,20,25,0.95)'
                                    : 'rgba(255,255,255,0.98)',
                                borderColor: mode === 'dark'
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.08)',
                            }
                        ]}>
                            {/* Close button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>

                            {/* Icon */}
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: `${colors.secondary}20` }
                            ]}>
                                <GraduationCap
                                    size={28}
                                    color={colors.secondary}
                                    strokeWidth={1.5}
                                />
                            </View>

                            {/* Title */}
                            <Text style={[
                                styles.title,
                                {
                                    color: colors.secondary,
                                    fontFamily: fontFamily.uiBold,
                                }
                            ]}>
                                {title}
                            </Text>

                            {/* Description */}
                            <ScrollView
                                style={styles.descriptionScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={[
                                    styles.description,
                                    {
                                        color: colors.textMuted,
                                        fontFamily: fontFamily.uiRegular,
                                    }
                                ]}>
                                    {description}
                                </Text>
                            </ScrollView>

                            {/* Learn More Button */}
                            {researchLink && (
                                <ScalePressable
                                    onPress={handleLearnMore}
                                    style={[
                                        styles.learnMoreButton,
                                        {
                                            backgroundColor: colors.secondary,
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.learnMoreText,
                                        { fontFamily: fontFamily.uiMedium, color: colors.white }
                                    ]}>
                                        {t('games.academic.learnMore')}
                                    </Text>
                                    <ExternalLink size={16} color={colors.white} />
                                </ScalePressable>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
    },
    descriptionScroll: {
        maxHeight: 200,
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },
    learnMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    learnMoreText: {
        fontSize: 14,
    },
});
