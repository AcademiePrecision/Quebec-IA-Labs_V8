import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Environment from '../config/environment';

// Types de permissions
export type UserRole = 'admin' | 'vip' | 'formateur' | 'salon' | 'etudiant' | 'guest';

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
  features: Record<string, boolean>;
  limits: {
    maxCourses?: number;
    maxStudents?: number;
    maxFormations?: number;
    canAccessAnalytics: boolean;
    canManagePayments: boolean;
    canAccessAI: boolean;
  };
  cachedAt: number;
  validUntil: number;
}

// Matrice de permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Partial<UserPermissions>> = {
  admin: {
    permissions: ['*'], // Toutes les permissions
    features: {
      analytics: true,
      payments: true,
      ai: true,
      formations: true,
      salons: true,
      users: true,
    },
    limits: {
      maxCourses: -1, // Illimité
      maxStudents: -1,
      maxFormations: -1,
      canAccessAnalytics: true,
      canManagePayments: true,
      canAccessAI: true,
    },
  },
  vip: {
    permissions: ['view:premium', 'access:ai', 'manage:own_content'],
    features: {
      analytics: true,
      payments: false,
      ai: true,
      formations: true,
      salons: false,
      users: false,
    },
    limits: {
      maxCourses: -1,
      maxStudents: 100,
      maxFormations: -1,
      canAccessAnalytics: true,
      canManagePayments: false,
      canAccessAI: true,
    },
  },
  formateur: {
    permissions: ['create:formations', 'manage:students', 'view:analytics'],
    features: {
      analytics: true,
      payments: false,
      ai: true,
      formations: true,
      salons: false,
      users: false,
    },
    limits: {
      maxCourses: 20,
      maxStudents: 50,
      maxFormations: 10,
      canAccessAnalytics: true,
      canManagePayments: false,
      canAccessAI: true,
    },
  },
  salon: {
    permissions: ['manage:appointments', 'view:staff', 'access:ai_valet'],
    features: {
      analytics: false,
      payments: true,
      ai: true,
      formations: false,
      salons: true,
      users: false,
    },
    limits: {
      maxCourses: 5,
      maxStudents: 20,
      maxFormations: 0,
      canAccessAnalytics: false,
      canManagePayments: true,
      canAccessAI: true,
    },
  },
  etudiant: {
    permissions: ['view:formations', 'submit:assignments'],
    features: {
      analytics: false,
      payments: false,
      ai: false,
      formations: true,
      salons: false,
      users: false,
    },
    limits: {
      maxCourses: 3,
      maxStudents: 0,
      maxFormations: 0,
      canAccessAnalytics: false,
      canManagePayments: false,
      canAccessAI: false,
    },
  },
  guest: {
    permissions: ['view:public'],
    features: {
      analytics: false,
      payments: false,
      ai: false,
      formations: false,
      salons: false,
      users: false,
    },
    limits: {
      maxCourses: 1,
      maxStudents: 0,
      maxFormations: 0,
      canAccessAnalytics: false,
      canManagePayments: false,
      canAccessAI: false,
    },
  },
};

/**
 * Gestionnaire de permissions avec cache et validation backend
 */
