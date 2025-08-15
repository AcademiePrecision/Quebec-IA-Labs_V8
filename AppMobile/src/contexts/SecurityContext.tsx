import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '../state/authStore';
import { permissionManager, UserPermissions, UserRole } from '../services/permission-manager';
import { paymentValidator } from '../services/payment-validator';
import { storageMigrator, SecureStorage } from '../services/storage-migrator';
import Environment from '../config/environment';
import { Alert } from 'react-native';

interface SecurityContextType {
  // Permissions
  permissions: UserPermissions | null;
  hasPermission: (permission: string) => Promise<boolean>;
  canAccessFeature: (feature: string) => Promise<boolean>;
  
  // Payment validation
  validatePayment: (paymentIntentId: string, amount: number) => Promise<boolean>;
  checkPaymentRateLimit: () => Promise<boolean>;
  
  // Storage
  secureStorage: typeof SecureStorage;
  
  // Security state
  isSecurityReady: boolean;
  securityError: string | null;
  
  // Actions
  refreshPermissions: () => Promise<void>;
  reportSecurityIncident: (type: string, details: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { session } = useAuthStore();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isSecurityReady, setIsSecurityReady] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Initialisation de la sécurité
  useEffect(() => {
    initializeSecurity();
  }, [session]);

  const initializeSecurity = async () => {
    try {
      setIsSecurityReady(false);
      setSecurityError(null);

      // 1. Démarrer la migration du stockage en arrière-plan
      storageMigrator.startMigration().catch(error => {
        Environment.logError(error, 'Storage migration failed');
      });

      // 2. Charger les permissions si l'utilisateur est connecté
      if (session?.account?.id && session?.activeProfile?.userType) {
        const userPermissions = await permissionManager.loadUserPermissions(
          session.account.id,
          session.activeProfile.userType as UserRole
        );
        setPermissions(userPermissions);
      }

      // 3. Vérifier l'intégrité de la session
      await validateSessionIntegrity();

      setIsSecurityReady(true);
      Environment.debugLog('[SecurityContext] Security initialized successfully');
    } catch (error) {
      const errorMessage = (error as Error).message;
      setSecurityError(errorMessage);
      Environment.logError(error as Error, 'Security initialization failed');
      
      // En production, alerter l'utilisateur
      if (Environment.isProduction) {
        Alert.alert(
          'Problème de sécurité',
          'Une erreur de sécurité est survenue. Veuillez vous reconnecter.',
          [{ text: 'OK', onPress: () => handleSecurityFailure() }]
        );
      }
    }
  };

