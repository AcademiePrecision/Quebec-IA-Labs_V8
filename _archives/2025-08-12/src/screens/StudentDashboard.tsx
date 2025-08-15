import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useAppStore } from '../state/appStore';
import { t } from '../utils/translations';
import { mockFormations, mockBadges } from '../utils/mockData';
import { useTheme, themes } from '../contexts/ThemeContext';

interface StudentDashboardProps {
  onNavigateToCatalog: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateToCatalog,
  onNavigateToProfile,
  onLogout,
}) => {
  const { session, language } = useAuthStore();
  const { formations, enrollments, userBadges, setFormations, setBadges } = useAppStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('[StudentDashboard] Component mounted');
    console.log('[StudentDashboard] session:', session);
    console.log('[StudentDashboard] language:', language);
  }, [session, language]);

  // Initialize mock data
  useEffect(() => {
    if (formations.length === 0) {
      setFormations(mockFormations);
    }
    setBadges(mockBadges);
  }, [formations.length, setFormations, setBadges]);

  const activeFormations = formations.filter(f => 
    enrollments.some(e => e.formationId === f.id && e.progress < 100)
  );

  const recommendedFormations = formations.slice(0, 3);

  const getUserDisplayName = () => {
    return session?.account.firstName || 'User';
  };
  const upcomingAteliers = [
    {
      id: '1',
      title: language === 'fr' ? 'Techniques de barbe avancées' : 'Advanced beard techniques',
      date: '2024-12-15',
      time: '14:00',
      instructor: 'Marc Dubois',
    },
    {
      id: '2',
      title: language === 'fr' ? 'Coupe dégradée moderne' : 'Modern fade cutting',
      date: '2024-12-18',
      time: '10:00',
      instructor: 'Sarah Martin',
    },
  ];

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: string; 
    color: string;
  }> = ({ title, value, icon, color }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm flex-1">
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon as any} size={24} color={color} />
        <Text className={`text-2xl font-bold text-[${color}]`}>{value}</Text>
      </View>
      <Text className="text-[#7F8C8D] text-sm">{title}</Text>
    </View>
  );

  const FormationCard: React.FC<{ 
    formation: any; 
    progress?: number;
  }> = ({ formation, progress }) => (
    <Pressable className="bg-white rounded-xl p-4 shadow-sm mr-4 w-72">
      <View className="h-32 bg-gray-200 rounded-lg mb-3" />
      <Text className="font-semibold text-[#2C3E50] mb-1" numberOfLines={2}>
        {formation.title}
      </Text>
      <Text className="text-[#7F8C8D] text-sm mb-2">
        {formation.formateur?.name || 'Formateur'}
      </Text>
      {progress !== undefined && (
        <View className="mb-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-[#7F8C8D]">
              {language === 'fr' ? 'Progression' : 'Progress'}
            </Text>
            <Text className="text-xs text-[#7F8C8D]">{progress}%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full">
            <View 
              className="h-2 bg-[#1ABC9C] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      )}
      <View className="flex-row items-center justify-between">
        <Text className="text-[#FF6B35] font-semibold">
          ${formation.price || 99}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#F39C12" />
          <Text className="text-[#7F8C8D] text-sm ml-1">
            {formation.rating || 4.8}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const AtelierCard: React.FC<{ atelier: any }> = ({ atelier }) => (
    <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-semibold text-[#2C3E50] mb-1">
            {atelier.title}
          </Text>
          <Text className="text-[#7F8C8D] text-sm mb-2">
            {language === 'fr' ? 'Par' : 'By'} {atelier.instructor}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#7F8C8D" />
            <Text className="text-[#7F8C8D] text-sm ml-1">
              {atelier.date} à {atelier.time}
            </Text>
          </View>
        </View>
        <AcademieButton
          title={language === 'fr' ? 'Rejoindre' : 'Join'}
          onPress={() => {}}
          variant="outline"
          size="sm"
        />
      </View>
    </View>
  );

  const BadgeItem: React.FC<{ badge: any }> = ({ badge }) => (
    <View className="items-center mr-4">
      <View className="w-16 h-16 bg-[#FF6B35] rounded-full items-center justify-center mb-2">
        <Ionicons name="trophy" size={24} color="white" />
      </View>
      <Text className="text-xs text-[#2C3E50] text-center" numberOfLines={2}>
        {badge.name}
      </Text>
    </View>
  );

  console.log('[StudentDashboard] Rendering StudentDashboard');

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-zvolskiy-1570807.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showLogout
          onLogoutPress={onNavigateToProfile}
        />
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View className="px-6 py-4">
            <ReadableText style={{ fontSize: 24, fontWeight: 'bold', color: currentTheme.text, marginBottom: 8 }}>
              {t('welcome', language)}, {getUserDisplayName()}!
            </ReadableText>
            <ReadableText style={{ color: currentTheme.textSecondary }}>
              {language === 'fr' 
                ? 'Continuez votre parcours d\'excellence' 
                : 'Continue your journey of excellence'}
            </ReadableText>
          </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row space-x-3">
            <StatCard
              title={language === 'fr' ? 'Formations actives' : 'Active courses'}
              value={activeFormations.length.toString()}
              icon="book-outline"
              color="#1ABC9C"
            />
            <StatCard
              title={language === 'fr' ? 'Badges obtenus' : 'Badges earned'}
              value={userBadges.length.toString()}
              icon="trophy-outline"
              color="#F39C12"
            />
          </View>
        </View>

        {/* Active Formations */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold text-[#2C3E50]">
              {t('myActiveFormations', language)}
            </Text>
            <Pressable onPress={onNavigateToCatalog}>
              <Text className="text-[#FF6B35] font-medium">
                {language === 'fr' ? 'Voir tout' : 'See all'}
              </Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24 }}
          >
            {activeFormations.length > 0 ? (
              activeFormations.map((formation, index) => (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  progress={Math.floor(Math.random() * 80) + 10}
                />
              ))
            ) : (
              <View className="w-72 h-48 bg-white rounded-xl p-4 shadow-sm items-center justify-center">
                <Ionicons name="book-outline" size={48} color="#7F8C8D" />
                <Text className="text-[#7F8C8D] text-center mt-2">
                  {language === 'fr' 
                    ? 'Aucune formation active\nCommencez votre parcours !' 
                    : 'No active courses\nStart your journey!'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recommended Formations */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold text-[#2C3E50]">
              {t('recommendedFormations', language)}
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24 }}
          >
            {recommendedFormations.map((formation) => (
              <FormationCard key={formation.id} formation={formation} />
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Workshops */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-[#2C3E50] mb-4">
            {t('upcomingWorkshops', language)}
          </Text>
          {upcomingAteliers.map((atelier) => (
            <AtelierCard key={atelier.id} atelier={atelier} />
          ))}
        </View>

        {/* Progress & Badges */}
        <View className="mb-6">
          <View className="px-6 mb-4">
            <Text className="text-xl font-bold text-[#2C3E50]">
              {t('myProgress', language)}
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24 }}
          >
            {userBadges.length > 0 ? (
              userBadges.map((badge, index) => (
                <BadgeItem key={index} badge={badge} />
              ))
            ) : (
              <View className="w-72 items-center justify-center py-8">
                <Ionicons name="trophy-outline" size={48} color="#7F8C8D" />
                <Text className="text-[#7F8C8D] text-center mt-2">
                  {language === 'fr' 
                    ? 'Pas encore de badges\nTerminez des formations pour en gagner !' 
                    : 'No badges yet\nComplete courses to earn them!'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <AcademieButton
            title={t('searchFormation', language)}
            onPress={onNavigateToCatalog}
            variant="primary"
            size="lg"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-6 py-3 flex-row justify-around">
        <Pressable className="items-center py-2">
          <Ionicons name="home" size={24} color="#FF6B35" />
          <Text className="text-xs text-[#FF6B35] mt-1">{t('dashboard', language)}</Text>
        </Pressable>
        <Pressable onPress={onNavigateToCatalog} className="items-center py-2">
          <Ionicons name="book-outline" size={24} color="#7F8C8D" />
          <Text className="text-xs text-[#7F8C8D] mt-1">{t('catalog', language)}</Text>
        </Pressable>
        <Pressable className="items-center py-2">
          <Ionicons name="calendar-outline" size={24} color="#7F8C8D" />
          <Text className="text-xs text-[#7F8C8D] mt-1">{t('calendar', language)}</Text>
        </Pressable>
        <Pressable className="items-center py-2">
          <Ionicons name="chatbubble-outline" size={24} color="#7F8C8D" />
          <Text className="text-xs text-[#7F8C8D] mt-1">{t('messages', language)}</Text>
        </Pressable>
        <Pressable onPress={onNavigateToProfile} className="items-center py-2">
          <Ionicons name="person-outline" size={24} color="#7F8C8D" />
          <Text className="text-xs text-[#7F8C8D] mt-1">{t('profile', language)}</Text>
        </Pressable>
      </View>
      </View>
    </SubtleBackground>
  );
};