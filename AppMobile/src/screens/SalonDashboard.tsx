import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useUIStore } from '../state/uiStore';
import { usePaymentStore } from '../state/paymentStore';
import { t } from '../utils/translations';
import { mockSalonDashboardData } from '../utils/salonMockData';
import { SalonDashboardData, SalonAnalytics, FormateurPerformance, ContentSubmission } from '../types/salon';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface SalonDashboardProps {
  onNavigateToProfile: () => void;
  onLogout: () => void;
  onNavigateToAIValet?: () => void;
  onNavigateToValetLanding?: () => void;
}

export const SalonDashboard: React.FC<SalonDashboardProps> = ({
  onNavigateToProfile,
  onLogout,
  onNavigateToAIValet,
  onNavigateToValetLanding,
}) => {
  const { session, language } = useAuthStore();
  const { showToast } = useUIStore();
  const { currentSubscription } = usePaymentStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  
  const [dashboardData, setDashboardData] = useState<SalonDashboardData>(mockSalonDashboardData);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setDashboardData(mockSalonDashboardData);
      setRefreshing(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatLargeNumber = (number: number): string => {
    if (number >= 1000000) {
      return `${Math.floor(number / 1000000)}M`;
    } else if (number >= 1000) {
      return `${Math.floor(number / 1000)}K`;
    }
    return number.toString();
  };

  const handleApproveContent = (contentId: string) => {
    showToast(
      language === 'fr' ? 'Contenu approuvé avec succès' : 'Content approved successfully',
      'success'
    );
  };

  const handleRejectContent = (contentId: string) => {
    showToast(
      language === 'fr' ? 'Contenu rejeté' : 'Content rejected',
      'info'
    );
  };

  const handleRequestRevision = (contentId: string) => {
    showToast(
      language === 'fr' ? 'Révision demandée' : 'Revision requested',
      'warning'
    );
  };

  // Revenue Analytics Card
  const RevenueCard: React.FC<{ data: SalonAnalytics }> = ({ data }) => (
    <View style={[styles.card, { marginBottom: 16 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={[styles.subtitle, { marginBottom: 0 }]}>
          {language === 'fr' ? 'Revenus Salon' : 'Salon Revenue'} ({data.period === 'week' ? 'Sem.' : 
           data.period === 'month' ? 'Mois' : data.period === 'quarter' ? 'Trim.' : 'Année'})
        </Text>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: data.growth >= 0 ? 
            (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
            (theme === 'dark' ? '#4A1A1A' : '#FEE2E2')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: data.growth >= 0 ? 
              (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
              (theme === 'dark' ? '#FCA5A5' : '#DC2626')
          }}>
            {formatPercentage(data.growth)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.statsValue, { fontSize: 32, marginBottom: 16 }]}>
        {formatCurrency(data.totalRevenue)}
      </Text>
      
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.caption}>Royautés Contenu</Text>
          <Text style={[styles.text, { fontWeight: '600' }]}>{formatCurrency(data.contentRoyalties)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.caption}>Ateliers</Text>
          <Text style={[styles.text, { fontWeight: '600' }]}>{formatCurrency(data.workshopRevenue)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.caption}>Location Espaces</Text>
          <Text style={[styles.text, { fontWeight: '600' }]}>{formatCurrency(data.spaceRental)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.caption}>Bonus Partenariat</Text>
          <Text style={[styles.text, { fontWeight: '600' }]}>{formatCurrency(data.partnershipBonus)}</Text>
        </View>
        <View style={{
          borderTopWidth: 1,
          borderTopColor: theme === 'dark' ? '#333333' : '#E5E7EB',
          paddingTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <Text style={styles.caption}>Minutes visionnées</Text>
          <Text style={{ color: '#1ABC9C', fontWeight: 'bold' }}>{Math.floor(data.totalViewingMinutes).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  // Period Selector
  const PeriodSelector = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F3F4F6',
      borderRadius: 8,
      padding: 4,
      marginBottom: 16
    }}>
      {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
        <Pressable
          key={period}
          onPress={() => setSelectedPeriod(period)}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: selectedPeriod === period ? styles.card.backgroundColor : 'transparent',
            shadowColor: selectedPeriod === period ? (theme === 'dark' ? '#000' : '#000') : undefined,
            shadowOffset: selectedPeriod === period ? { width: 0, height: 1 } : undefined,
            shadowOpacity: selectedPeriod === period ? (theme === 'dark' ? 0.3 : 0.1) : undefined,
            shadowRadius: selectedPeriod === period ? 2 : undefined,
            elevation: selectedPeriod === period ? 1 : undefined,
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '500',
            color: selectedPeriod === period ? styles.primaryText.color : styles.caption.color
          }}>
            {period === 'week' ? 'Sem.' : period === 'month' ? 'Mois' : 
             period === 'quarter' ? 'Trim.' : 'Année'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // Stats Card
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

  // Formateur Performance Card
  const FormateurCard: React.FC<{ formateur: FormateurPerformance }> = ({ formateur }) => (
    <View style={[styles.card, { marginBottom: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 48,
            height: 48,
            backgroundColor: styles.statsValue.color,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {formateur.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.text, { fontWeight: '600' }]}>{formateur.name}</Text>
            <Text style={styles.caption}>{formateur.specialties.join(', ')}</Text>
          </View>
        </View>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: formateur.status === 'active' ? 
            (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
            formateur.status === 'pending' ? 
            (theme === 'dark' ? '#4A3B1B' : '#FEF3C7') : 
            (theme === 'dark' ? '#374151' : '#F3F4F6')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: formateur.status === 'active' ? 
              (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
              formateur.status === 'pending' ? 
              (theme === 'dark' ? '#FDE047' : '#D97706') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
          }}>
            {formateur.status === 'active' ? 'Actif' : 
             formateur.status === 'pending' ? 'En attente' : 'Inactif'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.caption, { fontSize: 12 }]}>Revenus</Text>
          <Text style={{ fontWeight: 'bold', color: '#27AE60' }}>{formatCurrency(formateur.totalRevenue)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.caption, { fontSize: 12 }]}>Minutes vues</Text>
          <Text style={[styles.text, { fontWeight: '600' }]}>{Math.floor(formateur.viewingMinutes).toLocaleString()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.caption, { fontSize: 12 }]}>Note</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color="#F39C12" />
            <Text style={[styles.text, { fontWeight: '600', marginLeft: 4 }]}>{formateur.averageRating}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.caption}>
          {formateur.contentCount} contenus • {formateur.studentsCount} étudiants
        </Text>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
          backgroundColor: formateur.monthlyGrowth >= 0 ? 
            (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
            (theme === 'dark' ? '#4A1A1A' : '#FEE2E2')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: formateur.monthlyGrowth >= 0 ? 
              (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
              (theme === 'dark' ? '#FCA5A5' : '#DC2626')
          }}>
            {formatPercentage(formateur.monthlyGrowth)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Content Approval Card
  const ContentApprovalCard: React.FC<{ content: ContentSubmission }> = ({ content }) => (
    <View style={[styles.card, { marginBottom: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.text, { fontWeight: '600', marginBottom: 4 }]}>{content.title}</Text>
          <Text style={[styles.caption, { marginBottom: 8 }]} numberOfLines={2}>
            {content.description}
          </Text>
          <Text style={styles.caption}>
            Par {content.formateurName} • {formatDuration(content.duration)} • {formatCurrency(content.expectedPrice)}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: content.status === 'pending' ? 
            (theme === 'dark' ? '#4A3B1B' : '#FEF3C7') :
            content.status === 'revision_needed' ? 
            (theme === 'dark' ? '#4A2F1B' : '#FFEDD5') : 
            (theme === 'dark' ? '#374151' : '#F3F4F6')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: content.status === 'pending' ? 
              (theme === 'dark' ? '#FDE047' : '#D97706') :
              content.status === 'revision_needed' ? 
              (theme === 'dark' ? '#FB923C' : '#EA580C') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
          }}>
            {content.status === 'pending' ? 'En attente' :
             content.status === 'revision_needed' ? 'Révision' : content.status}
          </Text>
        </View>
      </View>

      {content.reviewComments && (
        <View style={{
          backgroundColor: theme === 'dark' ? '#4A2F1B' : '#FFEDD5',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12
        }}>
          <Text style={{
            color: theme === 'dark' ? '#FB923C' : '#EA580C',
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4
          }}>Commentaires:</Text>
          <Text style={{
            color: theme === 'dark' ? '#FB923C' : '#EA580C',
            fontSize: 14
          }}>{content.reviewComments}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <AcademieButton
            title="Approuver"
            onPress={() => handleApproveContent(content.id)}
            variant="primary"
            size="sm"
          />
        </View>
        <View style={{ flex: 1 }}>
          <AcademieButton
            title="Révision"
            onPress={() => handleRequestRevision(content.id)}
            variant="outline"
            size="sm"
          />
        </View>
        <Pressable 
          onPress={() => handleRejectContent(content.id)}
          style={{
            flex: 1,
            backgroundColor: '#EF4444',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: '500', fontSize: 14 }}>Rejeter</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-nickoloui-1319459.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showLogout
          onLogoutPress={onNavigateToProfile}
          title={language === 'fr' ? 'Dashboard Salon' : 'Salon Dashboard'}
        />
        
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Welcome Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            <ReadableText style={{ 
              textAlign: 'left', 
              marginBottom: 8, 
              fontSize: 34, // PLUS GROS comme demandé
              fontWeight: 'bold',
              // Force couleurs - PAS de styles.title qui écrase
              color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A', // BLANC en sombre, noir en clair
              // Enhanced readability with stronger shadow
              textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}>
              {language === 'fr' ? 'Bonjour' : 'Hello'}, {session?.account.firstName}!
            </ReadableText>
            <ReadableText style={{
              fontSize: 18, // Plus GROS pour lisibilité
              fontWeight: 'bold', // Plus GRAS pour lisibilité  
              // Force couleur #ChicRebel harmonieuse
              color: theme === 'dark' ? '#FF6B35' : '#E85D75', // Orange en sombre, Corail Fumé en clair
              textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}>
              {language === 'fr' 
                ? 'Gérez votre salon et vos formateurs partenaires' 
                : 'Manage your salon and partner trainers'}
            </ReadableText>
            
            {/* Bouton Valet IA */}
            {onNavigateToAIValet && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                {/* Badge orange cliquable PLUS POPULAIRE style */}
                <TouchableOpacity 
                  onPress={onNavigateToAIValet}
                  style={{
                    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#7C3AED', // Violet Royal PRECISION LUXE
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Marcel • Là pour vous ✂️
                  </Text>
                </TouchableOpacity>
                <ReadableText style={{
                  textAlign: 'center', 
                  marginTop: 8, 
                  fontStyle: 'italic',
                  fontSize: 14,
                  // Force couleur sans styles.caption qui écrase
                  color: theme === 'dark' ? '#E0E0E0' : '#2D3748', // Gris clair en sombre, PLUS FONCÉ en clair
                  textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {language === 'fr' 
                    ? 'Intelligence artificielle qui gère 100% de vos appels 24/7' 
                    : 'AI that handles 100% of your calls 24/7'}
                </ReadableText>
              </View>
            )}
            
            {/* Bouton Landing Page Valet-IA */}
            {onNavigateToValetLanding && (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                {/* Badge vert cliquable ACADÉMIE style */}
                <TouchableOpacity 
                  onPress={onNavigateToValetLanding}
                  style={{
                    backgroundColor: '#FF6B35', // Orange comme ProfileSelector
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 14, // PLUS GROSSE
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {language === 'fr' 
                      ? "📱 Découvrir l'offre Valet-IA complète" 
                      : "📱 Discover the complete Valet-AI offer"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        {/* Revenue Analytics */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Analytics de Revenus' : 'Revenue Analytics'}
          </Text>
          <PeriodSelector />
          <RevenueCard data={dashboardData.analytics[selectedPeriod]} />
        </View>

        {/* Key Metrics */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Métriques Clés' : 'Key Metrics'}
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <StatCard
              title={language === 'fr' ? 'Minutes visionnées' : 'Total viewing minutes'}
              value={formatLargeNumber(dashboardData.totalViewingMinutes)}
              icon="play-circle"
              color="#3498DB"
            />
            <StatCard
              title={language === 'fr' ? 'Formateurs actifs' : 'Active trainers'}
              value={dashboardData.activeFormateurs}
              icon="people"
              color="#1ABC9C"
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <StatCard
              title={language === 'fr' ? 'En attente d\'approbation' : 'Pending approvals'}
              value={dashboardData.pendingApprovals}
              icon="hourglass"
              color="#F39C12"
            />
            <StatCard
              title={language === 'fr' ? 'Étudiants actifs' : 'Active students'}
              value={dashboardData.analytics[selectedPeriod].activeStudents}
              icon="school"
              color="#9B59B6"
            />
          </View>
        </View>

        {/* Content Approvals */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Approbations de Contenu' : 'Content Approvals'}
          </Text>
          {dashboardData.pendingContent.length > 0 ? (
            dashboardData.pendingContent.map((content) => (
              <ContentApprovalCard key={content.id} content={content} />
            ))
          ) : (
            <View style={[styles.card, { alignItems: 'center' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#1ABC9C" />
              <Text style={[styles.caption, { textAlign: 'center', marginTop: 8 }]}>
                {language === 'fr' 
                  ? 'Aucun contenu en attente d\'approbation'
                  : 'No content pending approval'}
              </Text>
            </View>
          )}
        </View>

        {/* Formateurs Performance */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Performance des Formateurs' : 'Trainers Performance'}
          </Text>
          {dashboardData.formateurs.map((formateur) => (
            <FormateurCard key={formateur.id} formateur={formateur} />
          ))}
        </View>

        {/* Revenue Breakdown */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Répartition des Revenus' : 'Revenue Breakdown'}
          </Text>
          <View style={styles.card}>
            {dashboardData.revenueBreakdown.map((source, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: index < dashboardData.revenueBreakdown.length - 1 ? 1 : 0,
                borderBottomColor: theme === 'dark' ? '#333333' : '#F3F4F6'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{source.source}</Text>
                  <Text style={styles.caption}>{source.description}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.text, { fontWeight: 'bold' }]}>{formatCurrency(source.amount)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.caption, { marginRight: 8 }]}>{source.percentage}%</Text>
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: source.growth >= 0 ? 
                        (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
                        (theme === 'dark' ? '#4A1A1A' : '#FEE2E2')
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: source.growth >= 0 ? 
                          (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
                          (theme === 'dark' ? '#FCA5A5' : '#DC2626')
                      }}>
                        {formatPercentage(source.growth)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Royalty Distribution */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16 }]}>
            {language === 'fr' ? 'Distribution des Royautés' : 'Royalty Distribution'}
          </Text>
          <View style={styles.card}>
            {dashboardData.royaltyDistributions.map((distribution, index) => (
              <View key={index} style={{
                paddingVertical: 12,
                borderBottomWidth: index < dashboardData.royaltyDistributions.length - 1 ? 1 : 0,
                borderBottomColor: theme === 'dark' ? '#333333' : '#F3F4F6'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.text, { fontWeight: '500' }]}>{distribution.contentTitle}</Text>
                    <Text style={styles.caption}>Par {distribution.formateurName}</Text>
                  </View>
                  <Text style={styles.caption}>{distribution.period}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.caption}>
                    {Math.floor(distribution.totalMinutes).toLocaleString()} min • {formatCurrency(distribution.totalRevenue)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.caption, { fontSize: 12 }]}>Salon (60%)</Text>
                      <Text style={{ fontWeight: '600', color: styles.statsValue.color }}>{formatCurrency(distribution.salonShare)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.caption, { fontSize: 12 }]}>Formateur (40%)</Text>
                      <Text style={{ fontWeight: '600', color: '#1ABC9C' }}>{formatCurrency(distribution.formateurShare)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};