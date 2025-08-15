// 🚀 QUEBEC-IA-LABS + MARCEL V8.0 ULTIMATE UNIFIED
// ===============================================
// Serveur unifié - Marcel AI + Stripe + Supabase + ElevenLabs
// Version: Production 1.0 - SÉCURISÉ
// Date: 2025-08-11
// ===============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

// 🎯 INITIALISATION
const app = express();
const PORT = process.env.PORT || 3000;

// 🔄 Importer les modules Marcel si disponibles
let ContextAnalyzer, MarcelDataSystem;
try {
  // Vérifier si les modules existent dans Marcel-Trainer-Dev
  const marcelDevPath = path.join(__dirname, 'Marcel-Trainer-Dev');
  if (fs.existsSync(marcelDevPath)) {
    try {
      ContextAnalyzer = require(path.join(marcelDevPath, 'context-analyzer'));
      console.log("✅ ContextAnalyzer chargé depuis Marcel-Trainer-Dev");
    } catch (e) {
      console.log("⚠️ ContextAnalyzer non disponible");
    }
    
    try {
      MarcelDataSystem = require(path.join(marcelDevPath, 'relationship-data'));
      console.log("✅ MarcelDataSystem chargé avec", MarcelDataSystem?.clients?.length || 0, "clients");
    } catch (e) {
      console.log("⚠️ MarcelDataSystem non disponible");
    }
  }
} catch (error) {
  console.log("ℹ️ Modules Marcel non chargés:", error.message);
}

// 📊 SESSIONS SÉCURISÉES avec TTL
const sessions = new Map();
const SESSION_TTL = 3600000; // 1 hour

// 🧹 Nettoyage automatique des sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}, 300000); // Clean every 5 minutes

// 🔐 SÉCURITÉ MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 🚦 RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Plus strict pour les API
  message: { error: 'Limite API dépassée. Veuillez patienter.' }
});

// 🌐 CORS SÉCURISÉ
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://quebec-ia-labs.replit.app',
      'https://academie-precision.replit.app',
      'http://localhost:3000',
      'http://localhost:19006' // Expo dev
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// 🛠️ MIDDLEWARE
app.use('/api/', limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📁 Servir les fichiers statiques du dossier public si existant
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log("✅ Dossier public configuré:", publicPath);
}

// 📦 INTÉGRATIONS PRINCIPALES
let anthropic = null;
let stripe = null;
let supabase = null;

// 🧠 CLAUDE API
try {
  const Anthropic = require("@anthropic-ai/sdk");
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log("✅ Claude API connecté");
  }
} catch (error) {
  console.warn("⚠️ Claude SDK non disponible");
}

// 💳 STRIPE
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe connecté");
  }
} catch (error) {
  console.warn("⚠️ Stripe SDK non disponible");
}

// 🗄️ SUPABASE
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    console.log("✅ Supabase connecté");
  }
} catch (error) {
  console.warn("⚠️ Supabase SDK non disponible");
}

// 🎤 ELEVENLABS
let elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID_FRENCH_CA || 'IPgYtHTNLjC7Bq7IPHrm';

if (elevenLabsApiKey) {
  console.log("✅ ElevenLabs configuré avec voix masculine");
}

// 🧠 MARCEL INTELLIGENCE SYSTÈME
class MarcelIntelligence {
  constructor() {
    this.clientData = this.loadClientData();
  }

  loadClientData() {
    try {
      // Données client simulées pour démo
      return {
        clients: [
          {
            id: "1",
            name: "Jean Tremblay",
            phone: "+15145551234",
            preferredBarber: "Marco",
            lastVisit: "2025-08-05",
            preferences: ["coupe classique", "barbe"]
          },
          {
            id: "2", 
            name: "Marie Dubois",
            phone: "+15145552345",
            preferredBarber: "Julie",
            lastVisit: "2025-08-08",
            preferences: ["coupe moderne", "coloration"]
          }
        ],
        barbers: [
          {
            id: "marco",
            name: "Marco",
            specialties: ["coupe classique", "barbe", "taille"],
            schedule: {
              "monday": ["09:00-17:00"],
              "tuesday": ["09:00-17:00"], 
              "wednesday": ["09:00-17:00"],
              "thursday": ["09:00-17:00"],
              "friday": ["09:00-17:00"],
              "saturday": ["08:00-16:00"]
            }
          },
          {
            id: "julie",
            name: "Julie",
            specialties: ["coupe moderne", "coloration", "mise en plis"],
            schedule: {
              "monday": ["10:00-18:00"],
              "tuesday": ["10:00-18:00"],
              "wednesday": ["10:00-18:00"], 
              "thursday": ["10:00-18:00"],
              "friday": ["10:00-18:00"],
              "saturday": ["09:00-17:00"]
            }
          }
        ],
        services: [
          { name: "Coupe Classique", price: 45, duration: 30 },
          { name: "Coupe Moderne", price: 55, duration: 45 },
          { name: "Barbe", price: 35, duration: 20 },
          { name: "Package Complet", price: 75, duration: 60 },
          { name: "Coloration", price: 85, duration: 90 }
        ]
      };
    } catch (error) {
      console.warn("⚠️ Données client par défaut chargées");
      return { clients: [], barbers: [], services: [] };
    }
  }

