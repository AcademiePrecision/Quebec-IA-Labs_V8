import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AcademieButton } from '../components/AcademieButton';
import { SubtleBackground } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { t } from '../utils/translations';
import { mockAdminDashboardData } from '../utils/adminMockData';
import { AdminDashboardData, RevenueAnalytics } from '../types/admin';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface AdminDashboardProps {
  onNavigateToProfile: () => void;
  onNavigateToAccounts: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToProfile,
  onNavigateToAccounts,
  onLogout,
}) => {
  const { session, language } = useAuthStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(mockAdminDashboardData);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setDashboardData(mockAdminDashboardData);
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

  const formatLargeNumber = (number: number): string => {
    if (number >= 1000000) {
      return `${Math.floor(number / 1000000)}M`;
    } else if (number >= 1000) {
      return `${Math.floor(number / 1000)}K`;
    }
    return number.toString();
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}min`;
  };

  // Revenue Analytics Card - Redesigned as primary hero card
  const RevenueCard: React.FC<{ data: RevenueAnalytics }> = ({ data }) => (
    <View style={[styles.card, { marginBottom: 16, padding: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 40,
            height: 40,
            backgroundColor: '#8B5CF6',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Ionicons name="trending-up" size={20} color="white" />
          </View>
          <View>
            <Text style={[styles.caption, { fontSize: 12 }]}>
              {language === 'fr' ? 'Revenus Totaux' : 'Total Revenue'}
            </Text>
            <Text style={[styles.caption, { fontSize: 10 }]}>
              {data.period === 'week' ? 'Cette semaine' : 
               data.period === 'month' ? 'Ce mois' : data.period === 'quarter' ? 'Ce trimestre' : 'Cette année'}
            </Text>
          </View>
        </View>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: data.growth >= 0 ? 
            (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
            (theme === 'dark' ? '#4A1A1A' : '#FEE2E2')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: data.growth >= 0 ? 
              (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
              (theme === 'dark' ? '#FCA5A5' : '#DC2626')
          }}>
            {formatPercentage(data.growth)}
          </Text>
        </View>
      </View>
      
      <Text style={{
        fontSize: 36,
        fontWeight: 'black',
        color: '#8B5CF6',
        marginBottom: 16
      }}>
        {formatCurrency(data.totalRevenue)}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.caption, { fontSize: 10 }]}>Ateliers</Text>
          <Text style={[styles.text, { fontWeight: '600', fontSize: 14 }]}>{formatCurrency(data.workshopRevenue)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.caption, { fontSize: 10 }]}>Abonnements</Text>
          <Text style={[styles.text, { fontWeight: '600', fontSize: 14 }]}>{formatCurrency(data.subscriptionRevenue)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.caption, { fontSize: 10 }]}>Partenariats</Text>
          <Text style={[styles.text, { fontWeight: '600', fontSize: 14 }]}>{formatCurrency(data.partnershipRevenue)}</Text>
        </View>
      </View>
    </View>
  );

  // Quick Actions Card - New component for admin efficiency
  const QuickActionsCard = () => (
    <View style={[styles.card, { marginBottom: 16, padding: 16 }]}>
      <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 16 }]}>
        {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          marginHorizontal: 4,
          borderRadius: 8,
          backgroundColor: theme === 'dark' ? '#1E40AF20' : '#DBEAFE'
        }}>
          <Ionicons name="person-add" size={20} color="#3B82F6" />
          <Text style={[styles.caption, { fontSize: 10, marginTop: 4 }]}>Nouveau</Text>
        </Pressable>
        <Pressable style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          marginHorizontal: 4,
          borderRadius: 8,
          backgroundColor: theme === 'dark' ? '#DC262620' : '#FEE2E2'
        }}>
          <Ionicons name="checkmark-circle" size={20} color="#DC2626" />
          <Text style={[styles.caption, { fontSize: 10, marginTop: 4 }]}>Approuver</Text>
        </Pressable>
        <Pressable style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          marginHorizontal: 4,
          borderRadius: 8,
          backgroundColor: theme === 'dark' ? '#F5971120' : '#FEF3C7'
        }}>
          <Ionicons name="analytics" size={20} color="#F59E0B" />
          <Text style={[styles.caption, { fontSize: 10, marginTop: 4 }]}>Rapports</Text>
        </Pressable>
        <Pressable style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          marginHorizontal: 4,
          borderRadius: 8,
          backgroundColor: theme === 'dark' ? '#6B728020' : '#F3F4F6'
        }}>
          <Ionicons name="settings" size={20} color="#6B7280" />
          <Text style={[styles.caption, { fontSize: 10, marginTop: 4 }]}>Config</Text>
        </Pressable>
      </View>
    </View>
  );

  // Period Selector - Compact version
  const PeriodSelector = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F3F4F6',
      borderRadius: 8,
      padding: 2,
      marginBottom: 12
    }}>
      {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
        <Pressable
          key={period}
          onPress={() => setSelectedPeriod(period)}
          style={{
            flex: 1,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 6,
            backgroundColor: selectedPeriod === period ? styles.card.backgroundColor : 'transparent',
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: '500',
            color: selectedPeriod === period ? '#8B5CF6' : styles.caption.color
          }}>
            {period === 'week' ? 'Sem.' : period === 'month' ? 'Mois' : 
             period === 'quarter' ? 'Trim.' : 'Année'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // Enhanced Stats Card with better hierarchy
  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: string; 
    color: string;
    subtitle?: string;
    size?: 'small' | 'medium' | 'large';
    priority?: 'high' | 'medium' | 'low';
  }> = ({ title, value, icon, color, subtitle, size = 'medium', priority = 'medium' }) => {
    const cardSize = {
      small: { padding: 12, iconSize: 16, titleSize: 16, valueSize: 20 },
      medium: { padding: 16, iconSize: 20, titleSize: 18, valueSize: 24 },
      large: { padding: 20, iconSize: 24, titleSize: 20, valueSize: 32 }
    }[size];

    const priorityStyle = {
      high: { 
        borderWidth: 2, 
        borderColor: color + '40',
        backgroundColor: theme === 'dark' ? color + '10' : color + '05'
      },
      medium: {},
      low: { opacity: 0.8 }
    }[priority];

    return (
      <View style={[
        styles.card, 
        { 
          flex: 1, 
          marginRight: 8, 
          padding: cardSize.padding,
          marginBottom: 8
        },
        priorityStyle
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{
            width: cardSize.iconSize + 16,
            height: cardSize.iconSize + 16,
            borderRadius: (cardSize.iconSize + 16) / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color + '20',
          }}>
            <Ionicons name={icon as any} size={cardSize.iconSize} color={color} />
          </View>
          {priority === 'high' && (
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#EF4444'
            }} />
          )}
        </View>
        <Text style={{
          fontSize: cardSize.valueSize,
          fontWeight: 'bold',
          color,
          marginBottom: 4
        }}>
          {typeof value === 'number' ? formatLargeNumber(value) : value}
        </Text>
        <Text style={[styles.caption, { fontSize: 11 }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.caption, { fontSize: 10, marginTop: 2 }]}>{subtitle}</Text>
        )}
      </View>
    );
  };

  // Critical Alerts Card - New component for urgent items
  const AlertsCard = () => {
    const alerts = [
      { type: 'approval', count: dashboardData.pendingApprovals.partners.length + dashboardData.pendingApprovals.formateurs.length, icon: 'hourglass', color: '#F59E0B' },
      { type: 'content', count: dashboardData.pendingApprovals.content.length, icon: 'document-text', color: '#EF4444' },
    ];

    return (
      <View style={[styles.card, { marginBottom: 16, padding: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={[styles.subtitle, { marginLeft: 8, marginBottom: 0, fontSize: 16, color: '#EF4444' }]}>
            {language === 'fr' ? 'Alertes Critiques' : 'Critical Alerts'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {alerts.map((alert, index) => (
            <View key={index} style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginHorizontal: 2,
              borderRadius: 8,
              backgroundColor: theme === 'dark' ? alert.color + '20' : alert.color + '10'
            }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: alert.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{alert.count}</Text>
              </View>
              <Text style={[styles.caption, { fontSize: 11 }]}>
                {alert.type === 'approval' ? 'Approbations' : 'Contenu'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Enhanced Pending Approval Card with better visual hierarchy
  const PendingApprovalCard: React.FC<{ 
    title: string; 
    count: number; 
    type: 'partners' | 'formateurs' | 'content';
    onPress: () => void;
  }> = ({ title, count, type, onPress }) => {
    const typeConfig = {
      partners: { icon: 'business', color: '#8B5CF6' },
      formateurs: { icon: 'school', color: '#06B6D4' },
      content: { icon: 'document-text', color: '#F97316' }
    }[type];

    const isUrgent = count > 5;

    return (
      <Pressable 
        onPress={onPress} 
        style={[
          styles.card, 
          { 
            marginBottom: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: isUrgent ? '#EF4444' : typeConfig.color
          }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: typeConfig.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.text, { fontWeight: '600', marginBottom: 2 }]}>{title}</Text>
              <Text style={[styles.caption, { fontSize: 12 }]}>
                {count} {language === 'fr' ? 'en attente' : 'pending'}
                {isUrgent && (
                  <Text style={{ color: '#EF4444', fontWeight: '600' }}> • Urgent</Text>
                )}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {count > 0 && (
              <View style={{
                minWidth: 24,
                height: 24,
                backgroundColor: isUrgent ? '#EF4444' : typeConfig.color,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                paddingHorizontal: 6
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{count}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={styles.caption.color} />
          </View>
        </View>
      </Pressable>
    );
  };

  // Activity Feed Item
  const ActivityItem: React.FC<{ item: any }> = ({ item }) => {
    const priorityColor = item.priority === 'high' ? '#E74C3C' : 
                         item.priority === 'medium' ? '#F39C12' : '#95A5A6';
    
    return (
      <View className="flex-row items-start py-3 border-b border-gray-100 last:border-b-0">
        <View 
          className="w-2 h-2 rounded-full mt-2 mr-3" 
          style={{ backgroundColor: priorityColor }}
        />
      <View className="flex-1">
        <Text className="font-medium text-[#2C3E50] text-sm">{item.title}</Text>
        <Text className="text-[#7F8C8D] text-xs mt-1">{item.description}</Text>
        <Text className="text-[#7F8C8D] text-xs mt-1">{getTimeAgo(item.timestamp)}</Text>
      </View>
    </View>
    );
  };

  return (
    <SubtleBackground intensity="minimal" imageSource={require('../../assets/splash/pexels-thgusstavo-2040189.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showLogout
          onLogoutPress={onNavigateToProfile}
          title={language === 'fr' ? 'Admin Dashboard' : 'Admin Dashboard'}
        />
        
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section - Compact */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'black',
            color: styles.text.color,
            marginBottom: 4
          }}>
            {language === 'fr' ? 'Bonjour' : 'Hello'}, {session?.account.firstName}
          </Text>
          <Text style={[styles.caption, { fontSize: 14 }]}>
            {language === 'fr' 
              ? 'Tableau de bord administrateur - Académie Précision' 
              : 'Admin Dashboard - Precision Academy'}
          </Text>
        </View>

        {/* Critical Alerts Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <AlertsCard />
        </View>

        {/* Quick Actions Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <QuickActionsCard />
        </View>

        {/* Revenue Analytics - Primary Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 0, fontSize: 20 }]}>
              {language === 'fr' ? 'Revenus' : 'Revenue'}
            </Text>
            <PeriodSelector />
          </View>
          <RevenueCard data={dashboardData.revenueAnalytics[selectedPeriod]} />
        </View>

        {/* Key Metrics Grid - Enhanced Layout */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, fontSize: 20 }]}>
            {language === 'fr' ? 'Métriques Clés' : 'Key Metrics'}
          </Text>
          
          {/* High Priority Metrics Row */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <StatCard
              title={language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users'}
              value={dashboardData.platformStats.activeUsers}
              icon="people"
              color="#06B6D4"
              size="medium"
              priority="high"
            />
            <StatCard
              title={language === 'fr' ? 'Nouveaux (7j)' : 'New (7d)'}
              value={dashboardData.platformStats.newUsersThisWeek}
              icon="trending-up"
              color="#10B981"
              size="medium"
              priority="high"
            />
          </View>
          
          {/* Secondary Metrics Row */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <StatCard
              title={language === 'fr' ? 'Total Utilisateurs' : 'Total Users'}
              value={dashboardData.platformStats.totalUsers}
              icon="person-circle"
              color="#8B5CF6"
              size="small"
            />
            <StatCard
              title={language === 'fr' ? 'Partenaires' : 'Partners'}
              value={dashboardData.platformStats.totalPartners}
              icon="business"
              color="#F59E0B"
              size="small"
            />
            <StatCard
              title={language === 'fr' ? 'Formateurs' : 'Trainers'}
              value={dashboardData.platformStats.totalFormateurs}
              icon="school"
              color="#EF4444"
              size="small"
            />
          </View>
          
          {/* Performance Metrics */}
          <View style={{ flexDirection: 'row' }}>
            <StatCard
              title={language === 'fr' ? 'Taux Completion' : 'Completion Rate'}
              value={`${dashboardData.platformStats.completionRate}%`}
              icon="checkmark-circle"
              color="#10B981"
              size="medium"
            />
            <StatCard
              title={language === 'fr' ? 'Formations' : 'Courses'}
              value={dashboardData.platformStats.totalFormations}
              icon="library"
              color="#3B82F6"
              size="medium"
            />
          </View>
        </View>

        {/* Management Tools */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, fontSize: 20 }]}>
            {language === 'fr' ? 'Gestion' : 'Management'}
          </Text>
          
          <Pressable 
            onPress={onNavigateToAccounts}
            style={[styles.card, { marginBottom: 12, padding: 16 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#3B82F6',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Ionicons name="people" size={24} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { fontWeight: '600', fontSize: 16, marginBottom: 2 }]}>
                    {language === 'fr' ? 'Comptes Utilisateurs' : 'User Accounts'}
                  </Text>
                  <Text style={[styles.caption, { fontSize: 12 }]}>
                    {language === 'fr' 
                      ? `${dashboardData.platformStats.totalUsers} comptes actifs`
                      : `${dashboardData.platformStats.totalUsers} active accounts`
                    }
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  marginRight: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Gérer</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={styles.caption.color} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Pending Approvals - Enhanced Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 0, fontSize: 20 }]}>
              {language === 'fr' ? 'Approbations' : 'Approvals'}
            </Text>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: '#EF4444',
              borderRadius: 12
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {dashboardData.pendingApprovals.partners.length + 
                 dashboardData.pendingApprovals.formateurs.length + 
                 dashboardData.pendingApprovals.content.length} total
              </Text>
            </View>
          </View>
          
          <PendingApprovalCard
            title={language === 'fr' ? 'Demandes Partenariat' : 'Partnership Requests'}
            count={dashboardData.pendingApprovals.partners.length}
            type="partners"
            onPress={() => console.log('Navigate to partner approvals')}
          />
          <PendingApprovalCard
            title={language === 'fr' ? 'Candidatures Formateurs' : 'Trainer Applications'}
            count={dashboardData.pendingApprovals.formateurs.length}
            type="formateurs"
            onPress={() => console.log('Navigate to trainer approvals')}
          />
          <PendingApprovalCard
            title={language === 'fr' ? 'Contenu à Approuver' : 'Content Submissions'}
            count={dashboardData.pendingApprovals.content.length}
            type="content"
            onPress={() => console.log('Navigate to content approvals')}
          />
        </View>

        {/* Performance Overview */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, fontSize: 20 }]}>
            {language === 'fr' ? 'Performance' : 'Performance'}
          </Text>
          <View style={styles.card}>
            {dashboardData.topActivities.map((activity, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: index < dashboardData.topActivities.length - 1 ? 1 : 0,
                borderBottomColor: theme === 'dark' ? '#333333' : '#F3F4F6'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { fontWeight: '600', marginBottom: 2 }]}>{activity.type}</Text>
                  <Text style={[styles.caption, { fontSize: 12 }]}>
                    {formatLargeNumber(activity.count)} cette période
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: activity.growth >= 0 ? 
                    (theme === 'dark' ? '#1B4A3B' : '#DCFCE7') : 
                    (theme === 'dark' ? '#4A1A1A' : '#FEE2E2')
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: activity.growth >= 0 ? 
                      (theme === 'dark' ? '#86EFAC' : '#16A34A') : 
                      (theme === 'dark' ? '#FCA5A5' : '#DC2626')
                  }}>
                    {formatPercentage(activity.growth)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Feed - Compact and Modern */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 0, fontSize: 20 }]}>
              {language === 'fr' ? 'Activité Récente' : 'Recent Activity'}
            </Text>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#10B981'
            }} />
          </View>
          <View style={styles.card}>
            {dashboardData.activityFeed.slice(0, 6).map((item, index) => (
              <View key={item.id} style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingVertical: 10,
                borderBottomWidth: index < 5 ? 1 : 0,
                borderBottomColor: theme === 'dark' ? '#333333' : '#F3F4F6'
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 6,
                  marginRight: 12,
                  backgroundColor: item.priority === 'high' ? '#EF4444' : 
                                 item.priority === 'medium' ? '#F59E0B' : '#6B7280'
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.text, { fontWeight: '500', fontSize: 14, marginBottom: 2 }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.caption, { fontSize: 12, marginBottom: 2 }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={[styles.caption, { fontSize: 10 }]}>
                    {getTimeAgo(item.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
            <Pressable style={{ marginTop: 12, paddingVertical: 8 }}>
              <Text style={[styles.primaryText, { textAlign: 'center', fontWeight: '500' }]}>
                {language === 'fr' ? 'Voir tout l\'historique' : 'View full history'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      </View>
    </SubtleBackground>
  );
};