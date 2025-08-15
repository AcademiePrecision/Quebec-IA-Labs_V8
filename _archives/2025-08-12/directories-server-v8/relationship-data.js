// 🔗 SYSTÈME DE RELATIONS CLIENT-BARBIER-SALON AVANCÉ
// ================================================
// Version 2.0 - Avec vérification d'identité multi-utilisateurs
// ================================================

// 📞 PROFILS DE TÉLÉPHONE (NOUVEAU!)
// Un numéro peut être partagé par plusieurs personnes
const phoneProfiles = {
  "+15145551234": {
    type: "family", // family, office, personal, shared
    mainContact: {
      id: "client_001",
      name: "Jean Tremblay",
    },
    sharedWith: [
      {
        id: "client_004",
        name: "Sophie Tremblay",
        relation: "épouse",
        lastVisit: "2024-06-10",
        preferences: {
          barbier: "Julie",
          services: ["coupe", "coloration"],
        },
      },
      {
        id: "client_005",
        name: "Marc Tremblay",
        relation: "fils",
        age: 17,
        lastVisit: "2024-05-20",
        preferences: {
          barbier: "Tony",
          services: ["coupe moderne"],
        },
      },
    ],
    verificationRequired: true,
    notes: "Famille Tremblay - toujours vérifier qui appelle",
  },

  "+15145552345": {
    type: "personal",
    mainContact: {
      id: "client_002",
      name: "Marie Dubois",
    },
    sharedWith: [],
    verificationRequired: false,
    notes: "Numéro personnel",
  },

  "+15145553456": {
    type: "personal",
    mainContact: {
      id: "client_003",
      name: "Pierre Gagnon",
    },
    sharedWith: [],
    verificationRequired: false,
    notes: "Nouveau client",
  },

  "+15145554567": {
    type: "office",
    mainContact: {
      id: "office_001",
      name: "Bureau Desjardins",
    },
    sharedWith: [
      {
        id: "client_006",
        name: "Robert Lavoie",
        position: "Directeur",
      },
      {
        id: "client_007",
        name: "Michel Côté",
        position: "Comptable",
      },
      {
        id: "client_008",
        name: "Julie Bergeron",
        position: "Réceptionniste",
      },
    ],
    verificationRequired: true,
    notes: "Bureau Desjardins - plusieurs employés utilisent ce numéro",
  },
};

