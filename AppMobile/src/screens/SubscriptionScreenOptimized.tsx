import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Vibration,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStripe } from '@stripe/stripe-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../state/authStore';
import { usePaymentStore } from '../state/paymentStore';
import { SubscriptionPlan } from '../types/payment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Thumb zone optimization constants
const THUMB_ZONE = {
  bottom: SCREEN_HEIGHT * 0.15,
  top: SCREEN_HEIGHT * 0.85,
  optimal: SCREEN_HEIGHT * 0.7,
};

// Touch target sizes (WCAG 2.1 AA compliant)
const TOUCH_TARGETS = {
  minimum: 44,
  recommended: 48,
  primary: 56,
  spacing: 8,
};

// Animation constants for micro-interactions
const ANIMATION_CONFIG = {
  tension: 40,
  friction: 7,
  useNativeDriver: true,
};

interface PlanCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  isBestValue?: boolean;
  onSelect: () => void;
  isCurrentPlan?: boolean;
  animationDelay: number;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isPopular,
  isBestValue,
  onSelect,
  isCurrentPlan,
  animationDelay,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation with stagger effect
    Animated.sequence([
      Animated.delay(animationDelay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIMATION_CONFIG,
      }),
    ]).start();

    // Glow animation for popular plans
    if (isPopular || isBestValue) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const handlePress = () => {
    // Haptic feedback for better tactile response
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(10);
    }
    onSelect();
  };

  // Calculate monthly savings for annual plans
  const annualPrice = plan.price * 10; // 2 months free
  const monthlySavings = plan.price * 2;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: scaleAnim,
        marginBottom: 16,
      }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${plan.name} plan, ${plan.price / 100} dollars par mois`}
      accessibilityHint="Touchez deux fois pour sélectionner ce plan"
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        style={{
          minHeight: TOUCH_TARGETS.primary,
        }}
      >
        <View
          className={`
            bg-white dark:bg-gray-800 
            rounded-2xl shadow-lg 
            border-2 
            ${isPopular ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}
            overflow-hidden
          `}
        >
          {/* Badge for popular/best value */}
          {(isPopular || isBestValue) && (
            <LinearGradient
              colors={isBestValue ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-bold text-sm">
                {isBestValue ? '🏆 MEILLEURE VALEUR' : '⭐ PLUS POPULAIRE'}
              </Text>
            </LinearGradient>
          )}

          <View className="p-6">
            {/* Plan name and description */}
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {plan.name}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {getPlanDescription(plan.tier)}
            </Text>

            {/* Pricing with emphasis on savings */}
            <View className="mb-4">
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price / 100}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 ml-1">
                  /mois
                </Text>
              </View>
              
              {/* Annual pricing option */}
              <TouchableOpacity
                className="mt-2 flex-row items-center"
                accessibilityLabel="Option de paiement annuel"
              >
                <Text className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  ou ${annualPrice / 100}/année
                </Text>
                <View className="ml-2 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                  <Text className="text-xs text-green-800 dark:text-green-200 font-bold">
                    Économie ${monthlySavings / 100}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Feature list with checkmarks */}
            <View className="mb-6">
              {plan.features.slice(0, 5).map((feature, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-green-500 mr-2 text-lg">✓</Text>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm flex-1">
                    {feature}
                  </Text>
                </View>
              ))}
              
              {plan.features.length > 5 && (
                <TouchableOpacity className="mt-2">
                  <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    + {plan.features.length - 5} autres fonctionnalités
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={{
                backgroundColor: isCurrentPlan ? '#10B981' : '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                minHeight: TOUCH_TARGETS.primary,
                justifyContent: 'center',
              }}
              disabled={isCurrentPlan}
              accessibilityRole="button"
              accessibilityLabel={isCurrentPlan ? 'Plan actuel' : 'Sélectionner ce plan'}
            >
              <Text className="text-white font-bold text-base">
                {isCurrentPlan ? 'Plan actuel ✓' : 'Essayer gratuitement'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function for plan descriptions
const getPlanDescription = (tier: string): string => {
  const descriptions = {
    base: 'Pour barbiers indépendants',
    pro: 'Pour salons multi-barbiers',
    elite: 'Formation complète + Valet-IA',
  };
  return descriptions[tier] || '';
};

export const SubscriptionScreenOptimized: React.FC = () => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const { confirmPayment } = useStripe();
  
  const { session } = useAuthStore();
  const {
    currentSubscription,
    availablePlans,
    isLoading,
    calculateQuebecTax,
  } = usePaymentStore();

  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');
  const [showComparison, setShowComparison] = useState(false);
  const [userCount] = useState(3247); // This would be fetched from API

  // Animated values for micro-interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      'Page d\'abonnement chargée. Trois plans disponibles.'
    );
  }, []);

  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    // Navigate to checkout or show trial signup
    Alert.alert(
      'Commencer avec ' + plan.name,
      'Voulez-vous commencer votre essai gratuit de 14 jours?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, commencer',
          onPress: () => {
            // Navigate to trial signup flow
            console.log('Starting trial for:', plan.tier);
          },
        },
      ]
    );
  }, []);

  // Updated plan data with business requirements
  const optimizedPlans = [
    {
      ...availablePlans[0],
      tier: 'base' as const,
      name: 'Valet-IA Solo',
      price: 3499, // $34.99
      features: [
        'Marcel • Là pour vous ✂️',
        'Gestion clientèle complète',
        'Rappels automatiques SMS/Email',
        'Analyses de performance',
        'Support prioritaire français',
      ],
    },
    {
      ...availablePlans[1],
      tier: 'pro' as const,
      name: 'Valet-IA Salon',
      price: 5999, // $59.99
      features: [
        'Tout de Solo, plus:',
        'Jusqu\'à 5 utilisateurs',
        'Tableau de bord centralisé',
        'Gestion des employés',
        'Rapports financiers avancés',
        'Intégration comptabilité',
      ],
      isPopular: true,
    },
    {
      ...availablePlans[2],
      tier: 'elite' as const,
      name: 'Académie Complete',
      price: 8999, // $89.99
      features: [
        'Tout de Salon, plus:',
        'Accès illimité aux formations',
        'Certifications reconnues CPMT',
        'Mentorat personnalisé',
        'Création de vos propres cours',
        'Revenus partage 60/40',
        'Analytics avancés',
      ],
      isBestValue: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: THUMB_ZONE.bottom }}
      >
        {/* Header with social proof */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-4 pt-4 pb-6"
        >
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Choisissez votre plan
          </Text>
          
          {/* ROI Highlight */}
          <View className="bg-green-100 dark:bg-green-900 rounded-lg p-3 mb-4">
            <Text className="text-center text-green-800 dark:text-green-200 font-semibold">
              🎯 Économisez 287% sur vos coûts de formation
            </Text>
          </View>

          {/* Social proof indicators */}
          <View className="flex-row justify-center items-center space-x-4 mb-4">
            <View className="flex-row items-center">
              <Text className="text-yellow-500">⭐⭐⭐⭐⭐</Text>
              <Text className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                4.9/5
              </Text>
            </View>
            <Text className="text-gray-400">•</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {userCount.toLocaleString()}+ barbiers actifs
            </Text>
          </View>

          {/* Free trial banner */}
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-lg p-4 mb-4"
          >
            <Text className="text-white text-center font-bold text-lg mb-1">
              🎁 ESSAI GRATUIT 14 JOURS
            </Text>
            <Text className="text-white text-center text-sm opacity-90">
              Aucune carte requise • Annulez n'importe quand
            </Text>
          </LinearGradient>

          {/* Billing interval toggle */}
          <View className="flex-row bg-gray-200 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <TouchableOpacity
              onPress={() => setSelectedInterval('month')}
              className={`flex-1 py-3 rounded-md ${
                selectedInterval === 'month'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedInterval === 'month'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Mensuel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSelectedInterval('year')}
              className={`flex-1 py-3 rounded-md ${
                selectedInterval === 'year'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedInterval === 'year'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Annuel
              </Text>
              {selectedInterval === 'year' && (
                <Text className="text-center text-xs text-green-600 dark:text-green-400">
                  2 mois gratuits
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Plan cards */}
        <View className="px-4">
          {optimizedPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={plan.isPopular}
              isBestValue={plan.isBestValue}
              onSelect={() => handleSelectPlan(plan)}
              isCurrentPlan={currentSubscription?.subscriptionPlan.tier === plan.tier}
              animationDelay={index * 100}
            />
          ))}
        </View>

        {/* Comparison table toggle */}
        <TouchableOpacity
          onPress={() => setShowComparison(!showComparison)}
          className="mx-4 mt-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg"
        >
          <Text className="text-center text-blue-600 dark:text-blue-400 font-semibold">
            {showComparison ? 'Masquer' : 'Voir'} la comparaison détaillée
          </Text>
        </TouchableOpacity>

        {/* Trust indicators */}
        <View className="mx-4 mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="font-bold text-gray-900 dark:text-white mb-3">
            Nos garanties
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                Essai gratuit sans engagement
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                Annulation en 1 clic
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                Support 24/7 en français
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 mr-2">✓</Text>
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                Données hébergées au Canada
              </Text>
            </View>
          </View>
          
          {/* Payment methods */}
          <View className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Paiement sécurisé par Stripe
            </Text>
            <View className="flex-row space-x-2">
              <Text className="text-2xl">💳</Text>
              <Text className="text-2xl">🍎</Text>
              <Text className="text-2xl">🤖</Text>
            </View>
          </View>
        </View>

        {/* Testimonial carousel would go here */}
        <View className="mx-4 mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Text className="text-gray-600 dark:text-gray-400 italic">
            "Académie Précision a transformé mon salon. Le ROI est incroyable!"
          </Text>
          <Text className="text-gray-900 dark:text-white font-semibold mt-2">
            - Jean-Marc, Salon Excellence
          </Text>
        </View>

        {/* FAQ Section */}
        <View className="mx-4 mt-8 mb-8">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Questions fréquentes
          </Text>
          
          <TouchableOpacity className="mb-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-1">
              Puis-je changer de plan?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Oui, vous pouvez upgrader ou downgrader à tout moment.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="mb-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-1">
              Comment fonctionne l'essai gratuit?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              14 jours d'accès complet, aucune carte requise.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};