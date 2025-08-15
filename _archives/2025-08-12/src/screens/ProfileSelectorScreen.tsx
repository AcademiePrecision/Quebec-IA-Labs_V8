import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { UserProfile, UserType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface ProfileSelectorScreenProps {
  onSelectProfile: (profile: UserProfile) => void;
  onAddProfile: () => void;
  onLogout: () => void;
}

export const ProfileSelectorScreen: React.FC<ProfileSelectorScreenProps> = ({
  onSelectProfile,
  onAddProfile,
  onLogout,
}) => {
  const { session, language } = useAuthStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();

  if (!session) return null;

  // Deduplicate profiles to prevent React key conflicts
  const uniqueProfiles = session.availableProfiles.filter((profile, index, array) => 
    array.findIndex(p => p.id === profile.id) === index
  );

  const getProfileIcon = (userType: UserType): string => {
    switch (userType) {
      case 'academicien_barbier':
        return 'school-outline';
      case 'maitre_formateur':
        return 'person-circle-outline';
      case 'salon_partenaire':
        return 'business-outline';
      case 'admin':
        return 'settings-outline';
      default:
        return 'person-outline';
    }
  };

  const getProfileTitle = (userType: UserType): string => {
    switch (userType) {
      case 'academicien_barbier':
        return t('academicienBarbier', language);
      case 'maitre_formateur':
        return t('maitreFormateur', language);
      case 'salon_partenaire':
        return t('salonPartenaire', language);
      case 'admin':
        return t('admin', language);
      default:
        return userType;
    }
  };

  const getProfileDescription = (profile: UserProfile): string => {
    switch (profile.userType) {
      case 'academicien_barbier':
        const academicienProfile = profile as any;
        return language === 'fr' 
          ? `Niveau: ${academicienProfile.experienceLevel} • Budget: $${academicienProfile.monthlyTrainingBudget}/mois`
          : `Level: ${academicienProfile.experienceLevel} • Budget: $${academicienProfile.monthlyTrainingBudget}/month`;
      case 'maitre_formateur':
        const formateurProfile = profile as any;
        return language === 'fr'
          ? `${formateurProfile.yearsExperience} ans d'expérience • $${formateurProfile.hourlyRate}/h`
          : `${formateurProfile.yearsExperience} years experience • $${formateurProfile.hourlyRate}/h`;
      case 'salon_partenaire':
        const salonProfile = profile as any;
        return language === 'fr'
          ? `${salonProfile.salonName} • ${salonProfile.employeeCount} employés`
          : `${salonProfile.salonName} • ${salonProfile.employeeCount} employees`;
      case 'admin':
        const adminProfile = profile as any;
        return language === 'fr'
          ? `Département: ${adminProfile.department}`
          : `Department: ${adminProfile.department}`;
      default:
        return '';
    }
  };

  const ProfileCard: React.FC<{ profile: UserProfile; isActive: boolean }> = ({ 
    profile, 
    isActive 
  }) => (
    <Pressable
      onPress={() => onSelectProfile(profile)}
      style={[
        styles.card,
        {
          marginBottom: 16,
          borderWidth: 2,
          borderColor: isActive ? styles.statsValue.color : 'transparent',
        }
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
          backgroundColor: isActive ? styles.statsValue.color : styles.card.backgroundColor,
          borderWidth: isActive ? 0 : 1,
          borderColor: styles.statsValue.color,
        }}>
          <Ionicons 
            name={getProfileIcon(profile.userType) as any} 
            size={24} 
            color={isActive ? 'white' : styles.statsValue.color} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { marginBottom: 4 }]}>
            {getProfileTitle(profile.userType)}
          </Text>
          <Text style={styles.caption}>
            {getProfileDescription(profile)}
          </Text>
        </View>
        {isActive && (
          <View style={{
            width: 24,
            height: 24,
            backgroundColor: styles.statsValue.color,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </View>
      
      {isActive && (
        <View style={{
          backgroundColor: theme === 'dark' ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.1)',
          borderRadius: 8,
          padding: 12,
          marginTop: 8
        }}>
          <Text style={[styles.primaryText, { textAlign: 'center', fontSize: 14, fontWeight: '500' }]}>
            {language === 'fr' ? 'Profil actuel' : 'Current profile'}
          </Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
      <Header />
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Welcome Section */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: styles.statsValue.color,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              {session.account.firstName.charAt(0)}{session.account.lastName.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.title, { marginBottom: 8 }]}>
            {t('welcome', language)}, {session.account.firstName}!
          </Text>
          <Text style={[styles.caption, { textAlign: 'center' }]}>
            {language === 'fr' 
              ? 'Choisissez votre profil pour continuer'
              : 'Choose your profile to continue'
            }
          </Text>
        </View>

        {/* Available Profiles */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Vos profils' : 'Your profiles'}
          </Text>
          
          {uniqueProfiles.map((profile) => (
            <ProfileCard
              key={`profile-${profile.id}`}
              profile={profile}
              isActive={profile.id === session.activeProfile.id}
            />
          ))}
        </View>

        {/* Add New Profile */}
        <View style={{ marginBottom: 24 }}>
          <AcademieButton
            title={language === 'fr' ? 'Ajouter un nouveau profil' : 'Add new profile'}
            onPress={onAddProfile}
            variant="outline"
            size="lg"
          />
        </View>

        {/* Account Info */}
        <View style={[styles.card, { marginBottom: 24 }]}>
          <Text style={[styles.subtitle, { marginBottom: 12 }]}>
            {language === 'fr' ? 'Informations du compte' : 'Account information'}
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.caption, { width: 80 }]}>Email:</Text>
              <Text style={[styles.text, { flex: 1 }]}>{session.account.email}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.caption, { width: 80 }]}>
                {language === 'fr' ? 'Téléphone:' : 'Phone:'}
              </Text>
              <Text style={[styles.text, { flex: 1 }]}>{session.account.phone}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.caption, { width: 80 }]}>
                {language === 'fr' ? 'Membre depuis:' : 'Member since:'}
              </Text>
              <Text style={[styles.text, { flex: 1 }]}>
                {new Date(session.account.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <AcademieButton
          title={t('logout', language)}
          onPress={onLogout}
          variant="secondary"
          size="lg"
        />
      </ScrollView>
    </View>
  );
};