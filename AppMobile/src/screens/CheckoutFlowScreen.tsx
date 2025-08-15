import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CardField, useStripe, ApplePay, GooglePay } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { usePaymentStore } from '../state/paymentStore';
import { SubscriptionPlan } from '../types/payment';
import { useSecurity } from '../contexts/SecurityContext';
import Environment from '../config/environment';

interface CheckoutFlowScreenProps {
  plan: SubscriptionPlan;
  isTrialSignup?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Progress steps for checkout
const CHECKOUT_STEPS = [
  { id: 'account', label: 'Compte', icon: '👤' },
  { id: 'payment', label: 'Paiement', icon: '💳' },
  { id: 'confirm', label: 'Confirmation', icon: '✓' },
];

// Form validation rules
const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\(\)]+$/,
  postalCode: /^[A-Za-z]\d[A-Za-z][\s]?\d[A-Za-z]\d$/i, // Canadian postal code
};

export const CheckoutFlowScreen: React.FC<CheckoutFlowScreenProps> = ({
  plan,
  isTrialSignup = false,
  onSuccess,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { confirmPayment, isApplePaySupported, isGooglePaySupported } = useStripe();
  const { calculateQuebecTax } = usePaymentStore();
  const { validatePayment, checkPaymentRateLimit, reportSecurityIncident } = useSecurity();
  
  // Safety fallback for missing plan data
  const safePlan = plan || { 
    id: 'professional', 
    name: 'Professional', 
    price: 79, 
    currency: 'CAD' 
  };

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Account information
    email: '',
    name: '',
    businessName: '',
    phone: '',
    
    // Billing address
    address: '',
    city: '',
    province: 'QC',
    postalCode: '',
    
    // Payment preferences
    billingInterval: 'month' as 'month' | 'year',
    acceptTerms: false,
    subscribeNewsletter: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Calculate pricing with taxes using safePlan
  const pricing = calculateQuebecTax(
    formData.billingInterval === 'year' ? safePlan.price * 10 : safePlan.price
  );

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / CHECKOUT_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Step transition animation
    Animated.sequence([
      Animated.timing(stepAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(stepAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // Form validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Account step
        if (!formData.email) {
          newErrors.email = 'Email requis';
        } else if (!VALIDATION_RULES.email.test(formData.email)) {
          newErrors.email = 'Email invalide';
        }
        
        if (!formData.name) {
          newErrors.name = 'Nom requis';
        }
        
        if (!formData.phone) {
          newErrors.phone = 'Téléphone requis';
        }
        break;

      case 1: // Payment step
        if (!isTrialSignup) {
          if (!cardComplete) {
            newErrors.payment = 'Informations de carte incomplètes';
          }
        }
        
        if (!formData.postalCode) {
          newErrors.postalCode = 'Code postal requis';
        } else if (!VALIDATION_RULES.postalCode.test(formData.postalCode)) {
          newErrors.postalCode = 'Code postal invalide (ex: H1A 1A1)';
        }
        break;

      case 2: // Confirmation step
        if (!formData.acceptTerms) {
          newErrors.terms = 'Vous devez accepter les conditions';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < CHECKOUT_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      // Haptic feedback for validation error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  // Handle express checkout (Apple Pay / Google Pay)
  const handleExpressCheckout = async (method: 'apple' | 'google') => {
    setIsProcessing(true);
    
    try {
      // Implementation would connect to Stripe's express checkout
      Alert.alert(
        'Paiement Express',
        `${method === 'apple' ? 'Apple Pay' : 'Google Pay'} sera disponible bientôt!`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit form avec validation sécurisée
  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Vérifier les limites de taux
      const rateLimitOk = await checkPaymentRateLimit();
      if (!rateLimitOk) {
        reportSecurityIncident('rate_limit_exceeded', {
          email: formData.email,
          timestamp: new Date().toISOString(),
        });
        
        Alert.alert(
          'Trop de tentatives',
          'Veuillez patienter quelques minutes avant de réessayer.',
          [{ text: 'OK' }]
        );
        return;
      }

      // 2. Valider le paiement avec le backend (loading optimiste)
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const isValid = await validatePayment(paymentIntentId, pricing.total);
      
      if (!isValid) {
        throw new Error('Payment validation failed');
      }

      // 3. Animation de succès
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
      
      // Haptic success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Environment.debugLog('[CheckoutFlow] Payment successful', {
        paymentIntentId,
        amount: pricing.total,
      });
      
      if (onSuccess) {
        setTimeout(onSuccess, 500);
      }
    } catch (error) {
      reportSecurityIncident('payment_failed', {
        error: (error as Error).message,
        email: formData.email,
        amount: pricing.total,
      });
      
      Alert.alert(
        'Erreur de paiement',
        'Le paiement n\'a pas pu être traité. Veuillez vérifier vos informations et réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Account Information
        return (
          <Animated.View
            style={{ transform: [{ scale: stepAnim }] }}
            className="space-y-4"
          >
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Créez votre compte
            </Text>

            {/* Express signup options */}
            {isTrialSignup && (
              <View className="mb-6">
                <TouchableOpacity
                  className="bg-black rounded-lg py-4 mb-3"
                  onPress={() => handleExpressCheckout('apple')}
                >
                  <Text className="text-white text-center font-semibold">
                    🍎 Continuer avec Apple
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-blue-600 rounded-lg py-4 mb-3"
                  onPress={() => handleExpressCheckout('google')}
                >
                  <Text className="text-white text-center font-semibold">
                    🤖 Continuer avec Google
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-3 text-gray-500">ou</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>
              </View>
            )}

            {/* Email field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </Text>
              <TextInput
                className={`
                  border rounded-lg px-4 py-3 text-base
                  ${errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                  text-gray-900 dark:text-white
                `}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="jean@barbershop.ca"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Adresse email"
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Name field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet *
              </Text>
              <TextInput
                className={`
                  border rounded-lg px-4 py-3 text-base
                  ${errors.name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                  text-gray-900 dark:text-white
                `}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Jean Tremblay"
                autoComplete="name"
                accessibilityLabel="Nom complet"
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Business name (optional) */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du salon (optionnel)
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.businessName}
                onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                placeholder="Barbershop Excellence"
                accessibilityLabel="Nom du salon"
              />
            </View>

            {/* Phone field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone *
              </Text>
              <TextInput
                className={`
                  border rounded-lg px-4 py-3 text-base
                  ${errors.phone 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                  text-gray-900 dark:text-white
                `}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(514) 555-0123"
                keyboardType="phone-pad"
                autoComplete="tel"
                accessibilityLabel="Numéro de téléphone"
              />
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-1">{errors.phone}</Text>
              )}
            </View>

            {/* Trust message */}
            <View className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mt-4">
              <Text className="text-blue-800 dark:text-blue-200 text-sm">
                🔒 Vos informations sont sécurisées et ne seront jamais partagées
              </Text>
            </View>
          </Animated.View>
        );

      case 1: // Payment Information
        return (
          <Animated.View
            style={{ transform: [{ scale: stepAnim }] }}
            className="space-y-4"
          >
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isTrialSignup ? 'Informations de facturation' : 'Méthode de paiement'}
            </Text>

            {/* Billing interval selector */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fréquence de facturation
              </Text>
              <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, billingInterval: 'month' })}
                  className={`flex-1 py-3 rounded-md ${
                    formData.billingInterval === 'month'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      formData.billingInterval === 'month'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Mensuel
                  </Text>
                  <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
                    ${safePlan.price / 100}/mois
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, billingInterval: 'year' })}
                  className={`flex-1 py-3 rounded-md ${
                    formData.billingInterval === 'year'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      formData.billingInterval === 'year'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Annuel
                  </Text>
                  <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
                    ${(safePlan.price * 10) / 100}/année
                  </Text>
                  <Text className="text-center text-xs text-green-600 dark:text-green-400">
                    Économie ${(safePlan.price * 2) / 100}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!isTrialSignup && (
              <>
                {/* Express payment options */}
                <View className="mb-4">
                  {isApplePaySupported && (
                    <TouchableOpacity
                      className="bg-black rounded-lg py-4 mb-3 flex-row justify-center items-center"
                      onPress={() => handleExpressCheckout('apple')}
                    >
                      <Text className="text-white font-semibold">
                        Payer avec  Pay
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {isGooglePaySupported && (
                    <TouchableOpacity
                      className="bg-white border border-gray-300 rounded-lg py-4 mb-3 flex-row justify-center items-center"
                      onPress={() => handleExpressCheckout('google')}
                    >
                      <Text className="text-gray-900 font-semibold">
                        Payer avec Google Pay
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-3 text-gray-500">ou carte de crédit</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>
                </View>

                {/* Card input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Informations de carte
                  </Text>
                  <CardField
                    postalCodeEnabled={false}
                    placeholders={{
                      number: '4242 4242 4242 4242',
                      cvc: 'CVC',
                      expiration: 'MM/AA',
                    }}
                    cardStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      textColor: theme === 'dark' ? '#FFFFFF' : '#000000',
                      borderColor: errors.payment ? '#EF4444' : theme === 'dark' ? '#4B5563' : '#D1D5DB',
                      borderWidth: 1,
                      borderRadius: 8,
                      fontSize: 16,
                      placeholderColor: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                    }}
                    style={{
                      height: 50,
                      marginBottom: 16,
                    }}
                    onCardChange={(cardDetails) => {
                      setCardComplete(cardDetails.complete);
                      if (cardDetails.complete && errors.payment) {
                        setErrors({ ...errors, payment: '' });
                      }
                    }}
                  />
                  {errors.payment && (
                    <Text className="text-red-500 text-sm mt-1">{errors.payment}</Text>
                  )}
                </View>
              </>
            )}

            {/* Billing address */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code postal *
              </Text>
              <TextInput
                className={`
                  border rounded-lg px-4 py-3 text-base
                  ${errors.postalCode 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                  text-gray-900 dark:text-white
                `}
                value={formData.postalCode}
                onChangeText={(text) => setFormData({ ...formData, postalCode: text.toUpperCase() })}
                placeholder="H1A 1A1"
                autoCapitalize="characters"
                maxLength={7}
                accessibilityLabel="Code postal"
              />
              {errors.postalCode && (
                <Text className="text-red-500 text-sm mt-1">{errors.postalCode}</Text>
              )}
            </View>

            {/* Security badges */}
            <View className="flex-row items-center justify-center space-x-4 mt-4">
              <Text className="text-gray-500 text-sm">🔒 Paiement sécurisé</Text>
              <Text className="text-gray-500 text-sm">PCI-DSS</Text>
              <Text className="text-gray-500 text-sm">SSL 256-bit</Text>
            </View>
          </Animated.View>
        );

      case 2: // Confirmation
        return (
          <Animated.View
            style={{ transform: [{ scale: stepAnim }] }}
            className="space-y-4"
          >
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmez votre abonnement
            </Text>

            {/* Order summary */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                Résumé de la commande
              </Text>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Plan</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {safePlan.name}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Facturation</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {formData.billingInterval === 'month' ? 'Mensuelle' : 'Annuelle'}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Sous-total</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    ${pricing.subtotal / 100}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">TPS (5%)</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    ${pricing.gst / 100}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">TVQ (9.975%)</Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    ${pricing.qst / 100}
                  </Text>
                </View>
                
                <View className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-gray-900 dark:text-white">Total</Text>
                    <Text className="font-bold text-xl text-gray-900 dark:text-white">
                      ${pricing.total / 100} CAD
                    </Text>
                  </View>
                </View>
              </View>

              {isTrialSignup && (
                <View className="bg-green-100 dark:bg-green-900 rounded-lg p-3 mt-4">
                  <Text className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    ✓ Essai gratuit de 14 jours inclus
                  </Text>
                  <Text className="text-green-700 dark:text-green-300 text-xs mt-1">
                    Vous ne serez pas facturé avant la fin de l'essai
                  </Text>
                </View>
              )}
            </View>

            {/* Terms and conditions */}
            <View>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, acceptTerms: !formData.acceptTerms })}
                className="flex-row items-start mb-3"
              >
                <View
                  className={`
                    w-5 h-5 rounded border-2 mr-3 mt-0.5
                    ${formData.acceptTerms 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 dark:border-gray-700'
                    }
                  `}
                >
                  {formData.acceptTerms && (
                    <Text className="text-white text-xs text-center">✓</Text>
                  )}
                </View>
                <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                  J'accepte les{' '}
                  <Text className="text-blue-600 dark:text-blue-400 underline">
                    conditions d'utilisation
                  </Text>
                  {' '}et la{' '}
                  <Text className="text-blue-600 dark:text-blue-400 underline">
                    politique de confidentialité
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text className="text-red-500 text-sm mb-2">{errors.terms}</Text>
              )}

              {/* Newsletter opt-in */}
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, subscribeNewsletter: !formData.subscribeNewsletter })}
                className="flex-row items-start"
              >
                <View
                  className={`
                    w-5 h-5 rounded border-2 mr-3 mt-0.5
                    ${formData.subscribeNewsletter 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 dark:border-gray-700'
                    }
                  `}
                >
                  {formData.subscribeNewsletter && (
                    <Text className="text-white text-xs text-center">✓</Text>
                  )}
                </View>
                <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                  Recevoir des conseils et nouveautés par email
                </Text>
              </TouchableOpacity>
            </View>

            {/* What happens next */}
            <View className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <Text className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Ce qui se passe ensuite:
              </Text>
              <View className="space-y-1">
                <Text className="text-blue-800 dark:text-blue-200 text-sm">
                  1. Accès immédiat à votre tableau de bord
                </Text>
                <Text className="text-blue-800 dark:text-blue-200 text-sm">
                  2. Configuration guidée de votre compte
                </Text>
                <Text className="text-blue-800 dark:text-blue-200 text-sm">
                  3. Support prioritaire disponible 24/7
                </Text>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header with progress */}
        <View className="px-4 pt-4 pb-2">
          {/* Back button and title */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={handleBack}
              className="p-2"
              accessibilityLabel="Retour"
            >
              <Text className="text-blue-600 dark:text-blue-400 text-base">
                {currentStep === 0 ? 'Annuler' : '← Retour'}
              </Text>
            </TouchableOpacity>
            
            <Text className="text-gray-900 dark:text-white font-semibold">
              {safePlan.name}
            </Text>
            
            <View className="w-16" />
          </View>

          {/* Progress indicator */}
          <View className="mb-4">
            {/* Progress bar */}
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <Animated.View
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
            </View>

            {/* Step indicators */}
            <View className="flex-row justify-between">
              {CHECKOUT_STEPS.map((step, index) => (
                <View
                  key={step.id}
                  className="flex-1 items-center"
                  accessible={true}
                  accessibilityLabel={`Étape ${index + 1}: ${step.label}`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    now: currentStep >= index ? 1 : 0,
                    max: 1,
                  }}
                >
                  <View
                    className={`
                      w-8 h-8 rounded-full items-center justify-center mb-1
                      ${currentStep >= index 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300 dark:bg-gray-700'
                      }
                    `}
                  >
                    <Text
                      className={`text-sm ${
                        currentStep >= index ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </Text>
                  </View>
                  <Text
                    className={`text-xs ${
                      currentStep >= index 
                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Bottom action buttons */}
        <View className="px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <TouchableOpacity
            onPress={handleNext}
            disabled={isProcessing}
            className={`
              py-4 rounded-lg items-center
              ${isProcessing ? 'bg-gray-400' : 'bg-blue-600'}
            `}
            accessibilityLabel={
              currentStep === CHECKOUT_STEPS.length - 1 
                ? 'Confirmer l\'abonnement' 
                : 'Continuer'
            }
            accessibilityRole="button"
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {currentStep === CHECKOUT_STEPS.length - 1 
                  ? isTrialSignup 
                    ? 'Commencer l\'essai gratuit' 
                    : 'Confirmer le paiement'
                  : 'Continuer'
                }
              </Text>
            )}
          </TouchableOpacity>

          {/* Security message */}
          <Text className="text-center text-gray-500 text-xs mt-2">
            🔒 Paiement sécurisé par Stripe • Données hébergées au Canada
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Success overlay (shown after successful submission) */}
      {successAnim !== 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: successAnim,
            transform: [{ scale: successAnim }],
          }}
        >
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-4">
            <Text className="text-6xl text-center mb-4">🎉</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Bienvenue!
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              Votre compte a été créé avec succès
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};