export class PermissionManager {
  private static instance: PermissionManager;
  private permissionsCache: Map<string, UserPermissions>;
  private readonly CACHE_KEY_PREFIX = 'permissions_';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.permissionsCache = new Map();
    this.loadCachedPermissions();
  }

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Charge les permissions pour un utilisateur
   */
  async loadUserPermissions(userId: string, role: UserRole): Promise<UserPermissions> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    
    // Vérifier le cache mémoire
    const cached = this.permissionsCache.get(cacheKey);
    if (cached && cached.validUntil > Date.now()) {
      Environment.debugLog('[PermissionManager] Returning cached permissions', { userId });
      return cached;
    }

    // Vérifier le stockage sécurisé
    try {
      const stored = await this.getSecurePermissions(userId);
      if (stored && stored.validUntil > Date.now()) {
        this.permissionsCache.set(cacheKey, stored);
        return stored;
      }
    } catch (error) {
      Environment.debugLog('[PermissionManager] Error loading stored permissions', error);
    }

    // Générer les permissions basées sur le rôle
    const permissions = this.generatePermissions(userId, role);
    
    // Sauvegarder dans le cache et le stockage
    await this.savePermissions(userId, permissions);
    
    // Valider avec le backend de manière asynchrone
    this.validateWithBackend(userId, role);
    
    return permissions;
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getPermissions(userId);
    
    if (!permissions) {
      return false;
    }

    // Admin a toutes les permissions
    if (permissions.permissions.includes('*')) {
      return true;
    }

    return permissions.permissions.includes(permission);
  }

  /**
   * Vérifie si un utilisateur peut accéder à une fonctionnalité
   */
  async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const permissions = await this.getPermissions(userId);
    
    if (!permissions) {
      return false;
    }

    return permissions.features[feature] === true;
  }

  /**
   * Invalide le cache des permissions
   */
  async invalidateCache(userId: string): Promise<void> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    this.permissionsCache.delete(cacheKey);
    
    try {
      await SecureStore.deleteItemAsync(cacheKey);
    } catch (error) {
      Environment.debugLog('[PermissionManager] Error deleting cached permissions', error);
    }
  }

  /**
   * Met à jour les permissions d'un utilisateur
   */
  async updatePermissions(userId: string, updates: Partial<UserPermissions>): Promise<void> {
    const current = await this.getPermissions(userId);
    
    if (!current) {
      return;
    }

    const updated: UserPermissions = {
      ...current,
      ...updates,
      cachedAt: Date.now(),
      validUntil: Date.now() + this.CACHE_DURATION,
    };

    await this.savePermissions(userId, updated);
  }

  // Méthodes privées

  private generatePermissions(userId: string, role: UserRole): UserPermissions {
    const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest;
    
    return {
      role,
      permissions: roleConfig.permissions || [],
      features: roleConfig.features || {},
      limits: roleConfig.limits || {
        maxCourses: 1,
        maxStudents: 0,
        maxFormations: 0,
        canAccessAnalytics: false,
        canManagePayments: false,
        canAccessAI: false,
      },
      cachedAt: Date.now(),
      validUntil: Date.now() + this.CACHE_DURATION,
    };
  }

  private async getPermissions(userId: string): Promise<UserPermissions | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    
    // Cache mémoire
    const cached = this.permissionsCache.get(cacheKey);
    if (cached && cached.validUntil > Date.now()) {
      return cached;
    }

    // Stockage sécurisé
    try {
      const stored = await this.getSecurePermissions(userId);
      if (stored && stored.validUntil > Date.now()) {
        this.permissionsCache.set(cacheKey, stored);
        return stored;
      }
    } catch (error) {
      Environment.debugLog('[PermissionManager] Error getting permissions', error);
    }

    return null;
  }

  private async savePermissions(userId: string, permissions: UserPermissions): Promise<void> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    
    // Cache mémoire
    this.permissionsCache.set(cacheKey, permissions);
    
    // Stockage sécurisé
    try {
      await SecureStore.setItemAsync(cacheKey, JSON.stringify(permissions));
    } catch (error) {
      // Fallback vers AsyncStorage si SecureStore échoue
      Environment.debugLog('[PermissionManager] SecureStore failed, using AsyncStorage', error);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(permissions));
    }
  }

  private async getSecurePermissions(userId: string): Promise<UserPermissions | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    
    try {
      // Essayer SecureStore d'abord
      const stored = await SecureStore.getItemAsync(cacheKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // Fallback vers AsyncStorage
      try {
        const stored = await AsyncStorage.getItem(cacheKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (fallbackError) {
        Environment.debugLog('[PermissionManager] Failed to get permissions', fallbackError);
      }
    }
    
    return null;
  }

  private async loadCachedPermissions(): Promise<void> {
    try {
      // Charger toutes les permissions en cache au démarrage
      const keys = await AsyncStorage.getAllKeys();
      const permissionKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      for (const key of permissionKeys) {
        try {
          const stored = await AsyncStorage.getItem(key);
          if (stored) {
            const permissions = JSON.parse(stored);
            if (permissions.validUntil > Date.now()) {
              this.permissionsCache.set(key, permissions);
            }
          }
        } catch (error) {
          Environment.debugLog(`[PermissionManager] Error loading cached permission ${key}`, error);
        }
      }
      
      Environment.debugLog(`[PermissionManager] Loaded ${this.permissionsCache.size} cached permissions`);
    } catch (error) {
      Environment.debugLog('[PermissionManager] Error loading cached permissions', error);
    }
  }

  private async validateWithBackend(userId: string, role: UserRole): Promise<void> {
    // Validation asynchrone avec le backend
    setTimeout(async () => {
      try {
        // TODO: Implémenter l'appel API réel
        Environment.debugLog('[PermissionManager] Backend validation scheduled', { userId, role });
      } catch (error) {
        Environment.debugLog('[PermissionManager] Backend validation failed', error);
      }
    }, 1000);
  }
}

// Export singleton
export const permissionManager = PermissionManager.getInstance();