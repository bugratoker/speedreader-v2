/**
 * Common type definitions for the application
 */

/**
 * Basic user type
 */
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Navigation params - extend this with your screen params
 */
export type RootStackParamList = {
    Home: undefined;
    Settings: undefined;
    Profile: { userId: string };
    // Add more screens with their params here
};

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
