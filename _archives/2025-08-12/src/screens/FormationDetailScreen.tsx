import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { Formation } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles, getPlaceholderColor } from '../utils/screenTheming';

interface FormationDetailScreenProps {
  formation: Formation;
  onBack: () => void;
  onEnroll: (formation: Formation) => void;
}

export const FormationDetailScreen: React.FC<FormationDetailScreenProps> = ({
  formation,
  onBack,
  onEnroll,
}) => {
  const { language } = useAuthStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();

  const mockModules = [
    {
      id: '1',
      title: language === 'fr' ? 'Introduction aux techniques de base' : 'Introduction to basic techniques',
      description: language === 'fr' ? 'Découvrez les fondamentaux' : 'Discover the fundamentals',
      videoUrl: '',
      duration: 45,
      order: 1,
    },
    {
      id: '2',
      title: language === 'fr' ? 'Techniques avancées' : 'Advanced techniques',
      description: language === 'fr' ? 'Perfectionnez vos compétences' : 'Perfect your skills',
      videoUrl: '',
      duration: 60,
      order: 2,
    },
    {
      id: '3',
      title: language === 'fr' ? 'Pratique et évaluation' : 'Practice and evaluation',
      description: language === 'fr' ? 'Mettez en pratique vos acquis' : 'Put your knowledge into practice',
      videoUrl: '',
      duration: 90,
      order: 3,
    },
  ];

  const mockReviews = [
    {
      id: '1',
      userId: '1',
      userName: 'Alexandre Tremblay',
      userPhoto: '',
      formationId: formation.id,
      rating: 5,
      comment: language === 'fr' 
        ? 'Formation exceptionnelle ! Les techniques enseignées sont vraiment utiles.'
        : 'Exceptional course! The techniques taught are really useful.',
      createdAt: '2024-11-20',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Marie Dubois',
      userPhoto: '',
      formationId: formation.id,
      rating: 4,
      comment: language === 'fr'
        ? 'Très bon contenu, le formateur explique clairement.'
        : 'Very good content, the instructor explains clearly.',
      createdAt: '2024-11-18',
    },
  ];

  const ModuleCard: React.FC<{ module: any; index: number }> = ({ module, index }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 bg-[#FF6B35] rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">{index + 1}</Text>
        </View>
        <Text className="flex-1 font-semibold text-[#2C3E50]" numberOfLines={2}>
          {module.title}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#7F8C8D" />
          <Text className="text-[#7F8C8D] text-sm ml-1">{module.duration}min</Text>
        </View>
      </View>
      <Text className="text-[#7F8C8D] text-sm" numberOfLines={2}>
        {module.description}
      </Text>
    </View>
  );

  const ReviewCard: React.FC<{ review: any }> = ({ review }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 bg-[#FF6B35] rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold">
            {review.userName.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-[#2C3E50]">{review.userName}</Text>
          <View className="flex-row items-center">
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={14}
                color={i < review.rating ? "#F39C12" : "#E5E5E5"}
              />
            ))}
            <Text className="text-[#7F8C8D] text-sm ml-2">{review.createdAt}</Text>
          </View>
        </View>
      </View>
      <Text className="text-[#2C3E50]">{review.comment}</Text>
    </View>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
      <Header 
        showBack 
        onBackPress={onBack}
        title={t('viewDetails', language)}
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Video Preview */}
        <View className="h-48 bg-gray-300 items-center justify-center">
          <Pressable className="w-16 h-16 bg-[#FF6B35] rounded-full items-center justify-center">
            <Ionicons name="play" size={32} color="white" />
          </Pressable>
        </View>

        <View className="px-6 py-6">
          {/* Formation Title & Info */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-[#2C3E50] mb-2">
              {formation.title}
            </Text>
            <Text className="text-[#7F8C8D] text-base leading-relaxed mb-4">
              {formation.description}
            </Text>

            {/* Badges */}
            <View className="flex-row mb-4">
              <View className="bg-[#1ABC9C] px-3 py-1 rounded-full mr-2">
                <Text className="text-white text-sm font-medium">
                  {formation.level.charAt(0).toUpperCase() + formation.level.slice(1)}
                </Text>
              </View>
              <View className="bg-[#3498DB] px-3 py-1 rounded-full mr-2">
                <Text className="text-white text-sm font-medium">
                  {formation.category.charAt(0).toUpperCase() + formation.category.slice(1)}
                </Text>
              </View>
              <View className="bg-[#9B59B6] px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  {formation.duration}h
                </Text>
              </View>
            </View>

            {/* Rating & Stats */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="star" size={20} color="#F39C12" />
                  <Text className="text-[#2C3E50] font-semibold ml-1">
                    {formation.rating}
                  </Text>
                  <Text className="text-[#7F8C8D] ml-1">
                    ({formation.reviewCount} {language === 'fr' ? 'avis' : 'reviews'})
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={20} color="#7F8C8D" />
                  <Text className="text-[#7F8C8D] ml-1">
                    {formation.enrolledCount} {language === 'fr' ? 'inscrits' : 'enrolled'}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-[#FF6B35]">
                ${formation.price}
              </Text>
            </View>
          </View>

          {/* Instructor Info */}
          <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <Text className="text-lg font-bold text-[#2C3E50] mb-3">
              {t('instructor', language)}
            </Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#FF6B35] rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {formation.formateur.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-[#2C3E50]">
                  {formation.formateur.name}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#F39C12" />
                  <Text className="text-[#7F8C8D] ml-1">
                    {formation.formateur.rating} {language === 'fr' ? 'formateur expert' : 'expert instructor'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Course Modules */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-[#2C3E50] mb-3">
              {language === 'fr' ? 'Programme détaillé' : 'Detailed program'}
            </Text>
            {mockModules.map((module, index) => (
              <ModuleCard key={module.id} module={module} index={index} />
            ))}
          </View>

          {/* Reviews */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-[#2C3E50] mb-3">
              {language === 'fr' ? 'Avis des élèves' : 'Student reviews'}
            </Text>
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>

          {/* Similar Courses */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-[#2C3E50] mb-3">
              {t('similarFormations', language)}
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-[#7F8C8D] text-center">
                {language === 'fr' 
                  ? 'Formations similaires à venir...'
                  : 'Similar courses coming soon...'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <AcademieButton
          title={t('enrollNow', language)}
          onPress={() => onEnroll(formation)}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );
};