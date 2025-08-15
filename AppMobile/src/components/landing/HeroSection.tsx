import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../../contexts/ThemeContext';
import { AcademieButton } from '../AcademieButton';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { width } = Dimensions.get('window');

  return (
    <View style={{ minHeight: 400, paddingHorizontal: 20, paddingVertical: 40 }}>
      {/* Hero Content */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        {/* Badge */}
        <View
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.08)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 107, 53, 0.15)',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: currentTheme.primary,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            🚀 NOUVEAU • 500+ salons actifs
          </Text>
        </View>

        {/* Main Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: currentTheme.text,
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 40,
          }}
        >
          Valet-IA{'\n'}
          <Text style={{ color: currentTheme.primary }}>Révolutionne</Text>{'\n'}
          Ton Salon
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 18,
            color: currentTheme.textSecondary,
            textAlign: 'center',
            lineHeight: 26,
            marginBottom: 32,
          }}
        >
          L'assistant IA qui gère tes rendez-vous{'\n'}
          automatiquement en français québécois
        </Text>

        {/* Value Props */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          {[
            { icon: 'calendar', text: 'Réservations automatiques 24/7' },
            { icon: 'chatbubble', text: 'Conversations naturelles en français' },
            { icon: 'trending-up', text: '+40% de revenus en moyenne' },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme === 'dark' ? 'rgba(28, 200, 138, 0.15)' : 'rgba(28, 200, 138, 0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={currentTheme.success}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: currentTheme.text,
                  flex: 1,
                }}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <View style={{ width: '100%' }}>
          <AcademieButton
            title="Essai Gratuit 14 Jours"
            onPress={onGetStarted}
            variant="primary"
            size="lg"
            className="w-full mb-3"
          />
          <Text
            style={{
              fontSize: 14,
              color: currentTheme.textSecondary,
              textAlign: 'center',
            }}
          >
            ✓ Sans carte de crédit • ✓ Configuration en 5 min
          </Text>
        </View>
      </View>
    </View>
  );
};