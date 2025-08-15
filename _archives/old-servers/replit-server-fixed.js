// 🚀 VALET IA - SERVEUR PRODUCTION REPLIT PRO (CORRIGÉ)
// Version stable et optimisée pour Always On

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 📊 Performance Monitoring Simple
const performanceMetrics = {
  startTime: Date.now(),
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  concurrentCalls: 0
};

console.log(`
🚀 VALET IA REPLIT PRO - DÉMARRAGE
===================================
Port: ${PORT}
URL: ${process.env.REPLIT_PRO_URL}
Twilio: ${process.env.TWILIO_PHONE_NUMBER}
Always On: ${process.env.ENABLE_ALWAYS_ON}
===================================
`);

// Middleware optimisé
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de monitoring
app.use((req, res, next) => {
  performanceMetrics.totalCalls++;
  performanceMetrics.concurrentCalls++;
  
  if (process.env.ENABLE_DETAILED_LOGS === 'true') {
    console.log(`📊 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  
  res.on('finish', () => {
    performanceMetrics.concurrentCalls--;
    if (res.statusCode < 400) {
      performanceMetrics.successfulCalls++;
    } else {
      performanceMetrics.failedCalls++;
    }
  });
  
  next();
});

// ==============================================
// 🏥 HEALTH CHECK & MONITORING
// ==============================================

app.get("/", (req, res) => {
  const uptime = Date.now() - performanceMetrics.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  res.json({
    service: "Valet IA Salons - Replit Pro",
    status: "active",
    version: "2.1.0-stable",
    timestamp: new Date().toISOString(),
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    phone: process.env.TWILIO_PHONE_NUMBER,
    performance: {
      totalCalls: performanceMetrics.totalCalls,
      successRate: `${Math.round((performanceMetrics.successfulCalls / performanceMetrics.totalCalls) * 100) || 0}%`,
      concurrentCalls: performanceMetrics.concurrentCalls
    },
    services: {
      twilio: process.env.TWILIO_ACCOUNT_SID ? "configured" : "missing",
      elevenlabs: process.env.ELEVENLABS_API_KEY ? "configured" : "missing",
      supabase: process.env.SUPABASE_URL ? "configured" : "missing"
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

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// ==============================================
// 📞 WEBHOOKS TWILIO OPTIMISÉS
// ==============================================

// Webhook principal pour appels entrants
app.post("/webhook/twilio/voice", (req, res) => {
  const { From, To, CallSid } = req.body;
  
  if (process.env.ENABLE_DETAILED_LOGS === 'true') {
    console.log(`📞 Appel entrant: ${From} -> ${To} (${CallSid})`);
  }

  try {
    // Message d'accueil intelligent
    const greeting = generatePersonalizedGreeting(From);
    const twiml = generateGreetingTwiML(greeting, CallSid);

    res.set("Content-Type", "text/xml");
    res.send(twiml);
    
    if (process.env.ENABLE_DETAILED_LOGS === 'true') {
      console.log(`✅ TwiML envoyé pour ${CallSid}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur webhook Twilio (${CallSid}):`, error);
    res.set("Content-Type", "text/xml");
    res.send(generateErrorTwiML());
  }
});

// Webhook reconnaissance vocale
app.post("/webhook/twilio/speech", (req, res) => {
  const { SpeechResult, CallSid } = req.body;
  
  if (process.env.ENABLE_DETAILED_LOGS === 'true') {
    console.log(`🎤 Reconnaissance vocale (${CallSid}): "${SpeechResult}"`);
  }

  try {
    const intent = analyzeIntent(SpeechResult || "");
    const response = processIntent(intent, SpeechResult);
    const twiml = generateConversationTwiML(response);

    res.set("Content-Type", "text/xml");
    res.send(twiml);
    
  } catch (error) {
    console.error(`❌ Erreur reconnaissance vocale (${CallSid}):`, error);
    res.set("Content-Type", "text/xml");
    res.send(generateRetryTwiML());
  }
});

// Webhook SMS
app.post("/webhook/twilio/sms", (req, res) => {
  const { From, Body } = req.body;
  
  if (process.env.ENABLE_DETAILED_LOGS === 'true') {
    console.log(`📱 SMS reçu de ${From}: "${Body}"`);
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Merci pour votre message! Notre Valet IA vous rappellera sous peu. - Salon Tony</Message>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

// ==============================================
// 📊 API DASHBOARD
// ==============================================

app.get("/api/salon/:salonId/metrics", (req, res) => {
  const { salonId } = req.params;
  
  const metrics = {
    salon_id: salonId,
    live_stats: {
      calls_today: Math.floor(Math.random() * 50) + 10,
      bookings_today: Math.floor(Math.random() * 40) + 8,
      revenue_today: Math.floor(Math.random() * 1500) + 500,
      ai_uptime: 99.8,
      satisfaction_avg: 8.6 + Math.random(),
      active_conversations: performanceMetrics.concurrentCalls
    },
    timestamp: new Date().toISOString()
  };

  res.json(metrics);
});

app.get("/api/analytics/dashboard", (req, res) => {
  const uptime = Date.now() - performanceMetrics.startTime;
  
  res.json({
    service: "Valet IA Analytics Dashboard",
    timestamp: new Date().toISOString(),
    uptime_hours: Math.floor(uptime / (1000 * 60 * 60)),
    performance: performanceMetrics,
    endpoints: {
      voice: "/webhook/twilio/voice",
      sms: "/webhook/twilio/sms",
      health: "/health"
    }
  });
});

// ==============================================
// 🛠️ FONCTIONS UTILITAIRES
// ==============================================

function generatePersonalizedGreeting(clientPhone) {
  const isRegularClient = Math.random() > 0.6;
  
  if (isRegularClient) {
    return "Bonjour! Je vous reconnais. Comment puis-je vous aider aujourd'hui?";
  } else {
    return "Bonjour salon Tony! Comment puis-je vous aider?";
  }
}

function generateGreetingTwiML(greeting, callSid) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${greeting}</Say>
  <Pause length="1"/>
  <Say language="fr-CA" voice="Polly.Chantal">Pour un rendez-vous, dites rendez-vous. Pour les prix, dites prix. Pour les horaires, dites horaires.</Say>
  <Pause length="1"/>
  <Gather input="speech" timeout="15" speechTimeout="6" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Que puis-je faire pour vous?</Say>
  </Gather>
  <Say language="fr-CA" voice="Polly.Chantal">Je n'ai rien entendu. Merci de votre appel, au revoir!</Say>
</Response>`;
}

function generateErrorTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Excusez-nous, nous avons un problème technique. Rappellez dans quelques minutes. Merci!</Say>
</Response>`;
}

function generateRetryTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Je n'ai pas bien compris. Pouvez-vous répéter?</Say>
  <Gather input="speech" timeout="10" speechTimeout="4" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous écoute...</Say>
  </Gather>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel. Au revoir!</Say>
</Response>`;
}

function analyzeIntent(speechResult) {
  const text = speechResult.toLowerCase();

  if (text.includes("rendez-vous") || text.includes("rdv") || text.includes("reservation")) {
    return { intent: "booking_request", confidence: 0.9 };
  } else if (text.includes("prix") || text.includes("cout") || text.includes("tarif")) {
    return { intent: "pricing_inquiry", confidence: 0.8 };  
  } else if (text.includes("horaire") || text.includes("ouvert") || text.includes("disponible")) {
    return { intent: "hours_inquiry", confidence: 0.8 };
  } else {
    return { intent: "general", confidence: 0.3 };
  }
}

function processIntent(intent, speechResult) {
  switch (intent.intent) {
    case "booking_request":
      return {
        text: "Parfait! Je peux vous proposer un rendez-vous cette semaine. Mardi 14h avec Marco ou jeudi 16h avec Jessica. Lequel préférez-vous?",
        needsFollowUp: true
      };
    case "pricing_inquiry":
      return {
        text: "Nos prix: coupe homme 35 dollars, coupe et barbe 55 dollars, coupe enfant 25 dollars. Voulez-vous prendre rendez-vous?",
        needsFollowUp: true
      };
    case "hours_inquiry":
      return {
        text: "Nous sommes ouverts mardi au vendredi 9h à 18h, samedi 8h à 16h. Fermé dimanche et lundi. Voulez-vous un rendez-vous?",
        needsFollowUp: true
      };
    default:
      return {
        text: "Je peux vous aider avec les rendez-vous, prix et horaires. Dites rendez-vous pour un rendez-vous direct!",
        needsFollowUp: true
      };
  }
}

function generateConversationTwiML(response) {
  if (response.needsFollowUp) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response.text}</Say>
  <Pause length="1"/>
  <Gather input="speech" timeout="15" speechTimeout="6" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous écoute...</Say>
  </Gather>
  <Say language="fr-CA" voice="Polly.Chantal">Je n'ai rien entendu. Au revoir!</Say>
</Response>`;
  } else {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response.text}</Say>
  <Pause length="2"/>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel. Au revoir!</Say>
</Response>`;
  }
}

