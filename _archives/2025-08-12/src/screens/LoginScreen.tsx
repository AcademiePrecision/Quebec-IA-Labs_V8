import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore, findAccountByEmail, findProfilesByAccountId } from '../state/authStore';
import { t } from '../utils/translations';
import { UserSession } from '../types';
import { useTheme, themes } from '../contexts/ThemeContext';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const { language, setLoading, setError, error, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError(language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find account by email
      const account = findAccountByEmail(formData.email);
      if (!account) {
        setError(language === 'fr' ? 'Compte non trouvé' : 'Account not found');
        return;
      }
      
      // In real app, verify password here
      if (account.password !== formData.password) {
        setError(language === 'fr' ? 'Mot de passe incorrect' : 'Incorrect password');
        return;
      }
      
      // Find profiles for this account
      const allProfiles = findProfilesByAccountId(account.id);
      // Deduplicate profiles by ID to prevent React key conflicts
      const profiles = allProfiles.filter((profile, index, array) => 
        array.findIndex(p => p.id === profile.id) === index
      );
      
      if (profiles.length === 0) {
        setError(language === 'fr' ? 'Aucun profil trouvé pour ce compte' : 'No profiles found for this account');
        return;
      }
      
      // Determine which profile to use (prioritize last used, then student, formateur, salon, admin)
      let activeProfile = profiles.find(p => p.userType === account.lastUsedProfile);
      if (!activeProfile) {
        activeProfile = profiles.find(p => p.userType === 'academicien_barbier') ||
                       profiles.find(p => p.userType === 'maitre_formateur') ||
                       profiles.find(p => p.userType === 'salon_partenaire') ||
                       profiles.find(p => p.userType === 'admin') ||
                       profiles[0];
      }
      
      const session: UserSession = {
        account,
        activeProfile: activeProfile!,
        availableProfiles: profiles,
      };

      onLoginSuccess(session);
    } catch (error) {
      setError(language === 'fr' ? 'Erreur de connexion' : 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubtleBackground intensity="medium" imageSource={require('../../assets/splash/pexels-lumierestudiomx-897271.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={t('login', language)}
        />
        
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6 py-8">
            {/* Login form */}
            <View style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              borderRadius: 12, 
              padding: 24, 
              shadowColor: theme === 'dark' ? '#000' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}>
              <ReadableText style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: currentTheme.text, 
                textAlign: 'center', 
                marginBottom: 24 
              }}>
                {t('login', language)}
              </ReadableText>

            {error && (
              <View style={{ 
                backgroundColor: theme === 'dark' ? '#4A1A1A' : '#FEE2E2',
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#7F1D1D' : '#FECACA',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}>
                <Text style={{ 
                  color: theme === 'dark' ? '#FCA5A5' : '#DC2626', 
                  textAlign: 'center' 
                }}>{error}</Text>
              </View>
            )}

            <View>
              <View>
                <ReadableText style={{ 
                  color: currentTheme.text, 
                  fontWeight: '500', 
                  marginBottom: 8 
                }}>
                  {t('email', language)}
                </ReadableText>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder={t('email', language)}
                  placeholderTextColor={currentTheme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    borderColor: currentTheme.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: currentTheme.text,
                    backgroundColor: currentTheme.surface,
                  }}
                />
              </View>

              <View style={{ marginTop: 16 }}>
                <ReadableText style={{ 
                  color: currentTheme.text, 
                  fontWeight: '500', 
                  marginBottom: 8 
                }}>
                  {t('password', language)}
                </ReadableText>
                <TextInput
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder={t('password', language)}
                  placeholderTextColor={currentTheme.textSecondary}
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: currentTheme.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: currentTheme.text,
                    backgroundColor: currentTheme.surface,
                  }}
                />
              </View>
            </View>

            <AcademieButton
              title={t('login', language)}
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={isLoading}
              className="mt-6"
            />
          </View>
        </View>
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};