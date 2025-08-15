import { BaseAccount, UserProfile, AdminProfile, SalonPartenaireProfile, MaitreFormateurProfile, AcademicienBarbierProfile } from '../types';

// CEO Account (cannot be deleted)
export const ceoAccount: BaseAccount = {
  id: 'account-ceo-001',
  email: 'academieprecision@gmail.com',
  password: 'test1234',
  firstName: 'François',
  lastName: 'Maillé',
  phone: '418-951-0161',
  dateOfBirth: '1975-06-15',
  preferredLanguage: 'fr',
  createdAt: '2024-01-01T08:00:00.000Z',
  updatedAt: '2024-01-01T08:00:00.000Z',
  lastUsedProfile: 'admin'
};

export const ceoProfile: AdminProfile = {
  id: 'profile-ceo-001',
  accountId: 'account-ceo-001',
  userType: 'admin',
  isActive: true,
  adminAccessCode: 'CEO2024!',
  department: 'Administrateur/PDG',
  createdAt: '2024-01-01T08:00:00.000Z',
  updatedAt: '2024-01-01T08:00:00.000Z'
};

// Additional Admin Accounts
export const adminAccounts: BaseAccount[] = [
  {
    id: 'account-admin-002',
    email: 'marie.dubois@academieprecision.com',
    password: 'admin123',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '514-555-0102',
    dateOfBirth: '1982-03-22',
    preferredLanguage: 'fr',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T09:00:00.000Z',
    lastUsedProfile: 'admin'
  },
  {
    id: 'account-admin-003',
    email: 'john.smith@academieprecision.com',
    password: 'admin456',
    firstName: 'John',
    lastName: 'Smith',
    phone: '514-555-0103',
    dateOfBirth: '1979-11-08',
    preferredLanguage: 'en',
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
    lastUsedProfile: 'admin'
  }
];

export const adminProfiles: AdminProfile[] = [
  {
    id: 'profile-admin-002',
    accountId: 'account-admin-002',
    userType: 'admin',
    isActive: true,
    adminAccessCode: 'ADMIN2024',
    department: 'Opérations',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T09:00:00.000Z'
  },
  {
    id: 'profile-admin-003',
    accountId: 'account-admin-003',
    userType: 'admin',
    isActive: true,
    adminAccessCode: 'ADMIN2024',
    department: 'Technology',
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z'
  }
];

