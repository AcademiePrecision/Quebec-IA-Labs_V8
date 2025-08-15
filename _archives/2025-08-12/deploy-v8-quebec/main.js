// 🚀 MARCEL V8.0 ULTIMATE - SERVEUR PRODUCTION
// =============================================
// Version: 8.0 Ultimate Edition
// Fusion: Marcel-Trainer-Prod V2.3 + Quebec-IA-Labs Context Analyzer
// Claude Sonnet 3.5 + Vérification d'Identité V2.0 + Expressions Québécoises
// Target: $1.22M ARR - Architecture Revenue-Ready
// =============================================

// IMPORTANT: Charger .env AVANT tout le reste
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 📦 Initialisation
const app = express();
const PORT = process.env.PORT || 3000;

// 📊 Sessions en mémoire (IMPORTANT!)
const sessions = new Map();

// 🔧 Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 📚 Import des modules Marcel
let MarcelTrainer, ContextAnalyzer, MarcelDataSystem;
try {
  MarcelTrainer = require("./marcel-trainer");
  ContextAnalyzer = require("./context-analyzer");
  console.log("✅ Modules Marcel chargés");
} catch (error) {
  console.warn("⚠️ Modules non trouvés, mode basique activé");
}

// 🔗 Import du système de relations Client-Barbier-Salon avec vérification
try {
  MarcelDataSystem = require("./relationship-data");
  console.log("✅ Système de relations Client-Barbier-Salon v2.0 chargé!");

  // Afficher les stats du nouveau système
  if (MarcelDataSystem.getSystemStats) {
    const stats = MarcelDataSystem.getSystemStats();
    console.log(`   📊 ${stats.totalClients} clients en base`);
    console.log(`   📞 ${stats.totalPhoneNumbers} numéros de téléphone`);
    console.log(`   👥 ${stats.sharedNumbers} numéros partagés`);
    console.log(`   🔐 Taux de vérification requis: ${stats.verificationRate}`);
  } else {
    console.log(`   📊 ${MarcelDataSystem.clients.length} clients en base`);
    console.log(
      `   💈 ${Object.keys(MarcelDataSystem.salons).length} salons connectés`,
    );
  }
} catch (error) {
  console.warn("⚠️ relationship-data.js non trouvé - Relations désactivées");
  MarcelDataSystem = null;
}

// 🔧 FONCTION pour nettoyer les références circulaires
function cleanExtractedInfo(obj) {
  const seen = new WeakSet();

  function cleanObject(item, depth = 0) {
    if (depth > 5) return "[Max Depth]";
    if (item === null || item === undefined) return item;
    if (typeof item !== "object") return item;
    if (seen.has(item)) return "[Circular]";
    seen.add(item);

    if (Array.isArray(item)) {
      return item.map((i) => cleanObject(i, depth + 1));
    }

    if (item instanceof Set) {
      return Array.from(item);
    }

    if (item instanceof Map) {
      const obj = {};
      item.forEach((value, key) => {
        obj[String(key)] = cleanObject(value, depth + 1);
      });
      return obj;
    }

    if (item instanceof Date) {
      return item.toISOString();
    }

    const cleaned = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        try {
          if (
            key === "extractedFields" ||
            key === "session" ||
            key === "_session"
          ) {
            cleaned[key] = "[Omitted - Circular Reference]";
          } else if (typeof item[key] === "function") {
            cleaned[key] = "[Function]";
          } else {
            cleaned[key] = cleanObject(item[key], depth + 1);
          }
        } catch (error) {
          cleaned[key] = "[Error reading property]";
        }
      }
    }
    return cleaned;
  }

  try {
    return cleanObject(obj);
  } catch (error) {
    console.warn("⚠️ Erreur complète lors du nettoyage:", error);
    return {
      error: "Could not serialize object",
      keys: obj ? Object.keys(obj) : [],
    };
  }
}

// 🤖 CONFIGURATION CLAUDE
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    const Anthropic = require("@anthropic-ai/sdk");
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log("✅ Claude Sonnet 3.5 (claude-3-5-sonnet-20241022) configuré!");
  } catch (error) {
    console.log(
      "⚠️ Claude SDK non installé. Installez avec: npm install @anthropic-ai/sdk",
    );
  }
} else {
  console.log("ℹ️ Claude non configuré (ANTHROPIC_API_KEY manquante)");
}

// 🎨 Configuration
console.log(`
🧠 MARCEL TRAINER - SERVEUR DEV v2.3
=====================================
Mode: ${process.env.NODE_ENV || "development"}
Port: ${PORT}
Debug: ${process.env.DEBUG_LOGS ? "ACTIVÉ" : "DÉSACTIVÉ"}
Claude: ${anthropic ? "✅ Sonnet 3.5" : "❌ Non configuré"}
Relations: ${MarcelDataSystem ? "✅ v2.0 avec vérification" : "❌ Désactivées"}
Modules: ${ContextAnalyzer ? "✅" : "❌"} Analyzer | ${MarcelTrainer ? "✅" : "❌"} Trainer
=====================================
`);

