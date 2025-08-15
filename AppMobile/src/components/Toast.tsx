import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  runOnJS,
  Easing 
} from 'react-native-reanimated';
import { useTheme, themes } from '../contexts/ThemeContext';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.ease,
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.ease,
      });

      // Hide toast after duration
      const hideTimer = withDelay(
        duration,
        withTiming(-100, {
          duration: 300,
          easing: Easing.ease,
        }, () => {
          runOnJS(onHide)();
        })
      );

      const fadeTimer = withDelay(
        duration,
        withTiming(0, {
          duration: 300,
          easing: Easing.ease,
        })
      );

      translateY.value = hideTimer;
      opacity.value = fadeTimer;
    }
  }, [visible, duration, translateY, opacity, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#27AE60',
          iconName: 'checkmark-circle' as const,
          iconColor: '#FFF',
        };
      case 'error':
        return {
          backgroundColor: '#E74C3C',
          iconName: 'close-circle' as const,
          iconColor: '#FFF',
        };
      case 'warning':
        return {
          backgroundColor: '#F39C12',
          iconName: 'warning' as const,
          iconColor: '#FFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#3498DB',
          iconName: 'information-circle' as const,
          iconColor: '#FFF',
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 60,
          left: 20,
          right: 20,
          zIndex: 1000,
        },
      ]}
      className="rounded-lg shadow-lg"
    >
      <View 
        className="flex-row items-center p-4 rounded-lg"
        style={{ 
          backgroundColor: config.backgroundColor,
          shadowColor: theme === 'dark' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === 'dark' ? 0.8 : 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons 
          name={config.iconName} 
          size={24} 
          color={config.iconColor} 
        />
        <Text 
          style={{ 
            color: config.iconColor, 
            fontWeight: '500', 
            marginLeft: 12, 
            flex: 1 
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};