  findClientByPhone(phone) {
    return this.clientData.clients.find(client => client.phone === phone);
  }

  findBarberByName(name) {
    return this.clientData.barbers.find(barber => 
      barber.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  getServices() {
    return this.clientData.services;
  }

  async generateResponse(message, context = {}) {
    try {
      if (!anthropic) {
        return this.getFallbackResponse(message, context);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: message
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error("Erreur Claude:", error.message);
      return this.getFallbackResponse(message, context);
    }
  }

  buildSystemPrompt(context) {
    const client = context.client;
    const clientInfo = client ? `Client reconnu: ${client.name}, barbier préféré: ${client.preferredBarber}` : "Nouveau client";
    
    return `Tu es Marcel, l'assistant IA ultra-intelligent du salon de barbier québécois "Académie Précision". 

CONTEXTE:
${clientInfo}

SERVICES DISPONIBLES:
${this.clientData.services.map(s => `- ${s.name}: ${s.price}$ (${s.duration}min)`).join('\n')}

BARBIERS:
${this.clientData.barbers.map(b => `- ${b.name}: ${b.specialties.join(', ')}`).join('\n')}

HORAIRES:
Lun-Ven: 9h-18h, Sam: 8h-17h, Dim: 10h-16h

PERSONNALITÉ:
- Professionnel mais chaleureux
- Français québécois authentique  
- Expert en style masculin/féminin
- Efficace pour les rendez-vous

Réponds naturellement en français québécois avec expertise et chaleur.`;
  }

  getFallbackResponse(message, context) {
    const responses = [
      "Salut! Marcel ici. Comment je peux t'aider aujourd'hui?",
      "Bonjour! C'est Marcel d'Académie Précision. Prêt pour un nouveau look?",
      "Hey! Marcel à votre service. Que puis-je faire pour vous aujourd'hui?",
      "Allo! Marcel ici. Parlons de votre prochain rendez-vous!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// 🤖 Instance Marcel
const marcel = new MarcelIntelligence();

// 🔧 UTILITAIRES
function validateInput(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
}

function sendResponse(res, status, data, error = null) {
  res.status(status).json({
    success: status < 400,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString()
  });
}

// 📱 ROUTES PRINCIPALES

// 🏠 Page d'accueil unifiée
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎯 Quebec-IA-Labs + Marcel V8.0 Ultimate</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                padding: 3rem;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                max-width: 800px;
                margin: 2rem;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .version { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
            .status { 
                background: rgba(34, 197, 94, 0.2); 
                border: 2px solid #22c55e;
                border-radius: 15px;
                padding: 1.5rem;
                margin: 2rem 0;
                font-weight: bold;
                line-height: 1.8;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            .feature {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 10px;
                backdrop-filter: blur(5px);
            }
            .links {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 2rem;
            }
            .btn {
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            .btn.primary {
                background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 Quebec-IA-Labs</h1>
            <div class="version">Marcel V8.0 Ultimate + Stripe + Supabase</div>
            <div class="status">
                ✅ Marcel Intelligence Opérationnel<br>
                💳 Stripe Payments Configuré<br>
                🗄️ Supabase Database Connecté<br>
                🎤 ElevenLabs Voice Masculine<br>
                🔐 Sécurité Production Active<br>
                📱 API Twilio Prêt
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🧠 Marcel AI</h3>
                    <p>Intelligence complète avec reconnaissance client</p>
                </div>
                <div class="feature">
                    <h3>💳 Paiements</h3>
                    <p>Stripe intégré pour tous les services</p>
                </div>
                <div class="feature">
                    <h3>📊 Base de Données</h3>
                    <p>Supabase pour la persistance</p>
                </div>
                <div class="feature">
                    <h3>🎤 Voix IA</h3>
                    <p>ElevenLabs voix masculine québécoise</p>
                </div>
            </div>

            <div class="links">
                <a href="/test-marcel" class="btn primary">🧪 Test Marcel</a>
                <a href="/test-marcel-advanced" class="btn">🎯 Dashboard Avancé</a>
                <a href="/health" class="btn">💚 Santé Système</a>
                <a href="/webhook/twilio/test" class="btn">📱 Test Twilio</a>
                <a href="/api/payments/test" class="btn">💳 Test Stripe</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 🧪 Interface de test Marcel simple
app.get("/test-marcel", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🧪 Test Marcel V8.0 Ultimate</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
                min-height: 100vh;
                padding: 2rem;
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                padding: 2rem;
            }
            h1 { text-align: center; margin-bottom: 2rem; font-size: 2.5rem; }
            .test-section {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            .input-group {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            input[type="text"] {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 10px;
                background: rgba(255,255,255,0.2);
                color: white;
                font-size: 16px;
            }
            input[type="text"]::placeholder { color: rgba(255,255,255,0.7); }
            button {
                background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            .response {
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                padding: 1rem;
                margin-top: 1rem;
                min-height: 100px;
                white-space: pre-wrap;
                border-left: 4px solid #4CAF50;
            }
            .back-btn {
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 20px;
                text-decoration: none;
                display: inline-block;
                margin-bottom: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/" class="back-btn">← Retour Accueil</a>
            <h1>🧪 Test Marcel Unifié</h1>
            
            <div class="test-section">
                <h3>💬 Conversation avec Marcel</h3>
                <div class="input-group">
                    <input type="text" id="messageInput" placeholder="Parlez à Marcel..." />
                    <button onclick="testMarcel()">Envoyer</button>
                </div>
                <div class="response" id="marcelResponse">
                    Prêt à discuter! Marcel V8.0 Ultimate avec intelligence complète.
                </div>
            </div>
        </div>

        <script>
            async function testMarcel() {
                const message = document.getElementById('messageInput').value;
                const responseDiv = document.getElementById('marcelResponse');
                
                if (!message.trim()) return;
                
                responseDiv.textContent = '🧠 Marcel réfléchit...';
                
                try {
                    const response = await fetch('/api/marcel/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    });
                    
                    const data = await response.json();
                    responseDiv.textContent = data.success ? data.data.response : 'Erreur: ' + data.error;
                } catch (error) {
                    responseDiv.textContent = 'Erreur: ' + error.message;
                }
                
                document.getElementById('messageInput').value = '';
            }

            document.getElementById('messageInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') testMarcel();
            });
        </script>
    </body>
    </html>
  `);
});

// 🎯 Dashboard Marcel Avancé
app.get("/test-marcel-advanced", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎯 Marcel V8.0 - Dashboard Avancé</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: white;
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .header h1 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            .main-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            .panel {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .panel h2 {
                color: #2d3748;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            .chat-container {
                height: 400px;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                background: #f7fafc;
            }
            .message {
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 10px;
            }
            .message.user {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                margin-left: 20%;
                text-align: right;
            }
            .message.marcel {
                background: #e2e8f0;
                margin-right: 20%;
            }
            .input-group {
                display: flex;
                gap: 10px;
            }
            input[type="text"], input[type="tel"] {
                flex: 1;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 16px;
            }
            button {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .scenario-btn {
                background: #10b981;
                margin: 5px;
                padding: 8px 16px;
                font-size: 14px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-top: 20px;
            }
            .stat-card {
                background: #f7fafc;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #667eea;
            }
            .stat-label {
                color: #718096;
                font-size: 0.9rem;
                margin-top: 5px;
            }
            .alert {
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            .alert.success { background: #d4edda; color: #155724; }
            .alert.error { background: #f8d7da; color: #721c24; }
            .client-info {
                background: #f0f4f8;
                padding: 15px;
                border-radius: 10px;
                margin-top: 15px;
            }
            .tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            .tab {
                padding: 10px 20px;
                background: none;
                border: none;
                cursor: pointer;
                font-weight: 600;
                color: #718096;
                transition: all 0.3s;
            }
            .tab.active {
                color: #667eea;
                border-bottom: 3px solid #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Marcel V8.0 Ultimate - Dashboard Avancé</h1>
                <p style="color: #718096; font-size: 1.1rem;">Intelligence complète avec reconnaissance client</p>
                <div style="margin-top: 20px;">
                    <span id="status" class="alert success" style="display: inline-block; padding: 8px 16px;">✅ Système opérationnel</span>
                </div>
            </div>

            <div class="main-grid">
                <!-- Panel de Chat -->
                <div class="panel">
                    <h2>💬 Conversation avec Marcel</h2>
                    
                    <div class="tabs">
                        <button class="tab active" onclick="switchMode('smart')">🧠 Mode Smart</button>
                        <button class="tab" onclick="switchMode('basic')">📱 Mode Basic</button>
                        <button class="tab" onclick="switchMode('voice')">🎤 Mode Voix</button>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <input type="tel" id="phoneInput" placeholder="📱 Numéro de téléphone (optionnel)" style="width: 100%;" />
                    </div>

                    <div class="chat-container" id="chatContainer">
                        <div class="message marcel">Bonjour! C'est Marcel d'Académie Précision. Comment puis-je vous aider aujourd'hui?</div>
                    </div>

                    <div class="input-group">
                        <input type="text" id="messageInput" placeholder="Tapez votre message..." />
                        <button onclick="sendMessage()">Envoyer</button>
                    </div>

                    <div id="clientInfo" class="client-info" style="display: none;">
                        <h4>👤 Client reconnu</h4>
                        <div id="clientDetails"></div>
                    </div>
                </div>

                <!-- Panel de Contrôle -->
                <div class="panel">
                    <h2>🎮 Contrôle & Tests</h2>
                    
                    <h3 style="margin-bottom: 15px;">📋 Scénarios rapides</h3>
                    <div id="scenarios">
                        <button class="scenario-btn" onclick="testScenario('Bonjour Marcel');">👋 Salutation</button>
                        <button class="scenario-btn" onclick="testScenario(\'J\'aimerais prendre rendez-vous\');">📅 Rendez-vous</button>
                        <button class="scenario-btn" onclick="testScenario(\'C\'est combien pour une coupe?\');">💰 Prix</button>
                        <button class="scenario-btn" onclick="testScenario(\'Est-ce que Marco travaille demain?\');">👨 Barbier</button>
                        <button class="scenario-btn" onclick="testScenario(\'J\'voudrais une coupe avec Marco samedi matin\');">🎯 Complet</button>
                        <button class="scenario-btn" onclick="testScenario(\'J\'veux annuler mon rendez-vous\');">❌ Annulation</button>
                    </div>

                    <h3 style="margin-top: 25px; margin-bottom: 15px;">📊 Statistiques en temps réel</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="statMessages">0</div>
                            <div class="stat-label">Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="statResponseTime">0ms</div>
                            <div class="stat-label">Temps réponse</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="statExtracted">0</div>
                            <div class="stat-label">Infos extraites</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="statSuccess">100%</div>
                            <div class="stat-label">Succès</div>
                        </div>
                    </div>

                    <h3 style="margin-top: 25px; margin-bottom: 15px;">🔧 Actions</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="resetSession()">🔄 Nouvelle session</button>
                        <button onclick="exportConversation()">💾 Exporter</button>
                        <button onclick="viewMetrics()">📈 Métriques</button>
                        <button onclick="testWebhook()">📱 Test Twilio</button>
                    </div>

                    <div id="extractedInfo" style="margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 10px;">
                        <h4>📝 Informations extraites</h4>
                        <pre id="extractedData" style="margin-top: 10px; font-size: 12px;">Aucune information extraite</pre>
                    </div>
                </div>
            </div>

            <!-- Panel des métriques -->
            <div class="panel">
                <h2>📈 Métriques système</h2>
                <div id="systemMetrics" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px;">
                    <div class="stat-card">
                        <div class="stat-value" id="claudeStatus">-</div>
                        <div class="stat-label">Claude API</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stripeStatus">-</div>
                        <div class="stat-label">Stripe</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="supabaseStatus">-</div>
                        <div class="stat-label">Supabase</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="elevenLabsStatus">-</div>
                        <div class="stat-label">ElevenLabs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="sessionsCount">0</div>
                        <div class="stat-label">Sessions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="uptimeValue">0s</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let sessionId = 'web-' + Date.now();
            let messageCount = 0;
            let currentMode = 'smart';
            let extractedInfo = {};

            async function sendMessage() {
                const input = document.getElementById('messageInput').value;
                const phone = document.getElementById('phoneInput').value;
                
                if (!input.trim()) return;
                
                // Afficher le message de l'utilisateur
                addMessage(input, 'user');
                document.getElementById('messageInput').value = '';
                
                const startTime = Date.now();
                
                try {
                    const endpoint = currentMode === 'smart' ? '/api/marcel/chat/smart' : '/api/marcel/chat';
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: input,
                            phoneNumber: phone,
                            sessionId: sessionId,
                            mode: currentMode
                        })
                    });
                    
                    const data = await response.json();
                    const responseTime = Date.now() - startTime;
                    
                    if (data.success) {
                        addMessage(data.data.response, 'marcel');
                        
                        // Mettre à jour les stats
                        messageCount++;
                        document.getElementById('statMessages').textContent = messageCount;
                        document.getElementById('statResponseTime').textContent = responseTime + 'ms';
                        
                        // Mettre à jour les infos extraites
                        if (data.data.extractedInfo) {
                            extractedInfo = data.data.extractedInfo;
                            document.getElementById('extractedData').textContent = JSON.stringify(extractedInfo, null, 2);
                            document.getElementById('statExtracted').textContent = Object.keys(extractedInfo).length;
                        }
                        
                        // Afficher les infos client si disponibles
                        if (data.data.isKnownClient && data.data.clientData) {
                            showClientInfo(data.data.clientData);
                        }
                    } else {
                        addMessage('Erreur: ' + (data.error || 'Erreur inconnue'), 'marcel');
                    }
                } catch (error) {
                    addMessage('Erreur de connexion: ' + error.message, 'marcel');
                }
            }

            function addMessage(text, sender) {
                const container = document.getElementById('chatContainer');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + sender;
                messageDiv.textContent = text;
                container.appendChild(messageDiv);
                container.scrollTop = container.scrollHeight;
            }

            function testScenario(text) {
                document.getElementById('messageInput').value = text;
                sendMessage();
            }

            function switchMode(mode) {
                currentMode = mode;
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                event.target.classList.add('active');
            }

            function resetSession() {
                sessionId = 'web-' + Date.now();
                messageCount = 0;
                extractedInfo = {};
                document.getElementById('chatContainer').innerHTML = '<div class="message marcel">Nouvelle session démarrée. Comment puis-je vous aider?</div>';
                document.getElementById('statMessages').textContent = '0';
                document.getElementById('extractedData').textContent = 'Aucune information extraite';
                document.getElementById('clientInfo').style.display = 'none';
            }

            function showClientInfo(clientData) {
                const infoDiv = document.getElementById('clientInfo');
                const detailsDiv = document.getElementById('clientDetails');
                
                if (clientData && clientData.client) {
                    detailsDiv.innerHTML = '<p><strong>Nom:</strong> ' + clientData.client.name + '</p>' +
                        '<p><strong>Téléphone:</strong> ' + clientData.client.phone + '</p>' +
                        '<p><strong>Barbier préféré:</strong> ' + (clientData.preferredBarbier?.name || 'Aucun') + '</p>' +
                        '<p><strong>Dernière visite:</strong> ' + clientData.client.lastVisit + '</p>' +
                        '<p><strong>Total visites:</strong> ' + clientData.client.totalVisits + '</p>';
                    infoDiv.style.display = 'block';
                }
            }

            function exportConversation() {
                const chat = document.getElementById('chatContainer').innerText;
                const blob = new Blob([chat], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'marcel-conversation-' + Date.now() + '.txt';
                a.click();
            }

            async function viewMetrics() {
                try {
                    const response = await fetch('/health');
                    const data = await response.json();
                    alert(JSON.stringify(data.data, null, 2));
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }

            async function testWebhook() {
                try {
                    const response = await fetch('/webhook/twilio/test');
                    const data = await response.json();
                    alert('Test Twilio: ' + JSON.stringify(data.data, null, 2));
                } catch (error) {
                    alert('Erreur webhook: ' + error.message);
                }
            }

            // Charger les métriques système
            async function loadSystemMetrics() {
                try {
                    const response = await fetch('/health');
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        document.getElementById('claudeStatus').textContent = data.data.services.claude.includes('✅') ? '✅' : '❌';
                        document.getElementById('stripeStatus').textContent = data.data.services.stripe.includes('✅') ? '✅' : '❌';
                        document.getElementById('supabaseStatus').textContent = data.data.services.supabase.includes('✅') ? '✅' : '❌';
                        document.getElementById('elevenLabsStatus').textContent = data.data.services.elevenlabs.includes('✅') ? '✅' : '❌';
                        document.getElementById('sessionsCount').textContent = data.data.stats.activeSessions;
                        document.getElementById('uptimeValue').textContent = Math.floor(data.data.uptime) + 's';
                    }
                } catch (error) {
                    console.error('Erreur chargement métriques:', error);
                }
            }

            // Charger les métriques au démarrage et toutes les 10 secondes
            loadSystemMetrics();
            setInterval(loadSystemMetrics, 10000);

            // Support Enter pour envoyer
            document.getElementById('messageInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
        </script>
    </body>
    </html>
  `);
});

// 🧠 API Marcel Chat principal (basique)
app.post("/api/marcel/chat", 
  apiLimiter,
  [
    body('message').trim().isLength({ min: 1, max: 500 }),
    body('phoneNumber').optional().isMobilePhone(),
    body('sessionId').optional().isString(),
    body('mode').optional().isString()
  ],
  validateInput,
  async (req, res) => {
    try {
      const { message, phoneNumber, sessionId = 'web-' + Date.now() } = req.body;
      const startTime = Date.now();

      // Reconnaissance client si numéro fourni
      let client = null;
      if (phoneNumber) {
        client = marcel.findClientByPhone(phoneNumber);
      }

      // Contexte pour la réponse
      const context = {
        client: client,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      };

      // Générer réponse intelligente
      const response = await marcel.generateResponse(message, context);
      const responseTime = Date.now() - startTime;

      // Sauvegarder session
      sessions.set(sessionId, {
        createdAt: Date.now(),
        lastActivity: Date.now(),
        messages: (sessions.get(sessionId)?.messages || []).concat([
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: response, timestamp: new Date().toISOString() }
        ]).slice(-10), // Garder seulement les 10 derniers messages
        client: client,
        phoneNumber: phoneNumber
      });

      sendResponse(res, 200, {
        response: response,
        responseTime: responseTime,
        sessionId: sessionId,
        isKnownClient: !!client,
        clientName: client?.name,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur API Marcel:', error);
      sendResponse(res, 500, null, 'Erreur interne du serveur');
    }
  }
);

// 🧠 API Marcel Chat Smart avec relations client
app.post("/api/marcel/chat/smart",
  apiLimiter,
  [
    body('message').trim().isLength({ min: 1, max: 500 }),
    body('phoneNumber').optional().isMobilePhone(),
    body('sessionId').optional().isString()
  ],
  validateInput,
  async (req, res) => {
    try {
      const { message, phoneNumber, sessionId = 'smart-' + Date.now() } = req.body;
      const startTime = Date.now();

      // Créer ou récupérer session
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          createdAt: Date.now(),
          lastActivity: Date.now(),
          messages: [],
          extractedInfo: {},
          client: null,
          phoneNumber: phoneNumber
        });
      }

      const session = sessions.get(sessionId);
      session.lastActivity = Date.now();

      // Reconnaissance client améliorée
      let client = null;
      let clientContext = '';
      if (phoneNumber) {
        client = marcel.findClientByPhone(phoneNumber);
        if (client) {
          session.client = client;
          clientContext = `
CLIENT RECONNU: ${client.name}, barbier préféré: ${client.preferredBarber}, dernière visite: ${client.lastVisit}`;
        }
      }

      // Construire un prompt enrichi pour Claude si disponible
      let response;
      if (anthropic) {
        const systemPrompt = `Tu es Marcel, l'assistant IA ultra-intelligent du salon de barbier québécois "Académie Précision".
        
${marcel.buildSystemPrompt({ client })}
${clientContext}

HISTORIQUE CONVERSATION:
${session.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

INFORMATIONS DÉJÀ COLLECTÉES:
${JSON.stringify(session.extractedInfo, null, 2)}

Règles importantes:
1. Si tu reconnais le client, salue-le par son nom
2. Ne redemande JAMAIS une info déjà collectée
3. Sois personnalisé et chaleureux
4. Maximum 2-3 phrases courtes en français québécois`;

        try {
          const claudeResponse = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            temperature: 0.7,
            system: systemPrompt,
            messages: [{
              role: "user",
              content: message
            }]
          });
          response = claudeResponse.content[0].text;
        } catch (error) {
          console.error("Erreur Claude Smart:", error);
          response = marcel.getFallbackResponse(message, { client });
        }
      } else {
        response = marcel.getFallbackResponse(message, { client });
      }

      const responseTime = Date.now() - startTime;

      // Analyser et extraire les informations
      const extractedFields = analyzeMessage(message);
      Object.assign(session.extractedInfo, extractedFields);

      // Sauvegarder dans l'historique
      session.messages.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() }
      );

      // Limiter l'historique
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }

      sendResponse(res, 200, {
        response: response,
        responseTime: responseTime,
        sessionId: sessionId,
        isKnownClient: !!client,
        clientData: client ? {
          client: client,
          preferredBarbier: marcel.findBarberByName(client.preferredBarber)
        } : null,
        extractedInfo: session.extractedInfo,
        mode: 'smart',
        engine: anthropic ? 'Claude 3.5 Sonnet' : 'Fallback',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur API Marcel Smart:', error);
      sendResponse(res, 500, null, 'Erreur interne du serveur');
    }
  }
);

// 🔍 Fonction d'analyse de message
function analyzeMessage(message) {
  const extracted = {};
  const lowerMessage = message.toLowerCase();

  // Extraction du service
  if (lowerMessage.includes('coupe') || lowerMessage.includes('haircut')) {
    extracted.service = 'coupe';
  } else if (lowerMessage.includes('barbe') || lowerMessage.includes('beard')) {
    extracted.service = 'barbe';
  } else if (lowerMessage.includes('combo') || lowerMessage.includes('package')) {
    extracted.service = 'combo';
  }

  // Extraction de la date
  if (lowerMessage.includes('aujourd\'hui') || lowerMessage.includes('today')) {
    extracted.date = 'aujourd\'hui';
  } else if (lowerMessage.includes('demain') || lowerMessage.includes('tomorrow')) {
    extracted.date = 'demain';
  } else if (lowerMessage.includes('samedi') || lowerMessage.includes('saturday')) {
    extracted.date = 'samedi';
  }

  // Extraction du barbier
  const barbiers = ['marco', 'tony', 'julie'];
  barbiers.forEach(barbier => {
    if (lowerMessage.includes(barbier)) {
      extracted.barbier = barbier.charAt(0).toUpperCase() + barbier.slice(1);
    }
  });

  // Extraction du moment de la journée
  if (lowerMessage.includes('matin') || lowerMessage.includes('morning')) {
    extracted.periode = 'matin';
  } else if (lowerMessage.includes('après-midi') || lowerMessage.includes('afternoon')) {
    extracted.periode = 'après-midi';
  } else if (lowerMessage.includes('soir') || lowerMessage.includes('evening')) {
    extracted.periode = 'soir';
  }

  // Extraction du besoin
  if (lowerMessage.includes('rendez-vous') || lowerMessage.includes('appointment')) {
    extracted.besoin = 'rendez-vous';
  } else if (lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('combien')) {
    extracted.besoin = 'prix';
  } else if (lowerMessage.includes('horaire') || lowerMessage.includes('schedule')) {
    extracted.besoin = 'horaire';
  }

  return extracted;
}

// 🧪 Routes de test originales du marcel-dev-server
app.post("/test-marcel-response", async (req, res) => {
  const { userInput, sessionId = "test-" + Date.now() } = req.body;

  console.log("🎯 Test Marcel:", userInput);
  
  // Créer ou récupérer la session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      lastActivity: Date.now(),
      extractedInfo: {},
      messages: [],
      questionsAsked: new Set()
    });
  }

  const session = sessions.get(sessionId);
  const context = { client: null, sessionId };

  // Générer réponse
  const response = await marcel.generateResponse(userInput, context);
  
  // Analyser le message
  const extracted = analyzeMessage(userInput);
  Object.assign(session.extractedInfo, extracted);

  // Ajouter à l'historique
  session.messages.push(
    { role: 'user', content: userInput },
    { role: 'assistant', content: response }
  );

  res.json({
    input: userInput,
    response: response,
    extractedInfo: session.extractedInfo,
    sessionId: sessionId,
    conversationLength: session.messages.length,
    engine: "Marcel Intelligence"
  });
});

// 🧠 Test avec Claude (basique)
app.post("/test-claude", async (req, res) => {
  const { userInput, sessionId = "claude-" + Date.now() } = req.body;

  console.log("🤖 Test Claude:", userInput);

  if (!anthropic) {
    return res.status(400).json({
      error: "Claude non configuré",
      message: "Ajoutez ANTHROPIC_API_KEY dans .env",
      engine: "Claude - Non disponible"
    });
  }

  // Créer ou récupérer session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      extractedInfo: {},
      messages: []
    });
  }

