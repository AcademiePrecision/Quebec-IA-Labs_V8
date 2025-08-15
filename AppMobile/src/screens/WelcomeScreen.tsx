import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { useTheme, themes } from '../contexts/ThemeContext';

interface WelcomeScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onClearDatabase?: () => void;
  onRecreateTestData?: () => void;
  onForceCEO?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onClearDatabase,
  onRecreateTestData,
  onForceCEO,
}) => {
  const { language, forceCEOAccount } = useAuthStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const insets = useSafeAreaInsets();
  
  const [isResetting, setIsResetting] = React.useState(false);
  const [isRecreating, setIsRecreating] = React.useState(false);

  useEffect(() => {
    console.log('[WelcomeScreen] Component mounted');
    console.log('[WelcomeScreen] language:', language);
    console.log('[WelcomeScreen] insets:', insets);
    console.log('[WelcomeScreen] onForceCEO prop:', typeof onForceCEO, onForceCEO ? 'AVAILABLE' : 'NOT PROVIDED');
  }, [language, insets, onForceCEO]);

  const handleClearDatabase = async () => {
    if (isResetting || !onClearDatabase) return;
    
    console.log('[WelcomeScreen] Starting database reset...');
    setIsResetting(true);
    
    try {
      await onClearDatabase();
      console.log('[WelcomeScreen] Database reset completed');
    } catch (error) {
      console.error('[WelcomeScreen] Database reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleRecreateTestData = async () => {
    if (isRecreating || !onRecreateTestData) return;
    
    console.log('[WelcomeScreen] Starting test data recreation...');
    setIsRecreating(true);
    
    try {
      await onRecreateTestData();
      console.log('[WelcomeScreen] Test data recreation completed');
    } catch (error) {
      console.error('[WelcomeScreen] Test data recreation failed:', error);
    } finally {
      setIsRecreating(false);
    }
  };

  const handleForceCEO = () => {
    console.log('[WelcomeScreen] handleForceCEO called!');
    console.log('[WelcomeScreen] onForceCEO available:', !!onForceCEO);
    
    if (!onForceCEO) {
      console.error('[WelcomeScreen] onForceCEO function not provided!');
      return;
    }
    
    try {
      console.log('[WelcomeScreen] Calling onForceCEO...');
      onForceCEO();
      console.log('[WelcomeScreen] onForceCEO called successfully');
    } catch (error) {
      console.error('[WelcomeScreen] Error calling onForceCEO:', error);
    }
  };

  const handleDirectCEO = () => {
    console.log('[WelcomeScreen] handleDirectCEO called - Direct Zustand call');
    
    try {
      // Force l'initialisation d'abord
      console.log('[WelcomeScreen] Forcing initialization...');
      
      forceCEOAccount();
      console.log('[WelcomeScreen] Direct forceCEOAccount called successfully');
      
      // Test immédiatement si le CEO est maintenant disponible
      const { findAccountByEmail } = require('../state/authStore');
      const testAccount = findAccountByEmail('academieprecision@gmail.com');
      console.log('[WelcomeScreen] Test login after force:', testAccount ? 'FOUND!' : 'STILL NULL');
      
      alert('CEO ajouté directement via Zustand! Check console.');
    } catch (error) {
      console.error('[WelcomeScreen] Error in direct CEO call:', error);
      alert('Erreur: ' + (error as Error).message);
    }
  };

  const handleLoginPress = () => {
    console.log('[WelcomeScreen] Login button pressed');
    onNavigateToLogin();
  };

  const handleRegisterPress = () => {
    console.log('[WelcomeScreen] Register button pressed');
    onNavigateToRegister();
  };

  console.log('[WelcomeScreen] Rendering WelcomeScreen');

  return (
    <SubtleBackground intensity="medium">
      <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Header />
      
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Welcome content */}
          <View className="items-center mb-12">
            <ReadableText 
              style={{ 
                fontSize: 30, 
                fontWeight: 'bold', 
                textAlign: 'center', 
                marginBottom: 16,
                color: currentTheme.text 
              }}
            >
              {t('welcomeTitle', language)}
            </ReadableText>
            
            <View style={{ 
              width: 80, 
              height: 4, 
              backgroundColor: currentTheme.primary, 
              borderRadius: 2, 
              marginBottom: 32 
            }} />
            
            {/* Motivational text frame between bars */}
            <View style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: 25,
              borderWidth: 3,
              borderColor: currentTheme.primary,
              paddingHorizontal: 24,
              paddingVertical: 20,
              marginBottom: 32,
            }}>
              <ReadableText 
                style={{ 
                  fontSize: 20,
                  fontWeight: '700',
                  fontStyle: 'italic',
                  textAlign: 'center', 
                  lineHeight: 28,
                  color: currentTheme.text,
                  textShadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {language === 'fr' 
                  ? "Soyez prêt à DOMINER votre métier !!"
                  : "Be ready to DOMINATE your craft!!"
                }
              </ReadableText>
            </View>
            
            {/* Second orange bar */}
            <View style={{ 
              width: 80, 
              height: 4, 
              backgroundColor: currentTheme.primary, 
              borderRadius: 2, 
              marginBottom: 32,
              shadowColor: currentTheme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 4,
            }} />
          </View>

          {/* Action buttons */}
          <View className="space-y-4">
            <AcademieButton
              title={t('newRegistration', language)}
              onPress={handleRegisterPress}
              variant="primary"
              size="lg"
            />
            
            <AcademieButton
              title={t('login', language)}
              onPress={handleLoginPress}
              variant="outline"
              size="lg"
            />
          </View>

          {/* Forgot password link */}
          <View className="mt-6 items-center">
            <Text className="text-[#7F8C8D] text-center">
              {t('forgotPassword', language)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <Text className="text-sm text-[#7F8C8D] text-center mb-3">
            {language === 'fr'
              ? "© 2024 Académie Précision. Tous droits réservés."
              : "© 2024 Precision Academy. All rights reserved."
            }
          </Text>
          
          {/* Clean footer - debug buttons removed */}
        </View>
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};