import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../state/authStore';

export interface SubscriptionTier {
  id: string;
  name: string;
  price?: number;
  maxCourses: number;
  maxStudents?: number;
  features: string[];
  level: number;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    maxCourses: 1,
    features: ['1 cours gratuit', 'Accès limité'],
    level: 0,
  },
  BASIC: {
    id: 'basic',
    name: 'Essentiel',
    price: 29,
    maxCourses: 5,
    features: ['5 cours', 'Support email', 'Certificats basiques'],
    level: 1,
  },
  PRO: {
    id: 'pro',
    name: 'Professionnel',
    price: 79,
    maxCourses: 20,
    maxStudents: 50,
    features: ['20 cours', 'Support prioritaire', 'Certificats premium', 'Analytics'],
    level: 2,
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 199,
    maxCourses: -1, // Unlimited
    maxStudents: -1, // Unlimited
    features: ['Cours illimités', 'Support VIP 24/7', 'Coaching personnalisé', 'API Access'],
    level: 3,
  },
};

interface SubscriptionValidatorProps {
  requiredTier?: string;
  feature?: string;
  onUpgradeClick?: () => void;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionValidator: React.FC<SubscriptionValidatorProps> = ({
  requiredTier,
  feature,
  onUpgradeClick,
  children,
  fallback,
}) => {
  const { session } = useAuthStore();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS.FREE);
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    validateSubscription();
  }, [session]);

  const validateSubscription = async () => {
    setIsValidating(true);
    try {
      // Get subscription from storage or determine from user type
      const storedSubscription = await AsyncStorage.getItem(`subscription_${session?.account.id}`);
      
      let tier = SUBSCRIPTION_TIERS.FREE;
      
      if (storedSubscription) {
        const parsed = JSON.parse(storedSubscription);
        tier = SUBSCRIPTION_TIERS[parsed.tier] || SUBSCRIPTION_TIERS.FREE;
      } else {
        // Determine tier based on user type
        const userType = session?.activeProfile?.userType;
        switch (userType) {
          case 'vip':
          case 'admin':
            tier = SUBSCRIPTION_TIERS.PREMIUM;
            break;
          case 'formateur':
            tier = SUBSCRIPTION_TIERS.PREMIUM;
            break;
          case 'salon':
            tier = SUBSCRIPTION_TIERS.PRO;
            break;
          case 'etudiant':
            tier = SUBSCRIPTION_TIERS.BASIC;
            break;
          default:
            tier = SUBSCRIPTION_TIERS.FREE;
        }
      }

      setCurrentTier(tier);

      // Check access
      if (requiredTier) {
        const requiredLevel = SUBSCRIPTION_TIERS[requiredTier]?.level || 0;
        setHasAccess(tier.level >= requiredLevel);
      } else {
        setHasAccess(true);
      }

      // Log access attempt for security audit
      await logAccessAttempt(tier, requiredTier, feature);

    } catch (error) {
      console.error('Subscription validation error:', error);
      setHasAccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  const logAccessAttempt = async (currentTier: SubscriptionTier, required?: string, feature?: string) => {
    try {
      const accessLog = {
        userId: session?.account.id,
        timestamp: new Date().toISOString(),
        currentTier: currentTier.id,
        requiredTier: required,
        feature: feature,
        granted: !required || currentTier.level >= (SUBSCRIPTION_TIERS[required]?.level || 0),
      };

      const logs = await AsyncStorage.getItem('access_logs');
      const logList = logs ? JSON.parse(logs) : [];
      logList.push(accessLog);

      // Keep only last 500 logs
      const trimmedLogs = logList.slice(-500);
      await AsyncStorage.setItem('access_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  };

  if (isValidating) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="small" color="#FF6B35" />
        <Text className="mt-2 text-sm text-gray-600">Validation des permissions...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <LockedContent
        currentTier={currentTier}
        requiredTier={requiredTier ? SUBSCRIPTION_TIERS[requiredTier] : undefined}
        feature={feature}
        onUpgradeClick={onUpgradeClick}
      />
    );
  }

  return <>{children}</>;
};

interface LockedContentProps {
  currentTier: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  feature?: string;
  onUpgradeClick?: () => void;
}

const LockedContent: React.FC<LockedContentProps> = ({
  currentTier,
  requiredTier,
  feature,
  onUpgradeClick,
}) => {
  const ChicRebelPalette = {
    primary: '#FF6B35',
    secondary: '#D4AF37',
    accent: '#E85D75',
    dark: '#1A1A1A',
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-white rounded-3xl p-8 shadow-xl items-center max-w-sm">
        {/* Lock Icon with Gradient Background */}
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${ChicRebelPalette.primary}20` }}
        >
          <Ionicons name="lock-closed" size={40} color={ChicRebelPalette.primary} />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-center mb-2" style={{ color: ChicRebelPalette.dark }}>
          Contenu Premium
        </Text>

        {/* Description */}
        <Text className="text-sm text-center text-gray-600 mb-4">
          {feature 
            ? `Cette fonctionnalité "${feature}" nécessite un abonnement supérieur.`
            : 'Ce contenu nécessite un abonnement supérieur pour y accéder.'}
        </Text>

        {/* Current vs Required Tier */}
        <View className="w-full mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-gray-500">Votre abonnement:</Text>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${ChicRebelPalette.accent}20` }}>
              <Text className="text-xs font-bold" style={{ color: ChicRebelPalette.accent }}>
                {currentTier.name}
              </Text>
            </View>
          </View>
          
          {requiredTier && (
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">Requis:</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${ChicRebelPalette.secondary}20` }}>
                <Text className="text-xs font-bold" style={{ color: ChicRebelPalette.secondary }}>
                  {requiredTier.name}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Features List */}
        {requiredTier && (
          <View className="w-full mb-6">
            <Text className="text-xs font-semibold text-gray-700 mb-2">
              Débloquez avec {requiredTier.name}:
            </Text>
            {requiredTier.features.slice(0, 3).map((feature, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <Ionicons name="checkmark-circle" size={14} color={ChicRebelPalette.secondary} />
                <Text className="ml-2 text-xs text-gray-600">{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Upgrade Button */}
        <Pressable
          onPress={onUpgradeClick}
          className="w-full py-3 rounded-xl items-center"
          style={{ backgroundColor: ChicRebelPalette.primary }}
        >
          <View className="flex-row items-center">
            <Ionicons name="rocket" size={18} color="white" />
            <Text className="ml-2 text-white font-bold">
              Mettre à niveau
              {requiredTier?.price && ` - $${requiredTier.price}/mois`}
            </Text>
          </View>
        </Pressable>

        {/* Security Badge */}
        <View className="flex-row items-center mt-4">
          <Ionicons name="shield-checkmark" size={12} color={ChicRebelPalette.secondary} />
          <Text className="ml-1 text-xs" style={{ color: ChicRebelPalette.secondary }}>
            Paiement sécurisé avec Stripe
          </Text>
        </View>
      </View>
    </View>
  );
};

// Hook for easy subscription checks
export const useSubscription = () => {
  const { session } = useAuthStore();
  const [tier, setTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS.FREE);

  useEffect(() => {
    const loadTier = async () => {
      const storedSubscription = await AsyncStorage.getItem(`subscription_${session?.account.id}`);
      if (storedSubscription) {
        const parsed = JSON.parse(storedSubscription);
        setTier(SUBSCRIPTION_TIERS[parsed.tier] || SUBSCRIPTION_TIERS.FREE);
      } else {
        // Default based on user type
        const userType = session?.activeProfile?.userType;
        switch (userType) {
          case 'vip':
          case 'admin':
          case 'formateur':
            setTier(SUBSCRIPTION_TIERS.PREMIUM);
            break;
          case 'salon':
            setTier(SUBSCRIPTION_TIERS.PRO);
            break;
          case 'etudiant':
            setTier(SUBSCRIPTION_TIERS.BASIC);
            break;
          default:
            setTier(SUBSCRIPTION_TIERS.FREE);
        }
      }
    };
    loadTier();
  }, [session]);

  const hasAccess = (requiredTierId: string): boolean => {
    const requiredLevel = SUBSCRIPTION_TIERS[requiredTierId]?.level || 0;
    return tier.level >= requiredLevel;
  };

  const canAccessCourse = (courseIndex: number): boolean => {
    if (tier.maxCourses === -1) return true; // Unlimited
    return courseIndex < tier.maxCourses;
  };

  return {
    tier,
    hasAccess,
    canAccessCourse,
    isFreeTier: tier.id === 'free',
    isPremium: tier.id === 'premium',
  };
};