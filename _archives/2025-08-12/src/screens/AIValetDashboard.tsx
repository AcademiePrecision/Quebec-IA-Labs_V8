import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DashboardData } from '../types/salon-ai';
import { mockDashboardData } from '../utils/aiValetMockData';
import { useTheme } from '../contexts/ThemeContext';

interface AIValetDashboardProps {
  route: {
    params: {
      salonId: string;
      salonName: string;
    };
  };
  onBack?: () => void;
}

export default function AIValetDashboard({ route, onBack }: AIValetDashboardProps) {
  const { salonId, salonName } = route.params;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'ai' | 'surveillance'>('overview');
  const { theme } = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, [salonId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Utiliser les données mock pour l'instant
      const data = mockDashboardData[salonId] || mockDashboardData['salon-001-tony'];
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      Alert.alert('Erreur', 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const TabButton = ({ 
    id, 
    title, 
    iconName 
  }: { 
    id: string; 
    title: string; 
    iconName: keyof typeof Ionicons.glyphMap;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === id && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(id as any)}
    >
      <Ionicons 
        name={iconName} 
        size={20} 
        color={activeTab === id ? '#4f46e5' : '#6b7280'} 
      />
      <Text style={[
        styles.tabText,
        activeTab === id && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.container}>
      {/* Stats principales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Statistiques du jour</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>
              {dashboardData?.today_stats?.metrics?.total_calls || 0}
            </Text>
            <Text style={styles.statLabel}>Appels</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {dashboardData?.today_stats?.metrics?.successful_bookings || 0}
            </Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
              {dashboardData?.today_stats?.metrics?.conversion_rate || 0}%
            </Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
        </View>
      </View>

      {/* Revenus IA */}
      <View style={[styles.card, styles.revenueCard]}>
        <View style={styles.revenueContent}>
          <View>
            <Text style={styles.revenueTitle}>💰 Revenus IA aujourd'hui</Text>
            <Text style={styles.revenueAmount}>
              {formatCurrency(dashboardData?.today_stats?.metrics?.revenue_generated || 0)}
            </Text>
          </View>
          <Ionicons name="cash" size={40} color="white" />
        </View>
      </View>

      {/* Performance barbiers */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✂️ Performance Barbiers</Text>
        {dashboardData?.barber_performance?.map((barber, index) => (
          <View key={index} style={styles.barberRow}>
            <View>
              <Text style={styles.barberName}>{barber.barber_id}</Text>
              <Text style={styles.barberDetails}>
                {barber.clients_served} clients • Score: {barber.efficiency_score}/10
              </Text>
            </View>
            <Text style={styles.barberRevenue}>
              {formatCurrency(barber.revenue_generated)}
            </Text>
          </View>
        ))}
      </View>

      {/* Insights IA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Insights IA</Text>
        {dashboardData?.ai_insights?.slice(0, 3).map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            {insight.action_required && (
              <Text style={styles.actionRequired}>⚠️ Action requise</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4f46e5" />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>🏪 {salonName}</Text>
            <Text style={styles.headerSubtitle}>
              Valet IA • {dashboardData?.salon?.settings?.ai_voice_enabled ? '🟢 Actif' : '🔴 Inactif'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton id="overview" title="Vue d'ensemble" iconName="trending-up" />
        <TabButton id="bookings" title="Réservations" iconName="calendar" />
        <TabButton id="ai" title="IA" iconName="brain" />
        <TabButton id="surveillance" title="Surveillance" iconName="shield" />
      </View>

      {/* Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      
      {activeTab === 'bookings' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>📅 Réservations à venir...</Text>
        </View>
      )}
      
      {activeTab === 'ai' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>🤖 Contrôles IA à venir...</Text>
        </View>
      )}
      
      {activeTab === 'surveillance' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>🛡️ Surveillance à venir...</Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🤖 Valet IA en action...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  revenueCard: {
    backgroundColor: '#10b981',
  },
  revenueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  revenueAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  barberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  barberDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  barberRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  insightCard: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  insightDescription: {
    fontSize: 14,
    color: '#1e40af',
    marginTop: 4,
  },
  actionRequired: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginTop: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#6b7280',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  loadingText: {
    color: '#111827',
  },
});