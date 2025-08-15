import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { usePaymentStore } from '../state/paymentStore';
import { SubscriptionPlan, SubscriptionTier } from '../types/payment';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlanUpgradeModalProps {
  visible: boolean;
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  visible,
  currentPlan,
  targetPlan,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { calculateQuebecTax } = usePaymentStore();
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate pricing differences
  const isUpgrade = targetPlan.price > currentPlan.price;
  const priceDifference = Math.abs(targetPlan.price - currentPlan.price);
  const currentTax = calculateQuebecTax(currentPlan.price);
  const targetTax = calculateQuebecTax(targetPlan.price);

  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal exit
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onConfirm();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Feature comparison
  const getFeatureDifferences = () => {
    const newFeatures = targetPlan.features.filter(
      feature => !currentPlan.features.includes(feature)
    );
    const lostFeatures = currentPlan.features.filter(
      feature => !targetPlan.features.includes(feature)
    );
    
    return { newFeatures, lostFeatures };
  };

  const { newFeatures, lostFeatures } = getFeatureDifferences();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onCancel}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          maxHeight: SCREEN_HEIGHT * 0.85,
        }}
        className="bg-white dark:bg-gray-900 rounded-t-3xl"
      >
        {/* Handle bar */}
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="px-6 mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {isUpgrade ? 'Améliorer' : 'Modifier'} votre plan
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {isUpgrade 
                ? 'Débloquez plus de fonctionnalités'
                : 'Ajustez votre abonnement selon vos besoins'
              }
            </Text>
          </View>

          {/* Visual comparison */}
          <View className="px-6 mb-6">
            {/* Current plan */}
            <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Plan actuel
                </Text>
                <View className="bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">
                  <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    ACTUEL
                  </Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {currentPlan.name}
              </Text>
              <Text className="text-gray-700 dark:text-gray-300">
                ${currentPlan.price / 100}/mois + taxes
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Total: ${currentTax.total / 100}/mois
              </Text>
            </View>

            {/* Arrow indicator */}
            <View className="items-center mb-3">
              <Text className="text-2xl">
                {isUpgrade ? '⬇️' : '↔️'}
              </Text>
            </View>

            {/* Target plan */}
            <View
              className={`
                rounded-lg p-4 border-2
                ${isUpgrade 
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' 
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                }
              `}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className={`text-sm ${
                    isUpgrade 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Nouveau plan
                </Text>
                {isUpgrade && (
                  <View className="bg-blue-600 px-2 py-1 rounded">
                    <Text className="text-xs font-semibold text-white">
                      RECOMMANDÉ
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {targetPlan.name}
              </Text>
              <Text className="text-gray-700 dark:text-gray-300">
                ${targetPlan.price / 100}/mois + taxes
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Total: ${targetTax.total / 100}/mois
              </Text>
            </View>
          </View>

          {/* Price difference highlight */}
          <View className="mx-6 mb-6">
            <LinearGradient
              colors={isUpgrade 
                ? ['#3B82F6', '#2563EB'] 
                : ['#10B981', '#059669']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-lg p-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                {isUpgrade 
                  ? `+${priceDifference / 100}$/mois supplémentaire`
                  : `Économie de ${priceDifference / 100}$/mois`
                }
              </Text>
              <Text className="text-white text-center text-sm opacity-90 mt-1">
                {isUpgrade 
                  ? 'Investissement dans votre croissance'
                  : 'Plus d\'économies chaque mois'
                }
              </Text>
            </LinearGradient>
          </View>

          {/* Feature changes */}
          {(newFeatures.length > 0 || lostFeatures.length > 0) && (
            <View className="px-6 mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Ce qui change
              </Text>

              {/* New features (for upgrades) */}
              {newFeatures.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✨ Nouvelles fonctionnalités
                  </Text>
                  {newFeatures.map((feature, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-green-500 mr-2">+</Text>
                      <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Lost features (for downgrades) */}
              {lostFeatures.length > 0 && (
                <View>
                  <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                    ⚠️ Fonctionnalités retirées
                  </Text>
                  {lostFeatures.map((feature, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-orange-500 mr-2">-</Text>
                      <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Important information */}
          <View className="mx-6 mb-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
            <Text className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
              ℹ️ Bon à savoir
            </Text>
            <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
              {isUpgrade 
                ? 'Le changement prend effet immédiatement. Vous serez facturé au prorata pour le reste du mois.'
                : 'Le changement prendra effet à la fin de votre période de facturation actuelle.'
              }
            </Text>
          </View>

          {/* Action buttons */}
          <View className="px-6">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isProcessing}
              className={`
                rounded-lg py-4 mb-3
                ${isProcessing ? 'bg-gray-400' : 'bg-blue-600'}
              `}
            >
              <Text className="text-white text-center font-bold text-base">
                {isProcessing 
                  ? 'Traitement...'
                  : isUpgrade 
                    ? `Améliorer pour ${targetPlan.price / 100}$/mois`
                    : 'Confirmer le changement'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              disabled={isProcessing}
              className="py-4"
            >
              <Text className="text-gray-600 dark:text-gray-400 text-center font-semibold">
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};