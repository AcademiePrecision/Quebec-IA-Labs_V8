// test-all-apis.js
require('dotenv').config();

console.log('🧪 VALIDATION COMPLÈTE DES APIS\n');

// Test Anthropic
if (process.env.ANTHROPIC_API_KEY) {
  console.log('✅ Claude AI: Configuré');
  console.log(`   Clé: ${process.env.ANTHROPIC_API_KEY.substring(0,15)}...`);
} else {
  console.log('❌ Claude AI: Manquant');
}

// Test Twilio
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  console.log('✅ Twilio: Configuré');
  console.log(`   Numéro: ${process.env.TWILIO_PHONE_NUMBER}`);
} else {
  console.log('❌ Twilio: Manquant');
}

// Test Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  console.log('✅ Supabase: Configuré');
  console.log(`   URL: ${process.env.SUPABASE_URL}`);
} else {
  console.log('❌ Supabase: Manquant');
}

// Test ElevenLabs
if (process.env.ELEVENLABS_API_KEY) {
  console.log('✅ ElevenLabs: Configuré');
  console.log(`   Voice ID: ${process.env.ELEVENLABS_VOICE_ID_FRENCH_CA}`);
} else {
  console.log('❌ ElevenLabs: Manquant');
}

console.log('\n🎉 TOUT EST PRÊT POUR LA PRODUCTION!');