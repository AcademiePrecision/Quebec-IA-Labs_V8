// 🚀 MARCEL V7.0 ULTIMATE - SERVER UNIFIÉ
// ======================================
// Combine TOUTES les meilleures innovations découvertes
// Base V2.2 + Innovations V3-V6 + Optimisations
// Revenue target: $1.22M ARR
// ======================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Configuration environnement
require("dotenv").config({ 
  path: require("path").resolve(__dirname, "../.env") 
});

console.log(`
╔═════════════════════════════════════════════════════════════════════════╗
║               🧠 MARCEL V7.0 ULTIMATE - DÉMARRAGE                      ║
╠═════════════════════════════════════════════════════════════════════════╣
║  📊 Version: V7.0 Ultimate Edition                                     ║
║  🎯 Target: $1.22M ARR                                                 ║  
║  💰 Revenue Streams: 3 (Marcel AI + Académie + Royalties)              ║
║  🧠 Intelligence: MarcelTrainer + ContextAnalyzer + Claude Opus         ║
║  💳 Payments: Stripe + Supabase intégrés                              ║
║  🎤 Voice: ElevenLabs voix française québécoise                       ║
║  📱 Dashboard: HTML complet + métriques temps réel                     ║
╚═════════════════════════════════════════════════════════════════════════╝
`);

// ═══════════════════════════════════════════════════════════════════════
// INITIALISATION EXPRESS
// ═══════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 3000;

// Sessions en mémoire (ESSENTIEL pour Marcel)
const sessions = new Map();

// Métriques performance
const performanceMetrics = {
  startTime: Date.now(),
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  averageResponseTime: 0,
  concurrentCalls: 0,
  revenueGenerated: 0,
  conversionsToday: 0,
  maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS) || 20
};

