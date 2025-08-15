#!/usr/bin/env node

// 🚀 SCRIPT CONFIGURATION AUTOMATIQUE - VALET IA
// Execute: node scripts/setup-environment.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log(`
🤖 CONFIGURATION VALET IA - SALONS DE COIFFURE
===============================================

Ce script va configurer automatiquement ton environnement.
Tu auras besoin de:
✅ Compte Twilio (déjà créé)
❓ Compte ElevenLabs (voix française)
❓ Compte Supabase (base de données)
❓ Compte Stripe (paiements)
❓ Compte OpenAI (intelligence IA)

Commençons...
`);

async function setupEnvironment() {
  const config = {};

  console.log('\n🔧 CONFIGURATION SERVICES...\n');

  // Twilio (déjà créé)
  console.log('📞 TWILIO (déjà configuré)');
  config.TWILIO_ACCOUNT_SID = await question('Account SID Twilio: ');
  config.TWILIO_AUTH_TOKEN = await question('Auth Token Twilio: ');
  config.TWILIO_PHONE_NUMBER = await question('Numéro Twilio (+15551234567): ');

  // ElevenLabs
  console.log('\n🎙️ ELEVENLABS (voix française IA)');
  console.log('💡 Si pas de compte: https://elevenlabs.io/ → Plan Starter $5/mois');
  const hasElevenLabs = await question('As-tu un compte ElevenLabs? (y/n): ');
  
  if (hasElevenLabs.toLowerCase() === 'y') {
    config.ELEVENLABS_API_KEY = await question('API Key ElevenLabs: ');
    config.ELEVENLABS_VOICE_ID_FRENCH_CA = await question('Voice ID français (ou laisser vide): ') || 'fr-CA-sylvie-warm';
  } else {
    console.log('❌ ElevenLabs requis pour voix naturelle. Utilisation voix par défaut...');
    config.ELEVENLABS_API_KEY = 'CONFIGURE_ELEVENLABS_LATER';
    config.ELEVENLABS_VOICE_ID_FRENCH_CA = 'fr-CA-default';
  }

  // Supabase
  console.log('\n🗄️ SUPABASE (base de données)');
  console.log('💡 Si pas de compte: https://supabase.com/ → Nouveau projet');
  const hasSupabase = await question('As-tu un projet Supabase? (y/n): ');
  
  if (hasSupabase.toLowerCase() === 'y') {
    config.SUPABASE_URL = await question('URL Supabase (https://xxx.supabase.co): ');
    config.SUPABASE_ANON_KEY = await question('Anon Key Supabase: ');
    config.SUPABASE_SERVICE_ROLE_KEY = await question('Service Role Key Supabase: ');
  } else {
    console.log('❌ Supabase requis pour base de données. Configuration plus tard...');
    config.SUPABASE_URL = 'CONFIGURE_SUPABASE_LATER';
    config.SUPABASE_ANON_KEY = 'CONFIGURE_SUPABASE_LATER';
    config.SUPABASE_SERVICE_ROLE_KEY = 'CONFIGURE_SUPABASE_LATER';
  }

  // Stripe
  console.log('\n💳 STRIPE (paiements 99$/mois)');
  console.log('💡 Si pas de compte: https://stripe.com/ → Mode test d\'abord');
  const hasStripe = await question('As-tu un compte Stripe? (y/n): ');
  
  if (hasStripe.toLowerCase() === 'y') {
    config.STRIPE_PUBLISHABLE_KEY = await question('Publishable Key Stripe (pk_test_...): ');
    config.STRIPE_SECRET_KEY = await question('Secret Key Stripe (sk_test_...): ');
    config.STRIPE_WEBHOOK_SECRET = await question('Webhook Secret (whsec_... ou laisser vide): ') || 'CONFIGURE_WEBHOOK_LATER';
  } else {
    console.log('❌ Stripe requis pour monétisation. Configuration plus tard...');
    config.STRIPE_PUBLISHABLE_KEY = 'CONFIGURE_STRIPE_LATER';
    config.STRIPE_SECRET_KEY = 'CONFIGURE_STRIPE_LATER';
    config.STRIPE_WEBHOOK_SECRET = 'CONFIGURE_STRIPE_LATER';
  }

  // OpenAI
  console.log('\n🧠 OPENAI (intelligence IA)');
  console.log('💡 Si pas de compte: https://platform.openai.com/ → $50 crédit');
  const hasOpenAI = await question('As-tu un compte OpenAI? (y/n): ');
  
  if (hasOpenAI.toLowerCase() === 'y') {
    config.OPENAI_API_KEY = await question('API Key OpenAI (sk-...): ');
    config.OPENAI_MODEL = 'gpt-4';
  } else {
    console.log('⚠️ OpenAI optionnel mais recommandé pour IA avancée...');
    config.OPENAI_API_KEY = 'CONFIGURE_OPENAI_LATER';
    config.OPENAI_MODEL = 'gpt-3.5-turbo';
  }

  // Configuration additionnelle
  config.NODE_ENV = 'development';
  config.PORT = '3000';
  config.APP_URL = await question('URL de ton app Replit (https://xxx.replit.dev): ') || 'https://your-app.replit.dev';
  config.JWT_SECRET = generateRandomString(32);
  config.ENCRYPTION_KEY = generateRandomString(32);
  config.USE_MOCK_DATA = 'true';
  config.ENABLE_DEMO_MODE = 'true';
  config.DEMO_SALON_ID = 'salon-001-tony';

  // Génération fichier .env
  await generateEnvFile(config);
  
  console.log('\n✅ CONFIGURATION TERMINÉE!');
  console.log(`