// 👥 BASE DE DONNÉES CLIENTS ÉTENDUE
const clients = [
  {
    id: "client_001",
    phoneNumber: "+15145551234",
    name: "Jean Tremblay",
    email: "jean.tremblay@email.com",
    firstVisit: "2023-01-15",
    lastVisit: "2024-07-15",
    totalVisits: 24,
    averageSpending: 55,
    preferences: {
      barbier: "Marco",
      serviceType: ["coupe", "barbe"],
      timePreference: "matin",
      products: ["gel", "cire"],
    },
    notes: "Client fidèle, préfère les discussions de hockey",
    familyMembers: ["Sophie Tremblay", "Marc Tremblay"],
    historique: [
      {
        date: "2024-07-15",
        services: ["coupe", "barbe"],
        barbier: "Marco",
        prix: 50,
        satisfaction: 5,
      },
      {
        date: "2024-06-10",
        services: ["coupe"],
        barbier: "Marco",
        prix: 35,
        satisfaction: 5,
      },
    ],
  },

  {
    id: "client_002",
    phoneNumber: "+15145552345",
    name: "Marie Dubois",
    email: "marie.d@email.com",
    firstVisit: "2023-03-22",
    lastVisit: "2024-07-20",
    totalVisits: 18,
    averageSpending: 75,
    preferences: {
      barbier: "Julie",
      serviceType: ["coupe", "coloration", "mise en plis"],
      timePreference: "après-midi",
      products: ["shampoing bio"],
    },
    notes: "Préfère les produits biologiques",
    familyMembers: [],
    historique: [
      {
        date: "2024-07-20",
        services: ["coupe", "coloration"],
        barbier: "Julie",
        prix: 85,
        satisfaction: 5,
      },
    ],
  },

  {
    id: "client_003",
    phoneNumber: "+15145553456",
    name: "Pierre Gagnon",
    email: null,
    firstVisit: "2024-07-25",
    lastVisit: "2024-07-25",
    totalVisits: 1,
    averageSpending: 35,
    preferences: {
      barbier: null,
      serviceType: ["coupe"],
      timePreference: null,
      products: [],
    },
    notes: "Nouveau client, pas de préférences établies",
    familyMembers: [],
    historique: [
      {
        date: "2024-07-25",
        services: ["coupe"],
        barbier: "Tony",
        prix: 35,
        satisfaction: 4,
      },
    ],
  },

  // Membres de famille Tremblay
  {
    id: "client_004",
    phoneNumber: "+15145551234", // Même numéro que Jean
    name: "Sophie Tremblay",
    email: "sophie.t@email.com",
    firstVisit: "2023-02-10",
    lastVisit: "2024-06-10",
    totalVisits: 15,
    averageSpending: 95,
    preferences: {
      barbier: "Julie",
      serviceType: ["coupe", "coloration", "mise en plis"],
      timePreference: "samedi",
      products: ["coloration L'Oréal"],
    },
    notes: "Épouse de Jean Tremblay, préfère Julie",
    familyMembers: ["Jean Tremblay", "Marc Tremblay"],
    historique: [
      {
        date: "2024-06-10",
        services: ["coupe", "coloration"],
        barbier: "Julie",
        prix: 95,
        satisfaction: 5,
      },
    ],
  },

  {
    id: "client_005",
    phoneNumber: "+15145551234", // Même numéro que Jean
    name: "Marc Tremblay",
    email: null,
    firstVisit: "2023-05-15",
    lastVisit: "2024-05-20",
    totalVisits: 8,
    averageSpending: 35,
    preferences: {
      barbier: "Tony",
      serviceType: ["coupe moderne"],
      timePreference: "après l'école",
      products: [],
    },
    notes: "Fils de Jean Tremblay, 17 ans, aime les coupes modernes",
    familyMembers: ["Jean Tremblay", "Sophie Tremblay"],
    historique: [
      {
        date: "2024-05-20",
        services: ["coupe moderne"],
        barbier: "Tony",
        prix: 35,
        satisfaction: 5,
      },
    ],
  },
];

// 💈 SALONS ET BARBIERS
const salons = {
  salon_001: {
    salonId: "salon_001",
    salonName: "Salon Marcel - Quartier St-Roch",
    address: "123 rue St-Joseph, Québec",
    phone: "+14185551111",
    barbiers: [
      {
        id: "barber_001",
        name: "Marco",
        specialties: ["barbe", "coupe classique"],
        experience: 10,
        rating: 4.8,
        availability: {
          lundi: [],
          mardi: ["9h-12h", "13h-18h"],
          mercredi: ["9h-12h", "13h-18h"],
          jeudi: ["9h-12h", "13h-18h"],
          vendredi: ["9h-12h", "13h-18h"],
          samedi: ["9h-16h"],
        },
        regularClients: ["Jean Tremblay"],
        hourlyRate: 60,
      },
      {
        id: "barber_002",
        name: "Tony",
        specialties: ["coupe moderne", "dégradé"],
        experience: 5,
        rating: 4.7,
        availability: {
          lundi: [],
          mardi: ["10h-12h", "13h-19h"],
          mercredi: ["10h-12h", "13h-19h"],
          jeudi: ["10h-12h", "13h-19h"],
          vendredi: ["10h-12h", "13h-19h"],
          samedi: ["9h-16h"],
        },
        regularClients: ["Marc Tremblay", "Pierre Gagnon"],
        hourlyRate: 50,
      },
      {
        id: "barber_003",
        name: "Julie",
        specialties: ["coloration", "coupe femme", "mise en plis"],
        experience: 8,
        rating: 4.9,
        availability: {
          lundi: [],
          mardi: ["9h-12h", "13h-17h"],
          mercredi: ["9h-12h", "13h-17h"],
          jeudi: ["9h-12h", "13h-17h"],
          vendredi: ["9h-12h", "13h-17h"],
          samedi: ["9h-15h"],
        },
        regularClients: ["Marie Dubois", "Sophie Tremblay"],
        hourlyRate: 70,
      },
    ],
  },

  salon_002: {
    salonId: "salon_002",
    salonName: "Salon Marcel - Beauport",
    address: "456 avenue Royale, Beauport",
    phone: "+14185552222",
    barbiers: [
      {
        id: "barber_004",
        name: "François",
        specialties: ["barbe", "coupe homme"],
        experience: 7,
        rating: 4.6,
        availability: {
          lundi: ["9h-17h"],
          mardi: ["9h-17h"],
          mercredi: ["9h-17h"],
          jeudi: ["9h-17h"],
          vendredi: ["9h-17h"],
          samedi: [],
        },
        regularClients: [],
        hourlyRate: 55,
      },
    ],
  },
};

