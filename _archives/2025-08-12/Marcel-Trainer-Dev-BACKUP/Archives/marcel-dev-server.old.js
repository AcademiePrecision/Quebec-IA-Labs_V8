// 🧠 MARCEL TRAINER - SERVEUR DEV
// Serveur de développement 100% indépendant pour formation Marcel
// Version: 1.0.0-dev | Mode: DEVELOPMENT ONLY

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import modules Marcel
const MarcelTrainer = require('./marcel-trainer');
const ContextAnalyzer = require('./context-analyzer');

// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// État global Marcel DEV
let marcelTrainer = null;
let contextAnalyzer = null;
let devMetrics = {
  startTime: Date.now(),
  totalTests: 0,
  successfulTests: 0,
  failedTests: 0,
  avgResponseTime: 0,
  sessionsActive: 0
};

// 📊 Logs de debug développement
const devLog = (category, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${category.toUpperCase()}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
};

// Middleware DEV
app.use(cors({ origin: '*' })); // DEV only - pas de restrictions
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir fichiers statiques
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware de logging détaillé
app.use((req, res, next) => {
  const startTime = Date.now();
  devLog('REQUEST', `${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body
  });
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    devLog('RESPONSE', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

console.log(`
🧠 MARCEL TRAINER - SERVEUR DEV
=====================================
Mode: ${NODE_ENV}
Port: ${PORT}
Debug: ACTIVÉ
Twilio: DÉSACTIVÉ (DEV only)
OpenAI: MODE TEST
=====================================
`);

// ============================================== 
// INITIALISATION MARCEL TRAINER
// ==============================================

function initializeMarcelTrainer() {
  if (!marcelTrainer) {
    marcelTrainer = new MarcelTrainer();
    devLog('INIT', 'Marcel Trainer initialisé');
  }
  return marcelTrainer;
}

function initializeContextAnalyzer() {
  if (!contextAnalyzer) {
    contextAnalyzer = new ContextAnalyzer();
    devLog('INIT', 'Context Analyzer initialisé');
  }
  return contextAnalyzer;
}

// ==============================================
// ROUTES MARCEL TRAINER DEV
// ==============================================

// 🏠 Page d'accueil DEV
app.get('/', (req, res) => {
  const uptime = Date.now() - devMetrics.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  res.json({
    service: "Marcel Trainer - Serveur DEV",
    status: "DEVELOPMENT",
    version: "1.0.0-dev",
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    features: {
      marcel_trainer: true,
      context_analyzer: true,
      debug_logs: true,
      twilio_webhooks: false,
      production_ready: false
    },
    metrics: devMetrics,
    endpoints: {
      dashboard: "/test-marcel",
      training: "/train-marcel",
      test_response: "/test-marcel-response",
      context_analysis: "/analyze-context",
      scenarios: "/test-scenarios",
      reports: "/training-report"
    },
    environment: {
      node_env: NODE_ENV,
      openai_configured: !!process.env.OPENAI_API_KEY,
      debug_mode: true
    },
    timestamp: new Date().toISOString()
  });
});

// 🧠 Dashboard Marcel
app.get('/test-marcel', (req, res) => {
  devLog('DASHBOARD', 'Accès dashboard Marcel');
  res.sendFile(path.join(__dirname, 'public', 'test-marcel.html'));
});

// 🧪 Test réponse Marcel en temps réel
app.post('/test-marcel-response', async (req, res) => {
  const startTime = Date.now();
  const { userInput, sessionId, context } = req.body;
  
  devLog('TEST', 'Nouvelle demande de test', { userInput, sessionId });
  
  if (!userInput) {
    return res.status(400).json({
      success: false,
      error: 'userInput requis'
    });
  }
  
  try {
    devMetrics.totalTests++;
    
    // Analyser le contexte
    const analyzer = initializeContextAnalyzer();
    const contextAnalysis = analyzer.analyzeUserInput(userInput, context || {});
    
    // Simuler la réponse de Marcel (mode DEV)
    const marcelResponse = await simulateMarcelResponse(userInput, contextAnalysis);
    
    const responseTime = Date.now() - startTime;
    devMetrics.avgResponseTime = (devMetrics.avgResponseTime + responseTime) / 2;
    devMetrics.successfulTests++;
    
    devLog('SUCCESS', `Test réussi en ${responseTime}ms`, {
      input: userInput,
      context: contextAnalysis,
      response: marcelResponse.text.substring(0, 100) + '...'
    });
    
    res.json({
      success: true,
      response: marcelResponse.text,
      context: contextAnalysis,
      extractedInfo: contextAnalysis.extractedFields,
      intent: contextAnalysis.detectedIntent,
      confidence: contextAnalysis.confidence,
      responseTime: responseTime,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    devMetrics.failedTests++;
    devLog('ERROR', 'Erreur test Marcel', { error: error.message, input: userInput });
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🚀 Formation complète
app.get('/train-marcel', async (req, res) => {
  devLog('TRAINING', 'Démarrage formation complète');
  
  try {
    const trainer = initializeMarcelTrainer();
    const report = await trainer.runFullTraining();
    
    devLog('TRAINING', 'Formation terminée', {
      totalTests: report.summary.totalTests,
      successRate: report.summary.successRate
    });
    
    res.json({
      success: true,
      message: "Formation Marcel terminée!",
      report: report,
      devMetrics: devMetrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    devLog('ERROR', 'Erreur formation', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📊 Rapport de formation
app.get('/training-report', (req, res) => {
  try {
    const trainer = initializeMarcelTrainer();
    const stats = trainer.getStats();
    
    res.json({
      success: true,
      training_stats: stats,
      dev_metrics: devMetrics,
      marcel_version: "2.0.0-dev",
      environment: "DEVELOPMENT",
      recommendations: generateDevRecommendations(stats),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔍 Analyse de contexte avancée
app.post('/analyze-context', (req, res) => {
  const { text, previousContext } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'text requis'
    });
  }
  
  try {
    const analyzer = initializeContextAnalyzer();
    const analysis = analyzer.analyzeUserInput(text, previousContext || {});
    
    devLog('CONTEXT', 'Analyse contextuelle', { text, analysis });
    
    res.json({
      success: true,
      analysis: analysis,
      recommendations: analyzer.getRecommendations(analysis),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 Test des scénarios individuels
app.get('/test-scenarios', async (req, res) => {
  try {
    const trainer = initializeMarcelTrainer();
    const scenarios = trainer.getTestScenarios();
    
    res.json({
      success: true,
      scenarios: scenarios,
      count: scenarios.length,
      categories: [...new Set(scenarios.map(s => s.category))],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📈 Métriques temps réel
app.get('/dev-metrics', (req, res) => {
  const uptime = Date.now() - devMetrics.startTime;
  
  res.json({
    ...devMetrics,
    uptime: uptime,
    uptimeFormatted: formatUptime(uptime),
    successRate: devMetrics.totalTests > 0 ? 
      Math.round((devMetrics.successfulTests / devMetrics.totalTests) * 100) : 0,
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// FONCTIONS UTILITAIRES DEV
// ==============================================

// Simuler réponse Marcel (DEV seulement)
async function simulateMarcelResponse(input, context) {
  devLog('MARCEL', 'Simulation réponse', { input, context });
  
  // Logique simplifiée pour le DEV
  const intent = context.detectedIntent || 'general';
  const fields = context.extractedFields || {};
  
  let response = "";
  
  switch (intent) {
    case 'booking_request':
      if (!fields.service) {
        response = "Parfait! Quel type de service voulez-vous? Coupe homme, coupe femme, barbe ou coloration?";
      } else if (!fields.date) {
        response = `Excellent pour votre ${fields.service}! Quand souhaitez-vous votre rendez-vous?`;
      } else if (!fields.time) {
        response = `Parfait pour ${fields.date}! Quelle heure vous convient? 14h avec Marco ou 16h avec Jessica?`;
      } else if (!fields.name) {
        response = `Excellent! Alors c'est ${fields.service} ${fields.date} à ${fields.time}. Votre nom?`;
      } else {
        response = `Parfait ${fields.name}! Je confirme: ${fields.service} ${fields.date} ${fields.time}. À bientôt!`;
      }
      break;
      
    case 'pricing_inquiry':
      response = "Nos prix: coupe homme 35$, coupe femme 40$, coupe+barbe 55$, coloration 80$+. Voulez-vous un RDV?";
      break;
      
    case 'hours_inquiry':
      response = "Ouverts mardi-vendredi 9h-18h, samedi 8h-16h. Fermé dimanche-lundi. Un RDV?";
      break;
      
    default:
      response = "Je peux vous aider avec les RDV, prix et horaires. Que souhaitez-vous?";
  }
  
  return {
    text: response,
    confidence: context.confidence || 0.8,
    processingTime: Math.floor(Math.random() * 500) + 100 // Simulation
  };
}

