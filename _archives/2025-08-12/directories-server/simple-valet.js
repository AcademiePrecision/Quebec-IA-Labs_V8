// 🚀 SERVEUR VALET IA SIMPLE - SANS PROBLÈMES ENCODAGE
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`
🤖 SERVEUR VALET IA SIMPLE DÉMARRÉ
==================================
Port: ${PORT}
Twilio: ${process.env.TWILIO_PHONE_NUMBER}
==================================
`);

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Valet IA Simple',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Webhook principal Twilio
app.post('/webhook/twilio/voice', (req, res) => {
  console.log('📞 Appel entrant:', req.body.From, '->', req.body.To);
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">Bonjour salon Tony! Comment puis-je vous aider?</Say>
  <Pause length="1"/>
  <Gather input="speech" timeout="15" speechTimeout="6" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Parlez maintenant...</Say>
  </Gather>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel. Au revoir!</Say>
</Response>`;

  res.set('Content-Type', 'text/xml');
  res.send(twiml);
});

// Traitement reconnaissance vocale
app.post('/webhook/twilio/speech', (req, res) => {
  console.log('🎤 Reconnaissance vocale:', req.body.SpeechResult);
  
  const speechResult = req.body.SpeechResult || '';
  let response = "Je vous ai entendu. Merci de votre appel.";
  
  // Analyse simple
  if (speechResult.toLowerCase().includes('rendez-vous') || speechResult.toLowerCase().includes('reservation')) {
    response = "Parfait! Je peux vous proposer un rendez-vous demain a 14h avec Marco. Cela vous convient?";
  } else if (speechResult.toLowerCase().includes('prix') || speechResult.toLowerCase().includes('cout')) {
    response = "Nos coupes debutent a 35 dollars. Coupe et barbe a 55 dollars. Que souhaitez-vous?";
  } else if (speechResult.toLowerCase().includes('disponible') || speechResult.toLowerCase().includes('ouvert')) {
    response = "Nous sommes ouverts du mardi au samedi. Nous avons de la place cette semaine.";
  }
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response}</Say>
  <Pause length="2"/>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel. Au revoir!</Say>
</Response>`;

  res.set('Content-Type', 'text/xml');
  res.send(twiml);
});

app.listen(PORT, () => {
  console.log(`
🚀 SERVEUR SIMPLE PRÊT!
=======================
✅ Port: ${PORT}
✅ Webhook: /webhook/twilio/voice
📱 Test: ${process.env.TWILIO_PHONE_NUMBER}
  `);
});

module.exports = app;