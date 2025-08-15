// 🚀 QUÉBEC IA LABS - SERVEUR PRINCIPAL UNIFIÉ
// ================================================
// Version: 3.1.0 - CORRIGÉE
// Date: 2025-08-10

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");  // ✅ AJOUTÉ
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 📦 Import des modules AVEC GESTION D'ERREUR
let MarcelTrainer = null;
let ContextAnalyzer = null;
let RelationshipData = null;

// Charger les modules s'ils existent
try {
  MarcelTrainer = require('./marcel-trainer');
  console.log('✅ MarcelTrainer chargé');
} catch (error) {
  console.log('⚠️ MarcelTrainer non disponible');
}

try {
  ContextAnalyzer = require('./context-analyzer');
  console.log('✅ ContextAnalyzer chargé');
} catch (error) {
  console.log('⚠️ ContextAnalyzer non disponible');
}

try {
  RelationshipData = require('./relationship-data');
  console.log('✅ RelationshipData chargé');
} catch (error) {
  console.log('⚠️ RelationshipData non disponible');
}

// 🧠 Intelligence artificielle
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

// 📊 Métriques de performance
const performanceMetrics = {
  startTime: Date.now(),
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  averageResponseTime: 0,
  concurrentCalls: 0,
  maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS) || 50
};

// 💾 Sessions et mémoire
const conversations = new Map();
const callQueue = [];
let marcelTrainer = null;
let contextAnalyzer = null;

