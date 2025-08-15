import { NavigationProp } from '@react-navigation/native';
import { UserProfile } from '../types';

/**
 * Helper function to handle GO_BACK navigation with fallback
 * Ensures proper navigation even when there's no history
 */
export const handleGoBack = (
  navigation: NavigationProp<any>,
  userType: UserProfile['userType'] | undefined,
  fallbackAction?: () => void
) => {
  // Check if we can go back in the navigation stack
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else if (fallbackAction) {
    // Use the provided fallback action (e.g., setShowAIValet(false))
    fallbackAction();
  } else {
    // Fallback to appropriate dashboard based on user type
    switch (userType) {
      case 'academicien_barbier':
        navigation.navigate('StudentDashboard' as never);
        break;
      case 'salon_partenaire':
        navigation.navigate('SalonDashboard' as never);
        break;
      case 'maitre_formateur':
        navigation.navigate('FormateurDashboard' as never);
        break;
      case 'administrateur':
        navigation.navigate('AdminDashboard' as never);
        break;
      default:
        // If no user type, go to welcome screen
        navigation.navigate('Welcome' as never);
    }
  }
};

/**
 * Helper to determine if navigation can go back safely
 */
export const canNavigateBack = (navigation: NavigationProp<any>): boolean => {
  try {
    return navigation.canGoBack();
  } catch {
    return false;
  }
};

/**
 * Helper to get the appropriate dashboard route for a user type
 */
export const getDashboardRoute = (userType: UserProfile['userType']): string => {
  switch (userType) {
    case 'academicien_barbier':
      return 'StudentDashboard';
    case 'salon_partenaire':
      return 'SalonDashboard';
    case 'maitre_formateur':
      return 'FormateurDashboard';
    case 'administrateur':
      return 'AdminDashboard';
    default:
      return 'Welcome';
  }
};