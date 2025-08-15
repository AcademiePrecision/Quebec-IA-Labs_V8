// 🚀 SERVEUR VALET IA - WEBHOOKS & API
// Serveur Express pour gérer Twilio, Stripe et ElevenLabs

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import des services (simulés pour l'instant)
// const TwilioIntegration = require('../src/api/twilio-integration');
// const SalonStripeService = require('../src/api/salon-stripe-service');

console.log(`
🤖 SERVEUR VALET IA DÉMARRÉ
============================
Port: ${PORT}
Mode: ${process.env.NODE_ENV}
Demo: ${process.env.ENABLE_DEMO_MODE}
URL: ${process.env.APP_URL}
============================
`);

// ==============================================
// ROUTES PRINCIPALES
// ==============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Valet IA Salons',
    status: 'active',
    version: '1.0.0',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
      elevenlabs: process.env.ELEVENLABS_API_KEY !== 'CONFIGURE_ELEVENLABS_LATER' ? 'configured' : 'missing',
      supabase: process.env.SUPABASE_URL !== 'CONFIGURE_SUPABASE_LATER' ? 'configured' : 'missing',
      stripe: process.env.STRIPE_SECRET_KEY !== 'CONFIGURE_STRIPE_LATER' ? 'configured' : 'missing',
      openai: process.env.OPENAI_API_KEY !== 'CONFIGURE_OPENAI_LATER' ? 'configured' : 'missing'
    }
  });
});

// ==============================================
// WEBHOOKS TWILIO
// ==============================================

// Webhook principal pour appels entrants
app.post('/webhook/twilio/voice', async (req, res) => {
  console.log('📞 Appel entrant Twilio:', req.body);
  
  try {
    const { From, To, CallSid, CallStatus } = req.body;
    
    // Identification du salon par numéro appelé
    const salonId = getSalonByPhone(To);
    
    if (!salonId) {
      return res.send(generateErrorTwiML('Salon non trouvé'));
    }

    // Simulation traitement IA
    const greeting = generatePersonalizedGreeting(From, salonId);
    const twimlResponse = generateGreetingTwiML(greeting, CallSid);
    
    console.log(`✅ Réponse TwiML générée pour salon ${salonId}`);
    res.set('Content-Type', 'text/xml');
    res.send(twimlResponse);
    
  } catch (error) {
    console.error('❌ Erreur webhook Twilio:', error);
    res.send(generateErrorTwiML('Erreur système'));
  }
});

// Webhook pour reconnaissance vocale
app.post('/webhook/twilio/speech/:callSid', async (req, res) => {
  console.log('🎤 Reconnaissance vocale:', req.body);
  
  try {
    const { callSid } = req.params;
    const { SpeechResult, Confidence } = req.body;
    
    // Simulation analyse NLP
    const intent = analyzeIntent(SpeechResult);
    const response = processIntent(intent);
    
    const twimlResponse = generateResponseTwiML(response, callSid);
    
    res.set('Content-Type', 'text/xml');
    res.send(twimlResponse);
    
  } catch (error) {
    console.error('❌ Erreur reconnaissance vocale:', error);
    res.send(generateRetryTwiML());
  }
});

// Webhook SMS
app.post('/webhook/twilio/sms', async (req, res) => {
  console.log('📱 SMS reçu:', req.body);
  
  const { From, Body, To } = req.body;
  
  // Réponse SMS automatique
  const smsResponse = `Merci pour votre message! Notre IA vous rappellera sous peu. - Valet IA`;
  
  res.set('Content-Type', 'text/xml');
  res.send(`
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>${smsResponse}</Message>
    </Response>
  `);
});

// ==============================================
// WEBHOOKS STRIPE
// ==============================================

