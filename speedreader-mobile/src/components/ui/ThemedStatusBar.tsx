import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme';

export const ThemedStatusBar: React.FC = () => {
    const { mode } = useTheme();

    return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
};