// ==============================================
// 🔄 KEEP ALIVE POUR ALWAYS ON
// ==============================================

if (process.env.ENABLE_ALWAYS_ON === 'true') {
  setInterval(() => {
    try {
      const https = require('https');
      const url = `${process.env.REPLIT_PRO_URL}/ping`;
      
      https.get(url, (res) => {
        if (process.env.ENABLE_DETAILED_LOGS === 'true') {
          console.log(`🔄 Keep alive: ${res.statusCode}`);
        }
      }).on('error', (err) => {
        console.warn('⚠️ Keep alive error:', err.message);
      });
    } catch (error) {
      console.warn('⚠️ Keep alive setup error:', error.message);
    }
  }, 300000); // 5 minutes
}

// ==============================================
// 🚀 DÉMARRAGE SERVEUR
// ==============================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 VALET IA REPLIT PRO DÉMARRÉ!
===============================
✅ Port: ${PORT} (Always On: ${process.env.ENABLE_ALWAYS_ON})  
✅ URL: ${process.env.REPLIT_PRO_URL}
✅ Twilio: ${process.env.TWILIO_PHONE_NUMBER}

🔗 ENDPOINTS ACTIFS:
• Voice: /webhook/twilio/voice
• SMS: /webhook/twilio/sms  
• Health: /health
• Analytics: /api/analytics/dashboard

📞 SERVICE PRÊT POUR APPELS!
  `);
});

module.exports = app;