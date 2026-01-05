/**
 * Typography System
 * Single Responsibility: Only handles font families and text scales
 */

export const fontFamily = {
    ui: 'Inter',
    uiBold: 'Inter_700Bold',
    uiMedium: 'Inter_500Medium',
    uiRegular: 'Inter_400Regular',
    reading: 'PlayfairDisplay_400Regular',
    readingBold: 'PlayfairDisplay_700Bold',
    readingItalic: 'PlayfairDisplay_400Regular_Italic',
} as const;

export const readingFontFamilies = {
    Inter: {
        regular: 'Inter_400Regular',
        bold: 'Inter_700Bold',
    },
    Merriweather: {
        regular: 'Merriweather_400Regular',
        bold: 'Merriweather_700Bold',
    },
    OpenDyslexic: {
        regular: 'Inter_400Regular', // Fallback as font not available
        bold: 'Inter_700Bold',
    },
    Atkinson: {
        regular: 'AtkinsonHyperlegible_400Regular',
        bold: 'AtkinsonHyperlegible_700Bold',
    },
} as const;

export const fontSize = {
    // UI Text
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,

    // Reading Text (optimized for speed reading)
    readingSm: 16,
    readingMd: 20,
    readingLg: 24,
    readingXl: 28,
    readingFocus: 36, // For RSVP focused word
} as const;

export const lineHeight = {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    reading: 1.8, // Optimal for speed reading
} as const;

export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
} as const;

export const typography = {
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
} as const;
