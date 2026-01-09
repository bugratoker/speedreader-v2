/**
 * Root Navigation
 * Handles onboarding flow and main app navigation
 */

import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../components';
import {
    HomeScreen,
    LibraryScreen,
    ReadScreen,
    TrainingScreen,
    ProfileScreen,
    WelcomeScreen,
    AssessmentScreen,
} from '../screens';

// Tab Navigator Types
export type MainTabParamList = {
    Home: undefined;
    Library: undefined;
    Read: { bookId?: string; bookTitle?: string; comprehensionMode?: boolean } | undefined;
    Training: undefined;
    Profile: undefined;
};

// Onboarding steps
type OnboardingStep = 'welcome' | 'assessment' | 'complete';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="Home"
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Read" component={ReadScreen} />
            <Tab.Screen name="Training" component={TrainingScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export const RootNavigator: React.FC = () => {
    const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
    const [userWpm, setUserWpm] = useState<number | null>(null);

    const handleWelcomeComplete = () => {
        setOnboardingStep('assessment');
    };

    const handleAssessmentComplete = (wpm: number) => {
        setUserWpm(wpm);
        setOnboardingStep('complete');
        // TODO: Save WPM to storage/state
    };

    // Onboarding flow
    if (onboardingStep === 'welcome') {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    if (onboardingStep === 'assessment') {
        return <AssessmentScreen onComplete={handleAssessmentComplete} />;
    }

    // Main app
    return <MainTabNavigator />;
};

export { MainTabNavigator };
