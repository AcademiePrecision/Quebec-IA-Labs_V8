import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface FormateurDashboardProps {
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const FormateurDashboard: React.FC<FormateurDashboardProps> = ({
  onNavigateToProfile,
  onLogout,
}) => {
  const { session, language } = useAuthStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Mock data for formateur
  const formateurProfile = session?.activeProfile as any;
  const mockStats = {
    monthlyRevenue: 3450,
    enrolledStudents: 89,
    contentApproved: 12,
    contentPending: 3,
    upcomingSessions: 8,
    averageRating: 4.7,
  };

  const mockContent = [
    {
      id: '1',
      title: 'Techniques de dégradé avancé',
      status: 'approved',
      enrollments: 45,
      revenue: 675,
      submittedAt: '2024-11-15',
    },
    {
      id: '2',
      title: 'Coupe moderne pour hommes',
      status: 'pending',
      enrollments: 0,
      revenue: 0,
      submittedAt: '2024-12-05',
    },
    {
      id: '3',
      title: 'Taille de barbe professionnelle',
      status: 'revision_needed',
      enrollments: 0,
      revenue: 0,
      submittedAt: '2024-12-01',
      reviewComments: 'Ajouter plus de détails sur les outils nécessaires',
    },
  ];

  const mockAvailability = [
    { day: 'Lundi', slots: '09:00-12:00, 14:00-17:00' },
    { day: 'Mardi', slots: '09:00-12:00' },
    { day: 'Mercredi', slots: 'Indisponible' },
    { day: 'Jeudi', slots: '14:00-17:00' },
    { day: 'Vendredi', slots: '09:00-12:00, 14:00-17:00' },
  ];

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: string; 
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statsCard, { flex: 1, marginRight: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}20`,
        }}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
      </View>
      <Text style={[styles.statsValue, { color, marginBottom: 4 }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.statsLabel}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statsLabel, { marginTop: 4 }]}>{subtitle}</Text>
      )}
    </View>
  );

  const ContentCard: React.FC<{ content: any }> = ({ content }) => (
    <View style={[styles.card, { marginBottom: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={[styles.subtitle, { flex: 1, marginRight: 8, marginBottom: 0 }]}>{content.title}</Text>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: content.status === 'approved' ? '#E8F5E8' :
            content.status === 'pending' ? '#FFF8E1' : '#FFEBEE'
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: content.status === 'approved' ? '#2E7D32' :
              content.status === 'pending' ? '#F57C00' : '#C62828'
          }}>
            {content.status === 'approved' ? 'Approuvé' :
             content.status === 'pending' ? 'En attente' : 'Révision requise'}
          </Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.caption}>
          {content.enrollments} inscriptions • ${content.revenue} revenus
        </Text>
        <Text style={[styles.caption, { fontSize: 12 }]}>
          Soumis le {new Date(content.submittedAt).toLocaleDateString('fr-CA')}
        </Text>
      </View>

      {content.reviewComments && (
        <View style={{
          backgroundColor: theme === 'dark' ? '#4A1A1A' : '#FEF2F2',
          padding: 12,
          borderRadius: 8,
          marginTop: 8
        }}>
          <Text style={{
            color: theme === 'dark' ? '#FCA5A5' : '#DC2626',
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4
          }}>Commentaires:</Text>
          <Text style={{
            color: theme === 'dark' ? '#FCA5A5' : '#DC2626',
            fontSize: 14
          }}>{content.reviewComments}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-lorentzworks-668196.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showLogout
          onLogoutPress={onNavigateToProfile}
          title={language === 'fr' ? 'Dashboard Formateur' : 'Trainer Dashboard'}
        />
        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Welcome Section */}
          <View className="px-6 py-4">
            <ReadableText style={[styles.title, { marginBottom: 8, textAlign: 'left' }]}>
              {language === 'fr' ? 'Bonjour' : 'Hello'}, {session?.account.firstName}!
            </ReadableText>
            <ReadableText style={styles.caption}>
              {language === 'fr' 
                ? 'Gérez votre contenu et vos disponibilités' 
                : 'Manage your content and availability'}
            </ReadableText>
          </View>

        {/* Quick Stats */}
        <View className="px-6 mb-6">
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Performances ce mois' : 'This month performance'}
          </Text>
          <View className="flex-row mb-4">
            <StatCard
              title={language === 'fr' ? 'Revenus' : 'Revenue'}
              value={`$${mockStats.monthlyRevenue}`}
              icon="cash"
              color="#27AE60"
            />
            <StatCard
              title={language === 'fr' ? 'Étudiants' : 'Students'}
              value={mockStats.enrolledStudents}
              icon="people"
              color="#3498DB"
            />
          </View>
          <View className="flex-row">
            <StatCard
              title={language === 'fr' ? 'Contenu approuvé' : 'Approved content'}
              value={mockStats.contentApproved}
              icon="checkmark-circle"
              color="#1ABC9C"
            />
            <StatCard
              title={language === 'fr' ? 'Note moyenne' : 'Average rating'}
              value={`${mockStats.averageRating}/5`}
              icon="star"
              color="#F39C12"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </Text>
          <View className="flex-row space-x-3 mb-3">
            <AcademieButton
              title={language === 'fr' ? 'Nouveau Contenu' : 'New Content'}
              onPress={() => console.log('Navigate to content creation')}
              variant="primary"
              size="md"
              className="flex-1"
            />
            <AcademieButton
              title={language === 'fr' ? 'Mes Disponibilités' : 'My Availability'}
              onPress={() => console.log('Navigate to availability')}
              variant="outline"
              size="md"
              className="flex-1"
            />
          </View>
        </View>

        {/* Content Management */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 0 }]}>
              {language === 'fr' ? 'Mon Contenu' : 'My Content'}
            </Text>
            <Pressable>
              <Text style={styles.primaryText}>
                {language === 'fr' ? 'Voir tout' : 'View all'}
              </Text>
            </Pressable>
          </View>
          
          {mockContent.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </View>

        {/* Availability Schedule */}
        <View className="px-6 mb-6">
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Mes Disponibilités' : 'My Availability'}
          </Text>
          <View style={styles.card}>
            {mockAvailability.map((item, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < mockAvailability.length - 1 ? 1 : 0,
                borderBottomColor: theme === 'dark' ? '#333333' : '#F3F4F6'
              }}>
                <Text style={styles.subtitle}>{item.day}</Text>
                <Text style={[
                  styles.caption,
                  { color: item.slots === 'Indisponible' ? '#EF4444' : styles.caption.color }
                ]}>
                  {item.slots}
                </Text>
              </View>
            ))}
            <Pressable style={{ marginTop: 16, paddingVertical: 8 }}>
              <Text style={[styles.primaryText, { textAlign: 'center', fontWeight: '500' }]}>
                {language === 'fr' ? 'Modifier les disponibilités' : 'Edit availability'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View className="px-6 mb-8">
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Prochaines Sessions' : 'Upcoming Sessions'}
          </Text>
          <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="calendar-outline" size={48} color={theme === 'dark' ? '#7F8C8D' : '#7F8C8D'} />
              <Text style={[styles.caption, { textAlign: 'center', marginTop: 8 }]}>
                {language === 'fr' 
                  ? `${mockStats.upcomingSessions} sessions programmées cette semaine`
                  : `${mockStats.upcomingSessions} sessions scheduled this week`
                }
              </Text>
              <Pressable style={{ marginTop: 12 }}>
                <Text style={[styles.primaryText, { fontWeight: '500' }]}>
                  {language === 'fr' ? 'Voir le calendrier' : 'View calendar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};