📋 RÉSUMÉ:
- Fichier .env créé
- ${Object.keys(config).length} variables configurées
- Mode développement activé
- Données de démonstration disponibles

🚀 PROCHAINES ÉTAPES:
1. Vérifier le fichier .env généré
2. Installer dépendances: npm run setup
3. Démarrer l'app: npm start
4. Tester avec salon Tony: ${config.DEMO_SALON_ID}

💡 SERVICES À CONFIGURER:
${!hasElevenLabs ? '- ❌ ElevenLabs (voix IA)\n' : ''}${!hasSupabase ? '- ❌ Supabase (base de données)\n' : ''}${!hasStripe ? '- ❌ Stripe (paiements)\n' : ''}${!hasOpenAI ? '- ❌ OpenAI (IA avancée)\n' : ''}

📞 TEST RAPIDE:
Appelle ton numéro Twilio pour tester la voix IA!
  `);

  rl.close();
}

async function generateEnvFile(config) {
  let envContent = `# 🤖 CONFIGURATION VALET IA - GÉNÉRÉ AUTOMATIQUEMENT
# Date: ${new Date().toISOString()}
# ⚠️ GARDEZ CE FICHIER SECRET - NE JAMAIS COMMITTER

# ==============================================
# TWILIO - GESTION APPELS 24/7
# ==============================================
TWILIO_ACCOUNT_SID=${config.TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${config.TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${config.TWILIO_PHONE_NUMBER}
TWILIO_WEBHOOK_URL=${config.APP_URL}/webhook

# ==============================================
# ELEVENLABS - VOIX FRANÇAISE IA
# ==============================================
ELEVENLABS_API_KEY=${config.ELEVENLABS_API_KEY}
ELEVENLABS_VOICE_ID_FRENCH_CA=${config.ELEVENLABS_VOICE_ID_FRENCH_CA}

# ==============================================
# SUPABASE - BASE DE DONNÉES
# ==============================================
SUPABASE_URL=${config.SUPABASE_URL}
SUPABASE_ANON_KEY=${config.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}

# ==============================================
# STRIPE - MONÉTISATION 99$/SALON
# ==============================================
STRIPE_PUBLISHABLE_KEY=${config.STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${config.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${config.STRIPE_WEBHOOK_SECRET}

# ==============================================
# OPENAI - INTELLIGENCE IA
# ==============================================
OPENAI_API_KEY=${config.OPENAI_API_KEY}
OPENAI_MODEL=${config.OPENAI_MODEL}

# ==============================================
# CONFIGURATION SALON
# ==============================================
NODE_ENV=${config.NODE_ENV}
PORT=${config.PORT}
APP_URL=${config.APP_URL}

# ==============================================
# SÉCURITÉ
# ==============================================
JWT_SECRET=${config.JWT_SECRET}
ENCRYPTION_KEY=${config.ENCRYPTION_KEY}

# ==============================================
# DÉVELOPPEMENT
# ==============================================
USE_MOCK_DATA=${config.USE_MOCK_DATA}
ENABLE_DEMO_MODE=${config.ENABLE_DEMO_MODE}
DEMO_SALON_ID=${config.DEMO_SALON_ID}

# ==============================================
# NOTIFICATIONS (OPTIONNEL)
# ==============================================
SENDGRID_API_KEY=CONFIGURE_SENDGRID_LATER
SENDGRID_FROM_EMAIL=noreply@quebecai-labs.com
SENTRY_DSN=CONFIGURE_SENTRY_LATER
`;

  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Fichier .env créé avec succès!');
  
  // Créer aussi .env.local pour Replit
  const envLocalPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Fichier .env.local créé pour Replit!');
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Lancement du script
if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };