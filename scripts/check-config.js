#!/usr/bin/env node

// 🔍 SCRIPT VÉRIFICATION CONFIGURATION - VALET IA
// Vérification simple des variables d'environnement

require('dotenv').config();

console.log(`
🔍 VÉRIFICATION CONFIGURATION VALET IA
======================================
`);

function checkConfig() {
  const services = {
    'Twilio (Appels)': {
      required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
      optional: ['TWILIO_PHONE_NUMBER']
    },
    'ElevenLabs (Voix IA)': {
      required: ['ELEVENLABS_API_KEY'],
      optional: ['ELEVENLABS_VOICE_ID_FRENCH_CA']
    },
    'Supabase (Base de données)': {
      required: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
      optional: ['SUPABASE_SERVICE_ROLE_KEY']
    },
    'Stripe (Paiements)': {
      required: ['STRIPE_SECRET_KEY'],
      optional: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET']
    },
    'OpenAI (Intelligence)': {
      required: ['OPENAI_API_KEY'],
      optional: ['OPENAI_MODEL']
    }
  };

  let totalConfigured = 0;
  let totalServices = Object.keys(services).length;

  for (const [serviceName, config] of Object.entries(services)) {
    console.log(`\n📋 ${serviceName}:`);
    
    let serviceConfigured = true;
    
    // Vérifier variables requises
    for (const envVar of config.required) {
      const value = process.env[envVar];
      if (value && value !== `CONFIGURE_${envVar.split('_')[0]}_LATER`) {
        console.log(`   ✅ ${envVar}: Configuré (${value.substring(0, 10)}...)`);
      } else {
        console.log(`   ❌ ${envVar}: Manquant ou non configuré`);
        serviceConfigured = false;
      }
    }
    
    // Vérifier variables optionnelles
    for (const envVar of config.optional) {
      const value = process.env[envVar];
      if (value && value !== `CONFIGURE_${envVar.split('_')[0]}_LATER`) {
        console.log(`   ✅ ${envVar}: Configuré (${value.substring(0, 10)}...)`);
      } else {
        console.log(`   ⚠️ ${envVar}: Optionnel - Non configuré`);
      }
    }
    
    if (serviceConfigured) {
      totalConfigured++;
      console.log(`   🎯 Statut: PRÊT`);
    } else {
      console.log(`   🔴 Statut: À CONFIGURER`);
    }
  }

  // Résumé
  const percentage = Math.round((totalConfigured / totalServices) * 100);
  
  console.log(`
📊 RÉSUMÉ GLOBAL
================
Services configurés: ${totalConfigured}/${totalServices} (${percentage}%)

${totalConfigured >= 5 ? '🎉' : totalConfigured >= 3 ? '⚡' : '🚧'} État: ${
    totalConfigured >= 5 ? 'OPÉRATIONNEL' : 
    totalConfigured >= 3 ? 'PARTIELLEMENT PRÊT' : 
    'CONFIGURATION REQUISE'
  }
`);

  // Recommandations
  if (totalConfigured < 5) {
    console.log(`🎯 PROCHAINES ÉTAPES RECOMMANDÉES:`);
    
    if (!isConfigured('ELEVENLABS_API_KEY')) {
      console.log(`1. 🎙️ PRIORITÉ: Configurer ElevenLabs pour voix française`);
      console.log(`   → https://elevenlabs.io/sign-up`);
      console.log(`   → Plan Starter: 5$/mois`);
    }
    
    if (!isConfigured('SUPABASE_URL')) {
      console.log(`2. 🗄️ Configurer Supabase pour base de données`);
      console.log(`   → https://supabase.com/dashboard`);
      console.log(`   → Plan gratuit disponible`);
    }
    
    if (!isConfigured('STRIPE_SECRET_KEY')) {
      console.log(`3. 💳 Configurer Stripe pour monétisation 99$/mois`);
      console.log(`   → https://dashboard.stripe.com/`);
    }
    
    if (!isConfigured('OPENAI_API_KEY')) {
      console.log(`4. 🧠 Configurer OpenAI pour intelligence IA`);
      console.log(`   → https://platform.openai.com/`);
      console.log(`   → 50$ de crédit recommandé`);
    }
    
    console.log(`\n📖 Guide détaillé: CONFIGURATION_GUIDE.md`);
  } else {
    console.log(`🚀 VALET IA PRÊT À DÉMARRER!`);
    console.log(`\nCommandes suivantes:`);
    console.log(`• npm run server  (Serveur webhooks)`);
    console.log(`• npm start       (App React Native)`);
    console.log(`\nTest webhook: Appeler ${process.env.TWILIO_PHONE_NUMBER || '[Configurer numéro Twilio]'}`);
  }

  // Variables d'environnement détectées
  console.log(`\n🔧 Variables d'environnement détectées:`);
  const envVars = Object.keys(process.env).filter(key => 
    key.includes('TWILIO') || 
    key.includes('ELEVENLABS') || 
    key.includes('SUPABASE') || 
    key.includes('STRIPE') || 
    key.includes('OPENAI')
  );
  
  if (envVars.length > 0) {
    envVars.forEach(envVar => {
      const value = process.env[envVar];
      console.log(`   ${envVar}: ${value ? (value.substring(0, 15) + '...') : 'Non défini'}`);
    });
  } else {
    console.log(`   ❌ Aucune variable Valet IA détectée`);
    console.log(`   💡 Créez un fichier .env basé sur .env.example`);
  }
}

function isConfigured(envVar) {
  const value = process.env[envVar];
  return value && !value.includes('CONFIGURE_') && !value.includes('_LATER');
}

// Lancement
checkConfig();