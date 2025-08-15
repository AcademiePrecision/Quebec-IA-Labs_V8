import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { SubscriptionPlan } from '../types/payment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlanComparisonTableProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

// Comprehensive feature list for comparison
const FEATURE_CATEGORIES = [
  {
    name: 'Fonctionnalités de base',
    features: [
      { id: 'ai_assistant', name: 'Marcel • Là pour vous', icon: '✂️' },
      { id: 'client_management', name: 'Gestion clientèle', icon: '👥' },
      { id: 'appointment_booking', name: 'Réservation en ligne', icon: '📅' },
      { id: 'sms_reminders', name: 'Rappels SMS automatiques', icon: '💬' },
      { id: 'email_reminders', name: 'Rappels par email', icon: '📧' },
    ],
  },
  {
    name: 'Analytics & Rapports',
    features: [
      { id: 'basic_analytics', name: 'Analyses de base', icon: '📊' },
      { id: 'advanced_analytics', name: 'Analyses avancées', icon: '📈' },
      { id: 'financial_reports', name: 'Rapports financiers', icon: '💰' },
      { id: 'employee_tracking', name: 'Suivi des employés', icon: '👔' },
      { id: 'inventory_management', name: 'Gestion d\'inventaire', icon: '📦' },
    ],
  },
  {
    name: 'Formation & Certification',
    features: [
      { id: 'basic_courses', name: 'Cours de base (5/mois)', icon: '📚' },
      { id: 'unlimited_courses', name: 'Cours illimités', icon: '🎓' },
      { id: 'certifications', name: 'Certifications CPMT', icon: '🏆' },
      { id: 'mentorship', name: 'Mentorat personnalisé', icon: '👨‍🏫' },
      { id: 'course_creation', name: 'Création de cours', icon: '✍️' },
      { id: 'revenue_sharing', name: 'Partage revenus 60/40', icon: '💸' },
    ],
  },
  {
    name: 'Support & Services',
    features: [
      { id: 'email_support', name: 'Support email', icon: '✉️' },
      { id: 'priority_support', name: 'Support prioritaire', icon: '⚡' },
      { id: 'phone_support', name: 'Support téléphonique', icon: '📞' },
      { id: 'dedicated_manager', name: 'Gestionnaire dédié', icon: '🤝' },
      { id: 'custom_training', name: 'Formation personnalisée', icon: '🎯' },
    ],
  },
  {
    name: 'Limites & Capacités',
    features: [
      { id: 'users', name: 'Nombre d\'utilisateurs', icon: '👤' },
      { id: 'locations', name: 'Nombre de succursales', icon: '🏢' },
      { id: 'storage', name: 'Stockage cloud', icon: '☁️' },
      { id: 'api_access', name: 'Accès API', icon: '🔌' },
      { id: 'integrations', name: 'Intégrations tierces', icon: '🔗' },
    ],
  },
];

// Define which features are available for each plan
const PLAN_FEATURES = {
  base: {
    ai_assistant: true,
    client_management: true,
    appointment_booking: true,
    sms_reminders: true,
    email_reminders: true,
    basic_analytics: true,
    basic_courses: true,
    email_support: true,
    users: '1',
    locations: '1',
    storage: '5 GB',
    api_access: false,
    integrations: 'Limitées',
  },
  pro: {
    ai_assistant: true,
    client_management: true,
    appointment_booking: true,
    sms_reminders: true,
    email_reminders: true,
    basic_analytics: true,
    advanced_analytics: true,
    financial_reports: true,
    employee_tracking: true,
    inventory_management: true,
    basic_courses: true,
    email_support: true,
    priority_support: true,
    phone_support: true,
    users: 'Jusqu\'à 5',
    locations: '1',
    storage: '50 GB',
    api_access: true,
    integrations: 'Toutes',
  },
  elite: {
    ai_assistant: true,
    client_management: true,
    appointment_booking: true,
    sms_reminders: true,
    email_reminders: true,
    basic_analytics: true,
    advanced_analytics: true,
    financial_reports: true,
    employee_tracking: true,
    inventory_management: true,
    unlimited_courses: true,
    certifications: true,
    mentorship: true,
    course_creation: true,
    revenue_sharing: true,
    email_support: true,
    priority_support: true,
    phone_support: true,
    dedicated_manager: true,
    custom_training: true,
    users: 'Illimité',
    locations: 'Illimité',
    storage: 'Illimité',
    api_access: true,
    integrations: 'Toutes + Custom',
  },
};

