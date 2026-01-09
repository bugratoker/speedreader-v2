import React from 'react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react-native';

interface TrainingStartButtonProps {
    onPress: () => void;
    title?: string;
    icon?: LucideIcon;
    loading?: boolean;
    style?: any;
    // Allow overriding variant if absolutely necessary, but default to outline
    variant?: 'outline' | 'primary' | 'secondary' | 'ghost'; 
}

/**
 * Standardized Start Button for all Training Modules.
 * Enforces consistency in design (Outline style, XL size).
 */
export const TrainingStartButton: React.FC<TrainingStartButtonProps> = ({
    onPress,
    title,
    icon = Play,
    loading = false,
    style,
    variant = 'outline',
}) => {
    const { t } = useTranslation();

    return (
        <PremiumButton
            title={title || t('games.common.start')}
            onPress={onPress}
            icon={icon}
            variant={variant}
            size="xl"
            fullWidth
            animatePulse={!loading}
            disabled={loading}
            style={style}
        />
    );
};
