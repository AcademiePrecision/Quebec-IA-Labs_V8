import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { SubtleBackground } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useUIStore } from '../state/uiStore';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';

interface AvailabilityManagementScreenProps {
  onBack: () => void;
}

export const AvailabilityManagementScreen: React.FC<AvailabilityManagementScreenProps> = ({
  onBack,
}) => {
  const { session, language } = useAuthStore();
  const { showToast } = useUIStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  
  // Mock data for availability
  const [availability, setAvailability] = useState([
    { 
      day: 'Lundi', 
      dayEn: 'Monday',
      slots: [
        { id: '1', time: '09:00-12:00', type: 'formation', title: 'Formation Dégradé Avancé', booked: true },
        { id: '2', time: '14:00-17:00', type: 'salon', title: 'Coupe Client - Marc D.', booked: true }
      ]
    },
    { 
      day: 'Mardi', 
      dayEn: 'Tuesday',
      slots: [
        { id: '3', time: '09:00-12:00', type: 'available', title: 'Disponible', booked: false },
        { id: '4', time: '14:00-17:00', type: 'formation', title: 'Formation Barbe Pro', booked: true }
      ]
    },
    { 
      day: 'Mercredi', 
      dayEn: 'Wednesday',
      slots: [
        { id: '5', time: '09:00-12:00', type: 'unavailable', title: 'Indisponible', booked: false },
        { id: '6', time: '14:00-17:00', type: 'available', title: 'Disponible', booked: false }
      ]
    },
    { 
      day: 'Jeudi', 
      dayEn: 'Thursday',
      slots: [
        { id: '7', time: '14:00-17:00', type: 'salon', title: 'Coupe Client - Julie M.', booked: true }
      ]
    },
    { 
      day: 'Vendredi', 
      dayEn: 'Friday',
      slots: [
        { id: '8', time: '09:00-12:00', type: 'formation', title: 'Formation Moderne', booked: true },
        { id: '9', time: '14:00-17:00', type: 'available', title: 'Disponible', booked: false }
      ]
    }
  ]);

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'formation': return '#8B5CF6'; // Violet pour formations
      case 'salon': return '#10B981'; // Vert pour salon
      case 'available': return '#3B82F6'; // Bleu pour disponible
      case 'unavailable': return '#6B7280'; // Gris pour indisponible
      default: return '#6B7280';
    }
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'formation': return 'school';
      case 'salon': return 'cut';
      case 'available': return 'add-circle';
      case 'unavailable': return 'close-circle';
      default: return 'time';
    }
  };

  const handleSlotPress = (dayIndex: number, slotId: string, slot: any) => {
    if (slot.type === 'available') {
      // Show options to add formation or salon appointment
      Alert.alert(
        language === 'fr' ? 'Ajouter une activité' : 'Add Activity',
        language === 'fr' ? 'Que voulez-vous ajouter dans ce créneau ?' : 'What would you like to add to this slot?',
        [
          {
            text: language === 'fr' ? 'Annuler' : 'Cancel',
            style: 'cancel'
          },
          {
            text: language === 'fr' ? 'Formation' : 'Training',
            onPress: () => {
              showToast(
                language === 'fr' ? 'Ajouter une formation - À implémenter' : 'Add training - To be implemented',
                'info'
              );
            }
          },
          {
            text: language === 'fr' ? 'Rendez-vous salon' : 'Salon appointment',
            onPress: () => {
              showToast(
                language === 'fr' ? 'Ajouter RDV salon - À implémenter' : 'Add salon appointment - To be implemented',
                'info'
              );
            }
          }
        ]
      );
    } else if (slot.booked) {
      // Show details or edit options
      Alert.alert(
        slot.title,
        language === 'fr' ? 
          `${slot.time}\nType: ${slot.type === 'formation' ? 'Formation' : 'Salon'}\n\nQue voulez-vous faire ?` :
          `${slot.time}\nType: ${slot.type === 'formation' ? 'Training' : 'Salon'}\n\nWhat would you like to do?`,
        [
          {
            text: language === 'fr' ? 'Annuler' : 'Cancel',
            style: 'cancel'
          },
          {
            text: language === 'fr' ? 'Voir détails' : 'View details',
            onPress: () => {
              showToast(
                language === 'fr' ? 'Voir détails - À implémenter' : 'View details - To be implemented',
                'info'
              );
            }
          },
          {
            text: language === 'fr' ? 'Modifier' : 'Edit',
            onPress: () => {
              showToast(
                language === 'fr' ? 'Modifier - À implémenter' : 'Edit - To be implemented',
                'info'
              );
            }
          }
        ]
      );
    }
  };

  const SlotCard: React.FC<{ slot: any, dayIndex: number }> = ({ slot, dayIndex }) => (
    <Pressable 
      onPress={() => handleSlotPress(dayIndex, slot.id, slot)}
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: getSlotColor(slot.type),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: getSlotColor(slot.type) + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Ionicons name={getSlotIcon(slot.type) as any} size={16} color={getSlotColor(slot.type)} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme === 'dark' ? '#FFFFFF' : '#000000',
            marginBottom: 2
          }} numberOfLines={2}>
            {slot.title}
          </Text>
          <Text style={{
            fontSize: 12,
            color: getSlotColor(slot.type)
          }}>
            {slot.time}
          </Text>
        </View>
      </View>
      
      {slot.type === 'available' && (
        <Ionicons name="add" size={20} color="#3B82F6" />
      )}
      {slot.booked && (
        <Ionicons name="chevron-forward" size={16} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
      )}
    </Pressable>
  );

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-lorentzworks-668196.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={language === 'fr' ? 'Mes Disponibilités' : 'My Availability'}
        />
        
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Stats */}
          <View style={{
            backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              {language === 'fr' ? 'Semaine du 8-14 Août 2025' : 'Week of Aug 8-14, 2025'}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#8B5CF6',
                  marginBottom: 4
                }}>6</Text>
                <Text style={{
                  fontSize: 12,
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}>
                  {language === 'fr' ? 'Formations' : 'Trainings'}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#10B981',
                  marginBottom: 4
                }}>3</Text>
                <Text style={{
                  fontSize: 12,
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}>
                  {language === 'fr' ? 'Salon' : 'Salon'}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#3B82F6',
                  marginBottom: 4
                }}>4</Text>
                <Text style={{
                  fontSize: 12,
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}>
                  {language === 'fr' ? 'Disponibles' : 'Available'}
                </Text>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={{
            backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              marginBottom: 12
            }}>
              {language === 'fr' ? 'Légende' : 'Legend'}
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 6, backgroundColor: '#8B5CF6', marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {language === 'fr' ? 'Formation' : 'Training'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {language === 'fr' ? 'Salon' : 'Salon'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {language === 'fr' ? 'Disponible' : 'Available'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 6, backgroundColor: '#6B7280', marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {language === 'fr' ? 'Indisponible' : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Schedule */}
          {availability.map((day, dayIndex) => (
            <View key={day.day} style={{
              backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#FFFFFF' : '#000000',
                marginBottom: 12
              }}>
                {language === 'fr' ? day.day : day.dayEn}
              </Text>
              
              {day.slots.length > 0 ? (
                day.slots.map((slot) => (
                  <SlotCard key={slot.id} slot={slot} dayIndex={dayIndex} />
                ))
              ) : (
                <View style={{
                  alignItems: 'center',
                  paddingVertical: 20,
                  opacity: 0.7
                }}>
                  <Ionicons name="calendar-outline" size={32} color="#6B7280" />
                  <Text style={{
                    fontSize: 14,
                    color: '#6B7280',
                    marginTop: 8
                  }}>
                    {language === 'fr' ? 'Aucun créneau défini' : 'No slots defined'}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Add Availability Button */}
          <Pressable style={{
            backgroundColor: '#8B5CF6',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20
          }}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={{
              color: 'white',
              fontWeight: '600',
              marginLeft: 8,
              fontSize: 16
            }}>
              {language === 'fr' ? 'Ajouter des créneaux' : 'Add Time Slots'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SubtleBackground>
  );
};