export const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({
  plans,
  currentPlanId,
  onSelectPlan,
}) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderFeatureValue = (planTier: string, featureId: string) => {
    const value = PLAN_FEATURES[planTier]?.[featureId];
    
    if (typeof value === 'boolean') {
      return value ? (
        <Text className="text-green-500 text-xl">✓</Text>
      ) : (
        <Text className="text-gray-400 text-xl">–</Text>
      );
    } else if (typeof value === 'string') {
      return (
        <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {value}
        </Text>
      );
    } else {
      return <Text className="text-gray-400 text-xl">–</Text>;
    }
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="bg-white dark:bg-gray-900"
    >
      {/* Header with plan names and prices */}
      <View className="bg-gray-50 dark:bg-gray-800 px-4 py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
        >
          <View className="flex-row">
            {/* Feature column header */}
            <View className="w-40 pr-4">
              <Text className="text-sm font-bold text-gray-900 dark:text-white">
                Fonctionnalités
              </Text>
            </View>

            {/* Plan columns */}
            {plans.map((plan) => (
              <View key={plan.id} className="w-32 items-center px-2">
                {plan.isPopular && (
                  <View className="bg-blue-600 px-2 py-1 rounded mb-1">
                    <Text className="text-white text-xs font-bold">
                      POPULAIRE
                    </Text>
                  </View>
                )}
                
                <Text className="text-sm font-bold text-gray-900 dark:text-white text-center mb-1">
                  {plan.name}
                </Text>
                
                <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${plan.price / 100}
                </Text>
                
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  /mois
                </Text>

                {currentPlanId === plan.id && (
                  <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded mt-1">
                    <Text className="text-green-800 dark:text-green-200 text-xs font-semibold">
                      ACTUEL
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Feature comparison rows */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {FEATURE_CATEGORIES.map((category, categoryIndex) => (
          <View key={categoryIndex}>
            {/* Category header */}
            <View className="bg-gray-100 dark:bg-gray-800 px-4 py-3">
              <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {category.name}
              </Text>
            </View>

            {/* Feature rows */}
            {category.features.map((feature, featureIndex) => (
              <View
                key={feature.id}
                className={`
                  border-b border-gray-200 dark:border-gray-800
                  ${featureIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-850'}
                `}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={false}
                >
                  <View className="flex-row items-center py-3">
                    {/* Feature name */}
                    <View className="w-40 px-4 flex-row items-center">
                      <Text className="mr-2">{feature.icon}</Text>
                      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {feature.name}
                      </Text>
                    </View>

                    {/* Plan values */}
                    {plans.map((plan) => (
                      <View
                        key={plan.id}
                        className="w-32 items-center justify-center px-2"
                      >
                        {renderFeatureValue(plan.tier, feature.id)}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </View>
        ))}

        {/* CTA section */}
        <View className="px-4 mt-6">
          <Text className="text-center text-gray-600 dark:text-gray-400 mb-4">
            Choisissez le plan qui correspond à vos besoins
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View className="flex-row">
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => onSelectPlan(plan)}
                  className="mr-3"
                  disabled={currentPlanId === plan.id}
                >
                  <LinearGradient
                    colors={
                      currentPlanId === plan.id
                        ? ['#10B981', '#059669']
                        : plan.isPopular
                        ? ['#3B82F6', '#2563EB']
                        : ['#6B7280', '#4B5563']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold">
                      {currentPlanId === plan.id
                        ? 'Plan actuel'
                        : `Choisir ${plan.name}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Additional info */}
        <View className="px-4 mt-6">
          <View className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <Text className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
              💡 Conseil Pro
            </Text>
            <Text className="text-blue-700 dark:text-blue-300 text-sm">
              La plupart de nos salons choisissent le plan Salon pour sa flexibilité 
              multi-utilisateurs et ses rapports financiers avancés. C'est l'équilibre 
              parfait entre fonctionnalités et prix.
            </Text>
          </View>

          <View className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Questions fréquentes
            </Text>
            
            <TouchableOpacity className="mb-3">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                → Puis-je changer de plan plus tard?
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-xs">
                Oui, vous pouvez upgrader ou downgrader à tout moment.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="mb-3">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                → Y a-t-il des frais d'installation?
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-xs">
                Non, tous nos plans incluent l'installation gratuite.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                → Offrez-vous des rabais pour paiement annuel?
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-xs">
                Oui! Économisez 2 mois avec le paiement annuel.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};