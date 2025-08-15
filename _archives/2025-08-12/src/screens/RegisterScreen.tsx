import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { ProfileTypeSelector } from '../components/ProfileTypeSelector';
import { SimpleSelector } from '../components/SimpleSelector';
import { KeyboardAvoidingScrollView } from '../components/KeyboardAvoidingScrollView';
import { useAuthStore, createAccount, createProfile, findAccountByEmail } from '../state/authStore';
import { t } from '../utils/translations';
import { UserType, UserSession, UserProfile } from '../types';
import { useTheme, themes } from '../contexts/ThemeContext';

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterSuccess: (session: UserSession) => void;
}

interface FormData {
  // Common fields
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  preferredLanguage: 'fr' | 'en';
  profilePhoto: string;
  userType: UserType | '';
  acceptTerms: boolean;

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

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onRegisterSuccess,
}) => {
  const { language, setLoading, setError, error, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const insets = useSafeAreaInsets();
  
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | ''>('');
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    preferredLanguage: language,
    profilePhoto: '',
    userType: '',
    acceptTerms: false,
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

  const updateField = (field: keyof FormData, value: string | boolean) => {
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

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.confirmPassword || !formData.phone || 
        !selectedUserType || !formData.acceptTerms) {
      setError(language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
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

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if account already exists
      const existingAccount = findAccountByEmail(formData.email);
      if (existingAccount) {
        setError(language === 'fr' ? 'Un compte avec cet email existe déjà' : 'An account with this email already exists');
        return;
      }
      
      // Create account
      const account = createAccount({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        preferredLanguage: formData.preferredLanguage,
        profilePhoto: formData.profilePhoto,
        lastUsedProfile: selectedUserType as UserType,
      });

      // Create profile based on type
      let profile: UserProfile;

      switch (selectedUserType) {
        case 'admin':
          profile = createProfile({
            accountId: account.id,
            userType: 'admin',
            isActive: true,
            adminAccessCode: formData.adminAccessCode,
            department: formData.department,
          } as any);
          break;
        case 'salon_partenaire':
          profile = createProfile({
            accountId: account.id,
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
          } as any);
          break;
        case 'maitre_formateur':
          profile = createProfile({
            accountId: account.id,
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
          } as any);
          break;
        case 'academicien_barbier':
          profile = createProfile({
            accountId: account.id,
            userType: 'academicien_barbier',
            isActive: true,
            experienceLevel: formData.experienceLevel as 'debutant' | 'intermediaire' | 'avance',
            specialtiesOfInterest: formData.specialtiesOfInterest.split(',').map(s => s.trim()),
            trainingGoals: formData.trainingGoals,
            employerSalon: formData.employerSalon,
            monthlyTrainingBudget: parseFloat(formData.monthlyTrainingBudget),
          } as any);
          break;
        default:
          throw new Error('Invalid user type');
      }

      const session: UserSession = {
        account,
        activeProfile: profile,
        availableProfiles: [profile],
      };

      onRegisterSuccess(session);
    } catch (error) {
      setError(language === 'fr' ? 'Erreur lors de l\'inscription' : 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTypeSelector = () => (
    <View>
      <Text className="text-[#2C3E50] font-medium mb-2">
        {t('profileType', language)} *
      </Text>
      <Pressable
        onPress={() => setShowProfileSelector(true)}
        className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
      >
        <Text className={`text-base ${selectedUserType ? 'text-[#2C3E50]' : 'text-[#7F8C8D]'}`}>
          {selectedUserType 
            ? getProfileTypeName(selectedUserType)
            : (language === 'fr' ? 'Sélectionner un profil...' : 'Select a profile...')
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7F8C8D" />
      </Pressable>
    </View>
  );

  const renderCommonFields = () => (
    <>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-[#2C3E50] font-medium mb-2">
            {t('firstName', language)} *
          </Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            placeholder={t('firstName', language)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>
        <View className="flex-1">
          <Text className="text-[#2C3E50] font-medium mb-2">
            {t('lastName', language)} *
          </Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            placeholder={t('lastName', language)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>
      </View>

      <View>
        <Text className="text-[#2C3E50] font-medium mb-2">
          {t('email', language)} *
        </Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          placeholder={t('email', language)}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
        />
      </View>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-[#2C3E50] font-medium mb-2">
            {t('password', language)} *
          </Text>
          <TextInput
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder={t('password', language)}
            secureTextEntry
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>
        <View className="flex-1">
          <Text className="text-[#2C3E50] font-medium mb-2">
            {t('confirmPassword', language)} *
          </Text>
          <TextInput
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            placeholder={t('confirmPassword', language)}
            secureTextEntry
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          />
        </View>
      </View>

      <View>
        <Text className="text-[#2C3E50] font-medium mb-2">
          {t('phone', language)} *
        </Text>
        <TextInput
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          placeholder={t('phone', language)}
          keyboardType="phone-pad"
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
        />
      </View>
    </>
  );

  const renderTypeSpecificFields = () => {
    if (!selectedUserType) return null;
    
    switch (selectedUserType) {
      case 'admin':
        return (
          <>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('adminAccessCode', language)} *
              </Text>
              <TextInput
                value={formData.adminAccessCode}
                onChangeText={(text) => updateField('adminAccessCode', text)}
                placeholder={t('adminAccessCode', language)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('department', language)} *
              </Text>
              <TextInput
                value={formData.department}
                onChangeText={(text) => updateField('department', text)}
                placeholder={t('department', language)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
          </>
        );

      case 'salon_partenaire':
        return (
          <>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('salonName', language)} *
              </Text>
              <TextInput
                value={formData.salonName}
                onChangeText={(text) => updateField('salonName', text)}
                placeholder={t('salonName', language)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('salonAddress', language)} *
              </Text>
              <TextInput
                value={formData.salonAddress}
                onChangeText={(text) => updateField('salonAddress', text)}
                placeholder={t('salonAddress', language)}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('businessNumber', language)} *
              </Text>
              <TextInput
                value={formData.businessNumber}
                onChangeText={(text) => updateField('businessNumber', text)}
                placeholder={t('businessNumber', language)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-[#2C3E50] font-medium mb-2">
                  {t('employeeCount', language)} *
                </Text>
                <TextInput
                  value={formData.employeeCount}
                  onChangeText={(text) => updateField('employeeCount', text)}
                  placeholder={t('employeeCount', language)}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#2C3E50] font-medium mb-2">
                  {t('yearsExperience', language)} *
                </Text>
                <TextInput
                  value={formData.yearsExperience}
                  onChangeText={(text) => updateField('yearsExperience', text)}
                  placeholder={t('yearsExperience', language)}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                />
              </View>
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('website', language)}
              </Text>
              <TextInput
                value={formData.website}
                onChangeText={(text) => updateField('website', text)}
                placeholder="https://www.votre-salon.com"
                keyboardType="url"
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('servicesOffered', language)} *
              </Text>
              <TextInput
                value={formData.servicesOffered}
                onChangeText={(text) => updateField('servicesOffered', text)}
                placeholder={language === 'fr' ? 'Barbier, Coiffure, Esthétique (séparez par des virgules)' : 'Barber, Hair, Aesthetics (separate with commas)'}
                multiline
                numberOfLines={2}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
          </>
        );

      case 'maitre_formateur':
        return (
          <>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('specialties', language)} * {language === 'fr' ? '(séparez par des virgules)' : '(separate with commas)'}
              </Text>
              <TextInput
                value={formData.specialties}
                onChangeText={(text) => updateField('specialties', text)}
                placeholder={language === 'fr' ? 'Barbier, Coiffure, Esthétique' : 'Barber, Hair, Aesthetics'}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-[#2C3E50] font-medium mb-2">
                  {t('yearsExperience', language)} *
                </Text>
                <TextInput
                  value={formData.yearsExperience}
                  onChangeText={(text) => updateField('yearsExperience', text)}
                  placeholder={t('yearsExperience', language)}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#2C3E50] font-medium mb-2">
                  {t('hourlyRate', language)} * ($)
                </Text>
                <TextInput
                  value={formData.hourlyRate}
                  onChangeText={(text) => updateField('hourlyRate', text)}
                  placeholder="50"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                />
              </View>
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('professionalBio', language)} *
              </Text>
              <TextInput
                value={formData.professionalBio}
                onChangeText={(text) => updateField('professionalBio', text)}
                placeholder={t('professionalBio', language)}
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
          </>
        );

      case 'academicien_barbier':
        return (
          <>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
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
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('specialtiesOfInterest', language)} * {language === 'fr' ? '(séparez par des virgules)' : '(separate with commas)'}
              </Text>
              <TextInput
                value={formData.specialtiesOfInterest}
                onChangeText={(text) => updateField('specialtiesOfInterest', text)}
                placeholder={language === 'fr' ? 'Barbier, Techniques avancées' : 'Barber, Advanced techniques'}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('trainingGoals', language)} *
              </Text>
              <TextInput
                value={formData.trainingGoals}
                onChangeText={(text) => updateField('trainingGoals', text)}
                placeholder={t('trainingGoals', language)}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-[#2C3E50] font-medium mb-2">
                {t('monthlyTrainingBudget', language)} * ($)
              </Text>
              <TextInput
                value={formData.monthlyTrainingBudget}
                onChangeText={(text) => updateField('monthlyTrainingBudget', text)}
                placeholder="200"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: currentTheme.background, paddingTop: insets.top }}>
      <Header 
        showBack 
        onBackPress={onBack}
        title={t('register', language)}
      />
      
      <KeyboardAvoidingScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-2xl font-bold text-[#2C3E50] text-center mb-6">
            {t('newRegistration', language)}
          </Text>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          <View className="space-y-4">
            {renderProfileTypeSelector()}
            {selectedUserType && (
              <>
                {renderCommonFields()}
                {renderTypeSpecificFields()}
              </>
            )}

            {selectedUserType && (
              <>
                {/* Terms and conditions */}
                <View className="flex-row items-center space-x-3 mt-6">
                  <Switch
                    value={formData.acceptTerms}
                    onValueChange={(value) => updateField('acceptTerms', value)}
                    trackColor={{ false: '#767577', true: '#FF6B35' }}
                    thumbColor={formData.acceptTerms ? '#FFF' : '#f4f3f4'}
                  />
                  <Text className="flex-1 text-[#2C3E50]">
                    {t('acceptTerms', language)}
                  </Text>
                </View>

                <AcademieButton
                  title={t('createAccount', language)}
                  onPress={handleRegister}
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className="mt-6"
                />

                <Text className="text-center text-[#7F8C8D] mt-4">
                  {t('alreadyHaveAccount', language)}
                </Text>
              </>
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
      />
    </View>
  );
};