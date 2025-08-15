import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseAccount, UserProfile, UserSession, Language } from '../types';
import { allMockAccounts, allMockProfiles, ceoAccount, ceoProfile, initializeMockData, initializeCoreData } from '../utils/mockPersonas';

interface AuthState {
  session: UserSession | null;
  isAuthenticated: boolean;
  language: Language;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: UserSession) => void;
  switchProfile: (profile: UserProfile) => void;
  addProfile: (profile: UserProfile | Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  logout: () => void;
  clearAllAccounts: () => Promise<void>;
  recreateTestData: () => Promise<void>;
  forceCEOAccount: () => void;
  setLanguage: (language: Language) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Admin functions
  getAllAccountsWithProfiles: () => Array<{ account: BaseAccount; profiles: UserProfile[] }>;
  updateAccount: (accountId: string, updates: Partial<BaseAccount>) => void;
  deleteAccount: (accountId: string) => boolean;
}

// Mock database - In real app this would be a proper database
let mockAccounts: BaseAccount[] = [];
let mockProfiles: UserProfile[] = [];

// Initialize mock data only once
const initializeMockDataOnce = () => {
  console.log('[AuthStore] initializeMockDataOnce called');
  console.log('[AuthStore] Current mockAccounts length:', mockAccounts.length);
  console.log('[AuthStore] Current mockProfiles length:', mockProfiles.length);
  
  if (mockAccounts.length === 0 && mockProfiles.length === 0) {
    console.log('[AuthStore] Initializing fresh mock data...');
    const { accounts, profiles } = initializeMockData();
    mockAccounts = accounts;
    mockProfiles = profiles;
    console.log('[AuthStore] Mock data initialized with', accounts.length, 'accounts and', profiles.length, 'profiles');
    console.log('[AuthStore] First few account emails:', accounts.slice(0, 5).map(a => a.email));
  } else {
    console.log('[AuthStore] Mock data already exists, skipping initialization');
  }
};

