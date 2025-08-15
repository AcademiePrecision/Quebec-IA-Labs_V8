import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useAppStore } from '../state/appStore';
import { t } from '../utils/translations';
import { Formation } from '../types';
import { mockFormations } from '../utils/mockData';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles, getPlaceholderColor } from '../utils/screenTheming';

interface CatalogScreenProps {
  onBack: () => void;
  onViewFormation: (formation: Formation) => void;
}



export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  onBack,
  onViewFormation,
}) => {
  const { language } = useAuthStore();
  const { setFormations } = useAppStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  // Initialize mock data
  React.useEffect(() => {
    setFormations(mockFormations);
  }, [setFormations]);

  const categories = [
    { id: 'all', name: language === 'fr' ? 'Toutes' : 'All' },
    { id: 'barbier', name: t('barbier', language) },
    { id: 'mecanique', name: t('mecanique', language) },
    { id: 'electricite', name: t('electricite', language) },
  ];

  const levels = [
    { id: 'all', name: language === 'fr' ? 'Tous niveaux' : 'All levels' },
    { id: 'debutant', name: t('beginner', language) },
    { id: 'intermediaire', name: t('intermediate', language) },
    { id: 'avance', name: t('advanced', language) },
  ];

  const sortOptions = [
    { id: 'rating', name: language === 'fr' ? 'Note' : 'Rating' },
    { id: 'price', name: t('price', language) },
    { id: 'duration', name: t('duration', language) },
  ];

  const filteredFormations = mockFormations
    .filter(formation => {
      const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           formation.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || formation.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || formation.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  const FilterChip: React.FC<{
    selected: boolean;
    onPress: () => void;
    children: React.ReactNode;
  }> = ({ selected, onPress, children }) => (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          marginRight: 12,
          borderWidth: selected ? 0 : 1,
        },
        selected 
          ? { backgroundColor: styles.statsValue.color }
          : { 
              backgroundColor: styles.card.backgroundColor, 
              borderColor: getPlaceholderColor(theme) 
            }
      ]}
    >
      <Text style={[
        styles.caption,
        {
          fontWeight: '500',
          color: selected ? 'white' : styles.body.color
        }
      ]}>
        {children}
      </Text>
    </Pressable>
  );

  const FormationCard: React.FC<{ formation: Formation }> = ({ formation }) => (
    <Pressable 
      onPress={() => onViewFormation(formation)}
      style={[styles.card, { marginBottom: 16 }]}
    >
      {/* Thumbnail placeholder */}
      <View style={{
        height: 160,
        backgroundColor: getPlaceholderColor(theme),
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: theme === 'dark' ? 0.3 : 0.2,
      }}>
        <Ionicons name="play-circle" size={48} color={styles.body.color} />
      </View>

      {/* Formation info */}
      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.subtitle, { marginBottom: 4 }]} numberOfLines={2}>
          {formation.title}
        </Text>
        <Text style={[styles.caption, { marginBottom: 8 }]} numberOfLines={2}>
          {formation.description}
        </Text>
        
        {/* Instructor info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: styles.statsValue.color,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {formation.formateur.name.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.body, { fontWeight: '500', flex: 1 }]}>
            {formation.formateur.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color="#F39C12" />
            <Text style={[styles.caption, { marginLeft: 4 }]}>
              {formation.formateur.rating}
            </Text>
          </View>
        </View>

        {/* Level and category badges */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={{
            backgroundColor: '#1ABC9C',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginRight: 8,
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              {formation.level.charAt(0).toUpperCase() + formation.level.slice(1)}
            </Text>
          </View>
          <View style={{
            backgroundColor: '#3498DB',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              {formation.category.charAt(0).toUpperCase() + formation.category.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-[#FF6B35] font-bold text-lg mr-4">
            ${formation.price}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#7F8C8D" />
            <Text className="text-[#7F8C8D] text-sm ml-1">
              {formation.duration}h
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#F39C12" />
          <Text className="text-[#7F8C8D] text-sm ml-1">
            {formation.rating} ({formation.reviewCount})
          </Text>
        </View>
      </View>

      <AcademieButton
        title={t('viewDetails', language)}
        onPress={() => onViewFormation(formation)}
        variant="outline"
        size="sm"
        className="mt-3"
      />
    </Pressable>
  );

  return (
    <SubtleBackground intensity="medium" imageSource={require('../../assets/splash/pexels-joshsorenson-995300.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={t('catalog', language)}
        />
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-6 py-4">
          <View style={[styles.textInput, { flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="search" size={20} color={getPlaceholderColor(theme)} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={language === 'fr' ? 'Rechercher une formation...' : 'Search for a course...'}
              placeholderTextColor={getPlaceholderColor(theme)}
              style={[styles.body, { flex: 1, marginLeft: 12, padding: 0 }]}
            />
          </View>
        </View>

        {/* Filters */}
        <View className="px-6 mb-4">
          <ReadableText style={[styles.subtitle, { marginBottom: 12 }]}>
            {t('filters', language)}
          </ReadableText>
          
          {/* Categories */}
          <ReadableText style={[styles.label, { marginBottom: 8 }]}>
            {t('specialty', language)}
          </ReadableText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {categories.map(category => (
              <FilterChip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </FilterChip>
            ))}
          </ScrollView>

          {/* Levels */}
          <ReadableText style={[styles.label, { marginBottom: 8 }]}>
            {t('level', language)}
          </ReadableText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {levels.map(level => (
              <FilterChip
                key={level.id}
                selected={selectedLevel === level.id}
                onPress={() => setSelectedLevel(level.id)}
              >
                {level.name}
              </FilterChip>
            ))}
          </ScrollView>

          {/* Sort */}
          <ReadableText style={[styles.label, { marginBottom: 8 }]}>
            {language === 'fr' ? 'Trier par' : 'Sort by'}
          </ReadableText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOptions.map(option => (
              <FilterChip
                key={option.id}
                selected={sortBy === option.id}
                onPress={() => setSortBy(option.id)}
              >
                {option.name}
              </FilterChip>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <View className="px-6">
          <ReadableText style={[styles.subtitle, { marginBottom: 16, fontSize: 18, fontWeight: 'bold' }]}>
            {language === 'fr' 
              ? `${filteredFormations.length} formation(s) trouvée(s)`
              : `${filteredFormations.length} course(s) found`
            }
          </ReadableText>

          {filteredFormations.length > 0 ? (
            filteredFormations.map(formation => (
              <FormationCard key={formation.id} formation={formation} />
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons name="search" size={64} color="#7F8C8D" />
              <ReadableText style={[styles.caption, { textAlign: 'center', marginTop: 16 }]}>
                {language === 'fr' 
                  ? 'Aucune formation trouvée\navec ces critères'
                  : 'No courses found\nwith these criteria'
                }
              </ReadableText>
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};