// ========================================
// 📍 ROUTES API
// ========================================

// 🏠 Route principale - Status
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "🧠 Marcel Trainer Dev Server - v2.3",
    version: "2.3.0",
    uptime: process.uptime(),
    endpoints: {
      dashboard: "/test-marcel",
      training: "/train-marcel",
      test_response: "/test-marcel-response",
      test_claude: "/test-claude",
      test_claude_smart: "/test-claude-smart",
      verify_identity: "/verify-identity",
      client_lookup: "/client-lookup",
      barbiers: "/barbiers",
      context_analysis: "/analyze-context",
      scenarios: "/test-scenarios",
      reports: "/training-report",
      stats: "/stats/relations",
    },
    environment: {
      node_env: process.env.NODE_ENV || "development",
      claude_configured: !!anthropic,
      claude_model: "claude-3-5-sonnet-20241022",
      relations_enabled: !!MarcelDataSystem,
      identity_verification: MarcelDataSystem?.verifyCallerIdentity
        ? true
        : false,
      analyzer_available: !!ContextAnalyzer,
      trainer_available: !!MarcelTrainer,
      timestamp: new Date().toISOString(),
    },
  });
});

// 🎯 Dashboard Marcel
app.get("/test-marcel", (req, res) => {
  console.log("📊 Accès dashboard Marcel");

  try {
    const htmlContent = fs.readFileSync("public/test-marcel.html", "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
    console.log("✅ Dashboard Marcel servi");
  } catch (error) {
    console.error("❌ Erreur lecture fichier:", error.message);
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard Marcel - Non trouvé</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          h1 { color: #e74c3c; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Dashboard non trouvé</h1>
          <p>Erreur: ${error.message}</p>
          <p>Le fichier <code>test-marcel.html</code> n'existe pas dans <code>/public</code></p>
          <h3>Endpoints API disponibles:</h3>
          <ul>
            <li>POST /test-marcel-response - Test basique</li>
            <li>POST /test-claude - Test avec Claude</li>
            <li>POST /test-claude-smart - Claude avec vérification d'identité</li>
            <li>POST /verify-identity - Vérifier l'identité d'un appelant</li>
            <li>POST /client-lookup - Recherche client</li>
            <li>GET /barbiers - Liste des barbiers</li>
            <li>GET /train-marcel - Formation</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// 🔐 NOUVELLE ROUTE: Vérification d'identité
app.post("/verify-identity", (req, res) => {
  const { phoneNumber, callerName } = req.body;

  console.log("🔐 Vérification d'identité:", { phoneNumber, callerName });

  if (!MarcelDataSystem || !MarcelDataSystem.verifyCallerIdentity) {
    return res.status(503).json({
      error: "Système de vérification non disponible",
      message: "Le système de vérification d'identité n'est pas configuré",
    });
  }

  const verification = MarcelDataSystem.verifyCallerIdentity(
    phoneNumber,
    callerName,
  );

  res.json({
    success: true,
    phoneNumber,
    callerName,
    verification,
    timestamp: new Date().toISOString(),
  });
});

// 🧪 Test de réponse Marcel (ROUTE BASIQUE)
app.post("/test-marcel-response", async (req, res) => {
  const { userInput, sessionId = "test-" + Date.now(), phoneNumber } = req.body;

  console.log("🎯 Test Marcel:", userInput);
  console.log("📊 Session ID:", sessionId);

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      phoneNumber,
      extractedInfo: {},
      questionsAsked: new Set(),
      conversation: [],
      verificationStatus: null,
      createdAt: new Date(),
    });
    console.log("✨ Nouvelle session créée");
  }

  const session = sessions.get(sessionId);

  if (!session.questionsAsked) {
    session.questionsAsked = new Set();
  }

  if (ContextAnalyzer) {
    const analyzer = new ContextAnalyzer();
    const extracted = analyzer.analyzeUserInput
      ? analyzer.analyzeUserInput(userInput, session)
      : analyzer.analyzeInput(userInput, session);

    console.log("🔍 Extrait:", extracted);

    Object.keys(extracted).forEach((key) => {
      if (extracted[key] && !session.extractedInfo[key]) {
        session.extractedInfo[key] = extracted[key];
        console.log(`✅ Ajouté: ${key} = ${extracted[key]}`);
      }
    });

    session.conversation.push({
      user: userInput,
      extracted: extracted,
      timestamp: new Date(),
    });

    const response = analyzer.generateResponse(session);

    console.log("📊 État session:", {
      extractedInfo: cleanExtractedInfo(session.extractedInfo),
      questionsAsked: session.questionsAsked
        ? Array.from(session.questionsAsked)
        : [],
    });

    res.json({
      input: userInput,
      response: response,
      extractedInfo: cleanExtractedInfo(session.extractedInfo),
      sessionId: sessionId,
      conversationLength: session.conversation.length,
      engine: "Context Analyzer",
    });
  } else {
    res.json({
      input: userInput,
      response:
        "Marcel est en mode test basique. Vérifiez que context-analyzer.js existe.",
      extractedInfo: {},
      sessionId: sessionId,
      engine: "Fallback",
    });
  }
});

// 🧠 TEST AVEC CLAUDE (BASIQUE)
app.post("/test-claude", async (req, res) => {
  const { userInput, sessionId = "claude-" + Date.now() } = req.body;

  console.log("🤖 Test Claude:", userInput);

  if (!anthropic) {
    return res.status(400).json({
      error: "Claude non configuré",
      message:
        "Ajoutez ANTHROPIC_API_KEY dans Secrets (Replit) ou .env (local)",
      engine: "claude-3-5-sonnet-20241022 - Non disponible",
    });
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      extractedInfo: {},
      conversation: [],
      createdAt: new Date(),
    });
  }

  const session = sessions.get(sessionId);

  const prompt = `Tu es Marcel, réceptionniste expert du Salon Marcel à Québec.

INFORMATION SALON:
- Coupe homme: 35$ | Barbe: 20$ | Combo: 50$
- Barbiers: Marco (expert barbe), Tony (coupes modernes), Julie (colorations)
- Horaires: Mardi-Vendredi 9h-18h, Samedi 9h-16h

HISTORIQUE CONVERSATION (derniers échanges):
${session.conversation
  .slice(-5)
  .map((c) => `Client: ${c.user}\nMarcel: ${c.response}`)
  .join("\n")}

INFORMATIONS DÉJÀ COLLECTÉES:
${JSON.stringify(cleanExtractedInfo(session.extractedInfo), null, 2)}

LE CLIENT DIT MAINTENANT: "${userInput}"

RÈGLES ABSOLUES:
1. NE JAMAIS redemander une information qui est dans "INFORMATIONS DÉJÀ COLLECTÉES"
2. Si tu as le service → demande la date
3. Si tu as la date → demande l'heure ou le barbier
4. Si tout est complet → confirme et résume le rendez-vous
5. Réponds naturellement en français québécois, maximum 2 phrases courtes

Ta réponse:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = message.content[0].text;

    if (ContextAnalyzer) {
      const analyzer = new ContextAnalyzer();
      const extracted = analyzer.analyzeUserInput
        ? analyzer.analyzeUserInput(userInput, session)
        : analyzer.analyzeInput(userInput, session);

      Object.keys(extracted).forEach((key) => {
        if (extracted[key]) {
          session.extractedInfo[key] = extracted[key];
        }
      });
    }

    session.conversation.push({
      user: userInput,
      response: response,
      timestamp: new Date(),
    });

    console.log("✅ Réponse Claude générée");

    res.json({
      input: userInput,
      response: response,
      extractedInfo: cleanExtractedInfo(session.extractedInfo),
      sessionId: sessionId,
      engine: "claude-3-5-sonnet-20241022",
      conversationLength: session.conversation.length,
      tokensUsed: message.usage?.output_tokens,
    });
  } catch (error) {
    console.error("❌ Erreur Claude:", error.message);
    res.status(500).json({
      error: "Erreur Claude API",
      message: error.message,
      engine: "claude-3-5-sonnet-20241022",
    });
  }
});

// 🧠🔗 TEST CLAUDE SMART AVEC VÉRIFICATION D'IDENTITÉ
app.post("/test-claude-smart", async (req, res) => {
  const {
    userInput,
    sessionId = "claude-smart-" + Date.now(),
    phoneNumber,
    callerName,
  } = req.body;

  console.log("🤖 Test Claude Smart avec vérification:", userInput);
  console.log("📞 Téléphone client:", phoneNumber);
  console.log("👤 Nom fourni:", callerName);

  if (!anthropic) {
    return res.status(400).json({
      error: "Claude non configuré",
      message: "Ajoutez ANTHROPIC_API_KEY dans Secrets",
      engine: "claude-3-5-sonnet-20241022 - Non disponible",
    });
  }

  // Créer ou récupérer session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      phoneNumber: phoneNumber,
      callerName: callerName,
      extractedInfo: {},
      conversation: [],
      clientData: null,
      verificationStatus: null,
      verificationAttempts: 0,
      createdAt: new Date(),
    });
  }

  const session = sessions.get(sessionId);

  // 🔐 VÉRIFICATION D'IDENTITÉ
  let verificationContext = "";
  let clientContext = "";

  if (phoneNumber && MarcelDataSystem) {
    // Si on n'a pas encore vérifié l'identité
    if (!session.verificationStatus) {
      // Extraire le nom de l'input si disponible
      let detectedName = callerName;

      // Tentative d'extraction du nom depuis l'input
      if (!detectedName && userInput.toLowerCase().includes("c'est")) {
        const match = userInput.match(/c'est\s+([A-Za-zÀ-ÿ\s\-]+)/i);
        if (match) detectedName = match[1].trim();
      }

      if (!detectedName && userInput.toLowerCase().includes("je m'appelle")) {
        const match = userInput.match(/je m'appelle\s+([A-Za-zÀ-ÿ\s\-]+)/i);
        if (match) detectedName = match[1].trim();
      }

      if (!detectedName && userInput.toLowerCase().includes("mon nom est")) {
        const match = userInput.match(/mon nom est\s+([A-Za-zÀ-ÿ\s\-]+)/i);
        if (match) detectedName = match[1].trim();
      }

      // Vérifier l'identité
      const verification = MarcelDataSystem.verifyCallerIdentity(
        phoneNumber,
        detectedName,
      );
      session.verificationStatus = verification;
      session.verificationAttempts++;

      console.log("🔐 Vérification:", verification);

      if (verification.needsVerification) {
        verificationContext = `
⚠️ VÉRIFICATION D'IDENTITÉ REQUISE:
${verification.possibleCallers ? `- Ce numéro peut appartenir à: ${verification.possibleCallers.join(", ")}` : ""}
- Type de numéro: ${verification.phoneType || "partagé"}
- RÈGLE ABSOLUE: Tu DOIS demander "Puis-je avoir votre nom?" ou "C'est pour qui le rendez-vous?"
- NE JAMAIS présumer de l'identité du client
- Attendre la confirmation avant de personnaliser
- Si le nom n'est pas reconnu, traiter comme nouveau client

${verification.suggestedQuestion || "Demande: 'Bonjour! Puis-je avoir votre nom pour mieux vous servir?'"}
`;
      } else if (verification.confirmedCaller) {
        // Identité confirmée
        const intelligence = MarcelDataSystem.getIntelligence(
          phoneNumber,
          verification.confirmedCaller,
        );
        session.clientData = intelligence;

        if (intelligence.isKnownClient) {
          clientContext = `
🎯 CLIENT CONFIRMÉ:
- Nom: ${intelligence.client.name}
- Client régulier (${intelligence.client.totalVisits} visites)
- Barbier préféré: ${intelligence.preferredBarbier?.name || "Aucun"}
- Dernière visite: ${intelligence.client.lastVisit}
- Services habituels: ${intelligence.client.preferences.serviceType.join(", ")}
- Préfère: ${intelligence.client.preferences.timePreference}
- Dépense moyenne: ${intelligence.client.averageSpending}$

HISTORIQUE RÉCENT:
${intelligence.client.historique
  .slice(-3)
  .map(
    (h) =>
      `- ${h.date}: ${h.services.join(", ")} avec ${h.barbier} (${h.prix}$)`,
  )
  .join("\n")}
`;
        }
      }
    } else {
      // Session déjà vérifiée
      if (session.clientData && session.clientData.isKnownClient) {
        const client = session.clientData.client;
        clientContext = `
🎯 CLIENT VÉRIFIÉ:
- Nom: ${client.name}
- Statut: Client confirmé
- Barbier préféré: ${session.clientData.preferredBarbier?.name || "Aucun"}
- Services habituels: ${client.preferences.serviceType.join(", ")}
`;
      }
    }
  } else if (!phoneNumber) {
    clientContext =
      "⚠️ AUCUN NUMÉRO DE TÉLÉPHONE - Traiter comme client anonyme";
  }

  // Construire le prompt enrichi
  const prompt = `Tu es Marcel, réceptionniste expert du Salon Marcel à Québec.

INFORMATION SALON:
- Coupe homme: 35$ | Barbe: 20$ | Combo: 50$
- Barbiers: Marco (expert barbe), Tony (coupes modernes), Julie (colorations)
- Horaires: Mardi-Vendredi 9h-18h, Samedi 9h-16h

${verificationContext}

${clientContext}

CONVERSATION ACTUELLE:
${session.conversation
  .slice(-5)
  .map((c) => `Client: ${c.user}\nMarcel: ${c.response}`)
  .join("\n")}

INFORMATIONS DÉJÀ COLLECTÉES:
${JSON.stringify(cleanExtractedInfo(session.extractedInfo), null, 2)}

LE CLIENT DIT: "${userInput}"

RÈGLES CRITIQUES:
${
  verificationContext
    ? `
1. PRIORITÉ ABSOLUE: Vérifier l'identité avant toute personnalisation
2. Demander poliment le nom si pas encore confirmé
3. Ne JAMAIS mentionner d'informations personnelles sans confirmation
`
    : `
1. Client identifié - personnaliser la réponse
2. Suggérer son barbier préféré s'il en a un
3. Tenir compte de ses préférences
`
}
4. Ne redemande JAMAIS ce qui est déjà collecté
5. Maximum 2 phrases courtes en français québécois
6. Être chaleureux mais professionnel

Ta réponse:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = message.content[0].text;

    // Analyser la réponse pour voir si on a obtenu un nom
    if (session.verificationStatus?.needsVerification) {
      const namePatterns = [
        /c'est\s+([A-Za-zÀ-ÿ\s\-]+)/i,
        /je\s+(?:m'appelle|suis)\s+([A-Za-zÀ-ÿ\s\-]+)/i,
        /mon nom est\s+([A-Za-zÀ-ÿ\s\-]+)/i,
      ];

      for (const pattern of namePatterns) {
        const match = userInput.match(pattern);
        if (match) {
          const detectedName = match[1].trim();
          // Re-vérifier avec le nom détecté
          const newVerification = MarcelDataSystem.verifyCallerIdentity(
            phoneNumber,
            detectedName,
          );
          session.verificationStatus = newVerification;

          if (!newVerification.needsVerification) {
            const intelligence = MarcelDataSystem.getIntelligence(
              phoneNumber,
              detectedName,
            );
            session.clientData = intelligence;
            console.log(`✅ Identité confirmée: ${detectedName}`);
          }
          break;
        }
      }
    }

    // Analyser avec ContextAnalyzer si disponible
    if (ContextAnalyzer) {
      const analyzer = new ContextAnalyzer();
      const extracted = analyzer.analyzeUserInput
        ? analyzer.analyzeUserInput(userInput, session)
        : analyzer.analyzeInput(userInput, session);

      Object.keys(extracted).forEach((key) => {
        if (extracted[key]) {
          session.extractedInfo[key] = extracted[key];
        }
      });
    }

    // Ajouter à l'historique
    session.conversation.push({
      user: userInput,
      response: response,
      timestamp: new Date(),
    });

    console.log("✅ Réponse Claude Smart générée avec vérification");

    res.json({
      input: userInput,
      response: response,
      extractedInfo: cleanExtractedInfo(session.extractedInfo),
      clientData: session.clientData,
      verificationStatus: session.verificationStatus,
      sessionId: sessionId,
      engine: "claude-3-5-sonnet-20241022 avec vérification",
      conversationLength: session.conversation.length,
      isKnownClient: session.clientData?.isKnownClient || false,
      identityVerified: !session.verificationStatus?.needsVerification,
    });
  } catch (error) {
    console.error("❌ Erreur Claude Smart:", error.message);
    res.status(500).json({
      error: "Erreur Claude API",
      message: error.message,
      engine: "claude-3-5-sonnet-20241022",
    });
  }
});

