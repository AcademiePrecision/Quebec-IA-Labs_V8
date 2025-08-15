// 🧪 SERVEUR TEST MINIMAL - DIAGNOSTIC
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🔧 Starting test server...");
console.log("Node version:", process.version);
console.log("Environment variables loaded:", {
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  REPLIT_PRO_URL: process.env.REPLIT_PRO_URL,
  ENABLE_DETAILED_LOGS: process.env.ENABLE_DETAILED_LOGS
});

// Middleware basique
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check simple
app.get("/", (req, res) => {
  console.log("📍 Health check accessed");
  res.json({
    service: "Valet IA Test Server",
    status: "active",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: {
      twilio_configured: !!process.env.TWILIO_ACCOUNT_SID,
      phone_number: process.env.TWILIO_PHONE_NUMBER
    }
  });
});

// Test webhook minimal
app.post("/webhook/twilio/voice", (req, res) => {
  console.log("📞 WEBHOOK TEST - Appel reçu:", {
    from: req.body.From,
    to: req.body.To,
    callSid: req.body.CallSid,
    body: req.body
  });

  try {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">
    Bonjour! Ceci est un test du service Valet IA. Le webhook fonctionne correctement.
  </Say>
  <Pause length="1"/>
  <Say language="fr-CA" voice="Polly.Chantal">
    Merci de votre appel. Au revoir!
  </Say>
</Response>`;

    console.log("✅ TwiML généré avec succès");
    res.set("Content-Type", "text/xml");
    res.send(twiml);
  } catch (error) {
    console.error("❌ Erreur génération TwiML:", error);
    res.status(500).send("Erreur serveur");
  }
});

// Test endpoint
app.get("/test", (req, res) => {
  console.log("🧪 Test endpoint accessed");
  res.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("💥 Erreur serveur:", error);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: error.message
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 SERVEUR TEST DÉMARRÉ!
=========================
✅ Port: ${PORT}
✅ Host: 0.0.0.0
✅ URL: http://localhost:${PORT}
✅ Webhook: /webhook/twilio/voice
✅ Test: /test

📱 Pour tester avec Twilio:
   URL webhook: https://AcademiePrecision.replit.app/webhook/twilio/voice
  `);
});

module.exports = app;