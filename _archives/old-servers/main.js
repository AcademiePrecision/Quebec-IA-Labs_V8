#!/usr/bin/env node

// 🚀 POINT D'ENTRÉE PRINCIPAL REPLIT
// Ce fichier doit être utilisé comme entrypoint dans Replit

console.log("🔧 DÉMARRAGE VALET IA...");
console.log("Node version:", process.version);
console.log("Working directory:", process.cwd());

// Vérifier les variables d'environnement critiques
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN', 
  'TWILIO_PHONE_NUMBER'
];

console.log("🔍 Vérification variables d'environnement:");
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  console.log(`  ${envVar}: ${value ? '✅ Configuré' : '❌ Manquant'}`);
}

// Charger le serveur principal
try {
  console.log("📦 Chargement du serveur...");
  require('./replit-server-fixed.js');
} catch (error) {
  console.error("💥 ERREUR CRITIQUE:", error.message);
  console.error("Stack:", error.stack);
  
  // Fallback vers serveur minimal
  console.log("🔄 Fallback vers serveur minimal...");
  try {
    require('./simple-test-server.js');
  } catch (fallbackError) {
    console.error("💥 ERREUR FALLBACK:", fallbackError.message);
    process.exit(1);
  }
}