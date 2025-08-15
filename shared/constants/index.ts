// 📊 CONSTANTES BUSINESS SAVAGECO
// Valeurs communes entre tous les projets

export const SALON_PROFILES = {
  TONY: {
    id: 'salon-tony-barbier',
    name: 'Salon Tony',
    barbier: 'Marco',
    specialties: ['Barbe traditionnelle', 'Rasage classique'],
    price: 45,
    phone: '514-555-1001',
  },
  GUSTAVE: {
    id: 'salon-gustave-coiffure', 
    name: 'Salon Gustave',
    barbier: 'Jessica',
    specialties: ['Colorations', 'Coupes femmes'],
    price: 55,
    phone: '438-555-1002',
  },
  INDEPENDENT: {
    id: 'salon-independent-barber',
    name: 'Independent Barber',
    barbier: 'Alex',
    specialties: ['Coupes modernes', 'Fades artistiques'],
    price: 50,
    phone: '514-555-1003',
  },
};

export const SERVICE_TYPES = {
  COUPE: 'coupe',
  BARBE: 'barbe',
  RASAGE: 'rasage',
  COLORATION: 'coloration',
  DESIGN: 'design',
  TRAITEMENT: 'traitement',
};

export const BUSINESS_HOURS = {
  MONDAY: { open: '09:00', close: '18:00' },
  TUESDAY: { open: '09:00', close: '18:00' },
  WEDNESDAY: { open: '09:00', close: '18:00' },
  THURSDAY: { open: '09:00', close: '18:00' },
  FRIDAY: { open: '09:00', close: '18:00' },
  SATURDAY: { open: '09:00', close: '16:00' },
  SUNDAY: { open: null, close: null }, // Fermé
};

export const REVENUE_TARGETS = {
  ANNUAL_TARGET: 1220000, // $1.22M
  MONTHLY_TARGET: 101667,
  WEEKLY_TARGET: 23462,
  DAILY_TARGET: 3342,
  
  // Répartition par produit
  APP_MOBILE_SHARE: 0.7, // 70%
  MARCEL_AI_SHARE: 0.3,   // 30%
};

export const QUEBEC_LOCALIZATION = {
  CURRENCY_SYMBOL: '$',
  CURRENCY_CODE: 'CAD',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  PHONE_FORMAT: '(XXX) XXX-XXXX',
  POSTAL_CODE_REGEX: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
};