// Middleware
app.use(cors({
  origin: process.env.ENABLE_ALWAYS_ON === 'true' ? '*' : ['http://localhost:3000', 'https://AcademiePrecision.replit.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir fichiers statiques
app.use('/public', express.static(path.join(__dirname, '../public')));

// ═══════════════════════════════════════════════════════════════════════
// MODULES MARCEL - INTÉGRATION COMPLÈTE
// ═══════════════════════════════════════════════════════════════════════

let MarcelTrainer = null;
let ContextAnalyzer = null;
let RelationshipData = null;
let ClaudeAPI = null;
let ElevenLabsAPI = null;

// Import MarcelTrainer (système d'apprentissage)
try {
  MarcelTrainer = require('../Marcel-Trainer-Dev/marcel-trainer');
  console.log('✅ MarcelTrainer V2.2 chargé - Système d\'apprentissage actif');
} catch (error) {
  console.warn('⚠️ MarcelTrainer non trouvé - Mode basique');
}

// Import ContextAnalyzer (extraction d'infos)
try {
  ContextAnalyzer = require('../Marcel-Trainer-Dev/context-analyzer');
  console.log('✅ ContextAnalyzer chargé - Extraction contexte activée');
} catch (error) {
  console.warn('⚠️ ContextAnalyzer non trouvé - Pas d\'analyse contexte');
}

// Import RelationshipData (clients Jean, Marie...)
try {
  RelationshipData = require('../Marcel-Trainer-Dev/relationship-data');
  if (RelationshipData && RelationshipData.clients) {
    console.log(`✅ RelationshipData chargé - ${RelationshipData.clients.length} clients en base`);
    console.log(`   👥 Clients: Jean Tremblay, Marie Dubois, Pierre Lavoie...`);
  }
} catch (error) {
  console.warn('⚠️ RelationshipData non trouvé - Pas de reconnaissance clients');
}

// ═══════════════════════════════════════════════════════════════════════
// AI API - CONFIGURATION (CLAUDE OU OPENAI)
// ═══════════════════════════════════════════════════════════════════════

// Essayer Claude d'abord, puis fallback sur OpenAI
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-api03-')) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    ClaudeAPI = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    console.log('✅ Claude Opus API configurée - Intelligence conversationnelle active');
  } catch (error) {
    console.warn('⚠️ Claude API non disponible:', error.message);
    ClaudeAPI = null;
  }
}

// Fallback sur OpenAI si Claude non disponible
if (!ClaudeAPI && process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    ClaudeAPI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    ClaudeAPI.isOpenAI = true; // Flag pour différencier
    console.log('✅ OpenAI API configurée - Intelligence conversationnelle active (fallback)');
  } catch (error) {
    console.warn('⚠️ OpenAI API non disponible:', error.message);
  }
}

if (!ClaudeAPI) {
  console.warn('⚠️ Aucune API IA disponible - Mode fallback basique');
}

// ═══════════════════════════════════════════════════════════════════════
// ELEVENLABS - VOIX MARCEL QUÉBÉCOISE  
// ═══════════════════════════════════════════════════════════════════════

if (process.env.ELEVENLABS_API_KEY) {
  const ElevenLabsConfig = {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID_FRENCH_CA || 'IKne3meq5aSn9XLyUdCD',
    modelId: 'eleven_multilingual_v2',
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.6
  };
  
  ElevenLabsAPI = {
    generateSpeech: async (text) => {
      try {
        const axios = require('axios');
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${ElevenLabsConfig.voiceId}`,
          {
            text: text,
            model_id: ElevenLabsConfig.modelId,
            voice_settings: {
              stability: ElevenLabsConfig.stability,
              similarity_boost: ElevenLabsConfig.similarityBoost,
              style: ElevenLabsConfig.style,
              use_speaker_boost: true
            }
          },
          {
            headers: {
              'xi-api-key': ElevenLabsConfig.apiKey,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('ElevenLabs Error:', error.message);
        return null;
      }
    }
  };
  
  console.log('✅ ElevenLabs configuré - Voix Marcel française québécoise');
} else {
  console.warn('⚠️ ELEVENLABS_API_KEY manquante - Pas de synthèse vocale');
}

// ═══════════════════════════════════════════════════════════════════════
// STRIPE + SUPABASE - SYSTÈME DE MONÉTISATION
// ═══════════════════════════════════════════════════════════════════════

let StripeAPI = null;
let SupabaseClient = null;

// Configuration Stripe
if (process.env.STRIPE_SECRET_KEY) {
  try {
    StripeAPI = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe configuré - Paiements prêts (sandbox/production)');
  } catch (error) {
    console.warn('⚠️ Stripe non disponible:', error.message);
  }
}

// Configuration Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    SupabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Supabase configuré - Base de données active');
  } catch (error) {
    console.warn('⚠️ Supabase non disponible:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TWILIO - WEBHOOKS VOIX
// ═══════════════════════════════════════════════════════════════════════

let TwilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    TwilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio configuré - Appels téléphoniques prêts');
  } catch (error) {
    console.warn('⚠️ Twilio non disponible:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FONCTIONS PRINCIPALES MARCEL
// ═══════════════════════════════════════════════════════════════════════

// Reconnaissance client par téléphone
function recognizeClientByPhone(phone) {
  if (!RelationshipData || !RelationshipData.getClientByPhone) {
    return null;
  }
  
  try {
    return RelationshipData.getClientByPhone(phone);
  } catch (error) {
    console.warn('Erreur reconnaissance client:', error.message);
    return null;
  }
}

// Traitement conversation Marcel complet
async function processMarcelConversation(userMessage, sessionId) {
  const startTime = Date.now();
  
  try {
    // 1. Récupérer ou créer session
    let session = sessions.get(sessionId) || {
      id: sessionId,
      context: {},
      history: [],
      client: null,
      createdAt: new Date()
    };
    
    // 2. Analyser le contexte avec ContextAnalyzer
    let contextInfo = {};
    if (ContextAnalyzer && ContextAnalyzer.analyzeContext) {
      try {
        contextInfo = await ContextAnalyzer.analyzeContext(userMessage, session.context);
        console.log('📊 Contexte analysé:', Object.keys(contextInfo));
      } catch (error) {
        console.warn('Erreur ContextAnalyzer:', error.message);
      }
    }
    
    // 3. Traitement par MarcelTrainer si disponible
    let marcelResponse = null;
    if (MarcelTrainer && MarcelTrainer.processConversation) {
      try {
        marcelResponse = await MarcelTrainer.processConversation(userMessage, session.context);
        console.log('🧠 MarcelTrainer traité');
      } catch (error) {
        console.warn('Erreur MarcelTrainer:', error.message);
      }
    }
    
    // 4. Enrichissement avec Claude AI (NOUVELLE INTÉGRATION)
    let claudeResponse = null;
    if (ClaudeAPI) {
      try {
        const prompt = `Tu es Marcel, réceptionniste IA d'un salon de coiffure au Québec.
        
Contexte de session: ${JSON.stringify(session.context, null, 2)}
Informations extraites: ${JSON.stringify(contextInfo, null, 2)}
Réponse MarcelTrainer: ${marcelResponse || 'Non disponible'}
Message client: "${userMessage}"

Réponds de manière naturelle et professionnelle en français québécois.
Si tu as déjà les informations du client, ne les redemande pas.
Concentre-toi sur l'aide et la réservation.`;

        const message = await ClaudeAPI.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: prompt
          }]
        });
        
        claudeResponse = message.content[0].text;
        console.log('✨ Claude Opus réponse générée');
        
      } catch (error) {
        console.error('Erreur Claude API:', error.message);
      }
    }
    
    // 5. Construire la réponse finale
    let finalResponse = claudeResponse || marcelResponse || "Bonjour! Comment puis-je vous aider aujourd'hui?";
    
    // 6. Mettre à jour la session
    session.context = { ...session.context, ...contextInfo };
    session.history.push({
      userMessage,
      response: finalResponse,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    });
    
    sessions.set(sessionId, session);
    
    // 7. Nettoyage automatique des sessions anciennes
    cleanOldSessions();
    
    // 8. Mise à jour métriques
    performanceMetrics.successfulCalls++;
    performanceMetrics.averageResponseTime = 
      (performanceMetrics.averageResponseTime * (performanceMetrics.successfulCalls - 1) + 
       (Date.now() - startTime)) / performanceMetrics.successfulCalls;
    
    return {
      success: true,
      response: finalResponse,
      context: session.context,
      processingTime: Date.now() - startTime,
      sessionId: sessionId
    };
    
  } catch (error) {
    performanceMetrics.failedCalls++;
    console.error('Erreur processMarcelConversation:', error);
    
    return {
      success: false,
      response: "Désolé, j'ai eu un petit problème. Pouvez-vous répéter?",
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

// Nettoyage sessions anciennes (éviter fuites mémoire)
function cleanOldSessions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  let cleaned = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.createdAt && session.createdAt.getTime() < oneHourAgo) {
      sessions.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} sessions anciennes nettoyées`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ENDPOINTS API
// ═══════════════════════════════════════════════════════════════════════

// Middleware de monitoring
app.use((req, res, next) => {
  const startTime = Date.now();
  performanceMetrics.totalCalls++;
  performanceMetrics.concurrentCalls++;
  
  if (process.env.ENABLE_DETAILED_LOGS === 'true') {
    console.log(`📊 [${new Date().toISOString()}] ${req.method} ${req.path} - Appels: ${performanceMetrics.concurrentCalls}`);
  }
  
  res.on('finish', () => {
    performanceMetrics.concurrentCalls--;
    const responseTime = Date.now() - startTime;
    
    if (res.statusCode < 400) {
      performanceMetrics.successfulCalls++;
    } else {
      performanceMetrics.failedCalls++;
    }
  });
  
  next();
});

// 🏠 DASHBOARD PRINCIPAL
app.get('/', (req, res) => {
  try {
    // Essayer de servir le dashboard HTML s'il existe
    const dashboardPath = path.resolve(__dirname, '../public/test-marcel.html');
    console.log('🔍 Searching for dashboard at:', dashboardPath);
    console.log('🔍 File exists:', fs.existsSync(dashboardPath));
    
    if (fs.existsSync(dashboardPath)) {
      try {
        const htmlContent = fs.readFileSync(dashboardPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
        console.log('✅ Dashboard HTML servi avec succès');
      } catch (readError) {
        console.error('❌ Error reading file:', readError);
        res.status(500).json({ error: 'Erreur lecture fichier', details: readError.message });
      }
    } else {
    // Dashboard de fallback moderne
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Marcel V7.0 Ultimate Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; border-radius: 20px; padding: 40px; margin-bottom: 30px; 
                 box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; }
        .header h1 { font-size: 3em; color: #764ba2; margin-bottom: 10px; }
        .header p { color: #666; font-size: 1.2em; }
        .badge { background: #10b981; color: white; padding: 5px 15px; 
                border-radius: 20px; font-size: 0.9em; display: inline-block; margin-top: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                  gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 25px; border-radius: 15px; 
                 box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; color: #764ba2; }
        .metric-label { color: #888; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9em; }
        .features { background: white; border-radius: 20px; padding: 30px; 
                   box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .feature { padding: 15px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; }
        .feature:last-child { border-bottom: none; }
        .feature-icon { font-size: 1.5em; margin-right: 15px; }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .test-section { margin-top: 30px; background: white; border-radius: 20px; padding: 30px; 
                       box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .test-input { width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; 
                     font-size: 16px; margin-bottom: 15px; }
        .test-button { background: #764ba2; color: white; padding: 15px 30px; border: none; 
                      border-radius: 10px; font-size: 16px; cursor: pointer; }
        .test-button:hover { background: #5a3a7a; }
        .test-response { margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 10px; 
                        border-left: 4px solid #764ba2; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Marcel V7.0 Ultimate</h1>
            <p>Intelligence Artificielle pour Salons de Coiffure</p>
            <span class="badge">✅ En ligne et opérationnel</span>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${performanceMetrics.totalCalls}</div>
                <div class="metric-label">Appels Total</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(performanceMetrics.averageResponseTime)}ms</div>
                <div class="metric-label">Temps Réponse</div>
            </div>
            <div class="metric">
                <div class="metric-value">${performanceMetrics.concurrentCalls}</div>
                <div class="metric-label">Appels Actifs</div>
            </div>
            <div class="metric">
                <div class="metric-value">${sessions.size}</div>
                <div class="metric-label">Sessions Actives</div>
            </div>
        </div>
        
        <div class="features">
            <h2 style="margin-bottom: 20px; color: #764ba2;">🚀 Fonctionnalités Actives</h2>
            <div class="feature">
                <span class="feature-icon ${MarcelTrainer ? 'status-good' : 'status-warning'}">
                    ${MarcelTrainer ? '✅' : '⚠️'}
                </span>
                <span>MarcelTrainer - Système d'apprentissage</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${ContextAnalyzer ? 'status-good' : 'status-warning'}">
                    ${ContextAnalyzer ? '✅' : '⚠️'}
                </span>
                <span>ContextAnalyzer - Extraction contexte</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${RelationshipData ? 'status-good' : 'status-warning'}">
                    ${RelationshipData ? '✅' : '⚠️'}
                </span>
                <span>RelationshipData - Base clients (${RelationshipData ? RelationshipData.clients?.length || 0 : 0} clients)</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${ClaudeAPI ? 'status-good' : 'status-warning'}">
                    ${ClaudeAPI ? '✅' : '⚠️'}
                </span>
                <span>Claude Opus API - Intelligence conversationnelle</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${ElevenLabsAPI ? 'status-good' : 'status-warning'}">
                    ${ElevenLabsAPI ? '✅' : '⚠️'}
                </span>
                <span>ElevenLabs - Synthèse vocale québécoise</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${StripeAPI ? 'status-good' : 'status-warning'}">
                    ${StripeAPI ? '✅' : '⚠️'}
                </span>
                <span>Stripe - Système de paiement</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${SupabaseClient ? 'status-good' : 'status-warning'}">
                    ${SupabaseClient ? '✅' : '⚠️'}
                </span>
                <span>Supabase - Base de données</span>
            </div>
            <div class="feature">
                <span class="feature-icon ${TwilioClient ? 'status-good' : 'status-warning'}">
                    ${TwilioClient ? '✅' : '⚠️'}
                </span>
                <span>Twilio - Appels téléphoniques</span>
            </div>
        </div>
        
        <div class="test-section">
            <h2 style="margin-bottom: 20px; color: #764ba2;">🧪 Test Marcel en Direct</h2>
            <input type="text" id="testMessage" class="test-input" 
                   placeholder="Tapez votre message à Marcel..." 
                   value="Bonjour Marcel, j'aimerais prendre rendez-vous">
            <button class="test-button" onclick="testMarcel()">Envoyer à Marcel</button>
            <div id="testResponse" class="test-response" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        async function testMarcel() {
            const message = document.getElementById('testMessage').value;
            const responseDiv = document.getElementById('testResponse');
            
            responseDiv.style.display = 'block';
            responseDiv.textContent = 'Marcel réfléchit...';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: message,
                        session_id: 'dashboard-test-' + Date.now()
                    })
                });
                
                const data = await response.json();
                responseDiv.textContent = data.response || 'Erreur dans la réponse';
            } catch (error) {
                responseDiv.textContent = 'Erreur: ' + error.message;
            }
        }
        
        // Auto-refresh metrics every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
    `);
    }
  } catch (error) {
    console.error('❌ Error in homepage route:', error);
    res.status(500).json({ error: 'Erreur serveur interne', message: error.message });
  }
});