// 📅 RÉSERVATIONS ACTIVES
const bookings = [
  {
    id: "booking_001",
    clientId: "client_001",
    clientName: "Jean Tremblay",
    barbierId: "barber_001",
    barbierName: "Marco",
    date: "2024-08-10",
    time: "10h00",
    services: ["coupe", "barbe"],
    status: "confirmé",
    price: 50,
    notes: "",
  },
  {
    id: "booking_002",
    clientId: "client_004",
    clientName: "Sophie Tremblay",
    barbierId: "barber_003",
    barbierName: "Julie",
    date: "2024-08-12",
    time: "14h00",
    services: ["coupe", "coloration"],
    status: "confirmé",
    price: 95,
    notes: "Coloration blonde",
  },
];

// 🔐 FONCTION DE VÉRIFICATION D'IDENTITÉ (NOUVELLE!)
function verifyCallerIdentity(phoneNumber, claimedName = null) {
  const profile = phoneProfiles[phoneNumber];

  if (!profile) {
    return {
      needsVerification: false,
      isNewClient: true,
      suggestedGreeting:
        "Bonjour! Bienvenue chez Salon Marcel. Comment puis-je vous aider?",
      verificationLevel: "none",
    };
  }

  // Numéro partagé - vérification requise
  if (
    profile.type === "family" ||
    profile.type === "office" ||
    profile.type === "shared"
  ) {
    const allPossibleCallers = [
      profile.mainContact.name,
      ...profile.sharedWith.map((p) => p.name),
    ];

    // Si un nom est fourni, vérifier s'il est dans la liste
    if (claimedName) {
      const isKnown = allPossibleCallers.some(
        (name) =>
          name.toLowerCase().includes(claimedName.toLowerCase()) ||
          claimedName.toLowerCase().includes(name.toLowerCase().split(" ")[0]),
      );

      if (isKnown) {
        const client = findClientByName(claimedName, phoneNumber);
        return {
          needsVerification: false,
          confirmedCaller: client?.name || claimedName,
          clientData: client,
          verificationLevel: "confirmed",
          suggestedGreeting: `Bonjour ${client?.name || claimedName}! Comment puis-je vous aider aujourd'hui?`,
        };
      } else {
        return {
          needsVerification: true,
          isNewPerson: true,
          phoneOwner: profile.mainContact.name,
          suggestedResponse: `D'accord! Je note que vous utilisez le téléphone de ${profile.mainContact.name}. Puis-je créer votre propre profil?`,
          verificationLevel: "new_user_on_shared_phone",
        };
      }
    }

    // Pas de nom fourni - demander
    return {
      needsVerification: true,
      possibleCallers: allPossibleCallers,
      suggestedQuestion:
        "Bonjour! Puis-je avoir votre nom pour mieux vous servir?",
      alternativeQuestion: "C'est pour qui le rendez-vous aujourd'hui?",
      verificationLevel: "required",
      phoneType: profile.type,
      notes: profile.notes,
    };
  }

  // Numéro personnel - pas de vérification
  return {
    needsVerification: false,
    confirmedCaller: profile.mainContact.name,
    clientData: findClientByName(profile.mainContact.name, phoneNumber),
    verificationLevel: "auto_confirmed",
    suggestedGreeting: `Bonjour ${profile.mainContact.name}! Content de vous entendre. Que puis-je faire pour vous?`,
  };
}

