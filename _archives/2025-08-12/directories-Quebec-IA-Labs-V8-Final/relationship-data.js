// 🔗 RELATIONS CLIENT-BARBIER-SALON POUR MARCEL AI V8.1
// =============================================
// Système de reconnaissance client et personnalisation
// Version: 8.1 - Compatible avec Quebec-IA-Labs-V8-Final
// =============================================

// ========================================
// 🏪 SALONS AVEC LEURS BARBIERS
// ========================================
const salonBarbierRelations = {
  'salon-tony-barbier': {
    salonId: 'profile-salon-001',
    salonName: 'Salon Tony',
    address: '1234 Rue Saint-Denis, Montréal, QC',
    phone: '514-555-1001',
    barbiers: [
      {
        id: 'barbier-marco-001',
        name: 'Marco',
        fullName: 'Marco Gagnon',
        specialties: ['Barbe traditionnelle', 'Rasage classique', 'Coupes masculines'],
        experience: '8 ans',
        hourlyRate: 45,
        personality: 'Expert barbe jovial',
        availability: {
          lundi: ['9h-12h', '13h-17h'],
          mardi: ['9h-12h', '13h-17h'],
          mercredi: ['9h-12h', '13h-17h'],
          jeudi: ['9h-12h', '13h-17h'],
          vendredi: ['9h-12h', '13h-17h'],
          samedi: ['9h-16h'],
          dimanche: 'fermé'
        }
      }
    ]
  },
  'salon-gustave-coiffure': {
    salonId: 'profile-salon-002',
    salonName: 'Salon Gustave',
    address: '5678 Boulevard Saint-Laurent, Montréal, QC',
    phone: '438-555-1002',
    barbiers: [
      {
        id: 'barbier-jessica-002',
        name: 'Jessica',
        fullName: 'Jessica Tremblay',
        specialties: ['Colorations', 'Coupes femmes', 'Traitements capillaires'],
        experience: '10 ans',
        hourlyRate: 55,
        personality: 'Spécialiste coloration énergique',
        availability: {
          lundi: ['9h-17h'],
          mardi: ['9h-17h'],
          mercredi: 'fermé',
          jeudi: ['9h-17h'],
          vendredi: ['9h-17h'],
          samedi: ['10h-16h'],
          dimanche: 'fermé'
        }
      }
    ]
  },
  'salon-independent-barber': {
    salonId: 'profile-salon-003',
    salonName: 'Independent Barber',
    address: '999 Rue Sainte-Catherine, Montréal, QC',
    phone: '514-555-1003',
    barbiers: [
      {
        id: 'barbier-alex-003',
        name: 'Alex',
        fullName: 'Alexandre Dubois',
        specialties: ['Coupes modernes', 'Fades artistiques', 'Design capillaire'],
        experience: '6 ans',
        hourlyRate: 50,
        personality: 'Artiste moderne créatif',
        availability: {
          lundi: ['10h-18h'],
          mardi: ['10h-18h'],
          mercredi: ['10h-18h'],
          jeudi: ['10h-18h'],
          vendredi: ['10h-18h'],
          samedi: ['9h-17h'],
          dimanche: 'fermé'
        }
      }
    ]
  }
};

