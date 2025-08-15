import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useAuthStore } from '../state/authStore';
import { BaseAccount, UserProfile, UserType } from '../types';

interface AdminAccountsScreenProps {
  onBack: () => void;
}

type SortType = 'name' | 'profile' | 'date';
type FilterType = 'all' | 'admin' | 'salon_partenaire' | 'maitre_formateur' | 'academicien_barbier';

export const AdminAccountsScreen: React.FC<AdminAccountsScreenProps> = ({ onBack }) => {
  const { language, getAllAccountsWithProfiles, updateAccount, deleteAccount } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [showPasswords, setShowPasswords] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const accountsWithProfiles = getAllAccountsWithProfiles();

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accountsWithProfiles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(({ account, profiles }) =>
        account.firstName.toLowerCase().includes(query) ||
        account.lastName.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        profiles.some(profile => getProfileTypeName(profile.userType).toLowerCase().includes(query))
      );
    }

    // Apply profile type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(({ profiles }) =>
        profiles.some(profile => profile.userType === filterBy)
      );
    }

    // Apply sorting
    filtered.sort(({ account: a, profiles: profilesA }, { account: b, profiles: profilesB }) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'profile':
          const primaryProfileA = profilesA[0]?.userType || '';
          const primaryProfileB = profilesB[0]?.userType || '';
          return primaryProfileA.localeCompare(primaryProfileB);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [accountsWithProfiles, searchQuery, sortBy, filterBy]);

  const getProfileTypeName = (userType: UserType): string => {
    switch (userType) {
      case 'admin':
        return language === 'fr' ? 'Administrateur' : 'Administrator';
      case 'salon_partenaire':
        return language === 'fr' ? 'Salon Partenaire' : 'Partner Salon';
      case 'maitre_formateur':
        return language === 'fr' ? 'Maître Formateur' : 'Master Trainer';
      case 'academicien_barbier':
        return language === 'fr' ? 'Académicien/Barbier' : 'Student/Barber';
      default:
        return userType;
    }
  };

  const getProfileIcon = (userType: UserType): string => {
    switch (userType) {
      case 'admin':
        return 'settings';
      case 'salon_partenaire':
        return 'business';
      case 'maitre_formateur':
        return 'school';
      case 'academicien_barbier':
        return 'person';
      default:
        return 'person';
    }
  };

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const handleDeleteAccount = (account: BaseAccount) => {
    if (account.id === 'account-ceo-001') {
      Alert.alert(
        language === 'fr' ? 'Action interdite' : 'Action Forbidden',
        language === 'fr' 
          ? 'Le compte PDG ne peut pas être supprimé.'
          : 'The CEO account cannot be deleted.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      language === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion',
      language === 'fr' 
        ? `Êtes-vous sûr de vouloir supprimer le compte de ${account.firstName} ${account.lastName}?`
        : `Are you sure you want to delete ${account.firstName} ${account.lastName}'s account?`,
      [
        {
          text: language === 'fr' ? 'Annuler' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'fr' ? 'Supprimer' : 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = deleteAccount(account.id);
            if (success) {
              Alert.alert(
                language === 'fr' ? 'Succès' : 'Success',
                language === 'fr' ? 'Compte supprimé avec succès.' : 'Account deleted successfully.'
              );
            }
          }
        }
      ]
    );
  };

  const AccountCard: React.FC<{ 
    account: BaseAccount; 
    profiles: UserProfile[];
    isExpanded: boolean;
  }> = ({ account, profiles, isExpanded }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
      {/* Header */}
      <Pressable 
        onPress={() => toggleAccountExpansion(account.id)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-1 flex-row items-center">
          <View className="w-12 h-12 bg-[#FF6B35] rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold text-lg">
              {account.firstName[0]}{account.lastName[0]}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-[#2C3E50] text-lg">
              {account.firstName} {account.lastName}
            </Text>
            <Text className="text-[#7F8C8D] text-sm">
              {profiles.map(p => getProfileTypeName(p.userType)).join(', ')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          {account.id === 'account-ceo-001' && (
            <View className="bg-yellow-100 px-2 py-1 rounded mr-2">
              <Text className="text-yellow-800 text-xs font-medium">CEO</Text>
            </View>
          )}
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#7F8C8D" 
          />
        </View>
      </Pressable>

      {/* Expanded Details */}
      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-gray-200">
          <View className="space-y-3">
            <View className="flex-row">
              <Text className="text-[#7F8C8D] w-24 text-sm">Email:</Text>
              <Text className="text-[#2C3E50] flex-1 text-sm">{account.email}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-[#7F8C8D] w-24 text-sm">
                {language === 'fr' ? 'Mot de passe:' : 'Password:'}
              </Text>
              <Text className="text-[#2C3E50] flex-1 text-sm font-mono">
                {showPasswords ? account.password : '••••••••'}
              </Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-[#7F8C8D] w-24 text-sm">
                {language === 'fr' ? 'Téléphone:' : 'Phone:'}
              </Text>
              <Text className="text-[#2C3E50] flex-1 text-sm">{account.phone}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-[#7F8C8D] w-24 text-sm">
                {language === 'fr' ? 'Langue:' : 'Language:'}
              </Text>
              <Text className="text-[#2C3E50] flex-1 text-sm">
                {account.preferredLanguage.toUpperCase()}
              </Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-[#7F8C8D] w-24 text-sm">
                {language === 'fr' ? 'Créé le:' : 'Created:'}
              </Text>
              <Text className="text-[#2C3E50] flex-1 text-sm">
                {new Date(account.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Profiles */}
          <View className="mt-4">
            <Text className="font-semibold text-[#2C3E50] mb-2">
              {language === 'fr' ? 'Profils:' : 'Profiles:'}
            </Text>
            {profiles.map((profile) => (
              <View key={profile.id} className="flex-row items-center py-2 px-3 bg-gray-50 rounded-lg mb-2">
                <Ionicons 
                  name={getProfileIcon(profile.userType) as any} 
                  size={16} 
                  color="#FF6B35" 
                />
                <Text className="ml-2 text-[#2C3E50] text-sm flex-1">
                  {getProfileTypeName(profile.userType)}
                </Text>
                <Text className="text-[#7F8C8D] text-xs">
                  {profile.isActive ? (language === 'fr' ? 'Actif' : 'Active') : 
                   (language === 'fr' ? 'Inactif' : 'Inactive')}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-200">
            <Pressable
              onPress={() => handleDeleteAccount(account)}
              className={`px-4 py-2 rounded-lg ${
                account.id === 'account-ceo-001' 
                  ? 'bg-gray-300' 
                  : 'bg-red-500'
              }`}
              disabled={account.id === 'account-ceo-001'}
            >
              <Text className={`text-sm font-medium ${
                account.id === 'account-ceo-001' 
                  ? 'text-gray-500' 
                  : 'text-white'
              }`}>
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: insets.top }}>
      <Header 
        showBack
        onBackPress={onBack}
        title={language === 'fr' ? 'Gestion des Comptes' : 'Account Management'}
      />
      
      <View className="flex-1">
        {/* Controls */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
            <Ionicons name="search" size={20} color="#7F8C8D" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              className="flex-1 ml-2"
            />
          </View>

          {/* Filters and Controls */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              {/* Sort Selector */}
              <Pressable 
                onPress={() => setSortBy(sortBy === 'name' ? 'profile' : sortBy === 'profile' ? 'date' : 'name')}
                className="bg-[#FF6B35] px-3 py-2 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">
                  {sortBy === 'name' ? (language === 'fr' ? 'Nom' : 'Name') :
                   sortBy === 'profile' ? (language === 'fr' ? 'Profil' : 'Profile') :
                   (language === 'fr' ? 'Date' : 'Date')}
                </Text>
              </Pressable>

              {/* Filter Selector */}
              <Pressable 
                onPress={() => {
                  const filters: FilterType[] = ['all', 'admin', 'salon_partenaire', 'maitre_formateur', 'academicien_barbier'];
                  const currentIndex = filters.indexOf(filterBy);
                  const nextFilter = filters[(currentIndex + 1) % filters.length];
                  setFilterBy(nextFilter);
                }}
                className="bg-gray-200 px-3 py-2 rounded-lg"
              >
                <Text className="text-[#2C3E50] text-sm font-medium">
                  {filterBy === 'all' ? (language === 'fr' ? 'Tous' : 'All') :
                   getProfileTypeName(filterBy as UserType)}
                </Text>
              </Pressable>
            </View>

            {/* Password Toggle */}
            <Pressable
              onPress={() => setShowPasswords(!showPasswords)}
              className="bg-gray-200 px-3 py-2 rounded-lg"
            >
              <Ionicons 
                name={showPasswords ? 'eye-off' : 'eye'} 
                size={16} 
                color="#2C3E50" 
              />
            </Pressable>
          </View>
        </View>

        {/* Accounts List */}
        <ScrollView className="flex-1 px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-[#2C3E50]">
              {filteredAndSortedAccounts.length} {language === 'fr' ? 'comptes trouvés' : 'accounts found'}
            </Text>
          </View>

          {filteredAndSortedAccounts.map(({ account, profiles }) => (
            <AccountCard
              key={account.id}
              account={account}
              profiles={profiles}
              isExpanded={expandedAccounts.has(account.id)}
            />
          ))}

          {filteredAndSortedAccounts.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="search" size={64} color="#BDC3C7" />
              <Text className="text-[#7F8C8D] text-lg mt-4">
                {language === 'fr' ? 'Aucun compte trouvé' : 'No accounts found'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};