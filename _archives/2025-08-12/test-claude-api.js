// Test simple de l'API Claude
// Copiez ce fichier dans Replit et lancez: node test-claude-api.js

require('dotenv').config();

async function testClaudeAPI() {
  console.log('🧪 Test de l\'API Claude...');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log(`🔑 Clé API: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NON TROUVÉE'}`);
  
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY manquante dans .env');
    return;
  }
  
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('📡 Envoi requête à Claude...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: "Dis juste 'Bonjour' en français"
      }]
    });
    
    console.log('✅ Succès! Réponse de Claude:');
    console.log(message.content[0].text);
    
  } catch (error) {
    console.log('❌ Erreur API Claude:');
    console.log('Type:', error.constructor.name);
    console.log('Message:', error.message);
    
    if (error.status) {
      console.log('Status HTTP:', error.status);
    }
    
    if (error.error) {
      console.log('Détails:', JSON.stringify(error.error, null, 2));
    }
  }
}

// Lancer le test
testClaudeAPI();