// 🔍 FONCTION DE RECHERCHE CLIENT PAR NOM ET TÉLÉPHONE
function findClientByName(name, phoneNumber) {
  if (!name) return null;

  // Recherche exacte d'abord
  let client = clients.find(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() &&
      c.phoneNumber === phoneNumber,
  );

  // Si pas trouvé, recherche partielle
  if (!client) {
    client = clients.find(
      (c) =>
        c.phoneNumber === phoneNumber &&
        (c.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])),
    );
  }

  return client;
}

// 📊 FONCTION D'INTELLIGENCE AMÉLIORÉE
function getIntelligence(phoneNumber, callerName = null) {
  // D'abord vérifier l'identité
  const verification = verifyCallerIdentity(phoneNumber, callerName);

  // Si nouveau client
  if (verification.isNewClient) {
    return {
      isKnownClient: false,
      needsVerification: false,
      suggestedGreeting: verification.suggestedGreeting,
      recommendations: [
        "Demander le nom complet",
        "Proposer nos services populaires",
        "Mentionner les promotions nouveau client",
      ],
    };
  }

  // Si vérification requise
  if (verification.needsVerification) {
    return {
      isKnownClient: false,
      needsVerification: true,
      verificationRequired: verification,
      suggestedGreeting: verification.suggestedQuestion,
      possibleCallers: verification.possibleCallers,
      recommendations: [
        "TOUJOURS vérifier l'identité avant de continuer",
        "Ne pas mentionner d'informations personnelles",
        "Attendre la confirmation du nom",
      ],
    };
  }

  // Client confirmé - donner les infos complètes
  const client =
    verification.clientData ||
    clients.find((c) => c.name === verification.confirmedCaller);

  if (!client) {
    return {
      isKnownClient: false,
      needsVerification: false,
      error: "Client introuvable après vérification",
    };
  }

  // Analyser les préférences
  const barbierPrefere = client.preferences.barbier
    ? Object.values(salons)
        .flatMap((s) => s.barbiers)
        .find((b) => b.name === client.preferences.barbier)
    : null;

  // Recommandations basées sur l'historique
  const lastServices = client.historique[0]?.services || [];
  const recommendations = [];

  if (Date.now() - new Date(client.lastVisit) > 30 * 24 * 60 * 60 * 1000) {
    recommendations.push(
      "Client pas venu depuis plus d'un mois - proposer une promotion",
    );
  }

  if (barbierPrefere) {
    recommendations.push(`Proposer ${barbierPrefere.name} en priorité`);
  }

  if (client.preferences.timePreference) {
    recommendations.push(
      `Privilégier les créneaux du ${client.preferences.timePreference}`,
    );
  }

  return {
    isKnownClient: true,
    verificationLevel: verification.verificationLevel,
    client: client,
    preferredBarbier: barbierPrefere,
    lastVisit: client.lastVisit,
    preferences: client.preferences,
    suggestedGreeting: verification.suggestedGreeting,
    historique: client.historique,
    recommendations: recommendations,
    familyMembers: client.familyMembers,
  };
}

