import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../../contexts/ThemeContext';

export const FeaturesSection: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  const features = [
    {
      icon: 'chatbubble-ellipses',
      color: '#FF6B35',
      title: 'IA Conversationnelle',
      description: 'Discussions naturelles en français québécois avec tes clients'
    },
    {
      icon: 'calendar',
      color: '#1ABC9C',
      title: 'Booking Automatique',
      description: 'Réservations 24/7 sans intervention manuelle'
    },
    {
      icon: 'notifications',
      color: '#E74C3C',
      title: 'Rappels Intelligents',
      description: 'SMS personnalisés qui réduisent les no-shows de 85%'
    },
    {
      icon: 'analytics',
      color: '#9B59B6',
      title: 'Analytics Avancées',
      description: 'Tableaux de bord pour optimiser tes revenus'
    },
    {
      icon: 'people',
      color: '#F39C12',
      title: 'Gestion d\'Équipe',
      description: 'Coordonne plusieurs barbiers et leurs horaires'
    },
    {
      icon: 'card',
      color: '#3498DB',
      title: 'Paiements Intégrés',
      description: 'Collecte automatique avec Stripe et Apple Pay'
    },
    {
      icon: 'globe',
      color: '#2ECC71',
      title: 'Multi-langues',
      description: 'Français, anglais et bientôt l\'espagnol'
    },
    {
      icon: 'shield-checkmark',
      color: '#E67E22',
      title: 'Sécurité Totale',
      description: 'Données hébergées au Canada avec cryptage'
    }
  ];

  return (
    <View style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
      {/* Section Header */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: currentTheme.text,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Pourquoi Choisir Valet-IA?
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: currentTheme.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          L'assistant IA le plus avancé{'\n'}pour l'industrie de la coiffure au Québec
        </Text>
      </View>

      {/* Features Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {features.map((feature, index) => (
          <View
            key={index}
            style={{
              width: '48%',
              backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.70)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${feature.color}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons
                name={feature.icon as any}
                size={24}
                color={feature.color}
              />
            </View>

            {/* Content */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: currentTheme.text,
                marginBottom: 8,
              }}
            >
              {feature.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: currentTheme.textSecondary,
                lineHeight: 20,
              }}
            >
              {feature.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};