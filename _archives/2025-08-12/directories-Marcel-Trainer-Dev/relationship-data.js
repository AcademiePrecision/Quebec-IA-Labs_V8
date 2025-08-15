// 🔗 RELATIONS CLIENT-BARBIER-SALON POUR MARCEL AI
// =============================================
// Système de reconnaissance client et personnalisation
// Version: 2.2 - Compatible avec marcel-dev-server.js
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
  },
  
  // Clients existants pour compatibilité
  {
    id: 'client-legacy-001',
    phone: '+15145551234',
    name: 'Jean Tremblay',
    email: 'jean.tremblay@gmail.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-tony-barbier',
    preferredBarbier: 'barbier-marco-001',
    lastVisit: '2024-07-15',
    totalVisits: 12,
    averageSpending: 45,
    preferences: {
      serviceType: ['coupe', 'barbe'],
      timePreference: 'matin',
      communication: 'sms'
    },
    historique: [
      {
        date: '2024-07-15',
        salon: 'salon-tony-barbier',
        barbier: 'barbier-marco-001',
        services: ['Coupe', 'Barbe'],
        prix: 55,
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

// Obtenir les barbiers d'un salon
function getBarbiersBySalon(salonId) {
  const salon = Object.values(salonBarbierRelations).find(s => s.salonId === salonId);
  return salon ? salon.barbiers : [];
}

// Vérifier la disponibilité d'un barbier
function checkBarbierAvailability(barbierId, date, time) {
  try {
    const dateObj = new Date(date);
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dayOfWeek = dayNames[dateObj.getDay()];

    for (const salon of Object.values(salonBarbierRelations)) {
      const barbier = salon.barbiers.find(b => b.id === barbierId);
      if (barbier && barbier.availability) {
        const dayAvailability = barbier.availability[dayOfWeek];
        if (dayAvailability === 'fermé') return false;

        // Vérifier si l'heure est dans les plages disponibles
        if (Array.isArray(dayAvailability)) {
          return dayAvailability.some(plage => {
            const [start, end] = plage.split('-');
            const timeNum = parseInt(time.replace('h', ''));
            const startNum = parseInt(start.replace('h', ''));
            const endNum = parseInt(end.replace('h', ''));
            return timeNum >= startNum && timeNum <= endNum;
          });
        }
      }
    }
  } catch (error) {
    console.warn('Erreur vérification disponibilité:', error.message);
  }
  return false;
}

// ========================================
// 📅 RÉSERVATIONS EXISTANTES
// ========================================
const existingBookings = [
  {
    id: 'booking-001',
    clientId: 'client-001',
    clientName: 'Jean Tremblay',
    clientPhone: '+15145551234',
    salonId: 'profile-salon-001',
    salonName: 'Elite Barbershop',
    barbierId: 'barbier-marco-001',
    barbierName: 'Marco',
    date: '2024-08-10',
    time: '14:00',
    duration: 60,
    services: ['Coupe', 'Barbe'],
    status: 'confirmé',
    prix: 55,
    notes: 'Client régulier, aime la coupe courte'
  },
  {
    id: 'booking-002',
    clientId: 'client-002',
    clientName: 'Marie Gagnon',
    clientPhone: '+14385556789',
    salonId: 'profile-salon-001',
    salonName: 'Elite Barbershop',
    barbierId: 'barbier-julie-001',
    barbierName: 'Julie',
    date: '2024-08-12',
    time: '15:30',
    duration: 90,
    services: ['Coupe', 'Coloration'],
    status: 'confirmé',
    prix: 85
  },
  {
    id: 'booking-003',
    clientId: 'client-003',
    clientName: 'Mike Johnson',
    clientPhone: '+15149998888',
    salonId: 'profile-salon-002',
    salonName: 'Prestige Cuts',
    barbierId: 'barbier-alex-002',
    barbierName: 'Alex',
    date: '2024-08-11',
    time: '18:00',
    duration: 45,
    services: ['Coupe moderne'],
    status: 'en_attente',
    prix: 48
  }
];

// ========================================
// 🤖 CONTEXTE POUR MARCEL AI
// ========================================
const marcelContext = {
  // Informations du salon principal (pour Marcel)
  currentSalon: {
    id: 'profile-salon-001',
    name: 'Elite Barbershop',
    address: '1234 Rue Saint-Denis, Montréal, QC',
    phone: '514-555-1001',
    hours: {
      'lundi': '9h-18h',
      'mardi': '9h-18h',
      'mercredi': '9h-18h',
      'jeudi': '9h-20h',
      'vendredi': '9h-20h',
      'samedi': '9h-17h',
      'dimanche': 'fermé'
    }
  },

  // Services disponibles avec prix
  services: {
    'coupe': { 
      name: 'Coupe homme', 
      prix: 35, 
      duration: 30,
      description: 'Coupe classique ou moderne'
    },
    'barbe': { 
      name: 'Taille de barbe', 
      prix: 20, 
      duration: 20,
      description: 'Taille et mise en forme de la barbe'
    },
    'coupe_barbe': { 
      name: 'Combo Coupe + Barbe', 
      prix: 50, 
      duration: 45,
      description: 'Service complet coupe et barbe'
    },
    'rasage': { 
      name: 'Rasage traditionnel', 
      prix: 35, 
      duration: 30,
      description: 'Rasage au rasoir avec serviette chaude'
    },
    'coloration': { 
      name: 'Coloration', 
      prix: 50, 
      duration: 60,
      description: 'Coloration professionnelle'
    }
  },

  // Phrases types pour Marcel
  responses: {
    greeting: {
      fr: "Salut! Marcel ici, ton réceptionniste IA jovial! 😄 Je peux t'aider avec nos 3 salons: Tony (Marco pour barbes), Gustave (Jessica pour colorations) ou Independent Barber (Alex pour coupes modernes). Quel salon t'intéresse?",
      en: "Hey there! Marcel here, your cheerful AI receptionist! I can help you with our 3 salons. Which one interests you?"
    },
    salon_selection: {
      fr: "Super! On a 3 options fantastiques:\n🔥 Salon Tony avec Marco (spécialiste barbe traditionnelle)\n💫 Salon Gustave avec Jessica (experte colorations)\n🎨 Independent Barber avec Alex (coupes modernes créatives)\n\nQuel salon te fait de l'œil?",
      en: "Great! We have 3 fantastic options. Which salon catches your eye?"
    },
    booking_confirm: {
      fr: "Excellent! ✅ RDV confirmé avec {barbier} au salon {salon} le {date} à {time} pour {service}. Total: {prix}$ - Tu vas adorer! À bientôt! 🎉",
      en: "Excellent! Appointment confirmed with {barbier} at {salon} on {date} at {time} for {service}. Total: ${prix} - You'll love it!"
    },
    client_recognized: {
      fr: "Hey {name}! 😃 Marcel ici, content de t'entendre! Tu veux ton habituel avec {barbier} au salon {salon}? Ou on essaie quelque chose de nouveau aujourd'hui?",
      en: "Hey {name}! Marcel here, great to hear from you! Your usual with {barbier} or trying something new today?"
    },
    day_preference_first: {
      fr: "Parfait pour {service}! Quel jour te conviendrait le mieux? Moi je suggère {preferredDay} si ça marche pour toi, sinon on a d'autres options!",
      en: "Perfect for {service}! What day works best for you?"
    }
  }
};

// ========================================
// 🔗 FONCTION PRINCIPALE POUR MARCEL
// ========================================
function getMarcelIntelligence(phoneNumber) {
  const client = findClientByPhone(phoneNumber);

  if (client) {
    // Client connu - personnaliser la réponse
    const preferredBarbier = client.preferredBarbier ? 
      findBarbierByName(client.preferredBarbier) : null;

    return {
      isKnownClient: true,
      client: client,
      preferredBarbier: preferredBarbier,
      lastVisit: client.lastVisit,
      preferences: client.preferences,
      suggestedGreeting: marcelContext.responses.client_recognized.fr
        .replace('{name}', client.name)
        .replace('{barbier}', preferredBarbier?.name || 'votre barbier'),
      historique: client.historique
    };
  }

  // Nouveau client
  return {
    isKnownClient: false,
    suggestedGreeting: marcelContext.responses.greeting.fr,
    availableBarbiers: Object.values(salonBarbierRelations)
      .flatMap(salon => salon.barbiers),
    services: marcelContext.services
  };
}

// ========================================
// 🔄 MISE À JOUR DES RELATIONS
// ========================================
function updateClientPreference(clientPhone, preferredBarbier, preferredSalon) {
  const client = findClientByPhone(clientPhone);
  if (client) {
    if (preferredBarbier) client.preferredBarbier = preferredBarbier;
    if (preferredSalon) client.preferredSalon = preferredSalon;
    return true;
  }
  return false;
}

// Ajouter un nouveau client
function addNewClient(clientInfo) {
  const newClient = {
    id: `client-${Date.now()}`,
    phone: clientInfo.phone,
    name: clientInfo.name,
    email: clientInfo.email || '',
    preferredLanguage: clientInfo.preferredLanguage || 'fr',
    preferredSalon: '',
    preferredBarbier: '',
    lastVisit: new Date().toISOString().split('T')[0],
    totalVisits: 0,
    averageSpending: 0,
    preferences: {
      serviceType: [],
      timePreference: '',
      communication: 'phone'
    },
    historique: []
  };

  clientDatabase.push(newClient);
  return newClient;
}

// ========================================
// 🎯 EXPORT PRINCIPAL
// ========================================
const MarcelDataSystem = {
  // Relations
  salons: salonBarbierRelations,
  clients: clientDatabase,
  bookings: existingBookings,

  // Recherche
  findClient: findClientByPhone,
  findBarbier: findBarbierByName,
  getBarbiersBySalon,
  checkAvailability: checkBarbierAvailability,

  // Intelligence
  getIntelligence: getMarcelIntelligence,
  context: marcelContext,

  // Mise à jour
  updatePreference: updateClientPreference,
  addClient: addNewClient
};

module.exports = MarcelDataSystem;