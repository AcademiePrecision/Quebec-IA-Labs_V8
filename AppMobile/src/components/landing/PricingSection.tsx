import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../../contexts/ThemeContext';
import { AcademieButton } from '../AcademieButton';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { width } = Dimensions.get('window');

  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      price: 39,
      description: 'Pour barbiers individuels',
      badge: null,
      features: [
        'Valet-IA booking automatique',
        'Gestion calendrier',
        'SMS reminders français',
        'Support par chat',
        'Statistiques de base',
      ],
      buttonVariant: 'outline' as const,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      description: 'Pour salons multi-barbiers',
      badge: '⭐ PLUS POPULAIRE',
      features: [
        'Tout de Essential +',
        'Multi-barbiers (jusqu\'à 5)',
        'Gestion équipe',
        'Analytics avancées',
        'Intégration POS',
        'Support prioritaire',
      ],
      buttonVariant: 'primary' as const,
    },
    {
      id: 'master',
      name: 'Master',
      price: 149,
      description: 'Solution complète + formation',
      badge: '🎓 ACADÉMIE',
      features: [
        'Tout de Professional +',
        'Plateforme de formation',
        'Contenu éducatif illimité',
        'Certifications',
        'Account manager dédié',
        'API personnalisée',
      ],
      buttonVariant: 'secondary' as const,
    },
  ];

  const renderPlan = (plan: typeof plans[0], index: number) => {
    const isPopular = plan.badge?.includes('POPULAIRE');
    
    return (
      <View
        key={plan.id}
        style={{
          width: width - 60,
          marginRight: 20,
          backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.75)',
          borderRadius: 16,
          padding: 24,
          borderWidth: isPopular ? 2 : 1,
          borderColor: isPopular ? currentTheme.primary : 
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          shadowColor: isPopular ? currentTheme.primary : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isPopular ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: isPopular ? 8 : 4,
        }}
      >
        {/* Badge */}
        {plan.badge && (
          <View
            style={{
              position: 'absolute',
              top: -10,
              left: 20,
              right: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: isPopular ? currentTheme.primary : currentTheme.success,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {plan.badge}
              </Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: plan.badge ? 16 : 0 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: currentTheme.text,
              marginBottom: 8,
            }}
          >
            {plan.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: currentTheme.textSecondary,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {plan.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: currentTheme.primary,
              }}
            >
              ${plan.price}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: currentTheme.textSecondary,
                marginLeft: 4,
              }}
            >
              /mois
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: currentTheme.textSecondary,
              marginTop: 4,
            }}
          >
            Économise 17% avec facturation annuelle
          </Text>
        </View>

        {/* Features */}
        <View style={{ marginBottom: 24 }}>
          {plan.features.map((feature, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={currentTheme.success}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: currentTheme.text,
                  flex: 1,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <AcademieButton
          title="Commencer l'essai"
          onPress={() => onSelectPlan(plan.id)}
          variant={plan.buttonVariant}
          size="lg"
          className="w-full"
        />
      </View>
    );
  };

  return (
    <View style={{ paddingVertical: 40 }}>
      {/* Section Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: currentTheme.text,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Choisis Ton Plan
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A', // Blanc en sombre, noir foncé en clair
            fontWeight: 'bold', // BOLD
            textAlign: 'center',
            // Enhanced visibility with text shadow
            textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          14 jours d'essai gratuit • Sans engagement
        </Text>
      </View>

      {/* Plans Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        snapToInterval={width - 40}
        decelerationRate="fast"
      >
        {plans.map(renderPlan)}
      </ScrollView>

      {/* Trust Indicators */}
      <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
        <View
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.70)',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="shield-checkmark" size={20} color={currentTheme.success} />
              <Text style={{ fontSize: 12, color: currentTheme.textSecondary, marginTop: 4 }}>
                Sécurisé
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="card-outline" size={20} color={currentTheme.success} />
              <Text style={{ fontSize: 12, color: currentTheme.textSecondary, marginTop: 4 }}>
                Sans frais cachés
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="exit-outline" size={20} color={currentTheme.success} />
              <Text style={{ fontSize: 12, color: currentTheme.textSecondary, marginTop: 4 }}>
                Annule quand tu veux
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};