// 🔍 FONCTION DE RECHERCHE DE BARBIER
function findBarbier(criteria) {
  const allBarbiers = Object.values(salons).flatMap((salon) => salon.barbiers);

  if (criteria.name) {
    return allBarbiers.find(
      (b) => b.name.toLowerCase() === criteria.name.toLowerCase(),
    );
  }

  if (criteria.specialty) {
    return allBarbiers.filter((b) =>
      b.specialties.some((s) =>
        s.toLowerCase().includes(criteria.specialty.toLowerCase()),
      ),
    );
  }

  return allBarbiers;
}

// 📅 VÉRIFIER DISPONIBILITÉ
function checkAvailability(barbierId, date, time) {
  const existingBookings = bookings.filter(
    (b) =>
      b.barbierId === barbierId &&
      b.date === date &&
      b.time === time &&
      b.status !== "annulé",
  );

  return existingBookings.length === 0;
}

// 📊 STATISTIQUES DU SYSTÈME
function getSystemStats() {
  const totalClients = clients.length;
  const totalPhoneNumbers = Object.keys(phoneProfiles).length;
  const sharedNumbers = Object.values(phoneProfiles).filter(
    (p) => p.type !== "personal",
  ).length;

  return {
    totalClients,
    totalPhoneNumbers,
    sharedNumbers,
    verificationRate:
      ((sharedNumbers / totalPhoneNumbers) * 100).toFixed(1) + "%",
    familyGroups: Object.values(phoneProfiles).filter(
      (p) => p.type === "family",
    ).length,
    officeNumbers: Object.values(phoneProfiles).filter(
      (p) => p.type === "office",
    ).length,
  };
}

// 🧪 FONCTION DE TEST DE VÉRIFICATION
function testVerificationScenarios() {
  const scenarios = [
    {
      phone: "+15145551234",
      name: null,
      expected: "Doit demander le nom",
    },
    {
      phone: "+15145551234",
      name: "Jean",
      expected: "Doit reconnaître Jean Tremblay",
    },
    {
      phone: "+15145551234",
      name: "Sophie",
      expected: "Doit reconnaître Sophie Tremblay",
    },
    {
      phone: "+15145551234",
      name: "Robert",
      expected: "Doit traiter comme nouveau sur téléphone partagé",
    },
    {
      phone: "+15145552345",
      name: null,
      expected: "Doit reconnaître Marie Dubois automatiquement",
    },
  ];

  console.log("🧪 TESTS DE VÉRIFICATION D'IDENTITÉ:");
  scenarios.forEach((s) => {
    const result = verifyCallerIdentity(s.phone, s.name);
    console.log(`📞 ${s.phone} / 👤 ${s.name || "non fourni"}`);
    console.log(`   Attendu: ${s.expected}`);
    console.log(
      `   Résultat: Vérification=${result.needsVerification}, Niveau=${result.verificationLevel}`,
    );
    console.log("---");
  });
}

// 📤 EXPORT DU MODULE
module.exports = {
  clients,
  salons,
  bookings,
  phoneProfiles,
  verifyCallerIdentity,
  findClientByName,
  getIntelligence,
  findBarbier,
  checkAvailability,
  getSystemStats,
  testVerificationScenarios,
};

// 🧪 LANCER LES TESTS SI EXÉCUTÉ DIRECTEMENT
if (require.main === module) {
  console.log("🔗 SYSTÈME DE RELATIONS CLIENT-BARBIER-SALON v2.0");
  console.log("==================================================");

  const stats = getSystemStats();
  console.log("\n📊 STATISTIQUES DU SYSTÈME:");
  console.log(`   Clients totaux: ${stats.totalClients}`);
  console.log(`   Numéros totaux: ${stats.totalPhoneNumbers}`);
  console.log(`   Numéros partagés: ${stats.sharedNumbers}`);
  console.log(`   Taux de vérification requis: ${stats.verificationRate}`);
  console.log(`   Groupes familiaux: ${stats.familyGroups}`);
  console.log(`   Numéros de bureau: ${stats.officeNumbers}`);

  console.log("\n🧪 LANCEMENT DES TESTS DE VÉRIFICATION:");
  testVerificationScenarios();
}
