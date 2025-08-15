import { Formation, UserProfile, MaitreFormateurProfile, SalonPartenaireProfile, FormationStatus } from '../types';
import { allMockProfiles } from './mockPersonas';

/**
 * Service gérant la logique d'approbation de contenu selon le workflow:
 * 
 * 1. Formateur attaché à un salon → Salon partenaire approuve
 * 2. Formateur indépendant → Admin approuve
 * 3. États possibles: draft → pending_approval → under_review → approved/rejected
 */

export interface ApprovalWorkflowResult {
  reviewerId: string | null;
  reviewerType: 'admin' | 'salon' | null;
  reviewerName: string;
  canApprove: boolean;
  reason: string;
}

/**
 * Détermine qui doit approuver une formation selon le formateur
 */
export const getApprovalWorkflow = (formation: Formation): ApprovalWorkflowResult => {
  // Trouver le profil du formateur
  const formateurProfile = allMockProfiles.find(p => p.id === formation.formateurId) as MaitreFormateurProfile;
  
  if (!formateurProfile) {
    return {
      reviewerId: null,
      reviewerType: null,
      reviewerName: 'Formateur non trouvé',
      canApprove: false,
      reason: 'Impossible de déterminer le formateur'
    };
  }

  // Si le formateur est attaché à un salon
  if (formateurProfile.attachedSalon) {
    // Trouver le salon partenaire correspondant
    const salonProfile = allMockProfiles.find(p => 
      p.userType === 'salon_partenaire' && 
      (p as SalonPartenaireProfile).salonName === formateurProfile.attachedSalon
    ) as SalonPartenaireProfile;

    if (salonProfile) {
      return {
        reviewerId: salonProfile.id,
        reviewerType: 'salon',
        reviewerName: salonProfile.salonName,
        canApprove: true,
        reason: `Formateur attaché au salon ${salonProfile.salonName}`
      };
    }
  }

  // Formateur indépendant → Admin approuve
  const adminProfile = allMockProfiles.find(p => p.userType === 'admin');
  
  if (adminProfile) {
    return {
      reviewerId: adminProfile.id,
      reviewerType: 'admin',
      reviewerName: 'Administration',
      canApprove: true,
      reason: 'Formateur indépendant - Validation par l\'administration'
    };
  }

  return {
    reviewerId: null,
    reviewerType: null,
    reviewerName: 'Aucun réviseur disponible',
    canApprove: false,
    reason: 'Aucun admin ou salon trouvé pour la validation'
  };
};

/**
 * Vérifie si un utilisateur peut approuver une formation
 */
export const canUserApproveFormation = (formation: Formation, userProfile: UserProfile): boolean => {
  const workflow = getApprovalWorkflow(formation);
  
  if (!workflow.canApprove) {
    return false;
  }

  // Si c'est un admin et que l'admin doit approuver
  if (userProfile.userType === 'admin' && workflow.reviewerType === 'admin') {
    return true;
  }

  // Si c'est un salon et que ce salon doit approuver
  if (userProfile.userType === 'salon_partenaire' && workflow.reviewerType === 'salon') {
    return userProfile.id === workflow.reviewerId;
  }

  return false;
};

/**
 * Obtient les formations en attente d'approbation pour un utilisateur
 */
export const getPendingApprovalsForUser = (formations: Formation[], userProfile: UserProfile): Formation[] => {
  return formations.filter(formation => {
    if (formation.status !== 'pending_approval' && formation.status !== 'under_review') {
      return false;
    }
    
    return canUserApproveFormation(formation, userProfile);
  });
};

/**
 * Simule l'approbation d'une formation
 */
export const approveFormation = (formation: Formation, reviewerId: string, comments?: string): Formation => {
  return {
    ...formation,
    status: 'approved' as FormationStatus,
    reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewComments: comments,
    approvedAt: new Date().toISOString()
  };
};

/**
 * Simule le rejet d'une formation
 */
export const rejectFormation = (formation: Formation, reviewerId: string, comments: string): Formation => {
  return {
    ...formation,
    status: 'rejected' as FormationStatus,
    reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewComments: comments,
    rejectedAt: new Date().toISOString()
  };
};

/**
 * Simule la mise en révision d'une formation
 */
export const requestRevision = (formation: Formation, reviewerId: string, revisionNotes: string): Formation => {
  return {
    ...formation,
    status: 'under_review' as FormationStatus,
    reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewComments: revisionNotes
  };
};

/**
 * Obtient le statut lisible d'une formation
 */
export const getFormationStatusLabel = (status: FormationStatus, language: 'fr' | 'en'): string => {
  const labels = {
    fr: {
      draft: 'Brouillon',
      pending_approval: 'En attente d\'approbation',
      under_review: 'En révision',
      approved: 'Approuvé',
      published: 'Publié',
      rejected: 'Rejeté'
    },
    en: {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      under_review: 'Under Review',
      approved: 'Approved',
      published: 'Published',
      rejected: 'Rejected'
    }
  };

  return labels[language][status] || status;
};

/**
 * Obtient la couleur associée à un statut
 */
export const getFormationStatusColor = (status: FormationStatus): string => {
  const colors = {
    draft: '#6B7280', // Gray
    pending_approval: '#F59E0B', // Amber
    under_review: '#3B82F6', // Blue
    approved: '#10B981', // Emerald
    published: '#059669', // Green
    rejected: '#EF4444' // Red
  };

  return colors[status] || '#6B7280';
};