// 🚀 MARCEL V8.0 ULTIMATE - VERSION REPLIT COMPATIBLE
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("✅ Marcel V8.0 Ultimate - Serveur Production");

// Anthropic setup (si disponible)
let anthropic = null;
try {
  const Anthropic = require("@anthropic-ai/sdk");
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
} catch (error) {
  console.log("⚠️  Anthropic non disponible, mode basique activé");
}

// Fonction de réponse basique
function getBasicResponse(input) {
  const responses = [
    "Bonjour! Comment puis-je vous aider aujourd'hui?",
    "Parfait! Quel service souhaitez-vous réserver?", 
    "Merci pour votre appel. À quelle heure préférez-vous?",
    "Excellent! Je vais noter votre rendez-vous."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Route racine - DOIT retourner 200 avec HTML
app.get('/', (req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html>
<head><title>Marcel V8.0</title></head>
<body style="text-align:center; font-family:Arial;">
<h1>✅ Marcel V8.0 Active</h1>
<p>Status: OK</p>
<p>Port: ${PORT}</p>
</body>
</html>`);
});

// Health check pour Replit
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', version: '8.0.0' });
});

// Dashboard
app.get('/test-marcel', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Marcel V8.0 Dashboard</title></head>
<body style="font-family:Arial; margin:20px;">
<h1>🧠 Marcel V8.0 Ultimate Dashboard</h1>
<div style="background:#e8f5e8; padding:15px; border-radius:5px;">
<h3>✅ Status: ACTIVE</h3>
<p>Version: 8.0.0</p>
<p>Port: ${PORT}</p>
<p>Timestamp: ${new Date().toISOString()}</p>
</div>
<h3>🔗 Endpoints:</h3>
<ul>
<li>📞 POST /webhook/twilio - Webhook Twilio</li>
<li>🧪 GET /webhook/twilio/test - Test endpoint</li>
</ul>
</body>
</html>`);
});

// Webhook Twilio - Version simplifiée
app.post('/webhook/twilio', (req, res) => {
  try {
    const { From, CallSid, SpeechResult } = req.body;
    console.log('📞 Twilio webhook:', { From, CallSid, SpeechResult });
    
    let response = "Bonjour! Vous êtes bien chez le salon.";
    
    if (SpeechResult) {
      response = getBasicResponse(SpeechResult);
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Celine" language="fr-CA">${response}</Say>
<Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="3" timeout="10">
<Say voice="Polly.Celine" language="fr-CA">Parlez maintenant...</Say>
</Gather>
<Say voice="Polly.Celine" language="fr-CA">Merci et à bientôt!</Say>
<Hangup/>
</Response>`;
    
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Celine" language="fr-CA">Erreur technique. Rappellez plus tard.</Say>
<Hangup/>
</Response>`);
  }
});

// Test endpoint
app.get('/webhook/twilio/test', (req, res) => {
  res.json({
    status: 'Marcel V8.0 Twilio Ready',
    version: '8.0.0',
    timestamp: new Date().toISOString(),
    message: 'Endpoint Twilio fonctionnel!'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Marcel V8.0 Ultimate démarré sur le port ${PORT}`);
  console.log(`📞 Endpoint Twilio ready: /webhook/twilio`);
  console.log(`✅ Quebec-IA-Labs V8.0 Ready!`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promesse rejetée:', error);
});