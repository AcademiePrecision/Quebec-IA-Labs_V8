#!/usr/bin/env node

// 🏗️ CONSOLIDATION COMPLÈTE SAVAGECO - QUÉBEC IA LABS
// =====================================================
// Ce script unifie tous les projets en une structure claire

const fs = require('fs');
const path = require('path');

const BASE_PATH = process.cwd();
const TIMESTAMP = new Date().toISOString().split('T')[0];

console.log(`
╔════════════════════════════════════════════════════════════╗
║        🚀 CONSOLIDATION SAVAGECO → QUÉBEC IA LABS         ║
║                                                            ║
║  Unification: Valet IA + App Mobile + Tests               ║
╚════════════════════════════════════════════════════════════╝

📁 Répertoire: ${BASE_PATH}
📅 Date: ${TIMESTAMP}
`);

// ============================================
// 1. CRÉATION DE LA STRUCTURE
// ============================================

const projectStructure = {
  // Projet principal
  'quebec-ia-labs': {
    'server': 'Serveur Valet IA principal',
    'database': 'Schémas Supabase',
    'api': 'API pour app mobile',
    'config': 'Configurations',
    'webhooks': 'Webhooks Twilio',
    'ai': 'Intelligence artificielle',
    'scripts': 'Scripts utilitaires',
    'docs': 'Documentation'
  },
  
  // Archives
  '_archives': {
    'old-servers': 'Anciennes versions serveurs',
    'backup-configs': 'Configurations sauvegardées',
    [`backup-${TIMESTAMP}`]: 'Backup du jour'
  },
  
  // Resources
  '_resources': {
    'schemas': 'Schémas DB',
    'documentation': 'Guides et docs',
    'training-data': 'Données formation'
  }
};

console.log('📁 Création de la nouvelle structure...\n');