// Initialize immediately
initializeMockDataOnce();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      language: 'fr',
      isLoading: false,
      error: null,
      
      setSession: (session) => {
        // Update last used profile
        const account = { ...session.account, lastUsedProfile: session.activeProfile.userType };
        const updatedSession = { ...session, account };
        
        // Update mock database
        const accountIndex = mockAccounts.findIndex(a => a.id === account.id);
        if (accountIndex >= 0) {
          mockAccounts[accountIndex] = account;
        }
        
        set({ 
          session: updatedSession, 
          isAuthenticated: true, 
          error: null 
        });
      },
      
      switchProfile: (profile) => {
        const currentSession = get().session;
        if (currentSession) {
          const updatedSession: UserSession = {
            ...currentSession,
            activeProfile: profile
          };
          
          // Update last used profile in account
          const account = { ...currentSession.account, lastUsedProfile: profile.userType };
          updatedSession.account = account;
          
          // Update mock database
          const accountIndex = mockAccounts.findIndex(a => a.id === account.id);
          if (accountIndex >= 0) {
            mockAccounts[accountIndex] = account;
          }
          
          set({ session: updatedSession });
        }
      },
      
      addProfile: (profileInput) => {
        const currentSession = get().session;
        if (currentSession) {
          let profile: UserProfile;
          
          // Check if it's already a complete profile or just profile data
          if ('id' in profileInput && 'createdAt' in profileInput && 'updatedAt' in profileInput) {
            // It's already a complete profile
            profile = profileInput as UserProfile;
          } else {
            // It's profile data - create the complete profile
            profile = createProfile(profileInput as Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>);
          }
          
          // Check if profile already exists in session to prevent duplicates
          const existingInSession = currentSession.availableProfiles.find(p => p.id === profile.id);
          if (!existingInSession) {
            const updatedSession: UserSession = {
              ...currentSession,
              availableProfiles: [...currentSession.availableProfiles, profile]
            };
            
            set({ session: updatedSession });
          }
        }
      },
      
      logout: () => set({ 
        session: null, 
        isAuthenticated: false, 
        error: null 
      }),
      
      clearAllAccounts: async () => {
        console.log('[AuthStore] clearAllAccounts called');
        
        // Reset to core data only (CEO + debug profiles)
        const { accounts, profiles } = initializeCoreData();
        console.log('[AuthStore] Core data loaded:', accounts.length, 'accounts,', profiles.length, 'profiles');
        console.log('[AuthStore] Core account emails:', accounts.map(a => a.email));
        
        mockAccounts.length = 0;
        mockProfiles.length = 0;
        mockAccounts.push(...accounts);
        mockProfiles.push(...profiles);
        
        console.log('[AuthStore] Mock arrays updated, new lengths:', mockAccounts.length, mockProfiles.length);
        
        // Reset store state
        set({ 
          session: null, 
          isAuthenticated: false, 
          error: null,
          language: 'fr',
          isLoading: false
        });
        
        // Clear AsyncStorage completely
        try {
          await AsyncStorage.removeItem('auth-storage');
          console.log('[AuthStore] Database reset successfully - Core accounts preserved (CEO + debug profiles)');
        } catch (error) {
          console.error('[AuthStore] Error clearing AsyncStorage:', error);
        }
      },
      
      recreateTestData: async () => {
        console.log('[AuthStore] recreateTestData called');
        
        // Reset to full mock data (includes all test users)
        const { accounts, profiles } = initializeMockData();
        console.log('[AuthStore] Full mock data loaded:', accounts.length, 'accounts,', profiles.length, 'profiles');
        console.log('[AuthStore] Full data account emails (first 10):', accounts.slice(0, 10).map(a => a.email));
        
        mockAccounts.length = 0;
        mockProfiles.length = 0;
        mockAccounts.push(...accounts);
        mockProfiles.push(...profiles);
        
        console.log('[AuthStore] Mock arrays updated, new lengths:', mockAccounts.length, mockProfiles.length);
        
        // Reset store state
        set({ 
          session: null, 
          isAuthenticated: false, 
          error: null,
          language: 'fr',
          isLoading: false
        });
        
        // Clear AsyncStorage completely
        try {
          await AsyncStorage.removeItem('auth-storage');
          console.log('[AuthStore] Test data recreated successfully - All mock users restored');
        } catch (error) {
          console.error('[AuthStore] Error clearing AsyncStorage:', error);
        }
      },
      
      forceCEOAccount: () => {
        console.log('[AuthStore] forceCEOAccount called - Emergency CEO addition');
        
        // Check if CEO already exists
        const existingCEO = mockAccounts.find(a => a.email === 'academieprecision@gmail.com');
        if (existingCEO) {
          console.log('[AuthStore] CEO account already exists:', existingCEO.email);
          return;
        }
        
        // Force add CEO account and profile
        console.log('[AuthStore] Adding CEO account manually...');
        mockAccounts.unshift(ceoAccount); // Add at beginning
        mockProfiles.unshift(ceoProfile);
        
        console.log('[AuthStore] CEO account added! Total accounts:', mockAccounts.length);
        console.log('[AuthStore] Current account emails:', mockAccounts.map(a => a.email).slice(0, 5));
      },
      
      setLanguage: (language) => set({ language }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Admin functions
      getAllAccountsWithProfiles: () => {
        return mockAccounts.map(account => {
          const allProfiles = mockProfiles.filter(profile => profile.accountId === account.id);
          // Deduplicate profiles by ID to prevent React key conflicts
          const profiles = allProfiles.filter((profile, index, array) => 
            array.findIndex(p => p.id === profile.id) === index
          );
          return {
            account,
            profiles: profiles.length > 0 ? profiles : []
          };
        }).filter(item => item.account && item.account.id); // Ensure valid accounts
      },
      
      updateAccount: (accountId: string, updates: Partial<BaseAccount>) => {
        const accountIndex = mockAccounts.findIndex(a => a.id === accountId);
        if (accountIndex >= 0) {
          mockAccounts[accountIndex] = {
            ...mockAccounts[accountIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
      },
      
      deleteAccount: (accountId: string): boolean => {
        // Prevent deletion of CEO account
        if (accountId === ceoAccount.id) {
          return false;
        }
        
        // Remove account and associated profiles
        mockAccounts = mockAccounts.filter(a => a.id !== accountId);
        mockProfiles = mockProfiles.filter(p => p.accountId !== accountId);
        
        return true;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
      }),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Clear old data and start fresh
          return {
            session: null,
            isAuthenticated: false,
            language: 'fr',
          };
        }
        return persistedState;
      },
    }
  )
);

// Helper functions for mock database operations
export const findAccountByEmail = (email: string): BaseAccount | null => {
  console.log(`[DEBUG] Searching for email: ${email}`);
  console.log(`[DEBUG] Available accounts: ${mockAccounts.length}`);
  console.log(`[DEBUG] Account emails:`, mockAccounts.map(a => a.email));
  
  // Case-insensitive email search
  const normalizedEmail = email.toLowerCase().trim();
  const account = mockAccounts.find(account => account.email.toLowerCase() === normalizedEmail) || null;
  console.log(`[DEBUG] Found account:`, account ? `${account.firstName} ${account.lastName}` : 'NULL');
  
  return account;
};

export const findProfilesByAccountId = (accountId: string): UserProfile[] => {
  const allProfiles = mockProfiles.filter(profile => profile.accountId === accountId);
  // Deduplicate profiles by ID to prevent React key conflicts
  return allProfiles.filter((profile, index, array) => 
    array.findIndex(p => p.id === profile.id) === index
  );
};

export const createAccount = (accountData: Omit<BaseAccount, 'id' | 'createdAt' | 'updatedAt'>): BaseAccount => {
  const account: BaseAccount = {
    ...accountData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockAccounts.push(account);
  return account;
};

export const createProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile => {
  let profileId: string;
  let attempts = 0;
  
  // Generate a unique ID that doesn't already exist
  do {
    profileId = Date.now().toString() + Math.random().toString(36).substr(2, 9) + attempts.toString();
    attempts++;
  } while (mockProfiles.some(p => p.id === profileId) && attempts < 10);
  
  const profile: UserProfile = {
    ...profileData,
    id: profileId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as UserProfile;
  
  mockProfiles.push(profile);
  return profile;
};

export const getAllAccounts = (): BaseAccount[] => mockAccounts;
export const getAllProfiles = (): UserProfile[] => mockProfiles;