import React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AcademieButton } from './AcademieButton';
import { t } from '../utils/translations';
import { UserType, Language } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface ProfileTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: UserType) => void;
  language: Language;
  availableTypes?: UserType[];
}

export const ProfileTypeSelector: React.FC<ProfileTypeSelectorProps> = ({
  visible,
  onClose,
  onSelectType,
  language,
  availableTypes,
}) => {
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();

  const allProfileTypes: UserType[] = ['academicien_barbier', 'maitre_formateur', 'salon_partenaire', 'admin'];
  const profileTypes = availableTypes || allProfileTypes;

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

  const getProfileDescription = (userType: UserType): string => {
    switch (userType) {
      case 'academicien_barbier':
        return language === 'fr' 
          ? 'Apprenez et progressez dans votre métier'
          : 'Learn and progress in your trade';
      case 'maitre_formateur':
        return language === 'fr'
          ? 'Partagez votre expertise et créez du contenu'
          : 'Share your expertise and create content';
      case 'salon_partenaire':
        return language === 'fr'
          ? 'Gérez votre salon et vos espaces de formation'
          : 'Manage your salon and training spaces';
      case 'admin':
        return language === 'fr'
          ? 'Administrez la plateforme Académie Précision'
          : 'Administer the Precision Academy platform';
      default:
        return '';
    }
  };

  const ProfileCard: React.FC<{ userType: UserType }> = ({ userType }) => (
    <Pressable
      onPress={() => {
        onSelectType(userType);
        onClose();
      }}
      style={[styles.card, { marginBottom: 16 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          backgroundColor: styles.statsValue.color,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          <Ionicons 
            name={getProfileIcon(userType) as any} 
            size={24} 
            color="white" 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { marginBottom: 4 }]}>
            {getProfileTitle(userType)}
          </Text>
          <Text style={styles.caption}>
            {getProfileDescription(userType)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={styles.caption.color} />
      </View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.card, { borderRadius: 0, borderBottomWidth: 1, borderBottomColor: styles.border.borderColor }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable onPress={onClose} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={24} color={styles.text.color} />
            </Pressable>
            <Text style={styles.subtitle}>
              {t('profileType', language)}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { textAlign: 'center', marginBottom: 8 }]}>
            {language === 'fr' ? 'Choisissez votre profil' : 'Choose your profile'}
          </Text>
          <Text style={[styles.caption, { textAlign: 'center', marginBottom: 32 }]}>
            {language === 'fr' 
              ? 'Sélectionnez le type de profil que vous souhaitez créer'
              : 'Select the type of profile you want to create'
            }
          </Text>

          {profileTypes.map((userType) => (
            <ProfileCard key={userType} userType={userType} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};