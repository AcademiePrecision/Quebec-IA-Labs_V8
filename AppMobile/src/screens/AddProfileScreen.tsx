import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { ProfileTypeSelector } from '../components/ProfileTypeSelector';
import { SimpleSelector } from '../components/SimpleSelector';
import { KeyboardAvoidingScrollView } from '../components/KeyboardAvoidingScrollView';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { UserType, UserProfile } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface AddProfileScreenProps {
  onBack: () => void;
  onProfileAdded: (profile: UserProfile | Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface FormData {
  userType: UserType | '';

  // Admin fields
  adminAccessCode: string;
  department: string;

  // Salon fields
  salonName: string;
  salonAddress: string;
  businessNumber: string;
  website: string;
  employeeCount: string;
  yearsExperience: string;
  servicesOffered: string;
  equipmentAvailable: string;
  workingHours: string;

  // Formateur fields
  specialties: string;
  certifications: string;
  portfolio: string;
  attachedSalon: string;
  hourlyRate: string;
  weeklyAvailability: string;
  professionalBio: string;

  // Student fields
  experienceLevel: 'debutant' | 'intermediaire' | 'avance' | '';
  specialtiesOfInterest: string;
  trainingGoals: string;
  employerSalon: string;
  monthlyTrainingBudget: string;
}

export const AddProfileScreen: React.FC<AddProfileScreenProps> = ({
  onBack,
  onProfileAdded,
}) => {
  const { session, language, setLoading, setError, error, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | ''>('');
  
  const [formData, setFormData] = useState<FormData>({
    userType: '',
    adminAccessCode: '',
    department: '',
    salonName: '',
    salonAddress: '',
    businessNumber: '',
    website: '',
    employeeCount: '',
    yearsExperience: '',
    servicesOffered: '',
    equipmentAvailable: '',
    workingHours: '',
    specialties: '',
    certifications: '',
    portfolio: '',
    attachedSalon: '',
    hourlyRate: '',
    weeklyAvailability: '',
    professionalBio: '',
    experienceLevel: '',
    specialtiesOfInterest: '',
    trainingGoals: '',
    employerSalon: '',
    monthlyTrainingBudget: '',
  });

  if (!session) return null;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    setFormData(prev => ({ ...prev, userType }));
    setShowProfileSelector(false);
  };

  const getProfileTypeName = (userType: UserType): string => {
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

  // For admin accounts, allow all profile types (they can have multiple profiles for testing)
  // For regular accounts, restrict to prevent duplicate profile types (except for some specific cases)
  const existingProfileTypes = session.availableProfiles.map(p => p.userType);
  const isAdminAccount = session.availableProfiles.some(p => p.userType === 'admin');
  
  const availableProfileTypes = isAdminAccount 
    ? (['admin', 'salon_partenaire', 'maitre_formateur', 'academicien_barbier'] as UserType[])
    : (['salon_partenaire', 'maitre_formateur', 'academicien_barbier'] as UserType[])
        .filter(type => !existingProfileTypes.includes(type));

  const renderProfileTypeSelector = () => (
    <View>
      <Text style={[styles.label, { marginBottom: 8 }]}>
        {t('profileType', language)} *
      </Text>
      <Pressable
        onPress={() => setShowProfileSelector(true)}
        style={styles.input}
      >
        <Text style={[styles.inputText, !selectedUserType && { color: styles.caption.color }]}>
          {selectedUserType 
            ? getProfileTypeName(selectedUserType)
            : (language === 'fr' ? 'Sélectionner un profil...' : 'Select a profile...')
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color={styles.caption.color} />
      </Pressable>
    </View>
  );

  const validateForm = (): boolean => {
    if (!selectedUserType) {
      setError(language === 'fr' ? 'Veuillez sélectionner un type de profil' : 'Please select a profile type');
      return false;
    }

    // Type-specific validation
    switch (selectedUserType) {
      case 'admin':
        if (!formData.adminAccessCode || !formData.department) {
          setError(language === 'fr' ? 'Veuillez remplir les champs admin' : 'Please fill admin fields');
          return false;
        }
        break;
      case 'salon_partenaire':
        if (!formData.salonName) {
          setError(language === 'fr' ? 'Veuillez remplir le nom du salon' : 'Please fill salon name');
          return false;
        }
        if (!formData.salonAddress) {
          setError(language === 'fr' ? 'Veuillez remplir l\'adresse du salon' : 'Please fill salon address');
          return false;
        }
        if (!formData.businessNumber) {
          setError(language === 'fr' ? 'Veuillez remplir le numéro d\'entreprise' : 'Please fill business number');
          return false;
        }
        if (!formData.employeeCount) {
          setError(language === 'fr' ? 'Veuillez remplir le nombre d\'employés' : 'Please fill employee count');
          return false;
        }
        if (!formData.yearsExperience) {
          setError(language === 'fr' ? 'Veuillez remplir les années d\'expérience' : 'Please fill years of experience');
          return false;
        }
        if (!formData.servicesOffered) {
          setError(language === 'fr' ? 'Veuillez remplir les services offerts' : 'Please fill services offered');
          return false;
        }
        break;
      case 'maitre_formateur':
        if (!formData.specialties || !formData.yearsExperience || !formData.hourlyRate || 
            !formData.professionalBio) {
          setError(language === 'fr' ? 'Veuillez remplir les champs formateur' : 'Please fill formateur fields');
          return false;
        }
        break;
      case 'academicien_barbier':
        if (!formData.experienceLevel || !formData.specialtiesOfInterest || 
            !formData.trainingGoals || !formData.monthlyTrainingBudget) {
          setError(language === 'fr' ? 'Veuillez remplir les champs étudiant' : 'Please fill student fields');
          return false;
        }
        break;
    }

    return true;
  };

  const handleAddProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create profile data based on type
      let profileData: any;

      switch (selectedUserType) {
        case 'admin':
          profileData = {
            accountId: session.account.id,
            userType: 'admin',
            isActive: true,
            adminAccessCode: formData.adminAccessCode,
            department: formData.department,
          };
          break;
        case 'salon_partenaire':
          profileData = {
            accountId: session.account.id,
            userType: 'salon_partenaire',
            isActive: true,
            salonName: formData.salonName,
            salonAddress: formData.salonAddress,
            businessNumber: formData.businessNumber,
            website: formData.website,
            employeeCount: parseInt(formData.employeeCount),
            yearsExperience: parseInt(formData.yearsExperience),
            servicesOffered: formData.servicesOffered.split(',').map(s => s.trim()),
            equipmentAvailable: formData.equipmentAvailable.split(',').map(s => s.trim()),
            workingHours: formData.workingHours,
          };
          break;
        case 'maitre_formateur':
          profileData = {
            accountId: session.account.id,
            userType: 'maitre_formateur',
            isActive: true,
            specialties: formData.specialties.split(',').map(s => s.trim()),
            yearsExperience: parseInt(formData.yearsExperience),
            certifications: formData.certifications.split(',').map(s => s.trim()),
            portfolio: formData.portfolio.split(',').map(s => s.trim()),
            attachedSalon: formData.attachedSalon,
            hourlyRate: parseFloat(formData.hourlyRate),
            weeklyAvailability: formData.weeklyAvailability,
            professionalBio: formData.professionalBio,
          };
          break;
        case 'academicien_barbier':
          profileData = {
            accountId: session.account.id,
            userType: 'academicien_barbier',
            isActive: true,
            experienceLevel: formData.experienceLevel as 'debutant' | 'intermediaire' | 'avance',
            specialtiesOfInterest: formData.specialtiesOfInterest.split(',').map(s => s.trim()),
            trainingGoals: formData.trainingGoals,
            employerSalon: formData.employerSalon,
            monthlyTrainingBudget: parseFloat(formData.monthlyTrainingBudget),
          };
          break;
        default:
          throw new Error('Invalid user type');
      }

      // Pass the profile data to be created, not a created profile
      onProfileAdded(profileData);
    } catch (error) {
      setError(language === 'fr' ? 'Erreur lors de la création du profil' : 'Profile creation error');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    if (!selectedUserType) return null;
    
    switch (selectedUserType) {
      case 'admin':
        return (
          <>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('adminAccessCode', language)} *
              </Text>
              <TextInput
                value={formData.adminAccessCode}
                onChangeText={(text) => updateField('adminAccessCode', text)}
                placeholder={t('adminAccessCode', language)}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('department', language)} *
              </Text>
              <TextInput
                value={formData.department}
                onChangeText={(text) => updateField('department', text)}
                placeholder={t('department', language)}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
          </>
        );

      case 'salon_partenaire':
        return (
          <>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('salonName', language)} *
              </Text>
              <TextInput
                value={formData.salonName}
                onChangeText={(text) => updateField('salonName', text)}
                placeholder={t('salonName', language)}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('salonAddress', language)} *
              </Text>
              <TextInput
                value={formData.salonAddress}
                onChangeText={(text) => updateField('salonAddress', text)}
                placeholder={t('salonAddress', language)}
                multiline
                numberOfLines={3}
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('businessNumber', language)} *
              </Text>
              <TextInput
                value={formData.businessNumber}
                onChangeText={(text) => updateField('businessNumber', text)}
                placeholder={t('businessNumber', language)}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  {t('employeeCount', language)} *
                </Text>
                <TextInput
                  value={formData.employeeCount}
                  onChangeText={(text) => updateField('employeeCount', text)}
                  placeholder={t('employeeCount', language)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={styles.caption.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  {t('yearsExperience', language)} *
                </Text>
                <TextInput
                  value={formData.yearsExperience}
                  onChangeText={(text) => updateField('yearsExperience', text)}
                  placeholder={t('yearsExperience', language)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={styles.caption.color}
                />
              </View>
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('website', language)}
              </Text>
              <TextInput
                value={formData.website}
                onChangeText={(text) => updateField('website', text)}
                placeholder="https://www.votre-salon.com"
                keyboardType="url"
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('servicesOffered', language)} *
              </Text>
              <TextInput
                value={formData.servicesOffered}
                onChangeText={(text) => updateField('servicesOffered', text)}
                placeholder={language === 'fr' ? 'Barbier, Coiffure, Esthétique (séparez par des virgules)' : 'Barber, Hair, Aesthetics (separate with commas)'}
                multiline
                numberOfLines={2}
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholderTextColor={styles.caption.color}
              />
            </View>
          </>
        );

      case 'maitre_formateur':
        return (
          <>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('specialties', language)} * {language === 'fr' ? '(séparez par des virgules)' : '(separate with commas)'}
              </Text>
              <TextInput
                value={formData.specialties}
                onChangeText={(text) => updateField('specialties', text)}
                placeholder={language === 'fr' ? 'Barbier, Coiffure, Esthétique' : 'Barber, Hair, Aesthetics'}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  {t('yearsExperience', language)} *
                </Text>
                <TextInput
                  value={formData.yearsExperience}
                  onChangeText={(text) => updateField('yearsExperience', text)}
                  placeholder={t('yearsExperience', language)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={styles.caption.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  {t('hourlyRate', language)} * ($)
                </Text>
                <TextInput
                  value={formData.hourlyRate}
                  onChangeText={(text) => updateField('hourlyRate', text)}
                  placeholder="50"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={styles.caption.color}
                />
              </View>
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('professionalBio', language)} *
              </Text>
              <TextInput
                value={formData.professionalBio}
                onChangeText={(text) => updateField('professionalBio', text)}
                placeholder={t('professionalBio', language)}
                multiline
                numberOfLines={4}
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholderTextColor={styles.caption.color}
              />
            </View>
          </>
        );

      case 'academicien_barbier':
        return (
          <>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('experienceLevel', language)} *
              </Text>
              <SimpleSelector
                value={formData.experienceLevel}
                onValueChange={(value) => updateField('experienceLevel', value)}
                options={[
                  { label: t('beginner', language), value: 'debutant' },
                  { label: t('intermediate', language), value: 'intermediaire' },
                  { label: t('advanced', language), value: 'avance' },
                ]}
                placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'}
                title={t('experienceLevel', language)}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('specialtiesOfInterest', language)} * {language === 'fr' ? '(séparez par des virgules)' : '(separate with commas)'}
              </Text>
              <TextInput
                value={formData.specialtiesOfInterest}
                onChangeText={(text) => updateField('specialtiesOfInterest', text)}
                placeholder={language === 'fr' ? 'Barbier, Techniques avancées' : 'Barber, Advanced techniques'}
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('trainingGoals', language)} *
              </Text>
              <TextInput
                value={formData.trainingGoals}
                onChangeText={(text) => updateField('trainingGoals', text)}
                placeholder={t('trainingGoals', language)}
                multiline
                numberOfLines={3}
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholderTextColor={styles.caption.color}
              />
            </View>
            <View>
              <Text style={[styles.label, { marginBottom: 8 }]}>
                {t('monthlyTrainingBudget', language)} * ($)
              </Text>
              <TextInput
                value={formData.monthlyTrainingBudget}
                onChangeText={(text) => updateField('monthlyTrainingBudget', text)}
                placeholder="200"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={styles.caption.color}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  if (availableProfileTypes.length === 0) {
    return (
      <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={language === 'fr' ? 'Ajouter un profil' : 'Add Profile'}
        />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={[styles.title, { textAlign: 'center', marginBottom: 16 }]}>
            {language === 'fr' 
              ? 'Tous les profils sont déjà créés'
              : 'All profiles are already created'
            }
          </Text>
          <Text style={[styles.caption, { textAlign: 'center', marginBottom: 24 }]}>
            {language === 'fr'
              ? 'Vous avez déjà créé tous les types de profils disponibles.'
              : 'You have already created all available profile types.'
            }
          </Text>
          <AcademieButton
            title={language === 'fr' ? 'Retour' : 'Back'}
            onPress={onBack}
            variant="primary"
            size="lg"
          />
        </View>
      </View>
    );
  }

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-thgusstavo-2040189.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={language === 'fr' ? 'Ajouter un profil' : 'Add Profile'}
        />
        
        <KeyboardAvoidingScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <ReadableText style={[styles.title, { textAlign: 'center', marginBottom: 24 }]}>
              {language === 'fr' ? 'Nouveau profil' : 'New Profile'}
            </ReadableText>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 16 }}>
            {renderProfileTypeSelector()}

            {selectedUserType && renderTypeSpecificFields()}

            {selectedUserType && (
              <View style={{ marginTop: 24 }}>
                <AcademieButton
                  title={language === 'fr' ? 'Créer le profil' : 'Create Profile'}
                  onPress={handleAddProfile}
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingScrollView>

        {/* Profile Type Selector Modal */}
        <ProfileTypeSelector
          visible={showProfileSelector}
          onClose={() => setShowProfileSelector(false)}
          onSelectType={handleProfileTypeSelect}
          language={language}
          availableTypes={availableProfileTypes}
        />
      </View>
    </SubtleBackground>
  );
};