app.post('/webhook/stripe', async (req, res) => {
  console.log('💳 Webhook Stripe:', req.body.type);
  
  try {
    const signature = req.headers['stripe-signature'];
    const event = req.body;
    
    // Simulation traitement événements Stripe
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('✅ Nouveau salon abonné:', event.data.object.customer);
        break;
        
      case 'invoice.payment_succeeded':
        console.log('💰 Paiement réussi:', event.data.object.amount_paid / 100, 'CAD');
        break;
        
      case 'customer.subscription.trial_will_end':
        console.log('⏰ Trial se termine bientôt:', event.data.object.customer);
        // Logique conversion ou rétention
        break;
        
      default:
        console.log('ℹ️ Événement Stripe non géré:', event.type);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// ==============================================
// API DASHBOARD SALONS
// ==============================================

// Données dashboard salon
app.get('/api/salon/:salonId/dashboard', async (req, res) => {
  const { salonId } = req.params;
  
  console.log(`📊 Dashboard demandé pour salon: ${salonId}`);
  
  try {
    // En mode demo, retourner données mock
    if (process.env.ENABLE_DEMO_MODE === 'true') {
      const mockData = getMockDashboardData(salonId);
      return res.json(mockData);
    }
    
    // En production, récupérer vraies données
    const dashboardData = await getSalonDashboard(salonId);
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Metrics salon en temps réel
app.get('/api/salon/:salonId/metrics', async (req, res) => {
  const { salonId } = req.params;
  
  const metrics = {
    salon_id: salonId,
    live_stats: {
      calls_today: Math.floor(Math.random() * 50) + 10,
      bookings_today: Math.floor(Math.random() * 40) + 8,
      revenue_today: Math.floor(Math.random() * 1500) + 500,
      ai_uptime: 99.8,
      satisfaction_avg: 8.6 + Math.random(),
      active_barbiers: Math.floor(Math.random() * 3) + 2
    },
    timestamp: new Date().toISOString()
  };
  
  console.log(`📈 Métriques temps réel salon ${salonId}:`, metrics.live_stats);
  res.json(metrics);
});

// ==============================================
// FONCTIONS UTILITAIRES
// ==============================================

function getSalonByPhone(phoneNumber) {
  // Mapping numéros → salons (en production: base de données)
  const phoneMapping = {
    [process.env.TWILIO_PHONE_NUMBER]: process.env.DEMO_SALON_ID || 'salon-001-tony'
  };
  
  return phoneMapping[phoneNumber] || null;
}

function generatePersonalizedGreeting(clientPhone, salonId) {
  // Simulation reconnaissance client
  const isRegularClient = Math.random() > 0.5;
  
  if (isRegularClient) {
    return "Bonjour client fidele! Comment puis-je vous aider aujourd hui?";
  } else {
    return "Bonjour salon Tony! Comment puis-je vous aider?";
  }
}

function generateGreetingTwiML(greeting, callSid) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${greeting}</Say>
  <Pause length="1"/>
  <Gather input="speech" timeout="15" speechTimeout="5" 
          action="/webhook/twilio/speech/${callSid}" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Parlez maintenant...</Say>
  </Gather>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel. Au revoir!</Say>
</Response>`;
}

function generateErrorTwiML(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${message}. Un moment s il vous plait.</Say>
  <Pause length="2"/>
  <Say language="fr-CA" voice="Polly.Chantal">Au revoir!</Say>
</Response>`;
}

function generateRetryTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Je n ai pas bien compris. Pouvez vous repeter?</Say>
  <Gather input="speech" timeout="5" speechTimeout="2" action="/webhook/twilio/retry" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous ecoute...</Say>
  </Gather>
</Response>`;
}

function analyzeIntent(speechResult) {
  // Simulation NLP simple
  const text = speechResult.toLowerCase();
  
  if (text.includes('rendez-vous') || text.includes('réservation')) {
    return { intent: 'booking_request', confidence: 0.9 };
  } else if (text.includes('prix') || text.includes('coût')) {
    return { intent: 'pricing_inquiry', confidence: 0.8 };
  } else if (text.includes('disponible') || text.includes('libre')) {
    return { intent: 'availability_inquiry', confidence: 0.8 };
  } else {
    return { intent: 'unknown', confidence: 0.3 };
  }
}

function processIntent(intent) {
  switch (intent.intent) {
    case 'booking_request':
      return {
        text: "Parfait! Je peux vous proposer un créneau demain à 14h30 avec Marco. Cela vous convient?",
        action: 'confirm_booking'
      };
    case 'pricing_inquiry':
      return {
        text: "Nos coupes débutent à 35 dollars, coupe et barbe à 55 dollars. Quel service vous interesse?",
        action: 'listen'
      };
    case 'availability_inquiry':
      return {
        text: "Nous avons de la disponibilité cette semaine. Quel jour vous arrangerait?",
        action: 'listen'
      };
    default:
      return {
        text: "Je peux vous aider avec les réservations, prix et disponibilités. Que souhaitez-vous?",
        action: 'listen'
      };
  }
}

function generateResponseTwiML(response, callSid) {
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response.text}</Say>`;

  if (response.action === 'listen') {
    twiml += `
  <Gather input="speech" timeout="10" speechTimeout="3" 
          action="/webhook/twilio/speech/${callSid}" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous ecoute...</Say>
  </Gather>`;
  } else if (response.action === 'confirm_booking') {
    twiml += `
  <Gather input="dtmf speech" timeout="10" numDigits="1" 
          action="/webhook/twilio/confirm/${callSid}" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Appuyez sur 1 pour confirmer, 2 pour modifier, ou dites oui ou non.</Say>
  </Gather>`;
  }

  twiml += `</Response>`;
  return twiml;
}

function getMockDashboardData(salonId) {
  // Retourner données de test selon salon
  return {
    salon_id: salonId,
    salon_name: salonId === 'salon-001-tony' ? 'Salon Tony & Co' : 'Salon Test',
    today_stats: {
      total_calls: Math.floor(Math.random() * 50) + 20,
      successful_bookings: Math.floor(Math.random() * 40) + 15,
      conversion_rate: 75 + Math.random() * 20,
      revenue_generated: Math.floor(Math.random() * 1500) + 800,
      ai_decisions_made: Math.floor(Math.random() * 100) + 50,
      client_satisfaction_avg: 8.0 + Math.random() * 1.5
    },
    ai_status: 'active',
    last_updated: new Date().toISOString()
  };
}

async function getSalonDashboard(salonId) {
  // En production: requête Supabase
  throw new Error('Production dashboard not implemented yet');
}

// ==============================================
// DÉMARRAGE SERVEUR
// ==============================================

app.listen(PORT, () => {
  console.log(`
🚀 VALET IA SERVEUR DÉMARRÉ!
=============================
✅ Port: ${PORT}
✅ Mode: ${process.env.NODE_ENV}
✅ Webhooks: ${process.env.APP_URL}/webhook
✅ Dashboard: ${process.env.APP_URL}/api/salon

📞 WEBHOOKS CONFIGURÉS:
- Twilio Voice: /webhook/twilio/voice
- Twilio SMS: /webhook/twilio/sms  
- Stripe: /webhook/stripe

🧪 DEMO MODE: ${process.env.ENABLE_DEMO_MODE}
📱 Teste en appelant: ${process.env.TWILIO_PHONE_NUMBER}
  `);
});

module.exports = app;