import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Environment from '../config/environment';

// Types pour la migration
interface MigrationItem {
  key: string;
  isSensitive: boolean;
  migrated: boolean;
  error?: string;
}

interface MigrationReport {
  totalItems: number;
  migratedItems: number;
  failedItems: number;
  startTime: string;
  endTime?: string;
  items: MigrationItem[];
}

// Clés sensibles qui doivent être migrées vers SecureStore
const SENSITIVE_KEY_PATTERNS = [
  /^auth_/,           // Données d'authentification
  /^session_/,        // Sessions utilisateur
  /^token_/,          // Tokens d'accès
  /^payment_/,        // Informations de paiement
  /^subscription_/,   // Données d'abonnement
  /^credentials_/,    // Identifiants
  /^api_key_/,        // Clés API
  /^private_/,        // Données privées
];

/**
 * Service de migration progressive AsyncStorage → SecureStore
 * Utilise un pattern de double-write pour une migration transparente
 */
export class StorageMigrator {
  private static instance: StorageMigrator;
  private migrationInProgress: boolean = false;
  private migrationReport: MigrationReport | null = null;
  private readonly MIGRATION_STATUS_KEY = '@migration_status';
  private readonly MAX_SECURE_STORE_SIZE = 2048; // Limite SecureStore en octets

  private constructor() {
    this.checkMigrationStatus();
  }

  static getInstance(): StorageMigrator {
    if (!StorageMigrator.instance) {
      StorageMigrator.instance = new StorageMigrator();
    }
    return StorageMigrator.instance;
  }

  /**
   * Démarre la migration progressive en arrière-plan
   */
  async startMigration(): Promise<void> {
    if (this.migrationInProgress) {
      Environment.debugLog('[StorageMigrator] Migration already in progress');
      return;
    }

    this.migrationInProgress = true;
    Environment.debugLog('[StorageMigrator] Starting progressive migration');

    try {
      const report: MigrationReport = {
        totalItems: 0,
        migratedItems: 0,
        failedItems: 0,
        startTime: new Date().toISOString(),
        items: [],
      };

      // Récupérer toutes les clés
      const allKeys = await AsyncStorage.getAllKeys();
      report.totalItems = allKeys.length;

      // Migrer les clés sensibles en priorité
      for (const key of allKeys) {
        const isSensitive = this.isSensitiveKey(key);
        
        if (isSensitive) {
          const success = await this.migrateKey(key);
          
          report.items.push({
            key,
            isSensitive,
            migrated: success,
            error: success ? undefined : 'Migration failed',
          });

          if (success) {
            report.migratedItems++;
          } else {
            report.failedItems++;
          }

          // Pause entre les migrations pour ne pas bloquer l'UI
          await this.delay(10);
        }
      }

      report.endTime = new Date().toISOString();
      this.migrationReport = report;
      
      // Sauvegarder le statut de migration
      await this.saveMigrationStatus(report);
      
      Environment.debugLog('[StorageMigrator] Migration completed', {
        migrated: report.migratedItems,
        failed: report.failedItems,
        total: report.totalItems,
      });
    } catch (error) {
      Environment.logError(error as Error, 'StorageMigrator.startMigration');
    } finally {
      this.migrationInProgress = false;
    }
  }

