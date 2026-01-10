/**
 * Deep Nebula Color Palette
 * Single Responsibility: Only handles color definitions
 */

export const colors = {
    // Core backgrounds
    background: '#000000',
    surface: '#0A0A0A',
    surfaceElevated: '#141414',
    surfaceOverlay: 'rgba(20, 20, 20, 0.8)',

    // Primary: Electric Cyan - for progress and active states
    primary: '#00FFFF',
    primaryDim: 'rgba(0, 255, 255, 0.6)',
    primaryGlow: 'rgba(0, 255, 255, 0.2)',

    // Secondary: Cyber Violet - for AI features and milestones
    secondary: '#8A2BE2',
    secondaryDim: 'rgba(138, 43, 226, 0.6)',
    secondaryGlow: 'rgba(138, 43, 226, 0.2)',

    // Text colors
    text: '#FFFFFF',
    textMuted: '#A0A0A0',
    textDim: '#666666',

    // Glass effects
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassFill: 'rgba(255, 255, 255, 0.05)',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Common
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
} as const;


export type ColorKey = keyof typeof colors;
export type ThemeColors = Record<ColorKey, string>;

