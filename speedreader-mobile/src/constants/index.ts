/**
 * Application-wide constants
 */

export const APP_NAME = 'SpeedReader';

/**
 * Storage keys for AsyncStorage
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
    THEME_MODE: '@theme_mode',
    ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;

/**
 * API endpoints
 */
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/update',
    },
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
    fast: 150,
    normal: 300,
    slow: 500,
} as const;

/**
 * Screen names for navigation
 */
export const SCREENS = {
    HOME: 'Home',
    SETTINGS: 'Settings',
    PROFILE: 'Profile',
    // Add more screen names here
} as const;
