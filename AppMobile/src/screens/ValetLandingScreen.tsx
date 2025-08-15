import React, { useRef, useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useAuthStore } from '../state/authStore';
import { SubtleBackground } from '../components/SubtleBackground';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';

// Landing page components
import { HeroSection } from '../components/landing/HeroSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TestimonialSection } from '../components/landing/TestimonialSection';

interface ValetLandingScreenProps {
  onBack?: () => void;
}

export const ValetLandingScreen: React.FC<ValetLandingScreenProps> = ({ onBack }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { session } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleGetStarted = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Navigate to checkout flow or registration
      if (session) {
        // User is logged in, go to checkout with default Professional plan
        const defaultPlan = { id: 'professional', name: 'Professional', price: 79, currency: 'CAD' };
        navigation.navigate('CheckoutFlow' as never, { plan: defaultPlan });
      } else {
        // User needs to register first
        Alert.alert(
          'Inscription Requise',
          'Pour commencer ton essai gratuit, créé d\'abord ton compte.',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'S\'inscrire',
              onPress: () => navigation.navigate('Register' as never)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in handleGetStarted:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie plus tard.');
    }
  }, [navigation, session]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      console.log('Selected plan:', planId);
      
      // Find the complete plan object
      const planMapping = {
        'essential': { id: 'essential', name: 'Essential', price: 39, currency: 'CAD' },
        'professional': { id: 'professional', name: 'Professional', price: 79, currency: 'CAD' },
        'master': { id: 'master', name: 'Master', price: 149, currency: 'CAD' }
      };
      
      const selectedPlan = planMapping[planId as keyof typeof planMapping];
      
      if (session) {
        // Navigate to checkout with selected plan object
        navigation.navigate('CheckoutFlow' as never, { plan: selectedPlan });
      } else {
        // Navigate to registration with plan pre-selected
        navigation.navigate('Register' as never, { planId, plan: selectedPlan });
      }
    } catch (error) {
      console.error('Error in handleSelectPlan:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie plus tard.');
    }
  }, [navigation, session]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SubtleBackground intensity="subtle">
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar 
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        
        <Header 
          showBack 
          onBackPress={() => {
            if (onBack) {
              onBack();
            } else {
              navigation.goBack();
            }
          }}
          title="Valet-IA"
        />
        
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={currentTheme.primary}
              colors={[currentTheme.primary]}
            />
          }
        >
          {/* Hero Section */}
          <HeroSection onGetStarted={handleGetStarted} />
          
          {/* Features Section */}
          <FeaturesSection />
          
          {/* Pricing Section */}
          <PricingSection onSelectPlan={handleSelectPlan} />
          
          {/* Testimonials Section */}
          <TestimonialSection />
          
          {/* Final CTA Section */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 40 }}>
            <View
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 107, 53, 0.03)',
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 107, 53, 0.2)',
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: currentTheme.text,
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                Prêt à Révolutionner Ton Salon?
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: currentTheme.textSecondary,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 24,
                }}
              >
                Plus de 500 salons font déjà confiance à Valet-IA{'\n'}
                pour gérer leurs rendez-vous automatiquement
              </Text>
              <AcademieButton
                title="Commencer Mon Essai Gratuit"
                onPress={handleGetStarted}
                variant="primary"
                size="lg"
                className="w-full"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: currentTheme.textSecondary,
                  textAlign: 'center',
                  marginTop: 12,
                }}
              >
                14 jours gratuits • Sans carte de crédit • Configuration en 5 minutes
              </Text>
            </View>
          </View>

          {/* Company Info Footer */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 32,
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
              borderTopWidth: 1,
              borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: currentTheme.text,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Académie Précision
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: currentTheme.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 16,
              }}
            >
              L'intelligence artificielle au service{'\n'}
              de l'excellence barbière québécoise
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: currentTheme.textSecondary }}>
                🍁 Fièrement développé au Québec
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed CTA Footer */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <AcademieButton
            title="Essai Gratuit 14 Jours"
            onPress={handleGetStarted}
            variant="primary"
            size="md"
            className="w-full"
          />
        </View>
      </SafeAreaView>
    </SubtleBackground>
  );
};