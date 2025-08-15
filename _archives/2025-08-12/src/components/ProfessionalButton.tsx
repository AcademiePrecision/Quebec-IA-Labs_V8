import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PROFESSIONAL_EDGE_COLORS, PROFESSIONAL_TYPOGRAPHY, PROFESSIONAL_SPACING } from '../theme/professionalTheme';

interface ProfessionalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { currentTheme } = useTheme();

  // Get button styles based on variant
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      ...getSizeStyle(),
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#666666' : PROFESSIONAL_EDGE_COLORS.accent,
          shadowColor: PROFESSIONAL_EDGE_COLORS.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: disabled ? 0 : 0.3,
          shadowRadius: 8,
          elevation: disabled ? 0 : 8,
        };

      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: disabled ? '#666666' : PROFESSIONAL_EDGE_COLORS.accent,
          borderWidth: 2,
        };

      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };

      case 'premium':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#666666' : PROFESSIONAL_EDGE_COLORS.gold,
          shadowColor: PROFESSIONAL_EDGE_COLORS.gold,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: disabled ? 0 : 0.3,
          shadowRadius: 12,
          elevation: disabled ? 0 : 8,
        };

      default:
        return baseStyle;
    }
  };

  // Get text styles based on variant
  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontFamily: PROFESSIONAL_TYPOGRAPHY.cta.fontFamily,
      fontWeight: PROFESSIONAL_TYPOGRAPHY.cta.fontWeight,
      letterSpacing: PROFESSIONAL_TYPOGRAPHY.cta.letterSpacing,
      textTransform: PROFESSIONAL_TYPOGRAPHY.cta.textTransform,
      ...getSizeTextStyle(),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: disabled ? '#999999' : PROFESSIONAL_EDGE_COLORS.textPrimary,
        };

      case 'secondary':
        return {
          ...baseTextStyle,
          color: disabled ? '#666666' : PROFESSIONAL_EDGE_COLORS.accent,
        };

      case 'ghost':
        return {
          ...baseTextStyle,
          color: disabled ? '#666666' : PROFESSIONAL_EDGE_COLORS.textPrimary,
        };

      case 'premium':
        return {
          ...baseTextStyle,
          color: disabled ? '#999999' : PROFESSIONAL_EDGE_COLORS.textInverse,
        };

      default:
        return baseTextStyle;
    }
  };

  // Get size-specific styles
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
        };
      case 'large':
        return {
          paddingVertical: 20,
          paddingHorizontal: 32,
        };
      case 'medium':
      default:
        return {
          paddingVertical: PROFESSIONAL_SPACING.button.paddingVertical,
          paddingHorizontal: PROFESSIONAL_SPACING.button.paddingHorizontal,
        };
    }
  };

  const getSizeTextStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          fontSize: 14,
          lineHeight: 16,
        };
      case 'large':
        return {
          fontSize: 18,
          lineHeight: 20,
        };
      case 'medium':
      default:
        return {
          fontSize: 16,
          lineHeight: 18,
        };
    }
  };

  const buttonStyle = [getButtonStyle(), style];
  const finalTextStyle = [getTextStyle(), textStyle];

  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={isInteractive ? onPress : undefined}
      disabled={disabled || loading}
      activeOpacity={isInteractive ? 0.8 : 1}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'premium' 
              ? PROFESSIONAL_EDGE_COLORS.textPrimary 
              : PROFESSIONAL_EDGE_COLORS.accent
          }
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && (
            <View style={{ marginRight: 8 }}>
              {icon}
            </View>
          )}
          <Text style={finalTextStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Specialized button variants for common use cases
export const ProfessionalCTA: React.FC<Omit<ProfessionalButtonProps, 'variant'>> = (props) => (
  <ProfessionalButton {...props} variant="primary" size="large" fullWidth />
);

export const ProfessionalSecondaryButton: React.FC<Omit<ProfessionalButtonProps, 'variant'>> = (props) => (
  <ProfessionalButton {...props} variant="secondary" />
);

export const ProfessionalGhostButton: React.FC<Omit<ProfessionalButtonProps, 'variant'>> = (props) => (
  <ProfessionalButton {...props} variant="ghost" />
);

export const ProfessionalPremiumButton: React.FC<Omit<ProfessionalButtonProps, 'variant'>> = (props) => (
  <ProfessionalButton {...props} variant="premium" />
);

export default ProfessionalButton;