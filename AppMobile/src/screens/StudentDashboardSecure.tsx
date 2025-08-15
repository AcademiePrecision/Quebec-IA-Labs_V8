import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useAppStore } from '../state/appStore';
import { t } from '../utils/translations';
import { mockFormations, mockBadges } from '../utils/mockData';
import { useTheme, themes } from '../contexts/ThemeContext';

// Security Components
import { SessionMonitor } from '../components/security/SessionMonitor';
import { SubscriptionValidator } from '../components/security/SubscriptionValidator';
import { SecureErrorBoundary } from '../components/security/SecureErrorBoundary';

// ChicRebel Palette Configuration
const ChicRebelPalette = {
  primary: '#FF6B35',      // Violet Royal
  secondary: '#D4AF37',    // Or Champagne
  accent: '#E85D75',       // Corail Fumé
  dark: '#1A1A1A',        // Noir Profond
  darkGray: '#2D2D2D',    // Gris Métallique
  lightGray: '#F3F4F6',   // Gris Perle
  white: '#FFFFFF',
  success: '#10B981',     // Vert Émeraude
  warning: '#F59E0B',     // Orange Ambre
  error: '#E85D75',       // Corail Fumé (same as accent)
  info: '#6366F1',        // Indigo
};

// Subscription Tiers
const SUBSCRIPTION_TIERS = {
  FREE: { id: 'free', name: 'Gratuit', maxCourses: 1, features: ['Cours limité'] },
  BASIC: { id: 'basic', name: 'Essentiel', price: 29, maxCourses: 5, features: ['5 cours', 'Support email'] },
  PRO: { id: 'pro', name: 'Professionnel', price: 79, maxCourses: 20, features: ['20 cours', 'Support prioritaire', 'Certificats'] },
  PREMIUM: { id: 'premium', name: 'Premium', price: 199, maxCourses: -1, features: ['Cours illimités', 'Support VIP', 'Coaching 1:1'] },
};

interface StudentDashboardSecureProps {
  onNavigateToCatalog: () => void;
  onNavigateToProfile: () => void;
  onNavigateToPayment: () => void;
  onLogout: () => void;
}