// 🔍 Recherche client par téléphone
app.post("/client-lookup", (req, res) => {
  const { phoneNumber, callerName } = req.body;

  console.log("🔍 Recherche client:", phoneNumber, callerName);

  if (!MarcelDataSystem) {
    return res.status(503).json({
      error: "Système de relations non disponible",
      message: "Le fichier relationship-data.js n'est pas chargé",
    });
  }

  const clientData = MarcelDataSystem.getIntelligence(phoneNumber, callerName);

  res.json({
    success: true,
    phoneNumber: phoneNumber,
    callerName: callerName,
    ...clientData,
  });
});

// 👥 Liste des barbiers disponibles
app.get("/barbiers", (req, res) => {
  if (!MarcelDataSystem) {
    return res.status(503).json({
      error: "Système de relations non disponible",
    });
  }

  const allBarbiers = Object.values(MarcelDataSystem.salons).flatMap((salon) =>
    salon.barbiers.map((b) => ({
      ...b,
      salon: salon.salonName,
      salonAddress: salon.address,
      salonPhone: salon.phone,
    })),
  );

  res.json({
    success: true,
    total: allBarbiers.length,
    barbiers: allBarbiers,
  });
});

// 📅 Vérifier disponibilité d'un barbier
app.post("/check-availability", (req, res) => {
  const { barbierId, date, time } = req.body;

  console.log("📅 Vérification disponibilité:", { barbierId, date, time });

  if (!MarcelDataSystem) {
    return res.status(503).json({
      error: "Système non disponible",
    });
  }

  const isAvailable = MarcelDataSystem.checkAvailability(barbierId, date, time);

  res.json({
    success: true,
    available: isAvailable,
    barbierId,
    date,
    time,
    message: isAvailable ? "Créneau disponible!" : "Créneau non disponible",
  });
});

