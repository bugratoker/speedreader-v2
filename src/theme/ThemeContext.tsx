/**
 * Theme Context
 * Dependency Inversion: Components depend on abstraction (context) not concrete theme values
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { colors } from './colors';
import { fontFamily, fontSize, lineHeight, fontWeight } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import { shadows, glows } from './shadows';

/**
 * Theme interface (Open/Closed: can be extended without modification)
 */
export interface Theme {
    colors: typeof colors;
    fontFamily: typeof fontFamily;
    fontSize: typeof fontSize;
    lineHeight: typeof lineHeight;
    fontWeight: typeof fontWeight;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    layout: typeof layout;
    shadows: typeof shadows;
    glows: typeof glows;
}

const defaultTheme: Theme = {
    colors,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    spacing,
    borderRadius,
    layout,
    shadows,
    glows,
};

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
    children: ReactNode;
    theme?: Partial<Theme>;
}

/**
 * ThemeProvider component
 * Allows theme extension without modification (Open/Closed Principle)
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    theme: customTheme,
}) => {
    const mergedTheme: Theme = {
        ...defaultTheme,
        ...customTheme,
    };

    return (
        <ThemeContext.Provider value={mergedTheme}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * useTheme hook for accessing theme in components
 */
export const useTheme = (): Theme => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export { defaultTheme };