export const StudentDashboardSecure: React.FC<StudentDashboardSecureProps> = ({
  onNavigateToCatalog,
  onNavigateToProfile,
  onNavigateToPayment,
  onLogout,
}) => {
  const { session, language } = useAuthStore();
  const { formations, enrollments, userBadges, setFormations, setBadges } = useAppStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const insets = useSafeAreaInsets();

  // Security States
  const [isValidatingSession, setIsValidatingSession] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState(SUBSCRIPTION_TIERS.FREE);
  const [lockedContent, setLockedContent] = useState<string[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);

  // Session Validation Effect
  useEffect(() => {
    validateSession();
    const interval = setInterval(validateSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session]);

  // Initialize mock data
  useEffect(() => {
    if (formations.length === 0) {
      setFormations(mockFormations);
    }
    setBadges(mockBadges);
  }, [formations.length, setFormations, setBadges]);

  const validateSession = useCallback(async () => {
    setIsValidatingSession(true);
    try {
      // Simulate session validation
      if (!session) {
        throw new Error('Session invalide');
      }

      // Check session expiry (30 minutes timeout)
      const sessionAge = Date.now() - new Date(session.account.updatedAt).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (sessionAge > thirtyMinutes) {
        setSecurityAlerts(prev => [...prev, 'Session expirée pour sécurité']);
        handleSessionTimeout();
        return;
      }

      setSessionExpiry(new Date(Date.now() + (thirtyMinutes - sessionAge)));
      
      // Validate subscription tier
      validateSubscription();
      
    } catch (error) {
      console.error('Session validation error:', error);
      setSecurityAlerts(prev => [...prev, 'Erreur de validation de session']);
    } finally {
      setIsValidatingSession(false);
    }
  }, [session]);

  const validateSubscription = () => {
    // Simulate subscription validation based on user type
    const userType = session?.activeProfile?.userType;
    
    switch (userType) {
      case 'vip':
      case 'formateur':
        setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM);
        setLockedContent([]);
        break;
      case 'salon':
        setSubscriptionTier(SUBSCRIPTION_TIERS.PRO);
        setLockedContent(formations.slice(20).map(f => f.id));
        break;
      case 'etudiant':
        setSubscriptionTier(SUBSCRIPTION_TIERS.BASIC);
        setLockedContent(formations.slice(5).map(f => f.id));
        break;
      default:
        setSubscriptionTier(SUBSCRIPTION_TIERS.FREE);
        setLockedContent(formations.slice(1).map(f => f.id));
    }
  };

  const handleSessionTimeout = () => {
    Alert.alert(
      'Session Expirée',
      'Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.',
      [{ text: 'OK', onPress: onLogout }]
    );
  };

  const getUserDisplayName = () => {
    return session?.account.firstName || 'Étudiant';
  };

  const activeFormations = formations.filter(f => 
    enrollments.some(e => e.formationId === f.id && e.progress < 100) &&
    !lockedContent.includes(f.id)
  );

  const recommendedFormations = formations
    .filter(f => !lockedContent.includes(f.id))
    .slice(0, 3);

  // Security Badge Component
  const SecurityBadge: React.FC<{ status: 'secure' | 'warning' | 'error' }> = ({ status }) => {
    const colors = {
      secure: ChicRebelPalette.success,
      warning: ChicRebelPalette.warning,
      error: ChicRebelPalette.error,
    };
    const icons = {
      secure: 'shield-checkmark',
      warning: 'warning',
      error: 'alert-circle',
    };
    
    return (
      <View className="flex-row items-center px-3 py-1 rounded-full" 
            style={{ backgroundColor: `${colors[status]}20` }}>
        <Ionicons name={icons[status] as any} size={14} color={colors[status]} />
        <Text className="ml-1 text-xs font-medium" style={{ color: colors[status] }}>
          {status === 'secure' ? 'Sécurisé' : status === 'warning' ? 'Attention' : 'Action requise'}
        </Text>
      </View>
    );
  };

  // Subscription Upgrade Card
  const UpgradeCard: React.FC = () => (
    <LinearGradient
      colors={[ChicRebelPalette.primary, ChicRebelPalette.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-6 mb-6 rounded-2xl p-5"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">
            Débloquez Plus de Contenu
          </Text>
          <Text className="text-white/90 text-sm mb-3">
            Passez à {SUBSCRIPTION_TIERS.PRO.name} pour accéder à tous les cours
          </Text>
          <Pressable 
            onPress={onNavigateToPayment}
            className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg self-start"
          >
            <Text className="text-white font-semibold">
              Mettre à niveau → ${SUBSCRIPTION_TIERS.PRO.price}/mois
            </Text>
          </Pressable>
        </View>
        <Ionicons name="rocket" size={48} color={ChicRebelPalette.secondary} />
      </View>
    </LinearGradient>
  );

  // Formation Card with Lock Status
  const SecureFormationCard: React.FC<{ 
    formation: any; 
    progress?: number;
    isLocked?: boolean;
  }> = ({ formation, progress, isLocked = false }) => (
    <Pressable 
      className={`rounded-2xl p-4 shadow-lg mr-4 w-72 ${isLocked ? 'opacity-60' : ''}`}
      style={{ backgroundColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.white }}
      disabled={isLocked}
    >
      <View className="h-32 rounded-xl mb-3 relative" style={{ backgroundColor: ChicRebelPalette.lightGray }}>
        {isLocked && (
          <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
            <Ionicons name="lock-closed" size={32} color={ChicRebelPalette.secondary} />
            <Text className="text-white text-sm mt-2 font-medium">Premium requis</Text>
          </View>
        )}
      </View>
      
      <View className="flex-row items-center mb-2">
        <View className="px-2 py-1 rounded-md mr-2" style={{ backgroundColor: `${ChicRebelPalette.primary}20` }}>
          <Text className="text-xs font-bold" style={{ color: ChicRebelPalette.primary }}>
            NOUVEAU
          </Text>
        </View>
        <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${ChicRebelPalette.secondary}20` }}>
          <Text className="text-xs font-bold" style={{ color: ChicRebelPalette.secondary }}>
            ACADÉMIE
          </Text>
        </View>
      </View>
      
      <Text className="font-bold text-base mb-1" style={{ color: currentTheme.text }} numberOfLines={2}>
        {formation.title}
      </Text>
      <Text className="text-sm mb-2" style={{ color: currentTheme.textSecondary }}>
        {formation.formateur?.name || 'Formateur Expert'}
      </Text>
      
      {progress !== undefined && !isLocked && (
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs" style={{ color: currentTheme.textSecondary }}>
              Progression
            </Text>
            <Text className="text-xs font-medium" style={{ color: ChicRebelPalette.primary }}>
              {progress}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <LinearGradient
              colors={[ChicRebelPalette.primary, ChicRebelPalette.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${progress}%`, height: '100%' }}
            />
          </View>
        </View>
      )}
      
      <View className="flex-row items-center justify-between">
        <Text className="font-bold" style={{ color: ChicRebelPalette.accent }}>
          ${formation.price || 99}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color={ChicRebelPalette.secondary} />
          <Text className="text-sm ml-1" style={{ color: currentTheme.textSecondary }}>
            {formation.rating || 4.8}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  // Session Timer Component
  const SessionTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const interval = setInterval(() => {
        if (sessionExpiry) {
          const diff = sessionExpiry.getTime() - Date.now();
          if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          } else {
            setTimeLeft('Expirée');
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [sessionExpiry]);

    return (
      <View className="flex-row items-center px-3 py-1.5 rounded-lg" 
            style={{ backgroundColor: `${ChicRebelPalette.info}20` }}>
        <Ionicons name="time-outline" size={14} color={ChicRebelPalette.info} />
        <Text className="ml-1.5 text-xs font-medium" style={{ color: ChicRebelPalette.info }}>
          Session: {timeLeft}
        </Text>
      </View>
    );
  };

  if (isValidatingSession) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: currentTheme.background }}>
        <ActivityIndicator size="large" color={ChicRebelPalette.primary} />
        <Text className="mt-4 text-base" style={{ color: currentTheme.text }}>
          Validation de votre session...
        </Text>
      </View>
    );
  }

  return (
    <SecureErrorBoundary>
      <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-zvolskiy-1570807.jpg')}>
        <View style={{ paddingTop: insets.top, flex: 1 }}>
          <Header 
            showLogout
            onLogoutPress={onNavigateToProfile}
          />
          
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Security Status Bar */}
            <View className="px-6 py-3 flex-row items-center justify-between" 
                  style={{ backgroundColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.lightGray }}>
              <SecurityBadge status="secure" />
              <SessionTimer />
              <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${ChicRebelPalette.secondary}20` }}>
                <Text className="text-xs font-bold" style={{ color: ChicRebelPalette.secondary }}>
                  {subscriptionTier.name.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Welcome Section avec Style ChicRebel */}
            <View className="px-6 py-6">
              <View className="flex-row items-baseline mb-2">
                <Text className="text-4xl font-bold" style={{ color: ChicRebelPalette.primary }}>
                  Bonjour
                </Text>
                <Text className="text-4xl font-bold ml-2" style={{ color: currentTheme.text }}>
                  {getUserDisplayName()}
                </Text>
              </View>
              
              <View className="flex-row items-center mt-2">
                <View className="px-3 py-1.5 rounded-lg mr-2" 
                      style={{ backgroundColor: `${ChicRebelPalette.primary}20` }}>
                  <Text className="text-sm font-bold" style={{ color: ChicRebelPalette.primary }}>
                    NOUVEAU
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-lg" 
                      style={{ backgroundColor: `${ChicRebelPalette.secondary}20` }}>
                  <Text className="text-sm font-bold" style={{ color: ChicRebelPalette.secondary }}>
                    ACADÉMIE
                  </Text>
                </View>
              </View>
              
              <Text className="text-base mt-3" style={{ color: currentTheme.textSecondary }}>
                Continuez votre parcours de formation professionnelle
              </Text>
            </View>

            {/* Stats Cards avec Gradient ChicRebel */}
            <View className="px-6 mb-6">
              <View className="flex-row space-x-3">
                <LinearGradient
                  colors={[ChicRebelPalette.primary, `${ChicRebelPalette.primary}CC`]}
                  className="flex-1 rounded-2xl p-4 shadow-lg"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Ionicons name="book" size={24} color={ChicRebelPalette.white} />
                    <Text className="text-3xl font-bold text-white">
                      {activeFormations.length}
                    </Text>
                  </View>
                  <Text className="text-white/90 text-sm">Formations actives</Text>
                </LinearGradient>

                <LinearGradient
                  colors={[ChicRebelPalette.secondary, `${ChicRebelPalette.secondary}CC`]}
                  className="flex-1 rounded-2xl p-4 shadow-lg"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Ionicons name="trophy" size={24} color={ChicRebelPalette.white} />
                    <Text className="text-3xl font-bold text-white">
                      {userBadges.length}
                    </Text>
                  </View>
                  <Text className="text-white/90 text-sm">Badges obtenus</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Upgrade Card if not Premium */}
            {subscriptionTier.id !== 'premium' && <UpgradeCard />}

            {/* Security Alerts */}
            {securityAlerts.length > 0 && (
              <View className="mx-6 mb-6">
                {securityAlerts.map((alert, index) => (
                  <View key={index} className="flex-row items-center p-3 rounded-lg mb-2"
                        style={{ backgroundColor: `${ChicRebelPalette.warning}20` }}>
                    <Ionicons name="warning-outline" size={20} color={ChicRebelPalette.warning} />
                    <Text className="ml-2 flex-1 text-sm" style={{ color: currentTheme.text }}>
                      {alert}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Active Formations with Lock Status */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between px-6 mb-4">
                <Text className="text-xl font-bold" style={{ color: currentTheme.text }}>
                  Mes Formations Actives
                </Text>
                <Pressable onPress={onNavigateToCatalog}>
                  <Text className="font-medium" style={{ color: ChicRebelPalette.primary }}>
                    Voir tout →
                  </Text>
                </Pressable>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24 }}
              >
                {activeFormations.length > 0 ? (
                  activeFormations.map((formation) => (
                    <SecureFormationCard
                      key={formation.id}
                      formation={formation}
                      progress={Math.floor(Math.random() * 80) + 10}
                      isLocked={lockedContent.includes(formation.id)}
                    />
                  ))
                ) : (
                  <View className="w-72 h-48 rounded-2xl p-6 items-center justify-center"
                        style={{ backgroundColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.white }}>
                    <Ionicons name="book-outline" size={48} color={ChicRebelPalette.primary} />
                    <Text className="text-center mt-3 font-medium" style={{ color: currentTheme.text }}>
                      Aucune formation active
                    </Text>
                    <Pressable 
                      onPress={onNavigateToCatalog}
                      className="mt-4 px-4 py-2 rounded-lg"
                      style={{ backgroundColor: ChicRebelPalette.primary }}
                    >
                      <Text className="text-white font-semibold">
                        Commencer maintenant
                      </Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Recommended Formations with Security */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between px-6 mb-4">
                <Text className="text-xl font-bold" style={{ color: currentTheme.text }}>
                  Formations Recommandées
                </Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24 }}
              >
                {recommendedFormations.map((formation) => (
                  <SecureFormationCard 
                    key={formation.id} 
                    formation={formation}
                    isLocked={lockedContent.includes(formation.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Certificates Section with Verification */}
            <View className="px-6 mb-6">
              <Text className="text-xl font-bold mb-4" style={{ color: currentTheme.text }}>
                Mes Certificats Vérifiés
              </Text>
              <View className="rounded-2xl p-4" style={{ backgroundColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.white }}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="ribbon" size={24} color={ChicRebelPalette.secondary} />
                  <Text className="ml-3 font-semibold" style={{ color: currentTheme.text }}>
                    Certificat Barbier Professionnel
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs" style={{ color: currentTheme.textSecondary }}>
                      Code de vérification
                    </Text>
                    <Text className="font-mono text-sm mt-1" style={{ color: ChicRebelPalette.primary }}>
                      ACAD-2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-row items-center px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: `${ChicRebelPalette.success}20` }}>
                    <Ionicons name="checkmark-circle" size={16} color={ChicRebelPalette.success} />
                    <Text className="ml-1.5 text-xs font-medium" style={{ color: ChicRebelPalette.success }}>
                      Vérifié
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="px-6 pb-8">
              <LinearGradient
                colors={[ChicRebelPalette.primary, ChicRebelPalette.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl overflow-hidden"
              >
                <Pressable 
                  onPress={onNavigateToCatalog}
                  className="px-6 py-4 flex-row items-center justify-center"
                >
                  <Ionicons name="search" size={20} color={ChicRebelPalette.white} />
                  <Text className="ml-2 text-white font-bold text-base">
                    Explorer le Catalogue
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          </ScrollView>

          {/* Bottom Navigation avec Badges de Sécurité */}
          <View className="border-t flex-row justify-around py-2"
                style={{ 
                  backgroundColor: theme === 'dark' ? ChicRebelPalette.dark : ChicRebelPalette.white,
                  borderTopColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.lightGray
                }}>
            <Pressable className="items-center py-2 relative">
              <Ionicons name="home" size={24} color={ChicRebelPalette.primary} />
              <Text className="text-xs mt-1" style={{ color: ChicRebelPalette.primary }}>
                Accueil
              </Text>
              <View className="absolute -top-1 -right-1 w-2 h-2 rounded-full" 
                    style={{ backgroundColor: ChicRebelPalette.success }} />
            </Pressable>
            
            <Pressable onPress={onNavigateToCatalog} className="items-center py-2">
              <Ionicons name="book-outline" size={24} color={currentTheme.textSecondary} />
              <Text className="text-xs mt-1" style={{ color: currentTheme.textSecondary }}>
                Catalogue
              </Text>
            </Pressable>
            
            <Pressable className="items-center py-2 relative">
              <Ionicons name="calendar-outline" size={24} color={currentTheme.textSecondary} />
              <Text className="text-xs mt-1" style={{ color: currentTheme.textSecondary }}>
                Planning
              </Text>
              {lockedContent.length > 0 && (
                <View className="absolute -top-1 -right-1">
                  <Ionicons name="lock-closed" size={12} color={ChicRebelPalette.warning} />
                </View>
              )}
            </Pressable>
            
            <Pressable className="items-center py-2">
              <Ionicons name="chatbubble-outline" size={24} color={currentTheme.textSecondary} />
              <Text className="text-xs mt-1" style={{ color: currentTheme.textSecondary }}>
                Messages
              </Text>
            </Pressable>
            
            <Pressable onPress={onNavigateToProfile} className="items-center py-2">
              <Ionicons name="person-outline" size={24} color={currentTheme.textSecondary} />
              <Text className="text-xs mt-1" style={{ color: currentTheme.textSecondary }}>
                Profil
              </Text>
            </Pressable>
          </View>
        </View>
      </SubtleBackground>
    </SecureErrorBoundary>
  );
};