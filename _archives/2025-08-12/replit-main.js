#!/usr/bin/env node
// 🚀 VALET IA - REPLIT PRODUCTION

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 VALET IA DÉMARRAGE...");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.json({
    service: "Valet IA Salons",
    status: "active", 
    timestamp: new Date().toISOString(),
    phone: process.env.TWILIO_PHONE_NUMBER || "+15817101240"
  });
});

// Webhook Twilio
app.post("/webhook/twilio/voice", (req, res) => {
  console.log("📞 Appel reçu:", req.body.From);
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">
    Bonjour salon Tony! Comment puis-je vous aider aujourd'hui?
  </Say>
  <Pause length="1"/>
  <Say language="fr-CA" voice="Polly.Chantal">
    Pour un rendez-vous, dites rendez-vous. Pour les prix, dites prix.
  </Say>
  <Gather input="speech" timeout="10" action="/webhook/twilio/speech" method="POST">
    <Say language="fr-CA" voice="Polly.Chantal">Je vous écoute...</Say>
  </Gather>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

app.post("/webhook/twilio/speech", (req, res) => {
  const speech = req.body.SpeechResult || "";
  console.log("🎤 Parole:", speech);
  
  let response = "Je peux vous aider avec les rendez-vous et les prix.";
  
  if (speech.toLowerCase().includes("rendez-vous")) {
    response = "Parfait! Je peux vous proposer mardi à 14h ou jeudi à 16h. Lequel préférez-vous?";
  } else if (speech.toLowerCase().includes("prix")) {
    response = "Nos prix: coupe 35 dollars, coupe et barbe 55 dollars. Voulez-vous un rendez-vous?";
  }
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">${response}</Say>
  <Pause length="2"/>
  <Say language="fr-CA" voice="Polly.Chantal">Merci de votre appel!</Say>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(twiml);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SERVEUR DÉMARRÉ sur port ${PORT}`);
  console.log(`📞 Webhook: https://AcademiePrecision.replit.app/webhook/twilio/voice`);
});