// Initialiser ContextAnalyzer si disponible
if (ContextAnalyzer) {
  try {
    contextAnalyzer = new ContextAnalyzer();
    console.log('✅ ContextAnalyzer initialisé');
  } catch (error) {
    console.log('⚠️ Erreur initialisation ContextAnalyzer:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

console.log(`
🚀 QUÉBEC IA LABS - SERVEUR PRINCIPAL
=====================================
Version: 3.1.0
Port: ${PORT}
Claude AI: ${anthropic ? "✅" : "❌"}
Twilio: ${process.env.TWILIO_PHONE_NUMBER || "Non configuré"}
Supabase: ${process.env.SUPABASE_URL ? "✅" : "❌"}
ContextAnalyzer: ${contextAnalyzer ? "✅" : "❌"}
=====================================
`);

// ==============================================
// 🏥 HEALTH CHECK & MONITORING
// ==============================================

app.get("/", (req, res) => {
  const uptime = Date.now() - performanceMetrics.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  res.json({
    service: "Québec IA Labs - Valet IA Principal",
    status: "active",
    version: "3.1.0",
    timestamp: new Date().toISOString(),
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    performance: {
      totalCalls: performanceMetrics.totalCalls,
      successRate: `${Math.round((performanceMetrics.successfulCalls / performanceMetrics.totalCalls) * 100) || 0}%`,
      concurrentCalls: performanceMetrics.concurrentCalls
    },
    services: {
      claudeAI: !!anthropic,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      supabase: !!process.env.SUPABASE_URL,
      marcelTrainer: !!marcelTrainer,
      contextAnalyzer: !!contextAnalyzer
    },
    endpoints: {
      health: "/health",
      voice: "/webhook/twilio/voice",
      sms: "/webhook/twilio/sms",
      marcel: "/test-marcel",
      training: "/train-marcel",
      mobile: "/api/mobile/*"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    metrics: performanceMetrics
  });
});

// ==============================================
// 📞 WEBHOOKS TWILIO - VERSION STABLE
// ==============================================

app.post("/webhook/twilio/voice", (req, res) => {
  const { From, CallSid } = req.body;
  console.log(`📞 Appel entrant: ${From} [${CallSid}]`);
  performanceMetrics.totalCalls++;
  
  try {
    // Analyse intelligente si ContextAnalyzer disponible
    let greeting = "Bonjour! Bienvenue chez Québec IA Labs. Comment puis-je vous aider?";
    
    // Essayer d'utiliser ContextAnalyzer si disponible
    if (contextAnalyzer && req.body.SpeechResult) {
      try {
        const analysis = contextAnalyzer.analyzeUserInput(req.body.SpeechResult);
        console.log(`🧠 Analyse: ${analysis.detectedIntent} (${Math.round(analysis.confidence * 100)}%)`);
      } catch (error) {
        console.log('⚠️ Erreur analyse:', error.message);
      }
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${greeting}</Say>
  <Pause length="1"/>
  <Say language="fr-CA" voice="Polly.Chantal">Pour un rendez-vous, dites rendez-vous. Pour les prix, dites prix. Pour les horaires, dites horaires.</Say>
  <Gather input="speech" timeout="10" language="fr-CA" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous écoute...</Say>
  </Gather>
</Response>`;
    
    console.log("✅ TwiML envoyé avec succès");
    performanceMetrics.successfulCalls++;
    res.set("Content-Type", "text/xml");
    res.send(twiml);
    
  } catch (error) {
    console.error("❌ Erreur webhook voice:", error.message);
    performanceMetrics.failedCalls++;
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Un problème technique est survenu. Rappellez plus tard s'il vous plaît.</Say>
</Response>`;
    
    res.set("Content-Type", "text/xml");
    res.send(errorTwiml);
  }
});

app.post("/webhook/twilio/speech", (req, res) => {
  const speech = req.body.SpeechResult || "";
  const callSid = req.body.CallSid;
  console.log(`🎤 Reconnaissance vocale [${callSid}]: "${speech}"`);
  
  try {
    let response = "Je peux vous aider avec les rendez-vous, les prix et les horaires.";
    const text = speech.toLowerCase();
    
    // Analyse avec ContextAnalyzer si disponible
    if (contextAnalyzer) {
      try {
        const analysis = contextAnalyzer.analyzeUserInput(speech);
        console.log(`🧠 Intent détecté: ${analysis.detectedIntent}`);
        
        // Utiliser la recommandation du ContextAnalyzer
        if (analysis.detectedIntent === 'booking') {
          response = "Parfait! Je peux vous proposer mardi à 14h avec Marco ou jeudi à 16h avec Jessica. Lequel préférez-vous?";
        } else if (analysis.detectedIntent === 'pricing') {
          response = "Nos prix: coupe homme 35$, coupe femme 45$, coupe et barbe 55$, coloration à partir de 80$. Voulez-vous prendre rendez-vous?";
        } else if (analysis.detectedIntent === 'hours') {
          response = "Nous sommes ouverts du mardi au samedi, de 9h à 18h. Fermé dimanche et lundi. Voulez-vous réserver?";
        }
      } catch (error) {
        console.log('⚠️ Erreur analyse:', error.message);
      }
    } else {
      // Fallback sans ContextAnalyzer
      if (text.includes("rendez-vous") || text.includes("rdv") || text.includes("réserver")) {
        response = "Parfait! Je peux vous proposer mardi à 14h avec Marco ou jeudi à 16h avec Jessica. Lequel préférez-vous?";
      } else if (text.includes("prix") || text.includes("coût") || text.includes("tarif")) {
        response = "Nos prix: coupe homme 35$, coupe femme 45$, coupe et barbe 55$. Voulez-vous prendre rendez-vous?";
      } else if (text.includes("horaire") || text.includes("heure") || text.includes("ouvert")) {
        response = "Nous sommes ouverts du mardi au samedi, de 9h à 18h. Fermé dimanche et lundi.";
      } else if (text.includes("mardi") || text.includes("14h") || text.includes("marco")) {
        response = "Excellent! Je confirme votre rendez-vous mardi à 14h avec Marco. Quel est votre nom complet?";
      } else if (text.includes("jeudi") || text.includes("16h") || text.includes("jessica")) {
        response = "Parfait! Je confirme votre rendez-vous jeudi à 16h avec Jessica. Quel est votre nom complet?";
      }
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response}</Say>
  <Pause length="2"/>
  <Say language="fr-CA" voice="Polly.Chantal">Autre chose?</Say>
  <Gather input="speech" timeout="5" language="fr-CA" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous écoute...</Say>
  </Gather>
</Response>`;

    res.set("Content-Type", "text/xml");
    res.send(twiml);
    
  } catch (error) {
    console.error("❌ Erreur webhook speech:", error.message);
    res.set("Content-Type", "text/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Désolé, je n'ai pas compris. Pouvez-vous répéter?</Say>
</Response>`);
  }
});

app.post("/webhook/twilio/sms", (req, res) => {
  console.log("📱 SMS reçu:", req.body.From, "-", req.body.Body);
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Merci pour votre message! Notre équipe vous rappellera sous peu. Pour un service immédiat, appelez-nous au ${process.env.TWILIO_PHONE_NUMBER || '+15817101240'}. - Québec IA Labs</Message>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

// ==============================================
// 🧠 MARCEL TRAINER
// ==============================================

app.get('/test-marcel', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/test-marcel.html');
  
  // Vérifier si le fichier HTML existe
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    // Réponse JSON si pas de fichier HTML
    res.json({
      message: "🧠 Dashboard Marcel",
      status: "active",
      version: "3.1.0",
      contextAnalyzer: !!contextAnalyzer,
      endpoints: {
        train: "/train-marcel",
        report: "/training-report",
        test: "/test-scenario"
      },
      info: "Marcel Trainer est fonctionnel!"
    });
  }
});

app.get('/train-marcel', async (req, res) => {
  try {
    if (!marcelTrainer && MarcelTrainer) {
      marcelTrainer = new MarcelTrainer();
    }
    
    if (!marcelTrainer) {
      return res.json({
        success: false,
        message: "Marcel Trainer non disponible",
        hint: "Assurez-vous que marcel-trainer.js est présent"
      });
    }
    
    const report = await marcelTrainer.runFullTraining();
    res.json({
      success: true,
      report: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==============================================
// 📱 API MOBILE
// ==============================================

app.get('/api/mobile/status', (req, res) => {
  res.json({
    service: "API Mobile",
    status: "active",
    version: "1.0.0",
    endpoints: [
      "/api/mobile/salons",
      "/api/mobile/booking",
      "/api/mobile/profile"
    ]
  });
});

app.get('/api/mobile/salons', (req, res) => {
  res.json({
    salons: [
      {
        id: "salon-1",
        name: "Salon Marcel",
        address: "123 rue Saint-Jean, Québec",
        phone: process.env.TWILIO_PHONE_NUMBER || "+15817101240",
        services: ["Coupe homme", "Coupe femme", "Barbe", "Coloration"],
        hours: "Mar-Sam 9h-18h"
      },
      {
        id: "salon-2", 
        name: "Chez Tony",
        address: "456 rue Principale, Montréal",
        phone: "+15145551234",
        services: ["Coupe homme", "Barbe", "Rasage traditionnel"],
        hours: "Mar-Ven 10h-19h, Sam 9h-17h"
      }
    ]
  });
});

// ==============================================
// 🚀 DÉMARRAGE
// ==============================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🎉 QUÉBEC IA LABS - SERVEUR ACTIF!
===================================
✅ Port: ${PORT}
✅ URL: http://localhost:${PORT}
✅ Webhooks Twilio configurés
✅ Marcel Trainer ${marcelTrainer ? 'disponible' : 'non chargé'}
✅ Context Analyzer ${contextAnalyzer ? 'actif' : 'non chargé'}
✅ API Mobile active

📞 Téléphone: ${process.env.TWILIO_PHONE_NUMBER || "À configurer"}
🤖 IA: ${anthropic ? "Claude 3.5" : "Mode fallback"}

Endpoints disponibles:
- GET  /                    - Status général
- GET  /health             - Health check
- POST /webhook/twilio/*   - Webhooks Twilio
- GET  /test-marcel        - Dashboard Marcel
- GET  /train-marcel       - Formation IA
- GET  /api/mobile/*       - API Mobile

🧪 Test rapide: curl -X POST http://localhost:${PORT}/webhook/twilio/voice -d "From=+15145551234&CallSid=TEST"
  `);
});

module.exports = app;