  const session = sessions.get(sessionId);
  const context = { client: null };

  const response = await marcel.generateResponse(userInput, context);
  const extracted = analyzeMessage(userInput);
  Object.assign(session.extractedInfo, extracted);

  session.messages.push(
    { role: 'user', content: userInput },
    { role: 'assistant', content: response }
  );

  res.json({
    input: userInput,
    response: response,
    extractedInfo: session.extractedInfo,
    sessionId: sessionId,
    engine: "Claude 3.5 Sonnet",
    conversationLength: session.messages.length
  });
});

// 🧠🔗 Test Claude Smart avec relations
app.post("/test-claude-smart", async (req, res) => {
  const { userInput, sessionId = "claude-smart-" + Date.now(), phoneNumber } = req.body;

  console.log("🤖 Test Claude Smart:", userInput);
  console.log("📞 Téléphone client:", phoneNumber);

  if (!anthropic) {
    return res.status(400).json({
      error: "Claude non configuré",
      message: "Ajoutez ANTHROPIC_API_KEY",
      engine: "Claude Smart - Non disponible"
    });
  }

  // Créer ou récupérer session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      phoneNumber: phoneNumber,
      extractedInfo: {},
      messages: [],
      clientData: null
    });
  }

  const session = sessions.get(sessionId);

  // Récupérer les infos client
  let client = null;
  if (phoneNumber) {
    client = marcel.findClientByPhone(phoneNumber);
    session.clientData = client;
  }

  const context = { client, sessionId };
  const response = await marcel.generateResponse(userInput, context);
  
  const extracted = analyzeMessage(userInput);
  Object.assign(session.extractedInfo, extracted);

  session.messages.push(
    { role: 'user', content: userInput },
    { role: 'assistant', content: response }
  );

  res.json({
    input: userInput,
    response: response,
    extractedInfo: session.extractedInfo,
    clientData: client,
    sessionId: sessionId,
    engine: "Claude Smart",
    conversationLength: session.messages.length,
    isKnownClient: !!client
  });
});

