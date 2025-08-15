// 🚀 MARCEL V8.0 ULTIMATE - SERVEUR PRODUCTION REPLIT
// =============================================
// Version: 8.0 Ultimate Edition - Fixed for Deployment
// Quebec IA Labs - Production Ready
// =============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Try to load Anthropic SDK, but continue if it fails
let Anthropic = null;
try {
  Anthropic = require("@anthropic-ai/sdk");
} catch (error) {
  console.log("⚠️ Anthropic SDK non disponible, mode basique activé");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Anthropic
let anthropic = null;
try {
  if (Anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log("✅ Anthropic Claude API connecté - Marcel intelligent activé");
  } else {
    console.log("⚠️ Mode basique activé - Pas d'API Claude");
  }
} catch (error) {
  console.log("⚠️ Erreur Anthropic:", error.message);
  anthropic = null;
}

console.log("✅ Marcel V8.0 Ultimate - Serveur Production");

// Sessions storage
const sessions = new Map();

// Marcel ULTRA intelligent response function - Hybride Claude + Fallback
async function generateMarcelResponse(userInput) {
  // PRIORITÉ 1: Essayer Claude pour l'intelligence MAXIMUM
  if (anthropic) {
    try {
      console.log('🧠 Utilisation de Claude pour l\'intelligence...');
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022", 
        max_tokens: 120,
        temperature: 0.9,
        messages: [{
          role: "user",
          content: `Tu es Marcel, réceptionniste IA expert d'un salon de coiffure premium au Québec. Tu es professionnel, chaleureux et utilises un français québécois authentique. 

Services & Prix:
- Coupe homme: 35$ 
- Coupe dame: 45$
- Coloration: 85$ 
- Barbe/moustache: 25$
- Styling/mise en plis: 30$

Horaire: Mardi à samedi 9h-18h (fermé dimanche-lundi)

Équipe: 3 coiffeurs expérimentés, spécialisés coupes modernes

Client dit: "${userInput}"

Réponds comme Marcel au téléphone - naturel, efficace, maximum 2 phrases. Si c'est pour un rendez-vous, propose des créneaux. Si question prix, donne le tarif exact.`
        }],
      });

      console.log('✅ Réponse Claude obtenue!');
      return message.content[0].text.trim();
    } catch (error) {
      console.error('⚠️ Claude API temporairement indisponible:', error.message);
      // Continuer vers fallback intelligent
    }
  }

  // PRIORITÉ 2: Fallback intelligent si Claude indisponible
  console.log('🔄 Mode fallback intelligent activé');
  const input = userInput ? userInput.toLowerCase() : '';
  
  if (input.includes('rendez-vous') || input.includes('réserver') || input.includes('appointment')) {
    return "Parfait! Quand souhaitez-vous votre rendez-vous? Nous avons de la disponibilité mardi à samedi.";
  }
  
  if (input.includes('prix') || input.includes('coût') || input.includes('tarif')) {
    return "Nos tarifs: Coupe homme 35$, coupe dame 45$, coloration 85$, barbe 25$. Quel service vous intéresse?";
  }
  
  if (input.includes('heure') || input.includes('ouvert') || input.includes('fermé') || input.includes('horaire')) {
    return "Nous sommes ouverts mardi à samedi de 9h à 18h. Dimanche et lundi fermé. Quand voulez-vous venir?";
  }
  
  if (input.includes('coupe') || input.includes('cheveux') || input.includes('coiffure')) {
    return "Excellente idée! Nos coiffeurs sont spécialisés en coupes modernes. À quelle date vous convient le mieux?";
  }
  
  if (input.includes('bonjour') || input.includes('salut') || input.includes('allo')) {
    return "Bonjour! Ici Marcel du salon. Souhaitez-vous prendre rendez-vous ou avez-vous des questions?";
  }
  
  if (input.includes('merci') || input.includes('parfait') || input.includes('ok') || input.includes('oui')) {
    return "Parfait! Y a-t-il autre chose que je puisse faire pour vous aujourd'hui?";
  }
  
  // Réponse engageante par défaut
  return "Je note ça. Quel service vous intéresse le plus? Nous excellons en coupes, colorations et soins de barbe.";
}

// Routes principales
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Ultimate</title>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px; text-align: center;">
      <h1>✅ Marcel V8.0 Ultimate Active</h1>
      <p><strong>Status:</strong> OK</p>
      <p><strong>Version:</strong> 8.0.0</p>
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

// Dashboard simple
app.get('/test-marcel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Ultimate Dashboard</title>
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
        <h1 class="header">🧠 Marcel V8.0 Ultimate</h1>
        <div class="status">
          <h3>✅ Status: ACTIVE</h3>
          <p>Version: 8.0.0 Ultimate Edition</p>
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

// 📞 WEBHOOK TWILIO - Version propre sans erreurs de syntaxe
app.post('/webhook/twilio', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;
    
    console.log('📞 Webhook Twilio:', { From, CallSid, SpeechResult });
    
    // Nouvel appel
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
    
    // Traiter la réponse vocale
    if (SpeechResult) {
      console.log('🎤 Parole reçue:', SpeechResult);
      
      const response = await generateMarcelResponse(SpeechResult);
      
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
    <Say voice="Polly.Chantal" language="fr-CA">Désolé, problème technique. Rappellez dans quelques minutes.</Say>
    <Hangup/>
</Response>`;
    
    res.type('text/xml').send(errorTwiml);
  }
});

// Test endpoint Twilio
app.get('/webhook/twilio/test', (req, res) => {
  res.json({
    status: 'Marcel V8.0 Twilio Webhook Ready',
    version: '8.0.0',
    timestamp: new Date().toISOString(),
    message: 'Endpoint Twilio fonctionnel!',
    endpoints: {
      voice: 'POST /webhook/twilio',
      test: 'GET /webhook/twilio/test'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Marcel V8.0 Ultimate démarré sur le port ${PORT}`);
  console.log(`📞 Endpoint Twilio ready: /webhook/twilio`);
  console.log(`🌐 Dashboard: /test-marcel`);
  console.log(`✅ Quebec-IA-Labs V8.0 Ready!`);
});