  /**
   * Lit une valeur avec fallback automatique
   * Utilise SecureStore pour les données sensibles, AsyncStorage sinon
   */
  async getItem(key: string): Promise<string | null> {
    const isSensitive = this.isSensitiveKey(key);

    if (isSensitive) {
      // Essayer SecureStore d'abord
      try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) {
          return value;
        }
      } catch (error) {
        Environment.debugLog(`[StorageMigrator] SecureStore read failed for ${key}`, error);
      }
    }

    // Fallback vers AsyncStorage
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      Environment.logError(error as Error, `StorageMigrator.getItem: ${key}`);
      return null;
    }
  }

  /**
   * Écrit une valeur avec double-write pattern
   * Écrit dans SecureStore ET AsyncStorage pendant la migration
   */
  async setItem(key: string, value: string): Promise<void> {
    const isSensitive = this.isSensitiveKey(key);

    if (isSensitive) {
      // Double-write pour les données sensibles
      try {
        // Vérifier la taille pour SecureStore
        if (this.getByteSize(value) <= this.MAX_SECURE_STORE_SIZE) {
          await SecureStore.setItemAsync(key, value);
          Environment.debugLog(`[StorageMigrator] Wrote to SecureStore: ${key}`);
        } else {
          // Si trop grand, compresser ou diviser
          await this.handleLargeValue(key, value);
        }
      } catch (error) {
        Environment.debugLog(`[StorageMigrator] SecureStore write failed for ${key}`, error);
      }

      // Toujours écrire dans AsyncStorage comme backup
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        Environment.logError(error as Error, `StorageMigrator.setItem backup: ${key}`);
      }
    } else {
      // Données non sensibles : AsyncStorage seulement
      await AsyncStorage.setItem(key, value);
    }
  }

  /**
   * Supprime une valeur des deux stockages
   */
  async removeItem(key: string): Promise<void> {
    const promises: Promise<void>[] = [];

    // Supprimer de SecureStore si sensible
    if (this.isSensitiveKey(key)) {
      promises.push(
        SecureStore.deleteItemAsync(key).catch(error => {
          Environment.debugLog(`[StorageMigrator] SecureStore delete failed for ${key}`, error);
        })
      );
    }

    // Toujours supprimer d'AsyncStorage
    promises.push(AsyncStorage.removeItem(key));

    await Promise.all(promises);
  }

  /**
   * Nettoie les données migrées d'AsyncStorage
   * À appeler après confirmation que la migration est complète
   */
  async cleanupMigratedData(): Promise<void> {
    if (!this.migrationReport) {
      Environment.debugLog('[StorageMigrator] No migration report available');
      return;
    }

    let cleaned = 0;
    
    for (const item of this.migrationReport.items) {
      if (item.migrated && item.isSensitive) {
        try {
          // Vérifier que la donnée existe bien dans SecureStore
          const secureValue = await SecureStore.getItemAsync(item.key);
          
          if (secureValue !== null) {
            // Supprimer d'AsyncStorage
            await AsyncStorage.removeItem(item.key);
            cleaned++;
          }
        } catch (error) {
          Environment.debugLog(`[StorageMigrator] Cleanup failed for ${item.key}`, error);
        }
      }
    }

    Environment.debugLog(`[StorageMigrator] Cleaned up ${cleaned} migrated items`);
  }

  /**
   * Obtient le rapport de migration
   */
  getMigrationReport(): MigrationReport | null {
    return this.migrationReport;
  }

  // Méthodes privées

  private isSensitiveKey(key: string): boolean {
    return SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
  }

  private async migrateKey(key: string): Promise<boolean> {
    try {
      // Lire depuis AsyncStorage
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return true; // Clé vide, considérée comme migrée
      }

      // Vérifier la taille
      if (this.getByteSize(value) > this.MAX_SECURE_STORE_SIZE) {
        // Gérer les grandes valeurs
        return await this.handleLargeValue(key, value);
      }

      // Écrire dans SecureStore
      await SecureStore.setItemAsync(key, value);
      
      Environment.debugLog(`[StorageMigrator] Migrated key: ${key}`);
      return true;
    } catch (error) {
      Environment.debugLog(`[StorageMigrator] Failed to migrate key: ${key}`, error);
      return false;
    }
  }

  private async handleLargeValue(key: string, value: string): Promise<boolean> {
    try {
      // Pour les grandes valeurs, on peut :
      // 1. Les compresser
      // 2. Les diviser en chunks
      // 3. Les stocker ailleurs (fichier, base de données)
      
      // Pour l'instant, on garde dans AsyncStorage avec un flag
      await AsyncStorage.setItem(`${key}_large`, 'true');
      await AsyncStorage.setItem(key, value);
      
      Environment.debugLog(`[StorageMigrator] Large value kept in AsyncStorage: ${key}`);
      return true;
    } catch (error) {
      Environment.logError(error as Error, `StorageMigrator.handleLargeValue: ${key}`);
      return false;
    }
  }

  private getByteSize(str: string): number {
    return new Blob([str]).size;
  }

  private async checkMigrationStatus(): Promise<void> {
    try {
      const status = await AsyncStorage.getItem(this.MIGRATION_STATUS_KEY);
      
      if (status) {
        this.migrationReport = JSON.parse(status);
        Environment.debugLog('[StorageMigrator] Loaded migration status', {
          migrated: this.migrationReport?.migratedItems,
          failed: this.migrationReport?.failedItems,
        });
      }
    } catch (error) {
      Environment.debugLog('[StorageMigrator] No previous migration status found');
    }
  }

  private async saveMigrationStatus(report: MigrationReport): Promise<void> {
    try {
      await AsyncStorage.setItem(this.MIGRATION_STATUS_KEY, JSON.stringify(report));
    } catch (error) {
      Environment.logError(error as Error, 'StorageMigrator.saveMigrationStatus');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Wrapper pour remplacer AsyncStorage progressivement
export class SecureStorage {
  private static migrator = StorageMigrator.getInstance();

  static async getItem(key: string): Promise<string | null> {
    return this.migrator.getItem(key);
  }

  static async setItem(key: string, value: string): Promise<void> {
    return this.migrator.setItem(key, value);
  }

  static async removeItem(key: string): Promise<void> {
    return this.migrator.removeItem(key);
  }

  static async clear(): Promise<void> {
    // Clear both storages
    await Promise.all([
      AsyncStorage.clear(),
      // SecureStore doesn't have a clear method, need to track keys
    ]);
  }

  static async getAllKeys(): Promise<string[]> {
    // Return keys from AsyncStorage for now
    return AsyncStorage.getAllKeys();
  }

  static async multiGet(keys: string[]): Promise<[string, string | null][]> {
    const results: [string, string | null][] = [];
    
    for (const key of keys) {
      const value = await this.getItem(key);
      results.push([key, value]);
    }
    
    return results;
  }

  static async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    for (const [key, value] of keyValuePairs) {
      await this.setItem(key, value);
    }
  }

  static async multiRemove(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }
}

// Export singleton
export const storageMigrator = StorageMigrator.getInstance();