// 🔍 HEALTH CHECK COMPLET
app.get('/health', (req, res) => {
  const uptime = Date.now() - performanceMetrics.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  const healthStatus = {
    status: 'healthy',
    version: '7.0-ultimate',
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    timestamp: new Date().toISOString(),
    
    // Services status
    services: {
      marcel_trainer: !!MarcelTrainer,
      context_analyzer: !!ContextAnalyzer,
      relationship_data: !!RelationshipData,
      claude_api: !!ClaudeAPI,
      elevenlabs: !!ElevenLabsAPI,
      stripe: !!StripeAPI,
      supabase: !!SupabaseClient,
      twilio: !!TwilioClient
    },
    
    // Performance metrics
    metrics: {
      total_calls: performanceMetrics.totalCalls,
      successful_calls: performanceMetrics.successfulCalls,
      failed_calls: performanceMetrics.failedCalls,
      success_rate: performanceMetrics.totalCalls > 0 
        ? Math.round((performanceMetrics.successfulCalls / performanceMetrics.totalCalls) * 100) 
        : 100,
      average_response_time: Math.round(performanceMetrics.averageResponseTime),
      concurrent_calls: performanceMetrics.concurrentCalls,
      active_sessions: sessions.size
    },
    
    // Business metrics
    business: {
      revenue_generated: performanceMetrics.revenueGenerated,
      conversions_today: performanceMetrics.conversionsToday,
      clients_in_database: RelationshipData && RelationshipData.clients 
        ? RelationshipData.clients.length 
        : 0
    }
  };
  
  res.json(healthStatus);
});

