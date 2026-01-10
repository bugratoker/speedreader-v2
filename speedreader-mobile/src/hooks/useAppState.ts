import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Custom hook to track app state changes (active, background, inactive)
 * @param onChange - Callback function when app state changes
 */
export const useAppState = (onChange?: (state: AppStateStatus) => void) => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            appState.current = nextAppState;
            onChange?.(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, [onChange]);

    return appState.current;
};