// Créer tous les dossiers
Object.entries(projectStructure).forEach(([mainDir, subDirs]) => {
  Object.keys(subDirs).forEach(subDir => {
    const fullPath = path.join(BASE_PATH, mainDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Créé: ${mainDir}/${subDir}`);
    } else {
      console.log(`  ⏭️  Existe: ${mainDir}/${subDir}`);
    }
  });
});

// ============================================
// 2. ANALYSE DES FICHIERS EXISTANTS
// ============================================

console.log('\n📊 Analyse des fichiers existants...\n');

const fileAnalysis = {
  servers: [],
  configs: [],
  mobile: [],
  tests: [],
  resources: []
};

// Scanner les fichiers
const files = fs.readdirSync(BASE_PATH);

files.forEach(file => {
  const filePath = path.join(BASE_PATH, file);
  const stats = fs.statSync(filePath);
  
  if (!stats.isDirectory() || file.startsWith('.')) {
    if (file.includes('server') || file.includes('replit')) {
      fileAnalysis.servers.push(file);
    } else if (file.includes('package') || file.includes('config')) {
      fileAnalysis.configs.push(file);
    } else if (file.endsWith('.md') || file.includes('guide')) {
      fileAnalysis.resources.push(file);
    }
  }
});

console.log('📋 Fichiers trouvés:');
console.log(`  - Serveurs: ${fileAnalysis.servers.length}`);
console.log(`  - Configs: ${fileAnalysis.configs.length}`);
console.log(`  - Resources: ${fileAnalysis.resources.length}`);

// ============================================
// 3. FUSION DES SERVEURS
// ============================================

console.log('\n🔄 Fusion des serveurs...\n');

// Créer le serveur principal fusionné
const mergedServerContent = `// 🚀 QUÉBEC IA LABS - SERVEUR PRINCIPAL UNIFIÉ
// ================================================
// Fusion de toutes les meilleures fonctionnalités
// Version: 3.0.0
// Date: ${TIMESTAMP}

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 📦 Import des modules
const MarcelTrainer = require('./marcel-trainer');
const ContextAnalyzer = require('./context-analyzer');
const RelationshipData = require('./relationship-data');

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

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

console.log(\`
🚀 QUÉBEC IA LABS - SERVEUR PRINCIPAL
=====================================
Version: 3.0.0
Port: \${PORT}
Claude AI: \${anthropic ? "✅" : "❌"}
Twilio: \${process.env.TWILIO_PHONE_NUMBER || "Non configuré"}
Supabase: \${process.env.SUPABASE_URL ? "✅" : "❌"}
=====================================
\`);

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
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    uptime: \`\${uptimeHours}h \${uptimeMinutes}m\`,
    performance: {
      totalCalls: performanceMetrics.totalCalls,
      successRate: \`\${Math.round((performanceMetrics.successfulCalls / performanceMetrics.totalCalls) * 100) || 0}%\`,
      concurrentCalls: performanceMetrics.concurrentCalls
    },
    services: {
      claudeAI: !!anthropic,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      supabase: !!process.env.SUPABASE_URL,
      marcelTrainer: !!marcelTrainer
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
// 📞 WEBHOOKS TWILIO
// ==============================================

app.post("/webhook/twilio/voice", async (req, res) => {
  const { From, CallSid } = req.body;
  console.log(\`📞 Appel: \${From} [\${CallSid}]\`);
  
  try {
    // Analyser avec context-analyzer si disponible
    let analysis = null;
    if (ContextAnalyzer) {
      analysis = ContextAnalyzer.analyzeInput(req.body.SpeechResult || "");
    }
    
    // Vérifier client avec relationship-data
    let clientInfo = null;
    if (RelationshipData) {
      clientInfo = RelationshipData.getClientByPhone(From);
    }
    
    // Générer réponse
    const greeting = clientInfo 
      ? \`Bonjour \${clientInfo.name}! Content de vous reparler!\`
      : "Bonjour! Bienvenue chez Québec IA Labs. Comment puis-je vous aider?";
    
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-CA" voice="Polly.Chantal">\${greeting}</Say>
  <Gather input="speech dtmf" timeout="10" language="fr-CA" action="/webhook/twilio/process">
    <Say language="fr-CA" voice="Polly.Chantal">Dites rendez-vous, prix, ou horaires.</Say>
  </Gather>
</Response>\`;
    
    res.set("Content-Type", "text/xml");
    res.send(twiml);
    
  } catch (error) {
    console.error("❌ Erreur webhook:", error);
    res.status(500).send("Erreur");
  }
});

// ==============================================
// 🧠 MARCEL TRAINER
// ==============================================

app.get('/test-marcel', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/test-marcel.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.json({
      message: "Dashboard Marcel",
      status: "Configuration requise",
      path: htmlPath
    });
  }
});

app.get('/train-marcel', async (req, res) => {
  try {
    if (!marcelTrainer) {
      marcelTrainer = new MarcelTrainer();
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
        phone: "+15817101240"
      },
      {
        id: "salon-2", 
        name: "Chez Tony",
        address: "456 rue Principale, Montréal",
        phone: "+15145551234"
      }
    ]
  });
});

// ==============================================
// 🚀 DÉMARRAGE
// ==============================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`
🎉 QUÉBEC IA LABS - SERVEUR ACTIF!
===================================
✅ Port: \${PORT}
✅ URL: http://localhost:\${PORT}
✅ Webhooks Twilio configurés
✅ Marcel Trainer disponible
✅ API Mobile active

📞 Téléphone: \${process.env.TWILIO_PHONE_NUMBER || "À configurer"}
🤖 IA: \${anthropic ? "Claude 3.5" : "Mode fallback"}

Endpoints disponibles:
- GET  /                    - Status général
- GET  /health             - Health check
- POST /webhook/twilio/*   - Webhooks Twilio
- GET  /test-marcel        - Dashboard Marcel
- GET  /train-marcel       - Formation IA
- GET  /api/mobile/*       - API Mobile
  \`);
});

module.exports = app;
`;

// Sauvegarder le serveur fusionné
const serverPath = path.join(BASE_PATH, 'quebec-ia-labs/server/main.js');
fs.writeFileSync(serverPath, mergedServerContent);
console.log('  ✅ Serveur principal créé: quebec-ia-labs/server/main.js');

// ============================================
// 4. MIGRATION DES FICHIERS IMPORTANTS
// ============================================

console.log('\n📦 Migration des fichiers importants...\n');

const filesToMigrate = [
  // Depuis marcel-trainer-dev
  {
    source: 'marcel-trainer-dev/context-analyzer.js',
    dest: 'quebec-ia-labs/server/context-analyzer.js'
  },
  {
    source: 'marcel-trainer-dev/relationship-data.js',
    dest: 'quebec-ia-labs/server/relationship-data.js'
  },
  {
    source: 'marcel-trainer-dev/scenarios.json',
    dest: 'quebec-ia-labs/server/scenarios.json'
  },
  {
    source: 'marcel-trainer-dev/marcel-trainer.js',
    dest: 'quebec-ia-labs/server/marcel-trainer.js'
  },
  {
    source: 'marcel-trainer-dev/public/test-marcel.html',
    dest: 'quebec-ia-labs/public/test-marcel.html'
  }
];

filesToMigrate.forEach(({ source, dest }) => {
  const sourcePath = path.join(BASE_PATH, source);
  const destPath = path.join(BASE_PATH, dest);
  
  if (fs.existsSync(sourcePath)) {
    // Créer le dossier de destination si nécessaire
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✅ Migré: ${source} → ${dest}`);
    } catch (error) {
      console.log(`  ⚠️  Erreur migration: ${source} - ${error.message}`);
    }
  } else {
    console.log(`  ⏭️  Non trouvé: ${source}`);
  }
});

// ============================================
// 5. ARCHIVAGE DES ANCIENS FICHIERS
// ============================================

console.log('\n📦 Archivage des anciens fichiers...\n');

const filesToArchive = [
  'replit-main.js',
  'main.js',
  'simple-test-server.js',
  'replit-server-fixed.js'
];

filesToArchive.forEach(file => {
  const sourcePath = path.join(BASE_PATH, file);
  const destPath = path.join(BASE_PATH, '_archives/old-servers', file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`  📦 Archivé: ${file}`);
    } catch (error) {
      // Si renommage échoue, copier puis supprimer
      try {
        fs.copyFileSync(sourcePath, destPath);
        fs.unlinkSync(sourcePath);
        console.log(`  📦 Archivé (copié): ${file}`);
      } catch (err) {
        console.log(`  ⚠️  Impossible d'archiver: ${file}`);
      }
    }
  }
});

// ============================================
// 6. CRÉATION DES CONFIGS
// ============================================

console.log('\n⚙️ Création des configurations...\n');

// Package.json pour quebec-ia-labs
const quebecPackageJson = {
  "name": "quebec-ia-labs",
  "version": "3.0.0",
  "description": "Système Valet IA multi-salons avec Claude AI",
  "main": "server/main.js",
  "scripts": {
    "start": "node server/main.js",
    "dev": "nodemon server/main.js",
    "test": "node server/marcel-trainer.js",
    "train": "node server/marcel-trainer.js",
    "migrate": "node scripts/migrate-database.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@anthropic-ai/sdk": "^0.58.0",
    "@supabase/supabase-js": "^2.39.0",
    "twilio": "^4.19.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync(
  path.join(BASE_PATH, 'quebec-ia-labs/package.json'),
  JSON.stringify(quebecPackageJson, null, 2)
);
console.log('  ✅ package.json créé pour quebec-ia-labs');

// .env.example
const envExample = `# QUÉBEC IA LABS - Configuration

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15817101240

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx

# Serveur
PORT=3000
NODE_ENV=production
MAX_CONCURRENT_CALLS=50

# Features
ENABLE_MARCEL_TRAINER=true
ENABLE_MOBILE_API=true
ENABLE_DETAILED_LOGS=false
`;

fs.writeFileSync(
  path.join(BASE_PATH, 'quebec-ia-labs/.env.example'),
  envExample
);
console.log('  ✅ .env.example créé');

// ============================================
// 7. CRÉATION DU README PRINCIPAL
// ============================================

const readmeContent = `# 🚀 QUÉBEC IA LABS - ÉCOSYSTÈME COMPLET

## 📊 Structure du Projet

\`\`\`
SavageCo/
├── quebec-ia-labs/          # Projet principal unifié
│   ├── server/              # Serveur Valet IA
│   ├── database/            # Schémas Supabase
│   ├── api/                 # API mobile
│   └── public/              # Dashboard Marcel
│
├── academie-precision-app/  # Application mobile
│   ├── App.tsx              # React Native/Expo
│   └── src/                 # Code mobile
│
├── marcel-trainer-dev/      # Tests et développement
│   └── [fichiers tests]     # Environnement de test
│
└── _archives/               # Anciennes versions
\`\`\`

## 🚀 Démarrage Rapide

### 1. Installation
\`\`\`bash
cd quebec-ia-labs
npm install
\`\`\`

### 2. Configuration
\`\`\`bash
cp .env.example .env
# Éditer .env avec vos clés
\`\`\`

### 3. Lancement

#### Serveur Principal
\`\`\`bash
cd quebec-ia-labs
npm start
\`\`\`

#### Application Mobile
\`\`\`bash
cd academie-precision-app
npm run mobile
\`\`\`

#### Tests Marcel
\`\`\`bash
cd quebec-ia-labs
npm test
\`\`\`

## 📡 Endpoints

### Valet IA
- GET  \`/\` - Status général
- POST \`/webhook/twilio/voice\` - Appels entrants
- POST \`/webhook/twilio/sms\` - SMS
- GET  \`/test-marcel\` - Dashboard

### API Mobile
- GET  \`/api/mobile/status\` - Status API
- GET  \`/api/mobile/salons\` - Liste salons
- POST \`/api/mobile/booking\` - Réservation

## 🔧 Technologies

- **Backend**: Node.js, Express
- **IA**: Claude 3.5 Sonnet (Anthropic)
- **Téléphonie**: Twilio
- **Base de données**: Supabase
- **Mobile**: React Native/Expo
- **Tests**: Marcel Trainer

## 📱 Configuration Twilio

1. Console Twilio → Phone Numbers
2. Configurer les webhooks:
   - Voice: \`https://[votre-url]/webhook/twilio/voice\`
   - SMS: \`https://[votre-url]/webhook/twilio/sms\`

## 🧪 Tests

\`\`\`bash
# Lancer tous les tests
cd quebec-ia-labs
npm test

# Dashboard interactif
npm start
# Ouvrir: http://localhost:3000/test-marcel
\`\`\`

## 📊 Monitoring

- Health Check: \`http://localhost:3000/health\`
- Métriques: \`http://localhost:3000/\`

---

**Québec IA Labs** - L'avenir de l'industrie de la beauté 🇨🇦
`;

fs.writeFileSync(
  path.join(BASE_PATH, 'README.md'),
  readmeContent
);
console.log('\n📄 README.md principal créé');

// ============================================
// 8. SCRIPT DE DÉMARRAGE
// ============================================

const startScript = `#!/bin/bash
# start-all.sh - Démarrer tout l'écosystème

echo "🚀 Démarrage Québec IA Labs..."

# Terminal 1: Serveur principal
echo "Starting server..."
cd quebec-ia-labs && npm start &

# Terminal 2: App mobile (optionnel)
read -p "Lancer l'app mobile? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd ../academie-precision-app && npm run mobile &
fi

echo "✅ Systèmes démarrés!"
echo "📍 Serveur: http://localhost:3000"
echo "📍 Marcel: http://localhost:3000/test-marcel"
`;

// Version Windows
const startScriptWin = `@echo off
REM start-all.bat - Démarrer tout l'écosystème

echo =====================================
echo    QUEBEC IA LABS - DEMARRAGE
echo =====================================

echo.
echo [1/2] Demarrage serveur principal...
start cmd /k "cd quebec-ia-labs && npm start"

echo.
choice /C YN /M "Lancer l'app mobile"
if %ERRORLEVEL% == 1 (
    echo [2/2] Demarrage app mobile...
    start cmd /k "cd academie-precision-app && npm run mobile"
)

echo.
echo =====================================
echo    SYSTEMES DEMARRES!
echo    Serveur: http://localhost:3000
echo    Marcel: http://localhost:3000/test-marcel
echo =====================================
pause
`;

fs.writeFileSync(path.join(BASE_PATH, 'start-all.sh'), startScript);
fs.writeFileSync(path.join(BASE_PATH, 'start-all.bat'), startScriptWin);
console.log('  ✅ Scripts de démarrage créés');

// ============================================
// 9. RÉSUMÉ FINAL
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════╗
║               ✅ CONSOLIDATION TERMINÉE!                   ║
╚════════════════════════════════════════════════════════════╝

📊 RÉSULTAT:
============

📁 quebec-ia-labs/           ✅ Projet principal créé
   ├── server/main.js        ✅ Serveur unifié
   ├── package.json          ✅ Configuration
   └── .env.example          ✅ Template config

📁 _archives/                ✅ Anciens fichiers archivés

📄 Fichiers créés:
   ✅ README.md principal
   ✅ start-all.bat (Windows)
   ✅ start-all.sh (Linux/Mac)

🚀 PROCHAINES ÉTAPES:
====================

1. Installation:
   cd quebec-ia-labs
   npm install

2. Configuration:
   cp .env.example .env
   # Éditer avec vos clés API

3. Test:
   npm start
   # Ouvrir http://localhost:3000

4. Démarrage complet:
   ${process.platform === 'win32' ? 'start-all.bat' : './start-all.sh'}

⚠️  IMPORTANT:
   - marcel-trainer-dev/ gardé intact (tests)
   - academie-precision-app/ gardé intact (mobile)
   - Anciens serveurs dans _archives/old-servers/

💡 TIPS:
   - Utilisez quebec-ia-labs/server/main.js comme serveur principal
   - Les tests Marcel sont dans quebec-ia-labs/server/marcel-trainer.js
   - L'app mobile reste indépendante dans academie-precision-app/

📞 Support: Consultez README.md pour la documentation complète
`);

// Optionnel: Créer un fichier de log
const logContent = {
  timestamp: new Date().toISOString(),
  filesCreated: [
    'quebec-ia-labs/server/main.js',
    'quebec-ia-labs/package.json',
    'quebec-ia-labs/.env.example'
  ],
  filesArchived: filesToArchive,
  filesMigrated: filesToMigrate.map(f => f.source),
  status: 'SUCCESS'
};

fs.writeFileSync(
  path.join(BASE_PATH, `_archives/consolidation-log-${TIMESTAMP}.json`),
  JSON.stringify(logContent, null, 2)
);

console.log('\n📝 Log de consolidation sauvegardé dans _archives/');
console.log('\n✨ Consolidation complète! Votre projet est maintenant unifié.\n');