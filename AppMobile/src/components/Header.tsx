import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { Language } from '../types';
import { useTheme, themes } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  showBack?: boolean;
  onBackPress?: () => void;
  title?: string;
  showLogout?: boolean;
  onLogoutPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showBack, 
  onBackPress, 
  title, 
  showLogout, 
  onLogoutPress 
}) => {
  const { language, setLanguage } = useAuthStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  useEffect(() => {
    console.log('[Header] Component mounted');
    console.log('[Header] language:', language);
    console.log('[Header] showBack:', showBack);
    console.log('[Header] title:', title);
  }, [language, showBack, title]);

  const toggleLanguage = () => {
    console.log('[Header] Toggle language called');
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <View style={{ 
      // Glassmorphism background with subtle transparency
      backgroundColor: theme === 'dark' 
        ? 'rgba(30, 30, 30, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      // Enhanced shadow for depth
      shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 8,
      // Subtle border with glassmorphism effect
      borderBottomWidth: 1, 
      borderBottomColor: theme === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 16, 
      paddingVertical: 14,
      // Backdrop blur effect simulation
      backdropFilter: 'blur(20px)',
    }}>
      {/* Top row - Main content */}
      <View className="flex-row items-center justify-between">
        {/* Left side - Back button or logo */}
        <View style={{ flex: 1 }}>
          {showBack && onBackPress ? (
            <Pressable 
              onPress={onBackPress}
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  borderWidth: 1,
                  borderColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.08)',
                  opacity: pressed ? 0.7 : 1,
                  // Subtle shadow for depth
                  shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 1,
                  shadowRadius: 3,
                  elevation: 3,
                }
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
            </Pressable>
          ) : (
            <View>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: currentTheme.text,
                // Enhanced text shadow for better readability over backgrounds
                textShadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                {title || t('appTitle', language)}
              </Text>
              {!title && (
                <Text style={{ 
                  fontSize: 12, 
                  color: currentTheme.primary, 
                  fontWeight: '600',
                  // Enhanced text shadow for the slogan
                  textShadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}>
                  {t('slogan', language)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right side - Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemeToggle size={20} />
          
          <View style={{ width: 8 }} />
          
          {showLogout && onLogoutPress && (
            <>
              <Pressable
                onPress={onLogoutPress}
                style={({ pressed }) => [
                  {
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 18,
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(231, 76, 60, 0.15)' 
                      : 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 1,
                    borderColor: theme === 'dark' 
                      ? 'rgba(231, 76, 60, 0.3)' 
                      : 'rgba(231, 76, 60, 0.2)',
                    opacity: pressed ? 0.7 : 1,
                    // Subtle shadow
                    shadowColor: 'rgba(231, 76, 60, 0.3)',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    shadowRadius: 3,
                    elevation: 3,
                  }
                ]}
              >
                <Ionicons name="log-out-outline" size={20} color={currentTheme.text} />
              </Pressable>
              <View style={{ width: 8 }} />
            </>
          )}
          
          <Pressable
            onPress={toggleLanguage}
            style={({ pressed }) => [
              {
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: currentTheme.primary,
                borderRadius: 16,
                minWidth: 40,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
                // Enhanced shadow for the primary button
                shadowColor: currentTheme.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
                // Subtle border for definition
                borderWidth: 1,
                borderColor: theme === 'dark' 
                  ? 'rgba(255, 107, 53, 0.8)' 
                  : 'rgba(255, 107, 53, 1)',
              }
            ]}
          >
            <Text style={{ 
              color: 'white', 
              fontWeight: '600', 
              fontSize: 11,
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}>
              {language.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};