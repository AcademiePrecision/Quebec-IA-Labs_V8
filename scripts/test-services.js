#!/usr/bin/env node

// 🧪 SCRIPT TEST SERVICES - VALET IA
// Test rapide de tous les services configurés

require('dotenv').config();
const axios = require('axios');

console.log(`
🧪 TEST SERVICES VALET IA
========================
Vérification de tous les services configurés...
`);

async function testServices() {
  const results = {
    twilio: false,
    elevenlabs: false,
    supabase: false,
    stripe: false,
    openai: false
  };

  // Test Twilio
  console.log('📞 Test Twilio...');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      // Simple test de credentials
      console.log('✅ Twilio: Credentials configurés');
      console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
      console.log(`   Numéro: ${process.env.TWILIO_PHONE_NUMBER || 'Non configuré'}`);
      results.twilio = true;
    } catch (error) {
      console.log('❌ Twilio: Erreur credentials');
    }
  } else {
    console.log('❌ Twilio: Variables manquantes');
  }

  // Test ElevenLabs
  console.log('\n🎙️ Test ElevenLabs...');
  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'CONFIGURE_ELEVENLABS_LATER') {
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      });
      console.log('✅ ElevenLabs: API fonctionnelle');
      console.log(`   Voix disponibles: ${response.data.voices?.length || 0}`);
      console.log(`   Voice ID configuré: ${process.env.ELEVENLABS_VOICE_ID_FRENCH_CA || 'Non configuré'}`);
      results.elevenlabs = true;
    } catch (error) {
      console.log('❌ ElevenLabs: Erreur API');
      console.log(`   Erreur: ${error.response?.status} ${error.response?.statusText}`);
    }
  } else {
    console.log('❌ ElevenLabs: API Key manquante ou non configurée');
  }

  // Test Supabase  
  console.log('\n🗄️ Test Supabase...');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'CONFIGURE_SUPABASE_LATER') {
    try {
      const response = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      console.log('✅ Supabase: API fonctionnelle');
      console.log(`   URL: ${process.env.SUPABASE_URL}`);
      results.supabase = true;
    } catch (error) {
      console.log('❌ Supabase: Erreur connexion');
      console.log(`   Erreur: ${error.response?.status} ${error.response?.statusText}`);
    }
  } else {
    console.log('❌ Supabase: URL manquante ou non configurée');
  }

  // Test Stripe
  console.log('\n💳 Test Stripe...');
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'CONFIGURE_STRIPE_LATER') {
    try {
      const response = await axios.get('https://api.stripe.com/v1/products?limit=1', {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        }
      });
      console.log('✅ Stripe: API fonctionnelle');
      console.log(`   Produits: ${response.data.data?.length || 0}`);
      console.log(`   Mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'Test' : 'Production'}`);
      results.stripe = true;
    } catch (error) {
      console.log('❌ Stripe: Erreur API');
      console.log(`   Erreur: ${error.response?.status} ${error.response?.statusText}`);
    }
  } else {
    console.log('❌ Stripe: Secret Key manquante ou non configurée');
  }

  // Test OpenAI
  console.log('\n🧠 Test OpenAI...');
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'CONFIGURE_OPENAI_LATER') {
    try {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      console.log('✅ OpenAI: API fonctionnelle');
      console.log(`   Modèles disponibles: ${response.data.data?.length || 0}`);
      console.log(`   GPT-4 disponible: ${response.data.data?.some(m => m.id.includes('gpt-4')) ? 'Oui' : 'Non'}`);
      results.openai = true;
    } catch (error) {
      console.log('❌ OpenAI: Erreur API');
      console.log(`   Erreur: ${error.response?.status} ${error.response?.statusText}`);
    }
  } else {
    console.log('❌ OpenAI: API Key manquante ou non configurée');
  }

  // Résumé
  const totalServices = Object.keys(results).length;
  const configuredServices = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((configuredServices / totalServices) * 100);

  console.log(`
📊 RÉSUMÉ CONFIGURATION
=======================
Services configurés: ${configuredServices}/${totalServices} (${percentage}%)

${results.twilio ? '✅' : '❌'} Twilio (Appels)
${results.elevenlabs ? '✅' : '❌'} ElevenLabs (Voix IA)  
${results.supabase ? '✅' : '❌'} Supabase (Base de données)
${results.stripe ? '✅' : '❌'} Stripe (Paiements)
${results.openai ? '✅' : '❌'} OpenAI (Intelligence)

🎯 PROCHAINES ÉTAPES:
${!results.elevenlabs ? '1. Configurer ElevenLabs (PRIORITÉ)\n' : ''}${!results.supabase ? '2. Configurer Supabase\n' : ''}${!results.stripe ? '3. Configurer Stripe\n' : ''}${!results.openai ? '4. Configurer OpenAI\n' : ''}${configuredServices === totalServices ? '🎉 Tous les services sont configurés!' : ''}

💡 Utilise le guide: CONFIGURATION_GUIDE.md
  `);

  if (configuredServices === totalServices) {
    console.log(`
🚀 VALET IA PRÊT À DÉMARRER!
============================
Tous les services sont configurés.

Test webhook: npm run server
Test app: npm start

Premier appel test sur: ${process.env.TWILIO_PHONE_NUMBER || 'Configurer numéro Twilio'}
    `);
  }
}

// Lancement du test
testServices().catch(console.error);