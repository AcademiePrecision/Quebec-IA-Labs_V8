import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, ViewStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  style?: ViewStyle;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 24, 
  style 
}) => {
  const { theme, toggleTheme } = useTheme();
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: theme === 'dark' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [theme, rotationAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePress = () => {
    toggleTheme();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        {
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 18,
          backgroundColor: theme === 'dark' ? '#333333' : '#F0F0F0',
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555555' : '#E0E0E0',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          transform: [{ rotate: rotation }],
        }}
      >
        <Ionicons
          name={theme === 'light' ? 'sunny' : 'moon'}
          size={size}
          color={theme === 'light' ? '#FF6B35' : '#FFD700'}
        />
      </Animated.View>
    </Pressable>
  );
};