// 💬 CHAT API - Interface web
app.post('/api/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }
    
    const sessionId = session_id || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await processMarcelConversation(message, sessionId);
    
    res.json(result);
    
  } catch (error) {
    console.error('Erreur /api/chat:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
});

// 📞 WEBHOOK TWILIO - Appels téléphoniques
app.post('/api/twilio/voice', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    
    // Reconnaître le client par son numéro
    const client = recognizeClientByPhone(From);
    
    let greeting = "Bonjour! Vous êtes bien chez le salon. Comment puis-je vous aider?";
    
    if (client) {
      greeting = `Bonjour ${client.name}! Heureux de vous entendre. Comment allez-vous?`;
      console.log(`📞 Client reconnu: ${client.name} (${From})`);
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">${greeting}</Say>
    <Gather input="speech" action="/api/twilio/process" method="POST" language="fr-CA" speechTimeout="3" timeout="10">
        <Say voice="Polly.Celine" language="fr-CA">Parlez maintenant...</Say>
    </Gather>
    <Say voice="Polly.Celine" language="fr-CA">Je n'ai pas bien entendu. Au revoir!</Say>
</Response>`;

    res.type('text/xml').send(twiml);
    
  } catch (error) {
    console.error('Erreur webhook Twilio:', error);
    res.status(500).send('Erreur serveur');
  }
});

// 🎤 TRAITEMENT RÉPONSE VOCALE
app.post('/api/twilio/process', async (req, res) => {
  try {
    const { SpeechResult, From, CallSid } = req.body;
    
    if (!SpeechResult) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">Je n'ai pas compris. Pouvez-vous répéter?</Say>
    <Hangup/>
</Response>`;
      return res.type('text/xml').send(twiml);
    }
    
    // Traitement conversation Marcel
    const sessionId = `twilio-${CallSid}`;
    const result = await processMarcelConversation(SpeechResult, sessionId);
    
    let response = result.response || "Je suis désolé, je n'ai pas pu traiter votre demande.";
    
    // Générer audio avec ElevenLabs si disponible
    let audioUrl = null;
    if (ElevenLabsAPI) {
      try {
        const audioBuffer = await ElevenLabsAPI.generateSpeech(response);
        if (audioBuffer) {
          // Ici, on devrait sauvegarder l'audio et retourner l'URL
          // Pour l'instant, on utilise Twilio TTS
        }
      } catch (error) {
        console.warn('Erreur ElevenLabs:', error.message);
      }
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">${response}</Say>
    <Pause length="1"/>
    <Gather input="speech" action="/api/twilio/process" method="POST" language="fr-CA" speechTimeout="3" timeout="10">
        <Say voice="Polly.Celine" language="fr-CA">Autre chose?</Say>
    </Gather>
    <Say voice="Polly.Celine" language="fr-CA">Merci et à bientôt!</Say>
    <Hangup/>
</Response>`;
    
    res.type('text/xml').send(twiml);
    
  } catch (error) {
    console.error('Erreur traitement vocal:', error);
    res.status(500).send('Erreur serveur');
  }
});

// 💳 WEBHOOK STRIPE - Paiements
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!StripeAPI || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Stripe non configuré');
  }
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = StripeAPI.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        performanceMetrics.revenueGenerated += paymentIntent.amount / 100;
        performanceMetrics.conversionsToday++;
        
        // Sauvegarder dans Supabase si configuré
        if (SupabaseClient) {
          await SupabaseClient
            .from('payments')
            .insert({
              stripe_payment_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'succeeded',
              created_at: new Date()
            });
        }
        
        console.log(`💰 Paiement reçu: $${paymentIntent.amount / 100}`);
        break;
        
      default:
        console.log(`Événement Stripe non traité: ${event.type}`);
    }
    
    res.json({received: true});
    
  } catch (error) {
    console.error('Erreur traitement webhook Stripe:', error);
    res.status(500).json({error: error.message});
  }
});

// 📊 MÉTRIQUES DÉTAILLÉES
app.get('/api/metrics', (req, res) => {
  res.json({
    server: {
      version: '7.0-ultimate',
      uptime: Date.now() - performanceMetrics.startTime,
      start_time: new Date(performanceMetrics.startTime).toISOString()
    },
    performance: performanceMetrics,
    sessions: {
      active: sessions.size,
      list: Array.from(sessions.keys()).slice(0, 10) // Premiers 10 pour privacy
    },
    services: {
      marcel_trainer_available: !!MarcelTrainer,
      context_analyzer_available: !!ContextAnalyzer,
      relationship_data_available: !!RelationshipData,
      claude_api_available: !!ClaudeAPI,
      elevenlabs_available: !!ElevenLabsAPI,
      stripe_available: !!StripeAPI,
      supabase_available: !!SupabaseClient,
      twilio_available: !!TwilioClient
    }
  });
});

// 🧪 TEST MARCEL - Endpoint de test
app.post('/api/test/marcel', async (req, res) => {
  try {
    const testScenarios = [
      "Bonjour, j'aimerais prendre rendez-vous",
      "Je suis Jean Tremblay, avez-vous de la place demain?",
      "Combien coûte une coupe de cheveux?",
      "Êtes-vous ouvert le dimanche?"
    ];
    
    const { scenario, custom_message } = req.body;
    const message = custom_message || testScenarios[Math.floor(Math.random() * testScenarios.length)];
    
    const sessionId = `test-${Date.now()}`;
    const result = await processMarcelConversation(message, sessionId);
    
    res.json({
      test: true,
      scenario_used: message,
      marcel_response: result,
      all_available_scenarios: testScenarios
    });
    
  } catch (error) {
    console.error('Erreur test Marcel:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GESTION ERREURS & FALLBACKS
// ═══════════════════════════════════════════════════════════════════════

// Fallback pour routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path_requested: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /health', 
      'POST /api/chat',
      'POST /api/twilio/voice',
      'POST /api/twilio/process',
      'POST /api/stripe/webhook',
      'GET /api/metrics',
      'POST /api/test/marcel'
    ]
  });
});

// Gestion erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
  });
});

// ═══════════════════════════════════════════════════════════════════════
// NETTOYAGE & OPTIMISATION
// ═══════════════════════════════════════════════════════════════════════

// Nettoyage automatique toutes les heures
setInterval(() => {
  cleanOldSessions();
  
  // Nettoyage mémoire
  if (global.gc) {
    global.gc();
  }
}, 60 * 60 * 1000);

// Gestion arrêt propre
process.on('SIGTERM', () => {
  console.log('🔄 Arrêt propre du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Arrêt manuel du serveur...');
  process.exit(0);
});

// ═══════════════════════════════════════════════════════════════════════
// DÉMARRAGE SERVEUR
// ═══════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════════════════════╗
║                    🚀 MARCEL V7.0 ULTIMATE DÉMARRÉ                     ║
╠═════════════════════════════════════════════════════════════════════════╣
║  📊 Port: ${PORT}                                                       ║
║  🌐 URL: http://localhost:${PORT}                                       ║
║  💻 Dashboard: http://localhost:${PORT}/                                ║
║  🔍 Health: http://localhost:${PORT}/health                             ║
║  📊 Metrics: http://localhost:${PORT}/api/metrics                       ║
║  🧪 Test: http://localhost:${PORT}/api/test/marcel                      ║
╠═════════════════════════════════════════════════════════════════════════╣
║  🎯 REVENUE TARGET: $1.22M ARR                                          ║
║  💰 Marcel AI Salons: $400K target                                      ║
║  🎓 Académie Précision: $600K target                                    ║
║  👨‍💼 Instructor Royalties: $220K target                                  ║
╠═════════════════════════════════════════════════════════════════════════╣
║  Services Status:                                                       ║
║  ${MarcelTrainer ? '✅' : '❌'} MarcelTrainer - Système d'apprentissage                    ║
║  ${ContextAnalyzer ? '✅' : '❌'} ContextAnalyzer - Extraction contexte                   ║  
║  ${RelationshipData ? '✅' : '❌'} RelationshipData - ${RelationshipData && RelationshipData.clients ? RelationshipData.clients.length : 0} clients en base           ║
║  ${ClaudeAPI ? '✅' : '❌'} Claude Opus API - Intelligence conversationnelle              ║
║  ${ElevenLabsAPI ? '✅' : '❌'} ElevenLabs - Synthèse vocale québécoise                   ║
║  ${StripeAPI ? '✅' : '❌'} Stripe - Système de paiement                                  ║
║  ${SupabaseClient ? '✅' : '❌'} Supabase - Base de données                                ║
║  ${TwilioClient ? '✅' : '❌'} Twilio - Appels téléphoniques                              ║
╚═════════════════════════════════════════════════════════════════════════╝

🎉 Marcel V7.0 Ultimate est prêt à générer vos $1.22M de revenus annuels!
   Visitez http://localhost:${PORT} pour commencer.
  `);
});

module.exports = app;