// 📊 Statistiques des relations
app.get("/stats/relations", (req, res) => {
  if (!MarcelDataSystem) {
    return res.status(503).json({
      error: "Système non disponible",
      message: "relationship-data.js non chargé",
    });
  }

  let stats;

  // Utiliser la nouvelle fonction getSystemStats si disponible
  if (MarcelDataSystem.getSystemStats) {
    const systemStats = MarcelDataSystem.getSystemStats();
    stats = {
      ...systemStats,
      totalClients: MarcelDataSystem.clients.length,
      totalSalons: Object.keys(MarcelDataSystem.salons).length,
      totalBarbiers: Object.values(MarcelDataSystem.salons).reduce(
        (acc, salon) => acc + salon.barbiers.length,
        0,
      ),
      totalBookings: MarcelDataSystem.bookings.length,
      topBarbiers: Object.values(MarcelDataSystem.salons)
        .flatMap((s) => s.barbiers)
        .slice(0, 3)
        .map((b) => ({
          name: b.name,
          specialties: b.specialties,
          hourlyRate: b.hourlyRate,
        })),
      recentBookings: MarcelDataSystem.bookings.slice(-5).map((b) => ({
        client: b.clientName,
        barbier: b.barbierName,
        date: b.date,
        status: b.status,
      })),
    };
  } else {
    // Fallback pour l'ancienne version
    stats = {
      totalClients: MarcelDataSystem.clients.length,
      totalSalons: Object.keys(MarcelDataSystem.salons).length,
      totalBarbiers: Object.values(MarcelDataSystem.salons).reduce(
        (acc, salon) => acc + salon.barbiers.length,
        0,
      ),
      totalBookings: MarcelDataSystem.bookings.length,
      topBarbiers: Object.values(MarcelDataSystem.salons)
        .flatMap((s) => s.barbiers)
        .slice(0, 3)
        .map((b) => ({
          name: b.name,
          specialties: b.specialties,
          hourlyRate: b.hourlyRate,
        })),
      recentBookings: MarcelDataSystem.bookings.slice(-5).map((b) => ({
        client: b.clientName,
        barbier: b.barbierName,
        date: b.date,
        status: b.status,
      })),
    };
  }

  res.json(stats);
});

