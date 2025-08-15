import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useAuthStore } from '../state/authStore';
import { usePaymentStore, formatPrice } from '../state/paymentStore';
import { paymentIntegration } from '../api/payment-integration';
import { stripeService } from '../api/stripe-service';
import { SubscriptionTier, SubscriptionPlan } from '../types/payment';

export const SubscriptionScreen: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { confirmPayment } = useStripe();
  
  const { session } = useAuthStore();
  const {
    currentSubscription,
    availablePlans,
    paymentMethods,
    customer,
    isLoading,
    error,
    currentPaymentIntent,
    isSubscriptionActive,
    hasValidPaymentMethod,
    calculateQuebecTax,
  } = usePaymentStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Initialize payment data when component mounts
    if (session?.activeProfile) {
      paymentIntegration.initializePaymentForProfile(session.activeProfile);
    }
  }, [session?.activeProfile]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (currentSubscription?.subscriptionPlan.tier === plan.tier) {
      Alert.alert('Information', 'Vous êtes déjà abonné à ce plan.');
      return;
    }

    setSelectedPlan(plan);
    
    if (!hasValidPaymentMethod()) {
      setShowPaymentForm(true);
    } else {
      handleSubscribe(plan.tier);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier, paymentMethodId?: string) => {
    setProcessing(true);
    
    try {
      const result = await paymentIntegration.subscribeToPlan(tier, paymentMethodId);
      
      if (result.success) {
        Alert.alert('Succès!', result.message);
        setShowPaymentForm(false);
        setSelectedPlan(null);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentWithNewCard = async () => {
    if (!cardComplete || !selectedPlan) {
      Alert.alert('Erreur', 'Veuillez compléter les informations de carte.');
      return;
    }

    setProcessing(true);

    try {
      // Create payment method
      const { success, paymentMethod, error: pmError } = await stripeService.createPaymentMethod(
        {}, // Card details from CardField
        {
          email: customer?.email,
          name: customer?.name,
        }
      );

      if (!success || !paymentMethod) {
        Alert.alert('Erreur', pmError?.message || 'Erreur lors de la création de la méthode de paiement');
        setProcessing(false);
        return;
      }

      // Subscribe with new payment method
      await handleSubscribe(selectedPlan.tier, paymentMethod.stripePaymentMethodId);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
      setProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler votre abonnement? Il sera actif jusqu\'à la fin de la période de facturation.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const result = await paymentIntegration.cancelSubscription();
            Alert.alert(
              result.success ? 'Succès' : 'Erreur',
              result.message
            );
          },
        },
      ]
    );
  };

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const taxInfo = calculateQuebecTax(plan.price);
    const isCurrentPlan = currentSubscription?.subscriptionPlan.tier === plan.tier;
    const isActive = isSubscriptionActive();

    return (
      <View style={[styles.planCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: currentTheme.text }]}>{plan.name}</Text>
          {plan.isPopular && (
            <View style={[styles.popularBadge, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.popularText}>Populaire</Text>
            </View>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            {formatPrice(plan.price)}
          </Text>
          <Text style={[styles.priceSubtext, { color: currentTheme.textSecondary }]}>
            /mois + taxes
          </Text>
        </View>

        <Text style={[styles.taxInfo, { color: currentTheme.textSecondary }]}>
          Total avec taxes: {formatPrice(taxInfo.total)}
        </Text>

        <View style={styles.featuresList}>
          {plan.features.map((feature, index) => (
            <Text key={index} style={[styles.feature, { color: currentTheme.text }]}>
              ✓ {feature}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: isCurrentPlan ? currentTheme.success : currentTheme.primary,
              opacity: processing ? 0.7 : 1,
            },
          ]}
          onPress={() => handleSelectPlan(plan)}
          disabled={processing || isCurrentPlan}
        >
          <Text style={styles.selectButtonText}>
            {isCurrentPlan ? 'Plan actuel' : 'Choisir ce plan'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            Chargement des abonnements...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Choisissez votre plan d'abonnement
        </Text>

        {currentSubscription && (
          <View style={[styles.currentSubscriptionCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.currentSubscriptionTitle, { color: currentTheme.text }]}>
              Abonnement actuel
            </Text>
            <Text style={[styles.currentSubscriptionPlan, { color: currentTheme.primary }]}>
              {currentSubscription.subscriptionPlan.name}
            </Text>
            <Text style={[styles.currentSubscriptionPrice, { color: currentTheme.text }]}>
              {formatPrice(currentSubscription.subscriptionPlan.price)}/mois
            </Text>
            <Text style={[styles.currentSubscriptionStatus, { color: currentTheme.textSecondary }]}>
              Statut: {currentSubscription.status}
            </Text>
            <Text style={[styles.currentSubscriptionPeriod, { color: currentTheme.textSecondary }]}>
              Prochaine facturation: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('fr-CA')}
            </Text>
            
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: currentTheme.error }]}
              onPress={handleCancelSubscription}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.error }]}>
                Annuler l'abonnement
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.plansContainer}>
          {availablePlans
            .sort((a, b) => a.priority - b.priority)
            .map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
        </View>

        {showPaymentForm && selectedPlan && (
          <View style={[styles.paymentForm, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.paymentFormTitle, { color: currentTheme.text }]}>
              Ajouter une méthode de paiement
            </Text>
            
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
                postalCode: 'H1A 1A1',
                cvc: 'CVC',
                expiration: 'MM/AA',
              }}
              cardStyle={{
                backgroundColor: currentTheme.background,
                textColor: currentTheme.text,
                borderColor: currentTheme.border,
                borderWidth: 1,
                borderRadius: 8,
                fontSize: 16,
                placeholderColor: currentTheme.textSecondary,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />

            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={[styles.cancelPaymentButton, { borderColor: currentTheme.border }]}
                onPress={() => setShowPaymentForm(false)}
                disabled={processing}
              >
                <Text style={[styles.cancelPaymentButtonText, { color: currentTheme.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmPaymentButton,
                  {
                    backgroundColor: currentTheme.primary,
                    opacity: cardComplete && !processing ? 1 : 0.5,
                  },
                ]}
                onPress={handlePaymentWithNewCard}
                disabled={!cardComplete || processing}
              >
                {processing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.confirmPaymentButtonText}>
                    S'abonner
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: currentTheme.error + '20' }]}>
            <Text style={[styles.errorText, { color: currentTheme.error }]}>
              {error.message}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentSubscriptionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentSubscriptionPlan: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentSubscriptionPrice: {
    fontSize: 16,
    marginBottom: 8,
  },
  currentSubscriptionStatus: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentSubscriptionPeriod: {
    fontSize: 14,
    marginBottom: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceSubtext: {
    fontSize: 14,
    marginLeft: 4,
  },
  taxInfo: {
    fontSize: 12,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 14,
    marginBottom: 6,
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentForm: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  paymentFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardField: {
    height: 50,
    marginBottom: 20,
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelPaymentButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmPaymentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPaymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});