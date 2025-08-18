// Test de Marcel pour vérifier qu'il ne mentionne plus d'emojis
// ============================================================

const axios = require('axios');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testMarcelVoiceResponse() {
  console.log('🔧 Test de Marcel - Vérification des réponses vocales\n');
  console.log('=' .repeat(50));
  
  const testCases = [
    {
      name: "Salutation initiale",
      message: "Bonjour Marcel",
      sessionId: "test-voice-1"
    },
    {
      name: "Demande de rendez-vous",
      message: "Je voudrais prendre rendez-vous pour une barbe",
      sessionId: "test-voice-1"
    },
    {
      name: "Confirmation avec détails",
      message: "Demain à 14h avec Marco",
      sessionId: "test-voice-1"
    },
    {
      name: "Test avec client connu",
      message: "C'est François",
      sessionId: "test-voice-2",
      phoneNumber: "+14189510161"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📞 Test: ${testCase.name}`);
    console.log(`   Message: "${testCase.message}"`);
    
    try {
      const response = await axios.post(`${BASE_URL}/test-claude`, {
        message: testCase.message,
        sessionId: testCase.sessionId,
        phoneNumber: testCase.phoneNumber
      });
      
      const marcelResponse = response.data.response;
      console.log(`   Marcel: "${marcelResponse}"`);
      
      // Vérifier qu'il n'y a pas de mots interdits
      const forbiddenWords = [
        'étoile', 'visage', 'souriant', 'emoji', 'symbole',
        'cœur', 'feu', 'éclair', 'artistique', 'pinceau'
      ];
      
      const foundForbidden = forbiddenWords.filter(word => 
        marcelResponse.toLowerCase().includes(word)
      );
      
      if (foundForbidden.length > 0) {
        console.log(`   ❌ ERREUR: Mots interdits détectés: ${foundForbidden.join(', ')}`);
      } else {
        console.log(`   ✅ OK: Aucune référence à des emojis ou symboles`);
      }
      
      // Vérifier qu'il n'y a pas d'emojis
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      
      if (emojiRegex.test(marcelResponse)) {
        console.log(`   ❌ ERREUR: Des emojis ont été détectés dans la réponse`);
      } else {
        console.log(`   ✅ OK: Aucun emoji dans la réponse`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur de test: ${error.message}`);
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Tests terminés\n');
  console.log('📌 RAPPEL: Marcel doit maintenant parler naturellement');
  console.log('          sans jamais mentionner d\'emojis ou de symboles visuels.\n');
}

// Lancer les tests
testMarcelVoiceResponse().catch(console.error);