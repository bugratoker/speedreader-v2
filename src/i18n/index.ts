/**
 * i18n Configuration
 * Internationalization setup using i18next with expo-localization
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import tr from './locales/tr.json';

// Supported languages
export const LANGUAGES = {
    en: { code: 'en', name: 'English', nativeName: 'English' },
    tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Get device language, fallback to English
const getDeviceLanguage = (): LanguageCode => {
    const deviceLocale = Localization.getLocales()[0]?.languageCode;
    if (deviceLocale && deviceLocale in LANGUAGES) {
        return deviceLocale as LanguageCode;
    }
    return 'en';
};

// Initialize i18n
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            tr: { translation: tr },
        },
        lng: getDeviceLanguage(),
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;

/**
 * Change the app language
 */
export const changeLanguage = async (languageCode: LanguageCode): Promise<void> => {
    await i18n.changeLanguage(languageCode);
};

/**
 * Get current language code
 */
export const getCurrentLanguage = (): LanguageCode => {
    return i18n.language as LanguageCode;
};
