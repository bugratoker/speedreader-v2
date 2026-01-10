/**
 * Global state management store
 * This is a simple React Context-based store
 * You can replace this with Zustand, Redux, or Jotai as needed
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ThemeMode, User } from '../types';

/**
 * Application state interface
 */
interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    themeMode: ThemeMode;
    isLoading: boolean;
}

/**
 * Action types
 */
type AppAction =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_AUTHENTICATED'; payload: boolean }
    | { type: 'SET_THEME_MODE'; payload: ThemeMode }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOGOUT' };

/**
 * Initial state
 */
const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    themeMode: 'system',
    isLoading: false,
};

/**
 * Reducer function
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_AUTHENTICATED':
            return { ...state, isAuthenticated: action.payload };
        case 'SET_THEME_MODE':
            return { ...state, themeMode: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'LOGOUT':
            return { ...initialState };
        default:
            return state;
    }
};

/**
 * Context
 */
const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(undefined);

/**
 * Provider component
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
};

/**
 * Custom hooks for accessing state and dispatch
 */
export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    return context;
};

export const useAppDispatch = () => {
    const context = useContext(AppDispatchContext);
    if (context === undefined) {
        throw new Error('useAppDispatch must be used within an AppProvider');
    }
    return context;
};

/**
 * Combined hook for convenience
 */
export const useApp = () => {
    return {
        state: useAppState(),
        dispatch: useAppDispatch(),
    };
};