// Salon Partner Accounts (5 salons with multiple locations)
export const salonAccounts: BaseAccount[] = [
  // Salon 1 - Elite Barbershop (2 locations)
  {
    id: 'account-salon-001',
    email: 'owner@elitebarbershop.com',
    password: 'salon123',
    firstName: 'Alexandre',
    lastName: 'Gagnon',
    phone: '514-555-1001',
    dateOfBirth: '1980-04-15',
    preferredLanguage: 'fr',
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  },
  // Salon 2 - Prestige Cuts (3 locations)
  {
    id: 'account-salon-002',
    email: 'manager@prestigecuts.com',
    password: 'salon456',
    firstName: 'Sophie',
    lastName: 'Tremblay',
    phone: '438-555-1002',
    dateOfBirth: '1985-07-20',
    preferredLanguage: 'fr',
    createdAt: '2024-02-05T09:00:00.000Z',
    updatedAt: '2024-02-05T09:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  },
  // Salon 3 - Modern Cuts (1 location)
  {
    id: 'account-salon-003',
    email: 'info@moderncuts.ca',
    password: 'salon789',
    firstName: 'David',
    lastName: 'Wilson',
    phone: '514-555-1003',
    dateOfBirth: '1978-12-03',
    preferredLanguage: 'en',
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-02-10T10:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  },
  // Salon 4 - Royal Barbering (2 locations)
  {
    id: 'account-salon-004',
    email: 'contact@royalbarbering.com',
    password: 'salon101',
    firstName: 'Marc',
    lastName: 'Leblanc',
    phone: '450-555-1004',
    dateOfBirth: '1982-09-18',
    preferredLanguage: 'fr',
    createdAt: '2024-02-15T11:00:00.000Z',
    updatedAt: '2024-02-15T11:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  },
  // Salon 5 - Classic Styles (1 location)
  {
    id: 'account-salon-005',
    email: 'admin@classicstyles.com',
    password: 'salon202',
    firstName: 'Julie',
    lastName: 'Martin',
    phone: '418-555-1005',
    dateOfBirth: '1987-01-25',
    preferredLanguage: 'fr',
    createdAt: '2024-02-20T12:00:00.000Z',
    updatedAt: '2024-02-20T12:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  }
];

export const salonProfiles: SalonPartenaireProfile[] = [
  {
    id: 'profile-salon-001',
    accountId: 'account-salon-001',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Elite Barbershop',
    salonAddress: '1234 Rue Saint-Denis, Montréal, QC',
    businessNumber: 'NEQ-1234567890',
    website: 'www.elitebarbershop.com',
    employeeCount: 12,
    yearsExperience: 8,
    servicesOffered: ['Coupe classique', 'Barbe', 'Rasage traditionnel', 'Soins capillaires'],
    equipmentAvailable: ['Fauteuils hydrauliques', 'Outils professionnels', 'Produits haut de gamme'],
    workingHours: 'Lun-Ven: 8h-20h, Sam: 8h-18h, Dim: 10h-16h',
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z'
  },
  {
    id: 'profile-salon-002',
    accountId: 'account-salon-002',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Prestige Cuts',
    salonAddress: '5678 Boulevard Saint-Laurent, Montréal, QC',
    businessNumber: 'NEQ-2345678901',
    website: 'www.prestigecuts.com',
    employeeCount: 18,
    yearsExperience: 12,
    servicesOffered: ['Coupe moderne', 'Styling', 'Coloration', 'Traitements'],
    equipmentAvailable: ['Équipement dernière génération', 'Produits bio'],
    workingHours: 'Lun-Sam: 9h-21h, Dim: 11h-17h',
    createdAt: '2024-02-05T09:00:00.000Z',
    updatedAt: '2024-02-05T09:00:00.000Z'
  },
  {
    id: 'profile-salon-003',
    accountId: 'account-salon-003',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Modern Cuts',
    salonAddress: '910 Crescent Street, Montreal, QC',
    businessNumber: 'NEQ-3456789012',
    employeeCount: 6,
    yearsExperience: 5,
    servicesOffered: ['Modern cuts', 'Beard styling', 'Hair treatments'],
    equipmentAvailable: ['Professional tools', 'Premium products'],
    workingHours: 'Mon-Fri: 9am-7pm, Sat: 9am-6pm',
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-02-10T10:00:00.000Z'
  },
  {
    id: 'profile-salon-004',
    accountId: 'account-salon-004',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Royal Barbering',
    salonAddress: '1122 Rue Sherbrooke, Laval, QC',
    businessNumber: 'NEQ-4567890123',
    website: 'www.royalbarbering.com',
    employeeCount: 15,
    yearsExperience: 10,
    servicesOffered: ['Coupe royal', 'Rasage premium', 'Soins de luxe'],
    equipmentAvailable: ['Chaises en cuir', 'Outils artisanaux'],
    workingHours: 'Mar-Sam: 10h-19h',
    createdAt: '2024-02-15T11:00:00.000Z',
    updatedAt: '2024-02-15T11:00:00.000Z'
  },
  {
    id: 'profile-salon-005',
    accountId: 'account-salon-005',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Classic Styles',
    salonAddress: '3344 Grande Allée, Québec, QC',
    businessNumber: 'NEQ-5678901234',
    employeeCount: 8,
    yearsExperience: 6,
    servicesOffered: ['Coupes classiques', 'Mise en plis', 'Conseils style'],
    equipmentAvailable: ['Matériel traditionnel', 'Produits naturels'],
    workingHours: 'Lun-Ven: 8h30-17h30, Sam: 9h-15h',
    createdAt: '2024-02-20T12:00:00.000Z',
    updatedAt: '2024-02-20T12:00:00.000Z'
  }
];

// Independent Trainer Accounts (5 independent trainers)
export const independentTrainerAccounts: BaseAccount[] = [
  {
    id: 'account-trainer-001',
    email: 'pierre.expert@gmail.com',
    password: 'trainer123',
    firstName: 'Pierre',
    lastName: 'Expert',
    phone: '514-555-2001',
    dateOfBirth: '1975-08-12',
    preferredLanguage: 'fr',
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-03-01T08:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  },
  {
    id: 'account-trainer-002',
    email: 'sarah.master@outlook.com',
    password: 'trainer456',
    firstName: 'Sarah',
    lastName: 'Master',
    phone: '438-555-2002',
    dateOfBirth: '1980-05-30',
    preferredLanguage: 'en',
    createdAt: '2024-03-05T09:00:00.000Z',
    updatedAt: '2024-03-05T09:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  },
  {
    id: 'account-trainer-003',
    email: 'antonio.maestro@hotmail.com',
    password: 'trainer789',
    firstName: 'Antonio',
    lastName: 'Maestro',
    phone: '514-555-2003',
    dateOfBirth: '1983-02-14',
    preferredLanguage: 'fr',
    createdAt: '2024-03-10T10:00:00.000Z',
    updatedAt: '2024-03-10T10:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  },
  {
    id: 'account-trainer-004',
    email: 'linda.pro@gmail.com',
    password: 'trainer101',
    firstName: 'Linda',
    lastName: 'Professional',
    phone: '450-555-2004',
    dateOfBirth: '1978-11-28',
    preferredLanguage: 'en',
    createdAt: '2024-03-15T11:00:00.000Z',
    updatedAt: '2024-03-15T11:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  },
  {
    id: 'account-trainer-005',
    email: 'claude.virtuose@yahoo.ca',
    password: 'trainer202',
    firstName: 'Claude',
    lastName: 'Virtuose',
    phone: '418-555-2005',
    dateOfBirth: '1972-07-06',
    preferredLanguage: 'fr',
    createdAt: '2024-03-20T12:00:00.000Z',
    updatedAt: '2024-03-20T12:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  }
];

export const independentTrainerProfiles: MaitreFormateurProfile[] = [
  {
    id: 'profile-trainer-001',
    accountId: 'account-trainer-001',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Coupe classique', 'Rasage traditionnel', 'Formation débutants'],
    yearsExperience: 20,
    certifications: ['Maître Barbier Certifié', 'Formateur Agréé'],
    portfolio: ['Portfolio URL 1', 'Portfolio URL 2'],
    hourlyRate: 85,
    weeklyAvailability: 'Lun-Mer-Ven: 9h-17h',
    professionalBio: 'Expert en techniques traditionnelles avec 20 ans d\'expérience',
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-03-01T08:00:00.000Z'
  },
  {
    id: 'profile-trainer-002',
    accountId: 'account-trainer-002',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Modern styling', 'Color techniques', 'Advanced cuts'],
    yearsExperience: 15,
    certifications: ['Advanced Stylist', 'Color Specialist'],
    portfolio: ['Portfolio URL 3', 'Portfolio URL 4'],
    hourlyRate: 90,
    weeklyAvailability: 'Tue-Thu-Sat: 10am-6pm',
    professionalBio: 'Specialist in modern techniques and color innovation',
    createdAt: '2024-03-05T09:00:00.000Z',
    updatedAt: '2024-03-05T09:00:00.000Z'
  },
  {
    id: 'profile-trainer-003',
    accountId: 'account-trainer-003',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Coupe artistique', 'Création de styles', 'Techniques avancées'],
    yearsExperience: 12,
    certifications: ['Artiste Capillaire', 'Créateur de Tendances'],
    portfolio: ['Portfolio URL 5', 'Portfolio URL 6'],
    hourlyRate: 95,
    weeklyAvailability: 'Mar-Jeu-Sam: 11h-19h',
    professionalBio: 'Créateur de styles uniques et formateur passionné',
    createdAt: '2024-03-10T10:00:00.000Z',
    updatedAt: '2024-03-10T10:00:00.000Z'
  },
  {
    id: 'profile-trainer-004',
    accountId: 'account-trainer-004',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Business training', 'Salon management', 'Client service'],
    yearsExperience: 18,
    certifications: ['Business Coach', 'Management Expert'],
    portfolio: ['Portfolio URL 7', 'Portfolio URL 8'],
    hourlyRate: 100,
    weeklyAvailability: 'Mon-Wed-Fri: 8am-4pm',
    professionalBio: 'Expert in salon business operations and management',
    createdAt: '2024-03-15T11:00:00.000Z',
    updatedAt: '2024-03-15T11:00:00.000Z'
  },
  {
    id: 'profile-trainer-005',
    accountId: 'account-trainer-005',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Techniques précision', 'Formation maître', 'Perfectionnement'],
    yearsExperience: 25,
    certifications: ['Maître Formateur', 'Expert Précision'],
    portfolio: ['Portfolio URL 9', 'Portfolio URL 10'],
    hourlyRate: 110,
    weeklyAvailability: 'Lun-Mer-Ven: 8h-16h',
    professionalBio: 'Formateur de formateurs avec une expertise de 25 ans',
    createdAt: '2024-03-20T12:00:00.000Z',
    updatedAt: '2024-03-20T12:00:00.000Z'
  }
];

// Student/Barber Accounts (20 students)
export const studentAccounts: BaseAccount[] = [
  // 20 student accounts with varied backgrounds
  ...Array.from({ length: 20 }, (_, i) => {
    const studentId = i + 1;
    const firstNames = [
      'Mathieu', 'Jessica', 'Kevin', 'Amélie', 'Nicolas', 'Valérie', 'Samuel', 'Caroline',
      'Gabriel', 'Mélanie', 'Anthony', 'Isabelle', 'Jonathan', 'Stéphanie', 'Alexandre',
      'Marie-Pier', 'Francis', 'Karine', 'Vincent', 'Nathalie'
    ];
    const lastNames = [
      'Bouchard', 'Gagnon', 'Roy', 'Côté', 'Boucher', 'Gauthier', 'Morin', 'Lavoie',
      'Fortin', 'Gagné', 'Ouellet', 'Pelletier', 'Bélanger', 'Bergeron', 'Paquette',
      'Girard', 'Simard', 'Tremblay', 'Fournier', 'Levesque'
    ];
    
    return {
      id: `account-student-${studentId.toString().padStart(3, '0')}`,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
      password: 'student123',
      firstName: firstNames[i],
      lastName: lastNames[i],
      phone: `514-555-${(3000 + studentId).toString()}`,
      dateOfBirth: `${1990 + (studentId % 10)}-${String((studentId % 12) + 1).padStart(2, '0')}-${String((studentId % 28) + 1).padStart(2, '0')}`,
      preferredLanguage: (studentId % 5 === 0 ? 'en' : 'fr') as 'fr' | 'en',
      createdAt: `2024-04-${String((studentId % 30) + 1).padStart(2, '0')}T${String(8 + (studentId % 8)).padStart(2, '0')}:00:00.000Z`,
      updatedAt: `2024-04-${String((studentId % 30) + 1).padStart(2, '0')}T${String(8 + (studentId % 8)).padStart(2, '0')}:00:00.000Z`,
      lastUsedProfile: 'academicien_barbier'
    } as BaseAccount;
  })
];

export const studentProfiles: AcademicienBarbierProfile[] = [
  ...studentAccounts.map((account, i) => {
    const studentId = i + 1;
    const experienceLevels: ('debutant' | 'intermediaire' | 'avance')[] = ['debutant', 'intermediaire', 'avance'];
    const specialties = [
      ['Coupe classique', 'Barbe'],
      ['Rasage', 'Soins'],
      ['Styling moderne', 'Coloration'],
      ['Techniques avancées', 'Coupe artistique'],
      ['Formation business', 'Service client']
    ];
    
    return {
      id: `profile-student-${studentId.toString().padStart(3, '0')}`,
      accountId: account.id,
      userType: 'academicien_barbier',
      isActive: true,
      experienceLevel: experienceLevels[studentId % 3],
      specialtiesOfInterest: specialties[studentId % 5],
      trainingGoals: studentId % 3 === 0 ? 'Devenir maître formateur' : 
                    studentId % 3 === 1 ? 'Ouvrir mon propre salon' : 
                    'Perfectionner mes techniques',
      employerSalon: studentId % 4 === 0 ? salonProfiles[studentId % 5].salonName : undefined,
      monthlyTrainingBudget: 100 + (studentId * 25),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    } as AcademicienBarbierProfile;
  })
];

// Salon-attached trainers (distributed across salons)
export const salonTrainerAccounts: BaseAccount[] = [];
export const salonTrainerProfiles: MaitreFormateurProfile[] = [];

// Generate trainers for each salon
salonAccounts.forEach((salon, salonIndex) => {
  const salonProfile = salonProfiles[salonIndex];
  const trainerCounts = [6, 8, 4, 7, 5]; // trainers per salon
  const trainerCount = trainerCounts[salonIndex];
  
  for (let i = 0; i < trainerCount; i++) {
    // Generate a truly unique trainer ID using salon index and trainer index
    const uniqueTrainerId = `${salonIndex.toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`;
    const trainerNames = [
      ['Michel', 'Dupont'], ['Lucie', 'Bernard'], ['Robert', 'Petit'], ['Annie', 'Robert'],
      ['François', 'Richard'], ['Diane', 'Mercier'], ['Alain', 'Durand'], ['Sylvie', 'Moreau'],
      ['Jean', 'Simon'], ['Louise', 'Laurent'], ['Daniel', 'Lefebvre'], ['Chantal', 'Michel'],
      ['André', 'Garcia'], ['Nicole', 'David'], ['Pierre', 'Roux'], ['Monique', 'Bertrand']
    ];
    
    const [firstName, lastName] = trainerNames[(salonIndex * 8 + i) % trainerNames.length];
    
    const trainerAccount: BaseAccount = {
      id: `account-salon-trainer-${uniqueTrainerId}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${salonProfile.salonName.toLowerCase().replace(/\s+/g, '')}.com`,
      password: 'trainer123',
      firstName,
      lastName,
      phone: `514-555-${4000 + parseInt(uniqueTrainerId)}`,
      dateOfBirth: `${1970 + (parseInt(uniqueTrainerId) % 20)}-${String(((parseInt(uniqueTrainerId) % 12) + 1)).padStart(2, '0')}-${String(((parseInt(uniqueTrainerId) % 28) + 1)).padStart(2, '0')}`,
      preferredLanguage: salonProfile.salonAddress.includes('Montreal, QC') ? 'en' : 'fr',
      createdAt: `2024-04-${String(((parseInt(uniqueTrainerId) % 30) + 1)).padStart(2, '0')}T09:00:00.000Z`,
      updatedAt: `2024-04-${String(((parseInt(uniqueTrainerId) % 30) + 1)).padStart(2, '0')}T09:00:00.000Z`,
      lastUsedProfile: 'maitre_formateur'
    };
    
    const trainerProfile: MaitreFormateurProfile = {
      id: `profile-salon-trainer-${uniqueTrainerId}`,
      accountId: trainerAccount.id,
      userType: 'maitre_formateur',
      isActive: true,
      specialties: [
        ['Coupe moderne', 'Styling'],
        ['Rasage traditionnel', 'Barbe'],
        ['Techniques avancées', 'Formation'],
        ['Soins capillaires', 'Conseils'],
        ['Service client', 'Vente']
      ][i % 5],
      yearsExperience: 3 + (i * 2),
      certifications: ['Barbier Certifié', 'Formation Continue'],
      portfolio: [`Portfolio ${uniqueTrainerId}-1`, `Portfolio ${uniqueTrainerId}-2`],
      attachedSalon: salonProfile.salonName,
      hourlyRate: 45 + (i * 5),
      weeklyAvailability: i % 2 === 0 ? 'Lun-Mer-Ven: 9h-17h' : 'Mar-Jeu-Sam: 10h-18h',
      professionalBio: `Formateur expérimenté chez ${salonProfile.salonName}`,
      createdAt: trainerAccount.createdAt,
      updatedAt: trainerAccount.updatedAt
    };
    
    salonTrainerAccounts.push(trainerAccount);
    salonTrainerProfiles.push(trainerProfile);
  }
});

// Combine all accounts and profiles
export const allMockAccounts: BaseAccount[] = [
  ceoAccount,
  ...adminAccounts,
  ...salonAccounts,
  ...independentTrainerAccounts,
  ...studentAccounts,
  ...salonTrainerAccounts
];

export const allMockProfiles: UserProfile[] = [
  ceoProfile,
  ...adminProfiles,
  ...salonProfiles,
  ...independentTrainerProfiles,
  ...studentProfiles,
  ...salonTrainerProfiles
];

// Helper function to get accounts that can be deleted (all except CEO)
export const getDeletableAccounts = (): BaseAccount[] => {
  return allMockAccounts.filter(account => account.id !== ceoAccount.id);
};

// Helper function to validate unique IDs
const validateUniqueIds = (accounts: BaseAccount[], profiles: UserProfile[]) => {
  const accountIds = accounts.map(a => a.id);
  const profileIds = profiles.map(p => p.id);
  
  const duplicateAccountIds = accountIds.filter((id, index) => accountIds.indexOf(id) !== index);
  const duplicateProfileIds = profileIds.filter((id, index) => profileIds.indexOf(id) !== index);
  
  if (duplicateAccountIds.length > 0) {
    console.error('Duplicate account IDs found:', duplicateAccountIds);
  }
  
  if (duplicateProfileIds.length > 0) {
    console.error('Duplicate profile IDs found:', duplicateProfileIds);
  }
  
  return duplicateAccountIds.length === 0 && duplicateProfileIds.length === 0;
};

// Helper function to deduplicate arrays by ID
const deduplicateById = <T extends { id: string }>(array: T[]): T[] => {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  const result = array.filter(item => {
    if (seen.has(item.id)) {
      duplicates.push(item.id);
      return false;
    }
    seen.add(item.id);
    return true;
  });
  
  if (duplicates.length > 0) {
    console.warn(`[MockData] Removed ${duplicates.length} duplicate IDs:`, duplicates);
  }
  
  return result;
};

// ===== DEBUG TEST PROFILES (Never deleted) =====
// These profiles are designed for easy testing of each screen type

export const debugTestAccounts: BaseAccount[] = [
  // Debug Student Account
  {
    id: 'debug-student-001',
    email: 'test.student@debug.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Student',
    phone: '418-999-0001',
    dateOfBirth: '1995-06-15',
    preferredLanguage: 'fr',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    lastUsedProfile: 'academicien_barbier'
  },
  // Debug Formateur Account
  {
    id: 'debug-formateur-001',
    email: 'test.formateur@debug.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Formateur',
    phone: '418-999-0002',
    dateOfBirth: '1985-08-20',
    preferredLanguage: 'fr',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    lastUsedProfile: 'maitre_formateur'
  },
  // Debug Salon Account
  {
    id: 'debug-salon-001',
    email: 'test.salon@debug.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Salon',
    phone: '418-999-0003',
    dateOfBirth: '1980-03-10',
    preferredLanguage: 'fr',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    lastUsedProfile: 'salon_partenaire'
  }
];

export const debugTestProfiles: UserProfile[] = [
  // Debug Student Profile
  {
    id: 'debug-student-profile-001',
    accountId: 'debug-student-001',
    userType: 'academicien_barbier',
    isActive: true,
    experienceLevel: 'intermediaire',
    specialtiesOfInterest: ['Coupe moderne', 'Barbe stylée'],
    trainingGoals: 'Tester toutes les fonctionnalités étudiant',
    employerSalon: undefined,
    monthlyTrainingBudget: 150,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  } as AcademicienBarbierProfile,
  // Debug Formateur Profile
  {
    id: 'debug-formateur-profile-001',
    accountId: 'debug-formateur-001',
    userType: 'maitre_formateur',
    isActive: true,
    specialties: ['Formation avancée', 'Techniques modernes'],
    yearsExperience: 8,
    certifications: ['Maître Barbier', 'Formateur Certifié', 'Spécialiste Debug'],
    portfolio: ['Portfolio Test 1', 'Portfolio Test 2'],
    attachedSalon: 'Salon Debug Test',
    hourlyRate: 75,
    weeklyAvailability: 'Lun-Ven: 9h-17h',
    professionalBio: 'Formateur de test pour déboguer toutes les fonctionnalités',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  } as MaitreFormateurProfile,
  // Debug Salon Profile
  {
    id: 'debug-salon-profile-001',
    accountId: 'debug-salon-001',
    userType: 'salon_partenaire',
    isActive: true,
    salonName: 'Salon Debug Test',
    salonAddress: '123 Debug Street, Debug City, QC H1A 1A1',
    businessNumber: 'DEBUG123456789',
    numberOfChairs: 4,
    servicesOffered: ['Coupe', 'Barbe', 'Rasage', 'Styling', 'Formation'],
    operatingHours: 'Lun-Sam: 8h-20h',
    partnershipLevel: 'premium',
    commissionRate: 0.6,
    monthlyRevenue: 25000,
    numberOfEmployees: 6,
    businessGoals: ['Test partnerships', 'Debug features', 'Validate workflows'],
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  } as SalonPartenaireProfile
];

// Helper function to initialize core data only (CEO + debug profiles)
export const initializeCoreData = (): { accounts: BaseAccount[], profiles: UserProfile[] } => {
  console.log('[MockData] initializeCoreData called');
  console.log('[MockData] ceoAccount:', ceoAccount ? `${ceoAccount.firstName} ${ceoAccount.lastName} (${ceoAccount.email})` : 'NULL');
  console.log('[MockData] debugTestAccounts count:', debugTestAccounts.length);
  
  const accounts = deduplicateById([ceoAccount, ...debugTestAccounts]);
  const profiles = deduplicateById([ceoProfile, ...debugTestProfiles]);
  
  console.log(`[MockData] Initialized core data: ${accounts.length} accounts and ${profiles.length} profiles`);
  console.log('[MockData] Core account emails:', accounts.map(a => a.email));
  
  return {
    accounts,
    profiles
  };
};

// Helper function to initialize all mock data (including test users)
export const initializeMockData = (): { accounts: BaseAccount[], profiles: UserProfile[] } => {
  const accounts = deduplicateById([...allMockAccounts, ...debugTestAccounts]);
  const profiles = deduplicateById([...allMockProfiles, ...debugTestProfiles]);
  
  console.log(`[MockData] Initialized full mock data: ${accounts.length} accounts and ${profiles.length} profiles`);
  
  return {
    accounts,
    profiles
  };
};