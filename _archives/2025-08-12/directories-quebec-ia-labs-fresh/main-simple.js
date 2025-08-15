// 🚀 MARCEL V8.0 SIMPLE - SERVEUR PRODUCTION STABLE
// =============================================
// Version simple qui fonctionne toujours
// =============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("✅ Marcel V8.0 Simple - Serveur Production STABLE");

// Marcel response function - VERSION INTELLIGENTE SANS API
function getMarcelResponse(userInput) {
  const input = userInput ? userInput.toLowerCase() : '';
  
  // Détection d'intention simple mais efficace
  if (input.includes('rendez-vous') || input.includes('réserver') || input.includes('appointment')) {
    return "Parfait! À quelle date souhaitez-vous votre rendez-vous?";
  }
  
  if (input.includes('prix') || input.includes('coût') || input.includes('tarif')) {
    return "Nos tarifs: Coupe homme 35$, coupe dame 45$, coloration 85$, barbe 25$. Qu'est-ce qui vous intéresse?";
  }
  
  if (input.includes('heure') || input.includes('ouvert') || input.includes('fermé')) {
    return "Nous sommes ouverts mardi à samedi de 9h à 18h. Dimanche et lundi fermé.";
  }
  
  if (input.includes('coupe') || input.includes('cheveux') || input.includes('coiffure')) {
    return "Excellent choix! Nous avons des spécialistes pour tous types de coupes. À quelle heure vous convient le mieux?";
  }
  
  if (input.includes('bonjour') || input.includes('salut') || input.includes('allo')) {
    return "Bonjour! Comment puis-je vous aider aujourd'hui? Souhaitez-vous prendre rendez-vous?";
  }
  
  if (input.includes('merci') || input.includes('parfait') || input.includes('ok')) {
    return "Avec plaisir! Y a-t-il autre chose que je puisse faire pour vous?";
  }
  
  // Réponse par défaut professionnelle
  return "Je vais noter ça. Quel service vous intéresse le plus? Nous avons des coupes, colorations, et soins de barbe.";
}

// Routes principales
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Simple</title>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px; text-align: center;">
      <h1>✅ Marcel V8.0 Simple ACTIF</h1>
      <p><strong>Status:</strong> STABLE</p>
      <p><strong>Version:</strong> 8.0.0 Simple</p>
      <p><strong>Port:</strong> ${PORT}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr>
      <h3>🔗 Endpoints:</h3>
      <ul style="list-style: none;">
        <li>📞 POST /webhook/twilio</li>
        <li>🧪 GET /webhook/twilio/test</li>
        <li>📊 GET /test-marcel</li>
      </ul>
    </body>
    </html>
  `);
});

// Dashboard
app.get('/test-marcel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #2c3e50; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .endpoint { background: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 3px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">🧠 Marcel V8.0 Simple</h1>
        <div class="status">
          <h3>✅ Status: STABLE ET ACTIF</h3>
          <p>Version: 8.0.0 Simple Edition</p>
          <p>Intelligence: Règles logiques avancées</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
        <h3>🔗 Endpoints disponibles:</h3>
        <div class="endpoint">
          <strong>POST /webhook/twilio</strong> - Webhook Twilio pour appels
        </div>
        <div class="endpoint">
          <strong>GET /webhook/twilio/test</strong> - Test endpoint Twilio
        </div>
      </div>
    </body>
    </html>
  `);
});

// 📞 WEBHOOK TWILIO - Version stable et intelligente
app.post('/webhook/twilio', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;
    
    console.log('📞 Webhook Twilio:', { From, CallSid, SpeechResult });
    
    // Premier appel
    if (!SpeechResult) {
      const greeting = "Bonjour! Ici Marcel du salon. Comment puis-je vous aider aujourd'hui?";
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Chantal" language="fr-CA">${greeting}</Say>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="4" timeout="8">
        <Say voice="Polly.Chantal" language="fr-CA">Je vous écoute...</Say>
    </Gather>
    <Say voice="Polly.Chantal" language="fr-CA">Désolé, je n'ai pas bien entendu. Bonne journée!</Say>
</Response>`;
      
      return res.type('text/xml').send(twiml);
    }
    
    // Traiter la réponse vocale avec intelligence
    if (SpeechResult) {
      console.log('🎤 Parole reçue:', SpeechResult);
      
      const response = getMarcelResponse(SpeechResult);
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Chantal" language="fr-CA">${response}</Say>
    <Pause length="1"/>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="4" timeout="8">
        <Say voice="Polly.Chantal" language="fr-CA">Avez-vous autre chose?</Say>
    </Gather>
    <Say voice="Polly.Chantal" language="fr-CA">Parfait! Merci et à bientôt!</Say>
    <Hangup/>
</Response>`;
      
      return res.type('text/xml').send(twiml);
    }
    
  } catch (error) {
    console.error('❌ Erreur webhook Twilio:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Chantal" language="fr-CA">Désolé, petit problème technique. Rappellez dans quelques minutes.</Say>
    <Hangup/>
</Response>`;
    
    res.type('text/xml').send(errorTwiml);
  }
});

// Test endpoint Twilio
app.get('/webhook/twilio/test', (req, res) => {
  res.json({
    status: 'Marcel V8.0 Simple - Twilio Ready',
    version: '8.0.0 Simple',
    timestamp: new Date().toISOString(),
    message: 'Endpoint Twilio STABLE et fonctionnel!',
    intelligence: 'Règles logiques avancées',
    endpoints: {
      voice: 'POST /webhook/twilio',
      test: 'GET /webhook/twilio/test'
    }
  });
});

// Start server avec gestion d'erreurs
app.listen(PORT, () => {
  console.log(`🚀 Marcel V8.0 Simple démarré sur le port ${PORT}`);
  console.log(`📞 Endpoint Twilio ready: /webhook/twilio`);
  console.log(`🌐 Dashboard: /test-marcel`);
  console.log(`✅ Quebec-IA-Labs V8.0 Simple Ready - STABLE!`);
});

// Gestion des erreurs robuste
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
  // Ne pas crasher le serveur
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promesse rejetée:', error);
  // Ne pas crasher le serveur
});