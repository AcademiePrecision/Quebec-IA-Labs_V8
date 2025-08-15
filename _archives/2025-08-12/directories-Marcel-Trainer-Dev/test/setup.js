// Jest Test Setup for Marcel V7.0
// =============================================
// Configuration et mocks globaux pour les tests
// =============================================

// Timeout global plus long pour les tests d'intégration
jest.setTimeout(30000);

// Mock console pour réduire le bruit dans les tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Désactiver les logs en mode test sauf si DEBUG_TESTS est activé
if (process.env.DEBUG_TESTS !== 'true') {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
}

// Restaurer les console methods pour les erreurs critiques
global.console.warn = originalConsoleLog;

// Mock des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Port dynamique pour les tests

// Clean up après tous les tests
afterAll(() => {
  // Restaurer les console methods
  global.console.log = originalConsoleLog;
  global.console.error = originalConsoleError;
  
  // Fermer toutes les connexions ouvertes
  if (global.server) {
    global.server.close();
  }
});

// Gestionnaire global d'erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});