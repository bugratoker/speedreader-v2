import { colors as darkColors, ThemeColors } from './colors';

export const lightColors: ThemeColors = {
    // Core backgrounds
    background: '#F9FAFB', // cool gray 50
    surface: '#FFFFFF',
    surfaceElevated: '#F3F4F6', // cool gray 100
    surfaceOverlay: 'rgba(255, 255, 255, 0.9)',

    // Primary: Electric Cyan (Darker for light mode contrast)
    primary: '#0891B2', // cyan 600
    primaryDim: 'rgba(8, 145, 178, 0.6)',
    primaryGlow: 'rgba(8, 145, 178, 0.15)',

    // Secondary: Cyber Violet (Darker for light mode contrast)
    secondary: '#7C3AED', // violet 600
    secondaryDim: 'rgba(124, 58, 237, 0.6)',
    secondaryGlow: 'rgba(124, 58, 237, 0.15)',

    // Text colors
    text: '#111827', // gray 900
    textMuted: '#4B5563', // gray 600
    textDim: '#9CA3AF', // gray 400

    // Glass effects
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassFill: 'rgba(255, 255, 255, 0.6)',

    // Status colors
    success: '#059669', // emerald 600
    warning: '#D97706', // amber 600
    error: '#DC2626', // red 600

    // Common
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};
