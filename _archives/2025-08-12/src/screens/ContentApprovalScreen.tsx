import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { SubtleBackground } from '../components/SubtleBackground';
import { useAuthStore } from '../state/authStore';
import { useUIStore } from '../state/uiStore';
import { Formation, FormationStatus } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';
import { mockPendingFormations } from '../utils/mockData';
import { 
  getPendingApprovalsForUser, 
  approveFormation, 
  rejectFormation, 
  requestRevision,
  getFormationStatusLabel,
  getFormationStatusColor
} from '../utils/approvalWorkflow';

interface ContentApprovalScreenProps {
  onBack: () => void;
}

export const ContentApprovalScreen: React.FC<ContentApprovalScreenProps> = ({
  onBack,
}) => {
  const { session, language } = useAuthStore();
  const { showToast } = useUIStore();
  const { theme } = useTheme();
  const styles = getScreenStyles(theme);
  const insets = useSafeAreaInsets();
  
  const [formations, setFormations] = useState<Formation[]>(mockPendingFormations);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  if (!session) return null;

  // Get formations pending approval for current user
  const pendingApprovals = getPendingApprovalsForUser(formations, session.activeProfile);

  const handleApprove = (formation: Formation) => {
    Alert.alert(
      language === 'fr' ? 'Approuver la formation' : 'Approve Formation',
      language === 'fr' 
        ? `Êtes-vous sûr de vouloir approuver "${formation.title}" ?`
        : `Are you sure you want to approve "${formation.title}"?`,
      [
        {
          text: language === 'fr' ? 'Annuler' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'fr' ? 'Approuver' : 'Approve',
          style: 'default',
          onPress: () => {
            const updatedFormation = approveFormation(
              formation, 
              session.activeProfile.id,
              language === 'fr' ? 'Formation approuvée automatiquement' : 'Formation approved automatically'
            );
            
            setFormations(prev => prev.map(f => f.id === formation.id ? updatedFormation : f));
            showToast(
              language === 'fr' 
                ? `Formation "${formation.title}" approuvée !`
                : `Formation "${formation.title}" approved!`,
              'success'
            );
          }
        }
      ]
    );
  };

  const handleReject = (formation: Formation) => {
    Alert.prompt(
      language === 'fr' ? 'Rejeter la formation' : 'Reject Formation',
      language === 'fr' 
        ? 'Veuillez expliquer la raison du rejet :'
        : 'Please explain the reason for rejection:',
      [
        {
          text: language === 'fr' ? 'Annuler' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'fr' ? 'Rejeter' : 'Reject',
          style: 'destructive',
          onPress: (reason) => {
            if (!reason || reason.trim().length === 0) {
              showToast(
                language === 'fr' 
                  ? 'Veuillez fournir une raison pour le rejet'
                  : 'Please provide a reason for rejection',
                'error'
              );
              return;
            }

            const updatedFormation = rejectFormation(formation, session.activeProfile.id, reason);
            setFormations(prev => prev.map(f => f.id === formation.id ? updatedFormation : f));
            showToast(
              language === 'fr' 
                ? `Formation "${formation.title}" rejetée`
                : `Formation "${formation.title}" rejected`,
              'info'
            );
          }
        }
      ],
      'plain-text'
    );
  };

  const handleRequestRevision = (formation: Formation) => {
    Alert.prompt(
      language === 'fr' ? 'Demander des révisions' : 'Request Revisions',
      language === 'fr' 
        ? 'Quelles améliorations suggérez-vous ?'
        : 'What improvements do you suggest?',
      [
        {
          text: language === 'fr' ? 'Annuler' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'fr' ? 'Envoyer' : 'Send',
          style: 'default',
          onPress: (notes) => {
            if (!notes || notes.trim().length === 0) {
              showToast(
                language === 'fr' 
                  ? 'Veuillez fournir des suggestions d\'amélioration'
                  : 'Please provide improvement suggestions',
                'error'
              );
              return;
            }

            const updatedFormation = requestRevision(formation, session.activeProfile.id, notes);
            setFormations(prev => prev.map(f => f.id === formation.id ? updatedFormation : f));
            showToast(
              language === 'fr' 
                ? `Révisions demandées pour "${formation.title}"`
                : `Revisions requested for "${formation.title}"`,
              'info'
            );
          }
        }
      ],
      'plain-text'
    );
  };

  const FormationCard: React.FC<{ formation: Formation }> = ({ formation }) => (
    <View style={{
      backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header with title and status */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#FFFFFF' : '#000000',
          flex: 1,
          marginRight: 12
        }}>
          {formation.title}
        </Text>
        <View style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: getFormationStatusColor(formation.status || 'draft') + '20'
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: getFormationStatusColor(formation.status || 'draft')
          }}>
            {getFormationStatusLabel(formation.status || 'draft', language)}
          </Text>
        </View>
      </View>

      {/* Formation details */}
      <Text style={{
        fontSize: 14,
        color: theme === 'dark' ? '#CCCCCC' : '#666666',
        marginBottom: 12,
        lineHeight: 20
      }}>
        {formation.description}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="person" size={14} color="#8B5CF6" />
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000', marginLeft: 4 }}>
            {formation.formateur.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time" size={14} color="#3B82F6" />
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000', marginLeft: 4 }}>
            {formation.duration}h
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="pricetag" size={14} color="#10B981" />
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000', marginLeft: 4 }}>
            ${formation.price}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="library" size={14} color="#F59E0B" />
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#FFFFFF' : '#000000', marginLeft: 4 }}>
            {formation.modules.length} modules
          </Text>
        </View>
      </View>

      {/* Review comments if any */}
      {formation.reviewComments && (
        <View style={{
          backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: '#3B82F6',
            marginBottom: 4
          }}>
            {language === 'fr' ? 'Commentaires précédents :' : 'Previous comments:'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme === 'dark' ? '#FFFFFF' : '#000000'
          }}>
            {formation.reviewComments}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => handleApprove(formation)}
          style={{
            flex: 1,
            backgroundColor: '#10B981',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color="white" />
          <Text style={{
            color: 'white',
            fontWeight: '600',
            marginLeft: 4,
            fontSize: 14
          }}>
            {language === 'fr' ? 'Approuver' : 'Approve'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleRequestRevision(formation)}
          style={{
            flex: 1,
            backgroundColor: '#3B82F6',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="create" size={16} color="white" />
          <Text style={{
            color: 'white',
            fontWeight: '600',
            marginLeft: 4,
            fontSize: 14
          }}>
            {language === 'fr' ? 'Révision' : 'Revise'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleReject(formation)}
          style={{
            backgroundColor: '#EF4444',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="close-circle" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SubtleBackground intensity="subtle" imageSource={require('../../assets/splash/pexels-nickoloui-1319459.jpg')}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <Header 
          showBack 
          onBackPress={onBack}
          title={language === 'fr' ? 'Approbations de Contenu' : 'Content Approvals'}
        />
        
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats header */}
          <View style={{
            backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#F59E0B',
              marginBottom: 4
            }}>
              {pendingApprovals.length}
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              textAlign: 'center'
            }}>
              {language === 'fr' 
                ? 'Formation(s) en attente d\'approbation'
                : 'Formation(s) pending approval'
              }
            </Text>
          </View>

          {/* Formation cards */}
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((formation) => (
              <FormationCard key={formation.id} formation={formation} />
            ))
          ) : (
            <View style={{
              backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              borderRadius: 12,
              padding: 40,
              alignItems: 'center'
            }}>
              <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme === 'dark' ? '#FFFFFF' : '#000000',
                marginTop: 16,
                textAlign: 'center'
              }}>
                {language === 'fr' 
                  ? 'Aucune formation en attente'
                  : 'No formations pending'
                }
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme === 'dark' ? '#CCCCCC' : '#666666',
                marginTop: 8,
                textAlign: 'center'
              }}>
                {language === 'fr' 
                  ? 'Toutes les formations ont été traitées'
                  : 'All formations have been processed'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SubtleBackground>
  );
};