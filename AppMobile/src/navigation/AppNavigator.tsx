import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileSelectorScreen } from '../screens/ProfileSelectorScreen';
import { AddProfileScreen } from '../screens/AddProfileScreen';
import { StudentDashboard } from '../screens/StudentDashboard';
import { AdminDashboard } from '../screens/AdminDashboard';
import { AdminAccountsScreen } from '../screens/AdminAccountsScreen';
import { FormateurDashboard } from '../screens/FormateurDashboard';
import { SalonDashboard } from '../screens/SalonDashboard';
import AIValetDashboard from '../screens/AIValetDashboard';
import { CatalogScreen } from '../screens/CatalogScreen';
import { FormationDetailScreen } from '../screens/FormationDetailScreen';
import { ValetLandingScreen } from '../screens/ValetLandingScreen';
import { CheckoutFlowScreen } from '../screens/CheckoutFlowScreen';
import { useAuthStore } from '../state/authStore';
import { useAppStore } from '../state/appStore';
import { useUIStore } from '../state/uiStore';
import { UserSession, UserProfile, Formation } from '../types';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { session, isAuthenticated, setSession, switchProfile, addProfile, logout, language, clearAllAccounts, recreateTestData, forceCEOAccount } = useAuthStore();
  const { addEnrollment, clearAllData } = useAppStore();
  const { showToast, clearAll: clearUIStore } = useUIStore();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showAdminAccounts, setShowAdminAccounts] = useState(false);
  const [showAIValet, setShowAIValet] = useState(false);
  const [showValetLanding, setShowValetLanding] = useState(false);

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    
    // If user has multiple profiles, show profile selector
    if (userSession.availableProfiles.length > 1) {
      setShowProfileSelector(true);
    }
  };

  const handleRegisterSuccess = (userSession: UserSession) => {
    setSession(userSession);
    // After registration, go directly to dashboard
    setShowProfileSelector(false);
  };

  const handleProfileSelect = (profile: UserProfile) => {
    if (session) {
      switchProfile(profile);
      setShowProfileSelector(false);
      
      const message = language === 'fr' 
        ? `Profil ${getProfileTypeName(profile.userType)} activé`
        : `${getProfileTypeName(profile.userType)} profile activated`;
      
      showToast(message, 'success');
    }
  };

  const handleAddProfile = (profileData: UserProfile | Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>, navigation: any) => {
    addProfile(profileData);
    navigation.goBack();
    
    const message = language === 'fr' 
      ? `Nouveau profil ${getProfileTypeName(profileData.userType)} créé!`
      : `New ${getProfileTypeName(profileData.userType)} profile created!`;
    
    showToast(message, 'success');
  };

  const handleLogout = () => {
    logout();
    setShowProfileSelector(false);
    setSelectedFormation(null);
    setShowAdminAccounts(false);
    setShowAIValet(false);
    setShowValetLanding(false);
    setShowValetLanding(false);
  };

  const handleClearDatabase = async () => {
    // Clear all stores
    await clearAllAccounts(); // Auth store (keeps CEO + debug profiles)
    clearAllData(); // App store (formations, enrollments, etc.)
    clearUIStore(); // UI store (toasts, loading states)
    
    // Reset local state
    setShowProfileSelector(false);
    setSelectedFormation(null);
    setShowAdminAccounts(false);
    setShowAIValet(false);
    setShowValetLanding(false);
    
    const message = language === 'fr' 
      ? 'Données réinitialisées (profils debug préservés)'
      : 'Data reset (debug profiles preserved)';
    
    showToast(message, 'success');
  };

  const handleRecreateTestData = async () => {
    // Recreate all test data
    await recreateTestData(); // Auth store (all mock users)
    clearAllData(); // App store (formations, enrollments, etc.)
    clearUIStore(); // UI store (toasts, loading states)
    
    // Reset local state
    setShowProfileSelector(false);
    setSelectedFormation(null);
    setShowAdminAccounts(false);
    setShowAIValet(false);
    setShowValetLanding(false);
    
    const message = language === 'fr' 
      ? 'Tous les utilisateurs de test recréés'
      : 'All test users recreated';
    
    showToast(message, 'info');
  };

  const handleForceCEO = () => {
    console.log('[AppNavigator] handleForceCEO called');
    
    try {
      forceCEOAccount();
      console.log('[AppNavigator] forceCEOAccount completed');
      
      const message = language === 'fr' 
        ? 'Compte CEO ajouté manuellement'
        : 'CEO account added manually';
      
      showToast(message, 'warning');
      console.log('[AppNavigator] Toast shown:', message);
    } catch (error) {
      console.error('[AppNavigator] Error in handleForceCEO:', error);
    }
  };

  const handleViewFormation = (formation: Formation, navigation: any) => {
    setSelectedFormation(formation);
    navigation.navigate('FormationDetail');
  };

  const handleEnrollFormation = (formation: Formation, navigation: any) => {
    if (session?.activeProfile) {
      const enrollment = {
        id: Date.now().toString(),
        profileId: session.activeProfile.id,
        formationId: formation.id,
        progress: 0,
        completedModules: [],
        enrolledAt: new Date().toISOString(),
      };
      addEnrollment(enrollment);
      
      const message = language === 'fr' 
        ? `Inscription réussie à "${formation.title}"!`
        : `Successfully enrolled in "${formation.title}"!`;
      
      showToast(message, 'success');
      navigation.goBack();
    }
  };

  const getProfileTypeName = (userType: string): string => {
    switch (userType) {
      case 'academicien_barbier':
        return language === 'fr' ? 'Académicien/Barbier' : 'Student/Barber';
      case 'maitre_formateur':
        return language === 'fr' ? 'Maître Formateur' : 'Master Trainer';
      case 'salon_partenaire':
        return language === 'fr' ? 'Salon Partenaire' : 'Partner Salon';
      case 'admin':
        return 'Admin';
      default:
        return userType;
    }
  };

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Welcome">
            {(props) => (
              <WelcomeScreen
                onNavigateToLogin={() => props.navigation.navigate('Login')}
                onNavigateToRegister={() => props.navigation.navigate('Register')}
                onClearDatabase={handleClearDatabase}
                onRecreateTestData={handleRecreateTestData}
                onForceCEO={handleForceCEO}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                onBack={() => props.navigation.goBack()}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Register">
            {(props) => (
              <RegisterScreen
                onBack={() => props.navigation.goBack()}
                onRegisterSuccess={handleRegisterSuccess}
              />
            )}
          </Stack.Screen>
        </>
      ) : showProfileSelector ? (
        // Profile Selection Stack
        <>
          <Stack.Screen name="ProfileSelector">
            {(props) => (
              <ProfileSelectorScreen
                onSelectProfile={handleProfileSelect}
                onAddProfile={() => props.navigation.navigate('AddProfile')}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="AddProfile">
            {(props) => (
              <AddProfileScreen
                onBack={() => props.navigation.goBack()}
                onProfileAdded={(profile) => handleAddProfile(profile, props.navigation)}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        // Main App Stack
        <>
          {/* Student Dashboard */}
          {session?.activeProfile.userType === 'academicien_barbier' && !showAIValet && !showValetLanding && (
            <>
              <Stack.Screen name="StudentDashboard">
                {(props) => (
                  <StudentDashboard
                    onNavigateToCatalog={() => props.navigation.navigate('Catalog')}
                    onNavigateToProfile={() => setShowProfileSelector(true)}
                    onLogout={handleLogout}
                    onNavigateToAIValet={() => setShowAIValet(true)}
                    onNavigateToValetLanding={() => setShowValetLanding(true)}
                  />
                )}
              </Stack.Screen>
              
              <Stack.Screen name="Catalog">
                {(props) => (
                  <CatalogScreen
                    onBack={() => props.navigation.goBack()}
                    onViewFormation={(formation) => handleViewFormation(formation, props.navigation)}
                  />
                )}
              </Stack.Screen>
              
              <Stack.Screen name="FormationDetail">
                {(props) => (
                  selectedFormation && (
                    <FormationDetailScreen
                      formation={selectedFormation}
                      onBack={() => props.navigation.goBack()}
                      onEnroll={(formation) => handleEnrollFormation(formation, props.navigation)}
                    />
                  )
                )}
              </Stack.Screen>
            </>
          )}

          {/* AI Valet Dashboard pour Students */}
          {session?.activeProfile.userType === 'academicien_barbier' && showAIValet && (
            <Stack.Screen name="AIValetDashboard">
              {() => (
                <AIValetDashboard
                  route={{
                    params: {
                      salonId: 'student-virtual',
                      salonName: 'Espace Étudiant ' + session?.activeProfile.firstName
                    }
                  }}
                  userType="academicien_barbier"
                  onNavigateToProfile={() => setShowProfileSelector(true)}
                  onLogout={handleLogout}
                  onNavigateToCheckout={(plan) => navigation.navigate('CheckoutFlow' as never, { plan })}
                  onNavigateToSettings={() => {}}
                  onBack={() => setShowAIValet(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Valet-IA Landing Page pour Students */}
          {session?.activeProfile.userType === 'academicien_barbier' && showValetLanding && (
            <Stack.Screen name="ValetLanding">
              {() => (
                <ValetLandingScreen 
                  onBack={() => setShowValetLanding(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Admin Dashboard */}
          {session?.activeProfile.userType === 'admin' && !showAdminAccounts && (
            <Stack.Screen name="AdminDashboard">
              {() => (
                <AdminDashboard
                  onNavigateToProfile={() => setShowProfileSelector(true)}
                  onNavigateToAccounts={() => setShowAdminAccounts(true)}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
          )}

          {/* Admin Accounts Management */}
          {session?.activeProfile.userType === 'admin' && showAdminAccounts && (
            <Stack.Screen name="AdminAccounts">
              {() => (
                <AdminAccountsScreen
                  onBack={() => setShowAdminAccounts(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Salon Dashboard */}
          {session?.activeProfile.userType === 'salon_partenaire' && !showAIValet && !showValetLanding && (
            <Stack.Screen name="SalonDashboard">
              {(props) => (
                <SalonDashboard
                  onNavigateToProfile={() => setShowProfileSelector(true)}
                  onLogout={handleLogout}
                  onNavigateToAIValet={() => setShowAIValet(true)}
                  onNavigateToValetLanding={() => setShowValetLanding(true)}
                />
              )}
            </Stack.Screen>
          )}

          {/* AI Valet Dashboard */}
          {session?.activeProfile.userType === 'salon_partenaire' && showAIValet && (
            <Stack.Screen name="AIValetDashboard">
              {() => (
                <AIValetDashboard
                  route={{
                    params: {
                      salonId: 'salon-001-tony',
                      salonName: session?.activeProfile.firstName + ' Salon'
                    }
                  }}
                  onBack={() => setShowAIValet(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Formateur Dashboard */}
          {session?.activeProfile.userType === 'maitre_formateur' && !showAIValet && !showValetLanding && (
            <Stack.Screen name="FormateurDashboard">
              {() => (
                <FormateurDashboard
                  onNavigateToProfile={() => setShowProfileSelector(true)}
                  onLogout={handleLogout}
                  onNavigateToAIValet={() => setShowAIValet(true)}
                  onNavigateToValetLanding={() => setShowValetLanding(true)}
                />
              )}
            </Stack.Screen>
          )}

          {/* AI Valet Dashboard pour Formateurs */}
          {session?.activeProfile.userType === 'maitre_formateur' && showAIValet && (
            <Stack.Screen name="AIValetDashboard">
              {() => (
                <AIValetDashboard
                  route={{
                    params: {
                      salonId: 'formateur-' + session?.activeProfile.id?.slice(-3),
                      salonName: 'Studio ' + session?.activeProfile.firstName
                    }
                  }}
                  userType="maitre_formateur"
                  onNavigateToProfile={() => setShowProfileSelector(true)}
                  onLogout={handleLogout}
                  onNavigateToCheckout={(plan) => navigation.navigate('CheckoutFlow' as never, { plan })}
                  onNavigateToSettings={() => {}}
                  onBack={() => setShowAIValet(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Valet-IA Landing Page pour Salon */}
          {session?.activeProfile.userType === 'salon_partenaire' && showValetLanding && (
            <Stack.Screen name="ValetLanding">
              {() => (
                <ValetLandingScreen 
                  onBack={() => setShowValetLanding(false)}
                />
              )}
            </Stack.Screen>
          )}

          {/* Valet-IA Landing Page pour Formateurs */}
          {session?.activeProfile.userType === 'maitre_formateur' && showValetLanding && (
            <Stack.Screen name="ValetLanding">
              {() => (
                <ValetLandingScreen 
                  onBack={() => setShowValetLanding(false)}
                />
              )}
            </Stack.Screen>
          )}
          
          {/* Checkout Flow (for subscription) */}
          <Stack.Screen name="CheckoutFlow">
            {(props) => (
              <CheckoutFlowScreen
                {...props.route.params}
                onCancel={() => props.navigation.goBack()}
                onSuccess={() => {
                  props.navigation.goBack();
                  // TODO: Afficher un message de succès ou naviguer vers le dashboard
                }}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};