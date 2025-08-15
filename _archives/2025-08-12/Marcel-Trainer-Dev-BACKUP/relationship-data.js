// 🔗 RELATIONS CLIENT-BARBIER-SALON POUR MARCEL AI
// =============================================
// Système de reconnaissance client et personnalisation
// Version: 2.2 - Compatible avec marcel-dev-server.js
// =============================================

// ========================================
// 🏪 SALONS AVEC LEURS BARBIERS
// ========================================
const salonBarbierRelations = {
  'salon-elite-barbershop': {
    salonId: 'profile-salon-001',
    salonName: 'Elite Barbershop',
    address: '1234 Rue Saint-Denis, Montréal, QC',
    phone: '514-555-1001',
    barbiers: [
      {
        id: 'barbier-marco-001',
        name: 'Marco',
        fullName: 'Marco Gagnon',
        specialties: ['Barbe traditionnelle', 'Rasage classique'],
        experience: '8 ans',
        hourlyRate: 45,
        availability: {
          lundi: ['9h-12h', '13h-17h'],
          mardi: ['9h-12h', '13h-17h'],
          mercredi: ['9h-12h', '13h-17h'],
          jeudi: ['9h-12h', '13h-17h'],
          vendredi: ['9h-12h', '13h-17h'],
          samedi: ['9h-16h'],
          dimanche: 'fermé'
        }
      },
      {
        id: 'barbier-tony-001',
        name: 'Tony',
        fullName: 'Tony Leblanc',
        specialties: ['Coupes modernes', 'Fades', 'Styling'],
        experience: '6 ans',
        hourlyRate: 40,
        availability: {
          lundi: ['10h-18h'],
          mardi: ['10h-18h'],
          mercredi: ['10h-18h'],
          jeudi: ['10h-18h'],
          vendredi: ['10h-18h'],
          samedi: ['9h-17h'],
          dimanche: 'fermé'
        }
      },
      {
        id: 'barbier-julie-001',
        name: 'Julie',
        fullName: 'Julie Tremblay',
        specialties: ['Colorations', 'Coupes femmes', 'Traitements'],
        experience: '10 ans',
        hourlyRate: 50,
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
  'salon-prestige-cuts': {
    salonId: 'profile-salon-002',
    salonName: 'Prestige Cuts',
    address: '5678 Boulevard Saint-Laurent, Montréal, QC',
    phone: '438-555-1002',
    barbiers: [
      {
        id: 'barbier-alex-002',
        name: 'Alex',
        fullName: 'Alexandre Dubois',
        specialties: ['Coupes artistiques', 'Design'],
        experience: '5 ans',
        hourlyRate: 48,
        availability: {
          lundi: ['10h-18h'],
          mardi: ['10h-18h'],
          mercredi: ['10h-18h'],
          jeudi: ['10h-18h'],
          vendredi: ['10h-18h'],
          samedi: ['9h-17h'],
          dimanche: 'fermé'
        }
      },
      {
        id: 'barbier-marie-002',
        name: 'Marie',
        fullName: 'Marie-Claude Roy',
        specialties: ['Styling professionnel', 'Événements'],
        experience: '7 ans',
        hourlyRate: 52,
        availability: {
          lundi: ['9h-17h'],
          mardi: ['9h-17h'],
          mercredi: ['9h-17h'],
          jeudi: ['9h-17h'],
          vendredi: ['9h-17h'],
          samedi: ['10h-16h'],
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
  {
    id: 'client-001',
    phone: '+15145551234',
    name: 'Jean Tremblay',
    email: 'jean.tremblay@gmail.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-elite-barbershop',
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
        salon: 'salon-elite-barbershop',
        barbier: 'barbier-marco-001',
        services: ['Coupe', 'Barbe'],
        prix: 55,
        satisfaction: 5
      },
      {
        date: '2024-06-20',
        salon: 'salon-elite-barbershop', 
        barbier: 'barbier-marco-001',
        services: ['Rasage complet'],
        prix: 35,
        satisfaction: 5
      }
    ]
  },
  {
    id: 'client-002',
    phone: '+14385556789',
    name: 'Marie Gagnon',
    email: 'marie.gagnon@outlook.com',
    preferredLanguage: 'fr',
    preferredSalon: 'salon-elite-barbershop',
    preferredBarbier: 'barbier-julie-001',
    lastVisit: '2024-07-20',
    totalVisits: 8,
    averageSpending: 75,
    preferences: {
      serviceType: ['coupe', 'coloration'],
      timePreference: 'après-midi',
      communication: 'email'
    },
    historique: [
      {
        date: '2024-07-20',
        salon: 'salon-elite-barbershop',
        barbier: 'barbier-julie-001',
        services: ['Coupe', 'Coloration'],
        prix: 85,
        satisfaction: 5
      }
    ]
  },
  {
    id: 'client-003',
    phone: '+15149998888',
    name: 'Mike Johnson',
    email: 'mike.j@gmail.com',
    preferredLanguage: 'en',
    preferredSalon: 'salon-prestige-cuts',
    preferredBarbier: 'barbier-alex-002',
    lastVisit: '2024-07-18',
    totalVisits: 5,
    averageSpending: 60,
    preferences: {
      serviceType: ['coupe'],
      timePreference: 'soir',
      communication: 'phone'
    },
    historique: [
      {
        date: '2024-07-18',
        salon: 'salon-prestige-cuts',
        barbier: 'barbier-alex-002',
        services: ['Coupe moderne'],
        prix: 48,
        satisfaction: 4
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
      fr: "Bonjour! Salon Marcel à votre service. Comment puis-je vous aider aujourd'hui?",
      en: "Hello! Marcel Salon at your service. How can I help you today?"
    },
    booking_confirm: {
      fr: "Parfait! J'ai réservé votre rendez-vous avec {barbier} le {date} à {time} pour {service}. Total: {prix}$",
      en: "Perfect! I've booked your appointment with {barbier} on {date} at {time} for {service}. Total: ${prix}"
    },
    client_recognized: {
      fr: "Bonjour {name}! Content de vous revoir. Voulez-vous prendre rendez-vous avec {barbier} comme d'habitude?",
      en: "Hello {name}! Good to hear from you again. Would you like to book with {barbier} as usual?"
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