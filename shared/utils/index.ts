// 🔧 UTILITAIRES PARTAGÉS SAVAGECO
// Fonctions réutilisables entre projets

/**
 * Formater un numéro de téléphone pour Marcel AI
 */
export function formatPhoneForMarcel(phone: string): string {
  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');
  
  // Format canadien/québécois
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return phone;
}

/**
 * Valider un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formater un prix en dollars canadiens
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

/**
 * Générer un ID unique
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Calculer la distance entre deux timestamps
 */
export function getTimeDistance(from: string, to: string): {
  hours: number;
  minutes: number;
  humanReadable: string;
} {
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  const diffMs = Math.abs(toTime - fromTime);
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let humanReadable = '';
  if (hours > 0) {
    humanReadable += `${hours}h`;
  }
  if (minutes > 0) {
    humanReadable += `${minutes}m`;
  }
  
  return { hours, minutes, humanReadable: humanReadable || '0m' };
}

/**
 * Logger unifié pour tous les projets
 */
export class Logger {
  static info(message: string, context?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context || '');
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }
  
  static warn(message: string, context?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context || '');
  }
  
  static debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, context || '');
    }
  }
}