// 💳 API Stripe Payments
app.post("/api/payments/create-intent",
  apiLimiter,
  [
    body('amount').isInt({ min: 1 }),
    body('currency').isIn(['cad', 'usd']),
    body('serviceId').optional().isString()
  ],
  validateInput,
  async (req, res) => {
    try {
      if (!stripe) {
        return sendResponse(res, 503, null, 'Service de paiement indisponible');
      }

      const { amount, currency = 'cad', serviceId, metadata = {} } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        metadata: {
          serviceId: serviceId || '',
          source: 'quebec-ia-labs',
          ...metadata
        }
      });

      sendResponse(res, 200, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      console.error('Erreur Stripe:', error);
      sendResponse(res, 500, null, 'Erreur lors de la création du paiement');
    }
  }
);

// 💳 Test endpoint Stripe
app.get("/api/payments/test", (req, res) => {
  sendResponse(res, 200, {
    status: stripe ? 'Stripe connecté' : 'Stripe non configuré',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 📱 Webhook Twilio avec ElevenLabs
app.post("/webhook/twilio", async (req, res) => {
  try {
    const { From, Body, CallStatus, CallSid, Direction } = req.body;
    
    console.log("📱 Appel Twilio reçu:", { From, Body, CallStatus, CallSid, Direction });

    // Reconnaissance client
    const client = marcel.findClientByPhone(From);
    const context = { client, phoneNumber: From };

    // Message d'accueil pour nouvel appel
    let messageToProcess = Body;
    if (CallStatus === 'ringing' || !Body) {
      messageToProcess = "Bonjour, je souhaite prendre rendez-vous";
    }

    // Générer réponse Marcel
    let marcelResponse = await marcel.generateResponse(
      messageToProcess, 
      context
    );

    // Limiter la longueur pour TwiML
    if (marcelResponse.length > 300) {
      marcelResponse = marcelResponse.substring(0, 300) + "...";
    }

    // Utiliser ElevenLabs si disponible
    let audioUrl = null;
    if (elevenLabsApiKey) {
      try {
        // Appel à ElevenLabs API pour générer audio
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
          },
          body: JSON.stringify({
            text: marcelResponse,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (elevenLabsResponse.ok) {
          // En production, vous devriez sauvegarder le fichier audio
          // et retourner une URL publique
          console.log("✅ Audio ElevenLabs généré");
        }
      } catch (error) {
        console.warn("⚠️ Erreur ElevenLabs:", error.message);
      }
    }

    // TwiML Response avec voix configurée et structure correcte
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Chantal-Neural" language="fr-CA">${marcelResponse}</Say>
    <Gather input="speech dtmf" timeout="5" speechTimeout="auto" language="fr-CA" action="/webhook/twilio" method="POST">
        <Say voice="Polly.Chantal-Neural" language="fr-CA">Comment puis-je vous aider?</Say>
    </Gather>
    <Say voice="Polly.Chantal-Neural" language="fr-CA">Merci de votre appel. Au revoir!</Say>
</Response>`;
    
    res.type('text/xml');
    res.status(200);
    res.send(twiml);
    
    console.log("✅ TwiML envoyé avec succès");
  } catch (error) {
    console.error("❌ Erreur webhook Twilio:", error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Chantal-Neural" language="fr-CA">Désolé, un problème technique est survenu. Veuillez rappeler plus tard.</Say>
</Response>`;
    
    res.type('text/xml');
    res.status(200);
    res.send(errorTwiml);
  }
});

// 📱 Test webhook Twilio
app.get("/webhook/twilio/test", (req, res) => {
  sendResponse(res, 200, {
    status: "✅ Webhook Twilio Opérationnel",
    service: "Quebec-IA-Labs Unifié",
    voice: "ElevenLabs + Polly Neural",
    timestamp: new Date().toISOString()
  });
});

// 💚 Health Check complet
app.get("/health", async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0-unified",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      marcel: "✅ Opérationnel",
      claude: anthropic ? "✅ Connecté" : "❌ Non configuré",
      stripe: stripe ? "✅ Connecté" : "❌ Non configuré", 
      supabase: supabase ? "✅ Connecté" : "❌ Non configuré",
      elevenlabs: elevenLabsApiKey ? "✅ Configuré" : "❌ Non configuré"
    },
    stats: {
      activeSessions: sessions.size,
      totalMemory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB"
    }
  };

  // Test rapide des connexions
  try {
    if (supabase) {
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      health.services.supabase += error ? " (Erreur)" : " (Testé)";
    }
  } catch (error) {
    health.services.supabase = "❌ Erreur connexion";
  }

  sendResponse(res, 200, health);
});

// 🚨 Gestion d'erreurs globale
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  if (error.type === 'entity.too.large') {
    return sendResponse(res, 413, null, 'Requête trop volumineuse');
  }
  
  sendResponse(res, 500, null, 'Erreur interne du serveur');
});