  const validateSessionIntegrity = async () => {
    if (!session) return;

    try {
      // Vérifier que la session n'a pas expiré
      const sessionData = await SecureStorage.getItem(`session_${session.account.id}`);
      
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        const expiryTime = parsed.expiresAt || 0;
        
        if (expiryTime > 0 && Date.now() > expiryTime) {
          throw new Error('Session expired');
        }
      }

      // Vérifier les limites de taux
      const rateLimitOk = await paymentValidator.checkRateLimit(session.account.id);
      
      if (!rateLimitOk) {
        Environment.debugLog('[SecurityContext] Rate limit exceeded for user', session.account.id);
      }
    } catch (error) {
      Environment.logError(error as Error, 'Session validation failed');
      throw error;
    }
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!session?.account?.id) return false;
    
    try {
      return await permissionManager.hasPermission(session.account.id, permission);
    } catch (error) {
      Environment.logError(error as Error, 'Permission check failed');
      return false;
    }
  };

  const canAccessFeature = async (feature: string): Promise<boolean> => {
    if (!session?.account?.id) return false;
    
    try {
      return await permissionManager.canAccessFeature(session.account.id, feature);
    } catch (error) {
      Environment.logError(error as Error, 'Feature access check failed');
      return false;
    }
  };

  const validatePayment = async (paymentIntentId: string, amount: number): Promise<boolean> => {
    if (!session?.account?.id || !session?.activeProfile?.id) {
      Environment.debugLog('[SecurityContext] Cannot validate payment without session');
      return false;
    }

    try {
      const result = await paymentValidator.validatePayment({
        userId: session.account.id,
        profileId: session.activeProfile.id,
        paymentIntentId,
        amount,
        currency: 'CAD',
        metadata: {
          userType: session.activeProfile.userType,
          timestamp: new Date().toISOString(),
        },
      });

      // Logger la tentative pour audit
      await paymentValidator.logPaymentAttempt(
        session.account.id,
        amount,
        result.valid,
        { paymentIntentId }
      );

      return result.valid;
    } catch (error) {
      Environment.logError(error as Error, 'Payment validation failed');
      return false;
    }
  };

  const checkPaymentRateLimit = async (): Promise<boolean> => {
    if (!session?.account?.id) return false;
    
    try {
      return await paymentValidator.checkRateLimit(session.account.id);
    } catch (error) {
      Environment.logError(error as Error, 'Rate limit check failed');
      return true; // Fail open pour ne pas bloquer les utilisateurs
    }
  };

  const refreshPermissions = async () => {
    if (!session?.account?.id || !session?.activeProfile?.userType) return;

    try {
      // Invalider le cache
      await permissionManager.invalidateCache(session.account.id);
      
      // Recharger les permissions
      const userPermissions = await permissionManager.loadUserPermissions(
        session.account.id,
        session.activeProfile.userType as UserRole
      );
      
      setPermissions(userPermissions);
      Environment.debugLog('[SecurityContext] Permissions refreshed');
    } catch (error) {
      Environment.logError(error as Error, 'Failed to refresh permissions');
    }
  };

  const reportSecurityIncident = (type: string, details: any) => {
    const incident = {
      type,
      userId: session?.account?.id,
      timestamp: new Date().toISOString(),
      details,
      environment: Environment.currentEnvironment,
    };

    // Logger localement
    Environment.logError(new Error(`Security incident: ${type}`), JSON.stringify(incident));

    // En production, envoyer à un service de monitoring
    if (Environment.isProduction) {
      // TODO: Intégrer avec Sentry ou autre service de monitoring
      console.error('[SECURITY INCIDENT]', incident);
    }

    // Sauvegarder localement pour audit
    SecureStorage.setItem(
      `security_incident_${Date.now()}`,
      JSON.stringify(incident)
    ).catch(error => {
      Environment.logError(error, 'Failed to save security incident');
    });
  };

  const handleSecurityFailure = () => {
    // Déconnecter l'utilisateur en cas d'échec de sécurité critique
    const authStore = useAuthStore.getState();
    authStore.logout();
  };

  const value: SecurityContextType = {
    permissions,
    hasPermission,
    canAccessFeature,
    validatePayment,
    checkPaymentRateLimit,
    secureStorage: SecureStorage,
    isSecurityReady,
    securityError,
    refreshPermissions,
    reportSecurityIncident,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  
  return context;
};

// HOC pour protéger les composants avec des permissions
interface WithPermissionOptions {
  permission?: string;
  feature?: string;
  fallback?: React.ComponentType;
}

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPermissionOptions
) {
  return (props: P) => {
    const { hasPermission, canAccessFeature } = useSecurity();
    const [hasAccess, setHasAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      checkAccess();
    }, []);

    const checkAccess = async () => {
      setIsChecking(true);
      
      try {
        let access = true;
        
        if (options.permission) {
          access = await hasPermission(options.permission);
        }
        
        if (access && options.feature) {
          access = await canAccessFeature(options.feature);
        }
        
        setHasAccess(access);
      } catch (error) {
        Environment.logError(error as Error, 'Permission check failed in HOC');
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isChecking) {
      return null; // Or a loading component
    }

    if (!hasAccess && options.fallback) {
      const FallbackComponent = options.fallback;
      return <FallbackComponent />;
    }

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}