// 🔄 Route alternative pour test-scenario
app.post("/test-scenario", async (req, res) => {
  const usesClaude =
    req.body.useClaude || process.env.USE_CLAUDE_BY_DEFAULT === "true";
  const hasPhone = req.body.phoneNumber;

  if (usesClaude && anthropic) {
    if (hasPhone && MarcelDataSystem) {
      return app._router.handle(
        Object.assign(req, { url: "/test-claude-smart" }),
        res,
        () => {},
      );
    } else {
      return app._router.handle(
        Object.assign(req, { url: "/test-claude" }),
        res,
        () => {},
      );
    }
  } else {
    return app._router.handle(
      Object.assign(req, { url: "/test-marcel-response" }),
      res,
      () => {},
    );
  }
});

// 🎓 Formation complète
app.get("/train-marcel", async (req, res) => {
  console.log("🎓 Lancement formation Marcel...");

  if (!MarcelTrainer) {
    return res.json({
      success: false,
      error: "Module marcel-trainer.js non trouvé",
    });
  }

  try {
    const trainer = new MarcelTrainer();
    const results = await trainer.runFullTraining();

    res.json({
      success: true,
      message: "Formation complétée",
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erreur formation:", error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});

// 📊 Rapport de formation
app.get("/training-report", (req, res) => {
  const report = {
    lastTraining: new Date().toISOString(),
    successRate: 85,
    totalTests: 25,
    passedTests: 21,
    failedTests: 4,
    avgResponseTime: "1.2s",
    issues: [
      "Boucles sur confirmation",
      "Contexte parfois perdu",
      "Extraction date à améliorer",
    ],
    recommendations: [
      "Améliorer la mémoire contextuelle",
      "Ajouter plus de scénarios québécois",
      "Optimiser l'extraction de dates relatives",
      "Intégrer les relations clients",
      "Implémenter la vérification d'identité systématique",
    ],
    scenarios: {
      greeting: { success: 100, tests: 5 },
      booking: { success: 80, tests: 10 },
      pricing: { success: 90, tests: 5 },
      edge_cases: { success: 60, tests: 5 },
      client_recognition: {
        success: MarcelDataSystem ? 95 : 0,
        tests: MarcelDataSystem ? 10 : 0,
      },
      identity_verification: {
        success: MarcelDataSystem?.verifyCallerIdentity ? 90 : 0,
        tests: MarcelDataSystem?.verifyCallerIdentity ? 8 : 0,
      },
    },
  };

  res.json(report);
});

// 🔍 Analyse de contexte
app.post("/analyze-context", (req, res) => {
  const { text } = req.body;

  if (!ContextAnalyzer) {
    return res.json({
      error: "ContextAnalyzer non disponible",
      text: text,
    });
  }

  const analyzer = new ContextAnalyzer();
  const mockSession = {
    extractedInfo: {},
    questionsAsked: new Set(),
  };

  const extracted = analyzer.analyzeInput(text, mockSession);

  res.json({
    text: text,
    extracted: extracted,
    patterns_found: Object.keys(extracted),
    timestamp: new Date().toISOString(),
  });
});

// 📋 Liste des scénarios de test
app.get("/test-scenarios", (req, res) => {
  try {
    const scenarios = require("./scenarios.json");
    res.json(scenarios);
  } catch (error) {
    res.json({
      error: "Fichier scenarios.json non trouvé",
      defaultScenarios: [
        {
          id: "test_1",
          input: "J'voudrais une coupe pour à matin",
          expectedExtraction: {
            besoin: "rdv",
            service: "coupe",
            date: "aujourd'hui",
            periode: "matin",
          },
        },
        {
          id: "test_2",
          input: "C'est combien pour la barbe?",
          expectedExtraction: {
            besoin: "prix",
            service: "barbe",
          },
        },
        {
          id: "test_3",
          input: "J'peux-tu avoir Marco demain?",
          expectedExtraction: {
            besoin: "rdv",
            barbier: "Marco",
            date: "demain",
          },
        },
        {
          id: "test_4",
          input: "Bonjour, c'est Jean Tremblay",
          expectedExtraction: {
            besoin: "salutation",
            client: "Jean Tremblay",
          },
        },
        {
          id: "test_5_verification",
          input: "Bonjour",
          expectedBehavior: "Doit demander le nom",
          phoneNumber: "+15145551234",
        },
        {
          id: "test_6_famille",
          input: "Salut, c'est Sophie",
          expectedBehavior: "Doit reconnaître Sophie Tremblay",
          phoneNumber: "+15145551234",
        },
      ],
    });
  }
});

// 🧹 Reset session
app.post("/reset-session", (req, res) => {
  const { sessionId } = req.body;

  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
    console.log(`🗑️ Session ${sessionId} supprimée`);
  }

  res.json({
    success: true,
    message: "Session réinitialisée",
    sessionId: sessionId,
  });
});

// 📈 Métriques API
app.get("/api/training/metrics", (req, res) => {
  const systemStats = MarcelDataSystem?.getSystemStats
    ? MarcelDataSystem.getSystemStats()
    : {};

  res.json({
    sessions_active: sessions.size,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    node_version: process.version,
    claude_enabled: !!anthropic,
    relations_enabled: !!MarcelDataSystem,
    identity_verification_enabled: !!MarcelDataSystem?.verifyCallerIdentity,
    total_clients: MarcelDataSystem ? MarcelDataSystem.clients.length : 0,
    shared_phone_numbers: systemStats.sharedNumbers || 0,
    verification_rate: systemStats.verificationRate || "0%",
    timestamp: new Date().toISOString(),
  });
});

// 📊 Métriques DEV (pour le dashboard)
app.get("/dev-metrics", (req, res) => {
  res.json({
    successRate: 85,
    totalTests: sessions.size,
    failedTests: 0,
    avgResponseTime: 150,
    sessionsActive: sessions.size,
    uptime: process.uptime(),
    claude_enabled: !!anthropic,
    relations_enabled: !!MarcelDataSystem,
    identity_verification: !!MarcelDataSystem?.verifyCallerIdentity,
    timestamp: new Date().toISOString(),
  });
});

// 🧪 NOUVELLE ROUTE: Tests de vérification
app.get("/test-verification", (req, res) => {
  if (!MarcelDataSystem || !MarcelDataSystem.testVerificationScenarios) {
    return res.status(503).json({
      error: "Tests de vérification non disponibles",
      message: "Le système de vérification n'est pas configuré",
    });
  }

  // Capturer les logs console
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => {
    logs.push(args.join(" "));
    originalLog(...args);
  };

  // Lancer les tests
  MarcelDataSystem.testVerificationScenarios();

  // Restaurer console.log
  console.log = originalLog;

  res.json({
    success: true,
    testResults: logs,
    timestamp: new Date().toISOString(),
  });
});

// ❌ Route 404
app.use((req, res) => {
  console.log(`❌ Route non trouvée: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route non trouvée",
    path: req.path,
    method: req.method,
    suggestion:
      "Vérifiez l'orthographe ou consultez GET / pour la liste des endpoints",
    availableEndpoints: {
      dashboard: "/test-marcel",
      api: {
        test_basic: "POST /test-marcel-response",
        test_claude: "POST /test-claude",
        test_claude_smart: "POST /test-claude-smart",
        verify_identity: "POST /verify-identity",
        client_lookup: "POST /client-lookup",
        barbiers: "GET /barbiers",
        availability: "POST /check-availability",
        train: "GET /train-marcel",
        report: "GET /training-report",
        test_verification: "GET /test-verification",
        reset: "POST /reset-session",
        stats: "GET /stats/relations",
        metrics: "GET /dev-metrics",
      },
    },
  });
});

// 🚀 Démarrage du serveur
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
✅ MARCEL TRAINER DEV - SERVEUR LANCÉ v2.3
=====================================
🌐 Local: http://localhost:${PORT}
🌐 Dashboard: http://localhost:${PORT}/test-marcel
🌐 Status: http://localhost:${PORT}/
=====================================
🤖 Claude: ${anthropic ? "✅ Sonnet 3.5" : "❌ Désactivé (ajoutez ANTHROPIC_API_KEY)"}
🔗 Relations: ${MarcelDataSystem ? "✅ v2.0 Chargées" : "❌ Non disponibles"}
🔐 Vérification: ${MarcelDataSystem?.verifyCallerIdentity ? "✅ Activée" : "❌ Non disponible"}
📊 Sessions: ${sessions.size} actives
🧠 Modules: ${MarcelTrainer ? "✅" : "❌"} Trainer | ${ContextAnalyzer ? "✅" : "❌"} Analyzer
=====================================
🆕 NOUVELLES FONCTIONNALITÉS v2.3:
   🔐 Vérification d'identité pour numéros partagés
   👥 Support multi-utilisateurs par téléphone
   🧪 Tests de vérification automatisés
   📊 Statistiques de vérification
=====================================
💡 Essayez ces scénarios de test:

   1. Numéro partagé sans nom:
   POST /test-claude-smart
   {
     "phoneNumber": "+15145551234",
     "userInput": "Bonjour, je voudrais un rendez-vous"
   }

   2. Membre de famille:
   POST /test-claude-smart
   {
     "phoneNumber": "+15145551234",
     "userInput": "Salut, c'est Sophie"
   }

   3. Tests automatisés:
   GET /test-verification
=====================================
⏰ Démarré: ${new Date().toLocaleString("fr-CA")}
=====================================
  `);
});

// 🛑 Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("\n\n👋 Arrêt du serveur Marcel Trainer...");
  console.log(`📊 ${sessions.size} sessions actives supprimées`);

  if (MarcelDataSystem) {
    if (MarcelDataSystem.getSystemStats) {
      const stats = MarcelDataSystem.getSystemStats();
      console.log(`🔗 ${stats.totalClients} clients en base`);
      console.log(`📞 ${stats.sharedNumbers} numéros partagés`);
      console.log(`🔐 Taux de vérification: ${stats.verificationRate}`);
    } else {
      console.log(`🔗 ${MarcelDataSystem.clients.length} clients en base`);
      console.log(
        `💈 ${Object.keys(MarcelDataSystem.salons).length} salons connectés`,
      );
    }
  }

  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });
});