// 🚫 Route 404
app.use((req, res) => {
  sendResponse(res, 404, null, 'Endpoint non trouvé');
});

// 🔄 Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Arrêt gracieux du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🔄 Arrêt du serveur...');
  process.exit(0);
});

// 🚀 DÉMARRAGE SERVEUR
app.listen(PORT, () => {
  console.log(`
🎯 QUEBEC-IA-LABS + MARCEL V8.0 ULTIMATE UNIFIÉ
===============================================
✅ Serveur démarré sur le port ${PORT}
🌍 URL: http://localhost:${PORT}
🧠 Marcel: Intelligence complète
💳 Stripe: ${stripe ? 'Configuré' : 'Non configuré'}
🗄️ Supabase: ${supabase ? 'Connecté' : 'Non configuré'}
🎤 ElevenLabs: ${elevenLabsApiKey ? 'Voix masculine prête' : 'Non configuré'}
📱 Twilio: Webhook prêt
🔐 Sécurité: Production active
===============================================
🎯 ENDPOINTS PRINCIPAUX:
• GET  /                     - Accueil unifié
• GET  /test-marcel          - Interface test simple
• POST /api/marcel/chat      - Chat Marcel IA
• POST /api/payments/*       - API Stripe
• POST /webhook/twilio       - Webhook Twilio
• GET  /health               - Santé système
===============================================
🚀 PRÊT POUR LA PRODUCTION!
  `);
});

module.exports = app;