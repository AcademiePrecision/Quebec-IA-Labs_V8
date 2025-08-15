import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cn } from '../utils/cn';
import { useTheme, themes } from '../contexts/ThemeContext';

interface AcademieButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const AcademieButton: React.FC<AcademieButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  
  const baseClasses = "rounded-xl flex-row items-center justify-center";
  
  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Enhanced styling with glassmorphism and better shadows
  const getButtonStyle = (pressed: boolean) => {
    const baseStyle = {
      borderRadius: 12,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 6,
    };

    const variants = {
      primary: {
        backgroundColor: '#FF6B35',
        borderColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.8)' : 'rgba(255, 107, 53, 1)',
        shadowColor: 'rgba(255, 107, 53, 0.4)',
      },
      secondary: {
        backgroundColor: theme === 'dark' 
          ? 'rgba(44, 62, 80, 0.9)' 
          : 'rgba(44, 62, 80, 1)',
        borderColor: theme === 'dark' 
          ? 'rgba(44, 62, 80, 0.8)' 
          : 'rgba(44, 62, 80, 1)',
        shadowColor: theme === 'dark' 
          ? 'rgba(0, 0, 0, 0.5)' 
          : 'rgba(44, 62, 80, 0.3)',
      },
      outline: {
        backgroundColor: theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.8)',
        borderColor: '#FF6B35',
        borderWidth: 2,
        shadowColor: theme === 'dark' 
          ? 'rgba(0, 0, 0, 0.3)' 
          : 'rgba(255, 107, 53, 0.2)',
      },
      glass: {
        backgroundColor: theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(255, 255, 255, 0.3)',
        shadowColor: theme === 'dark' 
          ? 'rgba(0, 0, 0, 0.5)' 
          : 'rgba(0, 0, 0, 0.1)',
        // Enhanced glassmorphism effect
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
      },
    };

    return {
      ...baseStyle,
      ...variants[variant],
      opacity: pressed && !disabled && !loading ? 0.7 : 
               disabled || loading ? 0.5 : 1,
    };
  };

  const getTextStyle = () => {
    const textColors = {
      primary: 'white',
      secondary: 'white',
      outline: '#FF6B35',
      glass: theme === 'dark' ? '#FFFFFF' : '#2C3E50',
    };

    return {
      color: textColors[variant],
      fontWeight: '600' as const,
      textShadowColor: variant === 'outline' 
        ? theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)'
        : variant === 'glass'
        ? theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        : 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    };
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      className={cn(
        baseClasses,
        sizeClasses[size],
        className
      )}
      style={({ pressed }) => getButtonStyle(pressed)}
    >
      {loading ? (
        <ActivityIndicator 
          color={
            variant === 'outline' ? '#FF6B35' : 
            variant === 'glass' ? (theme === 'dark' ? '#FFFFFF' : '#2C3E50') :
            'white'
          } 
          size="small" 
        />
      ) : (
        <Text 
          className={cn(
            textSizeClasses[size]
          )}
          style={getTextStyle()}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};