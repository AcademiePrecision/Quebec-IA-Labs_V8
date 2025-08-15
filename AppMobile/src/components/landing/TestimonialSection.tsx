import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../../contexts/ThemeContext';

export const TestimonialSection: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  const testimonials = [
    {
      name: 'Marc Dubois',
      salon: 'Salon Prestige, Montréal',
      rating: 5,
      text: 'Valet-IA a révolutionné mon salon! +40% de revenus en 3 mois et mes clients adorent la facilité de réservation.',
    },
    {
      name: 'Sophie Tremblay',
      salon: 'Coiffure Moderne, Québec',
      rating: 5,
      text: 'Enfin un système qui parle québécois! Plus de malentendus et mes rendez-vous sont toujours pleins.',
    },
    {
      name: 'Jean-François Roy',
      salon: 'Barbershop Elite, Laval',
      rating: 5,
      text: 'Incroyable comme l\'IA comprend mes clients. Elle gère même les demandes spéciales sans problème!',
    },
  ];

  const stats = [
    { number: '4.9/5', label: 'Note moyenne' },
    { number: '500+', label: 'Salons actifs' },
    { number: '+287%', label: 'Croissance moyenne' },
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
          Ce Que Disent Nos Clients
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: currentTheme.textSecondary,
            textAlign: 'center',
          }}
        >
          Des résultats concrets au Québec
        </Text>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 40,
          backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.70)',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }}
      >
        {stats.map((stat, index) => (
          <View key={index} style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: currentTheme.primary,
                marginBottom: 4,
              }}
            >
              {stat.number}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: currentTheme.textSecondary,
                textAlign: 'center',
              }}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Testimonials */}
      <View>
        {testimonials.map((testimonial, index) => (
          <View
            key={index}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.75)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Stars */}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {Array.from({ length: testimonial.rating }, (_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={16}
                  color="#F39C12"
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>

            {/* Quote */}
            <Text
              style={{
                fontSize: 16,
                color: currentTheme.text,
                lineHeight: 24,
                marginBottom: 16,
                fontStyle: 'italic',
              }}
            >
              "{testimonial.text}"
            </Text>

            {/* Author */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: currentTheme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: currentTheme.text,
                  }}
                >
                  {testimonial.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: currentTheme.textSecondary,
                  }}
                >
                  {testimonial.salon}
                </Text>
              </View>
              <View style={{ marginLeft: 'auto' }}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={currentTheme.success}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};