// ========================================
// 👥 CLIENTS AVEC LEURS HISTORIQUES
// ========================================
const clientDatabase = [
  // 3 Clients réguliers avec le même numéro test pour faciliter les tests
  {
    id: 'client-001',
    phone: '+14189510161',
    name: 'François Moreau',
    email: 'francois.moreau@gmail.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-tony-barbier',
    preferredBarbier: 'barbier-marco-001',
    lastVisit: '2024-08-08',
    totalVisits: 15,
    averageSpending: 50,
    personality: 'Client jovial et régulier',
    preferences: {
      serviceType: ['coupe', 'barbe'],
      timePreference: 'matin',
      communication: 'phone',
      dayPreference: 'mardi'
    },
    historique: [
      {
        date: '2024-08-08',
        salon: 'salon-tony-barbier',
        barbier: 'barbier-marco-001',
        services: ['Coupe', 'Barbe'],
        prix: 55,
        satisfaction: 5
      }
    ]
  },
  {
    id: 'client-002',
    phone: '+14189510161',
    name: 'Marie-Claude Gagnon',
    email: 'marie-claude.gagnon@outlook.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-gustave-coiffure',
    preferredBarbier: 'barbier-jessica-002',
    lastVisit: '2024-08-09',
    totalVisits: 12,
    averageSpending: 75,
    personality: 'Cliente fidèle et exigeante qualité',
    preferences: {
      serviceType: ['coupe', 'coloration'],
      timePreference: 'après-midi',
      communication: 'phone',
      dayPreference: 'jeudi'
    },
    historique: [
      {
        date: '2024-08-09',
        salon: 'salon-gustave-coiffure',
        barbier: 'barbier-jessica-002',
        services: ['Coupe', 'Coloration'],
        prix: 85,
        satisfaction: 5
      }
    ]
  },
  {
    id: 'client-003',
    phone: '+14189510161',
    name: 'Kevin Tremblay',
    email: 'kevin.tremblay@hotmail.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-independent-barber',
    preferredBarbier: 'barbier-alex-003',
    lastVisit: '2024-08-07',
    totalVisits: 8,
    averageSpending: 55,
    personality: 'Jeune créatif qui aime les nouvelles tendances',
    preferences: {
      serviceType: ['coupe', 'design'],
      timePreference: 'fin-après-midi',
      communication: 'phone',
      dayPreference: 'vendredi'
    },
    historique: [
      {
        date: '2024-08-07',
        salon: 'salon-independent-barber',
        barbier: 'barbier-alex-003',
        services: ['Coupe moderne', 'Design'],
        prix: 60,
        satisfaction: 5
      }
    ]
  }
];

// ========================================
// 🔍 FONCTIONS DE RECHERCHE POUR MARCEL
// ========================================

// Trouver un client par téléphone
function findClientByPhone(phone) {
  return clientDatabase.find(client => 
    client.phone === phone || 
    client.phone.replace(/[^\d]/g, '') === phone.replace(/[^\d]/g, '')
  );
}

// Trouver un barbier par nom
function findBarbierByName(name) {
  for (const salon of Object.values(salonBarbierRelations)) {
    const barbier = salon.barbiers.find(b => 
      b.name.toLowerCase() === name.toLowerCase() ||
      b.fullName.toLowerCase().includes(name.toLowerCase())
    );
    if (barbier) {
      return {
        ...barbier,
        salonId: salon.salonId,
        salonName: salon.salonName,
        salonAddress: salon.address
      };
    }
  }
  return null;
}

// Obtenir intelligence Marcel pour un numéro
function getMarcelIntelligence(phoneNumber) {
  const client = findClientByPhone(phoneNumber);

  if (client) {
    // Client connu - personnaliser la réponse
    const preferredBarbier = findBarbierByName(client.preferredBarbier);

    return {
      isKnownClient: true,
      client: client,
      preferredBarbier: preferredBarbier,
      lastVisit: client.lastVisit,
      preferences: client.preferences,
      suggestedGreeting: `Hey ${client.name}! 😃 Marcel ici, content de t'entendre! Tu veux ton habituel avec ${preferredBarbier?.name || 'ton barbier'} ou on essaie quelque chose de nouveau aujourd'hui?`,
      historique: client.historique
    };
  }

  // Nouveau client
  return {
    isKnownClient: false,
    suggestedGreeting: "Salut! Je peux t'aider avec nos 3 salons: Tony (Marco), Gustave (Jessica) ou Independent Barber (Alex). Lequel t'intéresse?",
    availableBarbiers: Object.values(salonBarbierRelations)
      .flatMap(salon => salon.barbiers)
  };
}

// Export pour Marcel V8.1
const MarcelDataSystem = {
  salons: salonBarbierRelations,
  clients: clientDatabase,
  findClient: findClientByPhone,
  findBarbier: findBarbierByName,
  getIntelligence: getMarcelIntelligence
};

module.exports = MarcelDataSystem;