// 🚀 MARCEL V8.0 ULTIMATE - SERVEUR PRODUCTION FINAL
// =============================================
// Version: 8.0 Ultimate Edition - CLEAN & FINAL
// Quebec IA Labs - Production Ready
// Date: 2025-08-11
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

console.log("✅ Marcel V8.0 Ultimate - Serveur Production Final");

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
      <title>Marcel V8.0 Ultimate Final</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .status { font-size: 1.2em; margin: 10px 0; }
        .endpoints { margin-top: 30px; }
        .endpoint { 
          background: rgba(255,255,255,0.2); 
          margin: 10px 0; 
          padding: 15px; 
          border-radius: 10px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧠 Marcel V8.0 Ultimate Final</h1>
        <div class="status">✅ Status: ACTIVE & READY</div>
        <div class="status">🎯 Version: 8.0.0 Final Edition</div>
        <div class="status">⏰ Timestamp: ${new Date().toISOString()}</div>
        
        <div class="endpoints">
          <h3>🔗 Endpoints Disponibles:</h3>
          <div class="endpoint">
            <strong>📞 POST /webhook/twilio</strong><br>
            Webhook principal pour appels Twilio
          </div>
          <div class="endpoint">
            <strong>🧪 GET /webhook/twilio/test</strong><br>
            Endpoint de test Twilio
          </div>
          <div class="endpoint">
            <strong>📊 GET /test-marcel</strong><br>
            Dashboard de test complet
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Dashboard de test avancé
app.get('/test-marcel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Ultimate Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fa; }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .test-button { 
          background: #28a745; 
          color: white; 
          padding: 12px 24px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer;
          margin: 5px;
        }
        .test-button:hover { background: #218838; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Marcel V8.0 Ultimate Dashboard</h1>
          <p>Réceptionniste IA pour Salons de Coiffure - Version Finale</p>
        </div>
        
        <div class="grid">
          <div class="card">
            <div class="status">
              <h3>✅ Status Système</h3>
              <p><strong>Version:</strong> 8.0.0 Final Edition</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Claude API:</strong> ${anthropic ? '🟢 Connecté' : '🟡 Mode Fallback'}</p>
              <p><strong>Statut:</strong> 🚀 PRODUCTION READY</p>
            </div>
          </div>
          
          <div class="card">
            <h3>🔗 Endpoints API</h3>
            <div class="endpoint">
              <strong>POST /webhook/twilio</strong><br>
              <small>Webhook principal Twilio pour appels vocaux</small>
            </div>
            <div class="endpoint">
              <strong>GET /webhook/twilio/test</strong><br>
              <small>Test de connectivité Twilio</small>
            </div>
          </div>
          
          <div class="card">
            <h3>📞 Test Marcel</h3>
            <p><strong>Numéro de test:</strong> +1 (581) 710-1240</p>
            <button class="test-button" onclick="testWebhook()">Test Webhook</button>
            <button class="test-button" onclick="testClaude()">Test Claude</button>
            <div id="test-results" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; display: none;"></div>
          </div>
        </div>
      </div>
      
      <script>
        function testWebhook() {
          showTestResult('🔄 Test webhook en cours...', 'info');
          fetch('/webhook/twilio/test')
            .then(response => response.json())
            .then(data => showTestResult('✅ Webhook OK: ' + data.message, 'success'))
            .catch(error => showTestResult('❌ Erreur: ' + error.message, 'error'));
        }
        
        function testClaude() {
          showTestResult('🔄 Test Claude API...', 'info');
          const testMessage = 'Bonjour, je voudrais un rendez-vous';
          fetch('/test-claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: testMessage })
          })
          .then(response => response.json())
          .then(data => showTestResult('✅ Claude Response: ' + data.response, 'success'))
          .catch(error => showTestResult('❌ Erreur Claude: ' + error.message, 'error'));
        }
        
        function showTestResult(message, type) {
          const div = document.getElementById('test-results');
          div.style.display = 'block';
          div.innerHTML = message;
          div.style.background = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
        }
      </script>
    </body>
    </html>
  `);
});

// 📞 WEBHOOK TWILIO - Version finale optimisée
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
    status: 'Marcel V8.0 Ultimate Final - Twilio Webhook Ready',
    version: '8.0.0-final',
    timestamp: new Date().toISOString(),
    message: 'Webhook Twilio fonctionnel - Version Finale!',
    endpoints: {
      voice: 'POST /webhook/twilio',
      test: 'GET /webhook/twilio/test',
      dashboard: 'GET /test-marcel'
    }
  });
});

// Test endpoint Claude (nouveau)
app.post('/test-claude', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await generateMarcelResponse(message || 'Test');
    res.json({
      status: 'success',
      input: message,
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '8.0.0-final',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    claude: anthropic ? 'connected' : 'fallback'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Marcel V8.0 Ultimate Final démarré sur le port ${PORT}`);
  console.log(`📞 Endpoint Twilio ready: /webhook/twilio`);
  console.log(`🌐 Dashboard: /test-marcel`);
  console.log(`❤️ Health check: /health`);
  console.log(`✅ Quebec-IA-Labs V8.0 FINAL READY! 🎯`);
});