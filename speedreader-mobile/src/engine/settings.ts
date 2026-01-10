/**
 * Reading Settings Types
 * Configuration options for reading experience
 */

export type ReadingFont = 'Inter' | 'Merriweather' | 'OpenDyslexic' | 'Atkinson';

// Bionic highlight color presets
export type BionicColor = 'cyan' | 'green' | 'orange' | 'purple' | 'pink';

export const BIONIC_COLORS: Record<BionicColor, string> = {
    cyan: '#00D9FF',
    green: '#00E676',
    orange: '#FF9100',
    purple: '#B388FF',
    pink: '#FF4081',
};

export interface ReadingSettings {
    autoImageGeneration: boolean;
    autoQuestionMode: boolean;
    smartCountdown: boolean;
    hapticFeedback: boolean;
    readingSounds: boolean;
    peripheralHighlight: boolean;
    textFont: ReadingFont;
    textSize: number;
    chunkSize: number;
    smartChunking: boolean;
    bionicHighlightColor: BionicColor;
}

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
    autoImageGeneration: false,
    autoQuestionMode: false,
    smartCountdown: true,
    hapticFeedback: true,
    readingSounds: false,
    peripheralHighlight: true,
    textFont: 'Inter',
    textSize: 32,
    chunkSize: 3,
    smartChunking: true,
    bionicHighlightColor: 'cyan',
};

export const FONT_SIZES = [14, 16, 18, 20, 22, 26, 30, 34];

export type SettingKey = keyof ReadingSettings;

// Font display names
export const FONT_LABELS: Record<ReadingFont, { en: string; tr: string; description: { en: string; tr: string } }> = {
    Inter: {
        en: 'Inter',
        tr: 'Inter',
        description: { en: 'Modern & clean', tr: 'Modern ve temiz' },
    },
    Merriweather: {
        en: 'Merriweather',
        tr: 'Merriweather',
        description: { en: 'Classic serif', tr: 'Klasik serif' },
    },
    OpenDyslexic: {
        en: 'OpenDyslexic',
        tr: 'OpenDyslexic',
        description: { en: 'Dyslexia-friendly', tr: 'Disleksi dostu' },
    },
    Atkinson: {
        en: 'Atkinson Hyperlegible',
        tr: 'Atkinson Hyperlegible',
        description: { en: 'High legibility', tr: 'Yüksek okunabilirlik' },
    },
};