// Recommandations DEV
function generateDevRecommendations(stats) {
  const recommendations = [];
  
  if (stats.failedTests > stats.passedTests * 0.2) {
    recommendations.push("❌ Taux d'échec élevé - Réviser la logique de traitement");
  }
  
  if (stats.successRate < 80) {
    recommendations.push("📈 Taux de succès < 80% - Améliorer les patterns de reconnaissance");
  }
  
  if (stats.errors && stats.errors.length > 0) {
    recommendations.push(`🔧 ${stats.errors.length} erreurs détectées - Voir détails`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push("🎉 Marcel fonctionne parfaitement!");
  }
  
  return recommendations;
}

// Formatter durée
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// ==============================================
// DÉMARRAGE SERVEUR DEV
// ==============================================

app.listen(PORT, '0.0.0.0', () => {
  devLog('SERVER', `Marcel Trainer DEV démarré sur port ${PORT}`);
  
  console.log(`
🚀 MARCEL TRAINER DEV - PRÊT!
=====================================
✅ Mode: DEVELOPMENT
✅ Port: ${PORT}
✅ Debug: ACTIVÉ
✅ CORS: OUVERT (DEV only)
✅ Logs: DÉTAILLÉS

🔗 ENDPOINTS DISPONIBLES:
• Dashboard: http://localhost:${PORT}/test-marcel
• API Test: http://localhost:${PORT}/test-marcel-response
• Formation: http://localhost:${PORT}/train-marcel
• Métriques: http://localhost:${PORT}/dev-metrics
• Contexte: http://localhost:${PORT}/analyze-context

🌐 URL REPLIT: [Sera disponible après déploiement]
=====================================
  `);
  
  // Initialisation des modules
  setTimeout(() => {
    initializeMarcelTrainer();
    initializeContextAnalyzer();
    devLog('READY', 'Tous les modules Marcel initialisés');
  }, 1000);
});

// Export pour tests
module.exports = { app, devMetrics };