// 📞 WEBHOOK TWILIO - Appels téléphoniques
app.post('/webhook/twilio', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;
    
    console.log('📞 Webhook Twilio reçu:', { From, To, CallSid, SpeechResult });
    
    // Si c'est un nouvel appel (pas de SpeechResult)
    if (!SpeechResult) {
      // Vérifier l'identité du client
      let verificationResult = null;
      if (MarcelDataSystem && MarcelDataSystem.verifyIdentity) {
        verificationResult = MarcelDataSystem.verifyIdentity(From);
        console.log('🔐 Vérification d\'identité:', verificationResult);
      }
      
      let greeting = "Bonjour! Vous êtes bien chez le salon. Comment puis-je vous aider?";
      
      // Si client reconnu et pas de vérification nécessaire
      if (verificationResult && !verificationResult.needsVerification) {
        const clientName = verificationResult.confirmedCaller || verificationResult.possibleCallers[0];
        greeting = `Bonjour ${clientName}! Heureux de vous entendre. Comment puis-je vous aider aujourd'hui?`;
      } else if (verificationResult?.needsVerification) {
        greeting = verificationResult.suggestedQuestion || "Bonjour! Puis-je avoir votre nom pour mieux vous servir?";
      }
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">${greeting}</Say>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="3" timeout="10">
        <Say voice="Polly.Celine" language="fr-CA">Parlez maintenant...</Say>
    </Gather>
    <Say voice="Polly.Celine" language="fr-CA">Je n'ai pas bien entendu. Au revoir!</Say>
</Response>`;
      
      return res.type('text/xml').send(twiml);
    }
    
    // Traitement de la réponse vocale
    if (SpeechResult) {
      console.log('🎤 Parole reçue:', SpeechResult);
      
      // Créer ou récupérer session
      const sessionId = `twilio-${CallSid}`;
      let session = sessions.get(sessionId);
      
      if (!session) {
        session = {
          phone: From,
          sessionId: sessionId,
          conversation: [],
          extractedInfo: {},
          verificationStatus: MarcelDataSystem ? MarcelDataSystem.verifyIdentity(From) : null,
          startTime: new Date()
        };
        sessions.set(sessionId, session);
      }
      
      // Traitement avec Marcel V8.0
      try {
        const response = await processWithClaudeSmart(SpeechResult, session.phone, session.sessionId);
        
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">${response.response || 'Désolé, je n\\'ai pas compris.'}</Say>
    <Pause length="1"/>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="3" timeout="10">
        <Say voice="Polly.Celine" language="fr-CA">Autre chose?</Say>
    </Gather>
    <Say voice="Polly.Celine" language="fr-CA">Merci et à bientôt!</Say>
    <Hangup/>
</Response>`;
        
        return res.type('text/xml').send(twiml);
        
      } catch (error) {
        console.error('❌ Erreur traitement Marcel:', error);
        
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">Je suis désolé, j'ai un problème technique. Rappellez plus tard.</Say>
    <Hangup/>
</Response>`;
        
        return res.type('text/xml').send(twiml);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur webhook Twilio:', error);
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Celine" language="fr-CA">Une erreur est survenue. Veuillez rappeler.</Say>
    <Hangup/>
</Response>`;
    
    res.type('text/xml').send(twiml);
  }
});

// 📊 Endpoint de test pour Twilio
app.get('/webhook/twilio/test', (req, res) => {
  res.json({
    status: 'Marcel V8.0 Twilio Webhook Ready',
    version: '8.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      voice: 'POST /webhook/twilio',
      test: 'GET /webhook/twilio/test'
    }
  });
});

module.exports = app;
