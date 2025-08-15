import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme, themes } from '../contexts/ThemeContext';

interface ReadableTextProps extends TextProps {
  variant?: 'heading' | 'body' | 'caption' | 'button';
  enhanceContrast?: boolean;
  children: React.ReactNode;
}

export const ReadableText: React.FC<ReadableTextProps> = ({
  variant = 'body',
  enhanceContrast = false,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  const getTextStyle = () => {
    const baseStyle = {
      color: currentTheme.text,
    };

    // Enhanced contrast for text over backgrounds
    if (enhanceContrast) {
      const shadowStyle = theme === 'light' 
        ? {
            textShadowColor: 'rgba(255, 255, 255, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }
        : {
            textShadowColor: 'rgba(0, 0, 0, 0.6)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          };
      
      return { ...baseStyle, ...shadowStyle };
    }

    // Variant-specific styles
    switch (variant) {
      case 'heading':
        return {
          ...baseStyle,
          fontSize: 24,
          fontWeight: '600',
          lineHeight: 32,
        };
      case 'body':
        return {
          ...baseStyle,
          fontSize: 16,
          lineHeight: 24,
        };
      case 'caption':
        return {
          ...baseStyle,
          fontSize: 14,
          color: currentTheme.textSecondary,
          lineHeight: 20,
        };
      case 'button':
        return {
          ...baseStyle,
          fontSize: 16,
          fontWeight: '500',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Text
      style={[getTextStyle(), style]}
      {...props}
    >
      {children}
    </Text>
  );
};