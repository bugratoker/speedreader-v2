/**
 * Theme System - Central Export (Open/Closed Principle)
 * New modules can be added without modifying existing exports
 */

// Color palette
export * from './colors';

// Typography system
export * from './typography';

// Spacing and layout
export * from './spacing';

// Shadows and glow effects
export * from './shadows';

// Theme context and provider
export * from './ThemeContext';

// Re-export complete theme object for convenience
import { colors } from './colors';
import { typography, fontFamily, fontSize, lineHeight, fontWeight } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import { shadows, glows } from './shadows';

export const theme = {
    colors,
    typography,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    spacing,
    borderRadius,
    layout,
    shadows,
    glows,
} as const;

export type ThemeType = typeof theme;
