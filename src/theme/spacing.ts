/**
 * Spacing System
 * Single Responsibility: Only handles spacing and layout constants
 * Based on 4px grid system
 */

export const spacing = {
    // Base spacing (4px grid)
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,

    // Bento Box specific
    bento: 16,
    bentoLg: 24,
} as const;

export const borderRadius = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,

    // Bento Box specific (24px as per design spec)
    bento: 24,
    bentoSm: 16,

    full: 9999,
} as const;

export const layout = {
    screenPadding: 16,
    cardGap: 12,
    sectionGap: 24,
    maxContentWidth: 600,
} as const;

export const spacingSystem = {
    spacing,
    borderRadius,
    layout,
} as const;
