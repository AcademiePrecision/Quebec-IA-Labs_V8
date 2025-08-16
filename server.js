// MARCEL V8.0 ULTIMATE - SERVEUR PRODUCTION FINAL CORRIGÉ
// =============================================
// Version: 8.0 Ultimate Edition - FINAL FIXED
// Quebec IA Labs - Production Ready
// Date: 2025-08-12
// =============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Try to load AI SDKs, but continue if they fail
let Anthropic = null;
let OpenAI = null;

try {
  Anthropic = require("@anthropic-ai/sdk");
} catch (error) {
  console.log("Warning: Anthropic SDK non disponible");
}

try {
  OpenAI = require("openai");
} catch (error) {
  console.log("Warning: OpenAI SDK non disponible");
}


// PATCH ANTI-EMOJI POUR TELEPHONE - VERSION RENFORCÉE
function removeAllEmojisForPhone(text) {
  if (!text) return '';
  
  // Supprimer tous les vrais emojis Unicode
  let cleaned = text.replace(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // Supprimer les descriptions d'émojis courantes
  const descriptions = [
    'visage souriant', 'etoile souriante', 'main qui salue',
    'ciseaux', 'calendrier', 'emoji', 'symbole', 'smiley',
    '😊', '😄', '😃', '✨', '👋', '✂️', '📅', '⭐',
    'emoji sourire', 'emoji étoile', 'emoji main', 'emoji ciseaux',
    'sourire', 'étoile', 'main qui fait signe', 'symbole étoile'
  ];
  
  descriptions.forEach(desc => {
    const regex = new RegExp('\\b' + desc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Nettoyer les espaces multiples et trimmer
  return cleaned.replace(/\s+/g, ' ').trim();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Anthropic
let anthropic = null;
try {
  // Essayer plusieurs noms de variables d'environnement
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY;
  
  if (Anthropic && anthropicKey) {
    anthropic = new Anthropic({
      apiKey: anthropicKey,
    });
    console.log("Success: Anthropic Claude API connecté - Marcel intelligent activé");
  } else {
    console.log("Warning: Mode basique activé - Pas d'API Claude disponible");
    console.log("Debug: ANTHROPIC_API_KEY présent:", !!process.env.ANTHROPIC_API_KEY);
    console.log("Debug: EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY présent:", !!process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY);
  }
} catch (error) {
  console.log("Warning: Erreur Anthropic:", error.message);
  anthropic = null;
}

// Initialize OpenAI as backup
let openai = null;
try {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (OpenAI && openaiKey) {
    openai = new OpenAI({
      apiKey: openaiKey,
    });
    console.log("Success: OpenAI API connecté - Fallback 2 activé");
  } else {
    console.log("Warning: OpenAI non disponible - Fallback basique seulement");
  }
} catch (error) {
  console.log("Warning: Erreur OpenAI:", error.message);
  openai = null;
}

console.log("Success: Marcel V8.0 Ultimate - Serveur Production Final");

// Sessions storage avec gestion des conversations
const sessions = new Map();

// Base de données des clients connus avec leurs préférences
const knownClients = new Map([
  ['+14189510161', {
    name: 'François',
    preferredService: 'barbe',
    preferredBarber: 'Marco',
    lastVisit: '2025-01-10',
    notes: 'Aime les finitions précises'
  }],
  ['+15141234567', {
    name: 'Jean-Pierre', 
    preferredService: 'coupe',
    preferredBarber: 'Marco',
    lastVisit: '2025-01-05',
    notes: 'Coupe classique, jamais trop court'
  }],
  ['+15149876543', {
    name: 'Michel',
    preferredService: 'coupe et barbe',
    preferredBarber: 'Julie', 
    lastVisit: '2024-12-20',
    notes: 'Package complet homme'
  }],
  ['+14387654321', {
    name: 'Alexandre',
    preferredService: 'barbe',
    preferredBarber: 'Marco',
    lastVisit: '2025-01-08', 
    notes: 'Style moderne, barbe bien taillée'
  }],
  ['+15147891234', {
    name: 'David',
    preferredService: 'coupe',
    preferredBarber: 'Sarah',
    lastVisit: '2024-12-15',
    notes: 'Coupes tendance, aime essayer de nouveaux styles'
  }]
]);

// Barbiers disponibles
const availableBarbers = ['Marco', 'Julie', 'Sarah'];

// Marcel ULTRA intelligent response function - Hybride Claude + Fallback
async function generateMarcelResponse(userInput, sessionId = null, phoneNumber = null) {
  // Timeout pour éviter les attentes trop longues
  const AI_TIMEOUT = 5000; // 5 secondes max
  // Vérifier si c'est un client connu
  let clientInfo = null;
  let isKnownNumber = false;
  
  if (phoneNumber && knownClients.has(phoneNumber)) {
    clientInfo = knownClients.get(phoneNumber);
    isKnownNumber = true;
  }
  
  // Récupérer et analyser le contexte COMPLET de la session
  let sessionContext = "";
  let knownService = "", knownDate = "", knownTime = "", knownBarber = "", confirmedClient = "";
  
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    const allMessages = session.messages.map(m => m.content).join(' ').toLowerCase();
    
    // Extraire les informations déjà connues
    if (allMessages.includes('barbe') || allMessages.includes('moustache')) {
      knownService = "barbe/moustache (35$)";
    } else if (allMessages.includes('coupe') && allMessages.includes('barbe')) {
      knownService = "coupe et barbe (75$)";
    } else if (allMessages.includes('coupe')) {
      knownService = "coupe (45$)";
    } else if (allMessages.includes('coloration')) {
      knownService = "coloration (95$)";
    }
    
    // Extraire le barbier choisi
    availableBarbers.forEach(barber => {
      if (allMessages.includes(barber.toLowerCase())) {
        knownBarber = barber;
      }
    });
    
    // Extraire le nom du client confirmé
    if (clientInfo) {
      availableBarbers.concat([clientInfo.name.toLowerCase()]).forEach(name => {
        if (allMessages.includes(name.toLowerCase())) {
          confirmedClient = clientInfo.name;
        }
      });
    }
    
    if (allMessages.includes('demain')) {
      knownDate = "demain";
    } else if (allMessages.includes('lundi')) {
      knownDate = "lundi";
    } else if (allMessages.includes('mardi')) {
      knownDate = "mardi";
    } else if (allMessages.includes('mercredi')) {
      knownDate = "mercredi";
    } else if (allMessages.includes('jeudi')) {
      knownDate = "jeudi";
    } else if (allMessages.includes('vendredi')) {
      knownDate = "vendredi";
    } else if (allMessages.includes('samedi')) {
      knownDate = "samedi";
    }
    
    if (allMessages.includes('14')) {
      knownTime = "14h";
    } else if (allMessages.includes('15')) {
      knownTime = "15h";
    } else if (allMessages.includes('16')) {
      knownTime = "16h";
    } else if (allMessages.match(/\d+h\d*/)) {
      const timeMatch = allMessages.match(/(\d+h\d*)/);
      if (timeMatch) knownTime = timeMatch[1];
    }
    
    sessionContext = `\nINFORMATIONS DÉJÀ CONNUES:
- Service: ${knownService || "NON SPÉCIFIÉ"}
- Date: ${knownDate || "NON SPÉCIFIÉE"}  
- Heure: ${knownTime || "NON SPÉCIFIÉE"}
- Barbier: ${knownBarber || "NON SPÉCIFIÉ"}
- Client confirmé: ${confirmedClient || "NON CONFIRMÉ"}

Historique conversation: ${session.messages.slice(-4).map(m => m.role === 'user' ? `Client: "${m.content}"` : `Marcel: "${m.content}"`).join(' | ')}`;
  }
  
  // Ajouter les informations du client connu si disponible
  if (isKnownNumber && clientInfo) {
    sessionContext += `\n\nCLIENT CONNU DÉTECTÉ:
- Nom: ${clientInfo.name}
- Service habituel: ${clientInfo.preferredService}
- Barbier préféré: ${clientInfo.preferredBarber}  
- Dernière visite: ${clientInfo.lastVisit}
- Notes: ${clientInfo.notes}
- Numéro reconnu mais identité à confirmer dans la conversation`;
  }

  // PRIORITÉ 1: Essayer Claude pour l'intelligence MAXIMUM
  if (anthropic) {
    try {
      console.log("Brain: Utilisation de Claude pour l'intelligence...");
      const message = await Promise.race([
        anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 120,
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: `Tu es Marcel, réceptionniste IA super jovial et efficace pour nos 3 salons à Québec!

NOS 3 SALONS FANTASTIQUES:
- SALON TONY - Marco (expert barbe traditionnelle, 45$)
- SALON GUSTAVE - Jessica (experte colorations, 55$)  
- INDEPENDENT BARBER - Alex (coupes modernes créatives, 50$)

SERVICES ET PRIX:
- Coupe homme: 35$ | Barbe: 20$ | Combo: 55$ | Coloration: 55$+
- Horaires généraux: Mardi-Vendredi 9h-18h, Samedi 9h-16h

${sessionContext}

Client vient de dire: "${userInput}"

LOGIQUE DE RÉPONSE VOCALE - SUPER IMPORTANT:
1. Si client reconnu: salue par nom avec enthousiasme et mentionne son salon/barbier habituel
2. Si nouveau client: demande d'abord quel SALON l'intéresse (Tony/Gustave/Independent)
3. Pour les RDV: demande JOUR PRÉFÉRÉ en premier (pas l'heure!)
4. Utilise les expressions québécoises: "Salut!", "Super!", "Parfait!", "À bientôt!"
5. IMPORTANT: Tu es au téléphone - JAMAIS d'emojis, symboles ou descriptions visuelles
6. Maximum 2 phrases dynamiques et précises
7. Ne redemande JAMAIS ce qui est déjà connu
8. Parle naturellement comme un humain sans mentionner de symboles

ORDRE LOGIQUE AMÉLIORÉ:
Service → SALON → JOUR PRÉFÉRÉ → HEURE → Nom → Confirmation

Ta réponse vocale naturelle et efficace:`,
            },
          ],
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI Timeout')), AI_TIMEOUT))
      ]);

      console.log("Success: Réponse Claude obtenue!");
      const rawResponse = message.content[0].text.trim();
      const response = removeAllEmojisForPhone(rawResponse);
      
      // Sauvegarder dans la session
      if (sessionId) {
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, { messages: [], createdAt: Date.now() });
        }
        const session = sessions.get(sessionId);
        session.messages.push({ role: 'user', content: userInput }, { role: 'assistant', content: response });
        // Garder seulement les 6 derniers messages
        if (session.messages.length > 6) {
          session.messages = session.messages.slice(-6);
        }
      }
      
      return response;
    } catch (error) {
      console.error("Warning: Claude API temporairement indisponible:", error.message);
      // Continuer vers fallback OpenAI
    }
  }

  // PRIORITÉ 2: Fallback OpenAI si Claude indisponible
  if (openai) {
    try {
      console.log("Brain: Utilisation d'OpenAI pour l'intelligence...");
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          max_tokens: 80,
          temperature: 0.7,
          messages: [
            {
              role: "user",
            content: `Tu es Marcel, réceptionniste professionnel d'Académie Précision au Québec. Tu es poli, efficace et respectueux.

Services & Prix:
- Coupe homme: 45$ (30-45min)
- Coupe dame: 65$ (45-60min)  
- Coloration: 95$ (90-120min)
- Barbe/moustache: 35$ (20min)
- Styling/mise en plis: 40$ (30min)
- Package complet homme: 75$ (60min)

Horaires: Lun-Ven: 9h-18h, Samedi: 8h-17h, Dimanche: 10h-16h
Équipe: Marco (spécialisé homme), Julie (coloration experte), Sarah (coupes modernes)

${sessionContext}

Client vient de dire: "${userInput}"

RÈGLES ABSOLUES:
1. Si CLIENT CONNU DÉTECTÉ mais "Client confirmé: NON CONFIRMÉ" → demande "À qui ai-je le plaisir de parler?"
2. Si client confirmé ET c'est un habitué → salue amicalement: "Salut [nom]! [Service habituel] comme d'habitude?"
3. REGARDE les "INFORMATIONS DÉJÀ CONNUES" - NE REDEMANDE JAMAIS ce qui est connu
4. Pour un rendez-vous complet, il faut: CLIENT + SERVICE + DATE + HEURE + BARBIER
5. Demande UN SEUL élément manquant à la fois dans cet ordre de priorité
6. Si Service NON SPÉCIFIÉ → demande le service
7. Si Barbier NON SPÉCIFIÉ → demande le barbier préféré  
8. Si Date NON SPÉCIFIÉE → demande la date
9. Si Heure NON SPÉCIFIÉE → demande l'heure
10. Si TOUT est connu → confirme le rendez-vous complet avec barbier
11. Maximum 1-2 phrases courtes et amicales`,
            },
          ],
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI Timeout')), AI_TIMEOUT))
      ]);

      console.log("Success: Réponse OpenAI obtenue!");
      const rawResponse = completion.choices[0].message.content.trim();
      const response = removeAllEmojisForPhone(rawResponse);
      
      // Sauvegarder dans la session
      if (sessionId) {
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, { messages: [], createdAt: Date.now() });
        }
        const session = sessions.get(sessionId);
        session.messages.push({ role: 'user', content: userInput }, { role: 'assistant', content: response });
        // Garder seulement les 6 derniers messages
        if (session.messages.length > 6) {
          session.messages = session.messages.slice(-6);
        }
      }
      
      return response;
    } catch (error) {
      console.error("Warning: OpenAI API temporairement indisponible:", error.message);
      // Continuer vers fallback basique
    }
  }

  // PRIORITÉ 3: Fallback intelligent si toutes les IA sont indisponibles
  console.log("Cycle: Mode fallback intelligent activé avec contexte:", {knownService, knownDate, knownTime, isKnownNumber, clientName: clientInfo?.name});
  const input = userInput ? userInput.toLowerCase() : "";

  // Utiliser les informations déjà extraites
  const hasService = knownService !== "";
  const hasDate = knownDate !== "";
  const hasTime = knownTime !== "";
  
  // Si c'est un numéro connu au début de conversation, demander l'identité
  if (isKnownNumber && clientInfo && !confirmedClient && (input.includes("salut") || input.includes("bonjour") || input.includes("allo"))) {
    return "À qui ai-je le plaisir de parler?";
  }

  if (input.includes("rendez-vous") || input.includes("réserver") || input.includes("appointment")) {
    if (hasService && hasDate && hasTime) {
      return "Parfait! Tout est confirmé. À bientôt!";
    }
    if (hasService) {
      return "Parfait pour le service. Pour quelle date?";
    }
    return "Parfait! Quel service vous intéresse?";
  }

  if (input.includes("barbe") || input.includes("moustache")) {
    if (hasDate && hasTime) {
      return "Parfait! Barbe confirmée à 35$. À bientôt!";
    }
    if (hasDate) {
      return "Très bien pour la barbe à 35$. À quelle heure?";
    }
    return "Parfait pour la barbe à 35$. Pour quelle date?";
  }

  if (input.includes("coupe") || input.includes("cheveux") || input.includes("coiffure")) {
    if (hasDate && hasTime) {
      return "Parfait! Coupe confirmée. À bientôt!";
    }
    if (hasDate) {
      return "Très bien pour la coupe. À quelle heure?";
    }
    return "Parfait pour la coupe. Pour quelle date?";
  }

  if (input.includes("14") || input.includes("15") || input.includes("16") || input.includes("heure")) {
    if (hasService && hasDate) {
      return "Parfait! Rendez-vous confirmé. On vous attend!";
    }
    if (hasService) {
      return "Très bien pour l'heure. Pour quelle date?";
    }
    return "D'accord pour l'heure. Quel service vous intéresse?";
  }

  if (input.includes("demain") || input.includes("lundi") || input.includes("mardi") || input.includes("mercredi") || input.includes("jeudi") || input.includes("vendredi") || input.includes("samedi")) {
    if (hasService && hasTime) {
      return "Parfait! Rendez-vous confirmé. À bientôt!";
    }
    if (hasService) {
      return "Très bien pour la date. À quelle heure?";
    }
    return "D'accord pour la date. Quel service vous intéresse?";
  }

  if (input.includes("françois")) {
    if (isKnownNumber && clientInfo && clientInfo.name === "François") {
      return "Salut François! Une barbe comme d'habitude avec Marco?";
    }
    return "Bonjour François! Que puis-je faire pour vous?";
  }
  
  if (input.includes("jean")) {
    if (isKnownNumber && clientInfo && clientInfo.name === "Jean-Pierre") {
      return "Salut Jean-Pierre! Une coupe avec Marco comme d'habitude?";
    }
    return "Bonjour Jean! Que puis-je faire pour vous?";
  }
  
  if (input.includes("michel")) {
    if (isKnownNumber && clientInfo && clientInfo.name === "Michel") {
      return "Salut Michel! Package complet avec Julie comme d'habitude?";
    }
    return "Bonjour Michel! Que puis-je faire pour vous?";
  }

  if (input.includes("arrête") || input.includes("stop") || input.includes("assez")) {
    return "Compris! Tout est noté François. Votre rendez-vous est confirmé. Bonne journée!";
  }

  if (input.includes("bonjour") || input.includes("salut") || input.includes("allo")) {
    if (isKnownNumber && clientInfo) {
      return "À qui ai-je le plaisir de parler?";
    }
    return "Bonjour! Ici Marcel d'Académie Précision. Comment puis-je vous aider aujourd'hui?";
  }

  if (input.includes("merci") || input.includes("parfait") || input.includes("ok") || input.includes("oui")) {
    return "Avec plaisir! Votre rendez-vous est confirmé. À bientôt chez Académie Précision!";
  }

  // Si on a déjà toutes les infos, conclure
  if (hasService && hasDate && hasTime) {
    return "Parfait François! Tout est confirmé. Merci de votre confiance!";
  }

  // Réponse engageante par défaut
  return "Je note ça. Quel service vous intéresse? Coupe, barbe ou coloration?";
}

// Routes principales
app.get("/", (req, res) => {
  const statusIcon = anthropic ? "Connected" : "Fallback";
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Ultimate Final Corrigé</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 800px;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .status { font-size: 1.2em; margin: 10px 0; }
        .endpoints { margin-top: 30px; }
        .endpoint { 
          background: rgba(255,255,255,0.2); 
          margin: 10px 0; 
          padding: 15px; 
          border-radius: 10px; 
          text-align: left;
        }
        .fixed-badge {
          background: #28a745;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          margin: 10px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Marcel V8.0 Ultimate Final</h1>
        <div class="fixed-badge">BOUCLE CORRIGÉE</div>
        <div class="fixed-badge">VOIX MASCULINE</div>
        
        <div class="status">Status: ACTIVE & READY</div>
        <div class="status">Version: 8.0.0 Final Edition - FIXED</div>
        <div class="status">Timestamp: ${new Date().toISOString()}</div>
        
        <div class="endpoints">
          <h3>Endpoints Disponibles:</h3>
          <div class="endpoint">
            <strong>POST /webhook/twilio</strong><br>
            <small>Webhook principal pour appels Twilio avec voix masculine et logique intelligente</small>
          </div>
          <div class="endpoint">
            <strong>GET /webhook/twilio/test</strong><br>
            <small>Endpoint de test Twilio</small>
          </div>
          <div class="endpoint">
            <strong>GET /test-marcel</strong><br>
            <small>Dashboard de test complet</small>
          </div>
          <div class="endpoint">
            <strong>POST /test-claude</strong><br>
            <small>Test direct de l'IA Marcel</small>
          </div>
        </div>
        
        <div style="margin-top: 30px; background: rgba(40, 167, 69, 0.2); padding: 20px; border-radius: 10px;">
          <h3>Corrections Apportées:</h3>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>Voix masculine: Polly.Liam-Neural</li>
            <li>Gestion mémoire de conversation</li>
            <li>Logique anti-boucle intelligente</li>
            <li>Conclusion automatique quand tout est noté</li>
            <li>Réponses contextuelles optimisées</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Dashboard de test avancé
app.get("/test-marcel", (req, res) => {
  const claudeStatus = anthropic ? "Connected" : "Fallback";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marcel V8.0 Ultimate Dashboard - CORRIGÉ</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .fixed-badge { background: #28a745; color: white; padding: 6px 12px; border-radius: 15px; font-size: 0.8em; margin: 5px; display: inline-block; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .test-button { 
          background: #28a745; 
          color: white; 
          padding: 12px 24px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer;
          margin: 5px;
        }
        .test-button:hover { background: #218838; }
        .conversation-test { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .test-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Marcel V8.0 Ultimate Dashboard</h1>
          <div class="fixed-badge">BOUCLE CORRIGÉE</div>
          <div class="fixed-badge">VOIX MASCULINE</div>
          <div class="fixed-badge">MÉMOIRE ACTIVE</div>
          <p>Réceptionniste IA pour Académie Précision - Version Finale Corrigée</p>
        </div>
        
        <div class="grid">
          <div class="card">
            <div class="status">
              <h3>Status Système</h3>
              <p><strong>Version:</strong> 8.0.0 Final Edition - FIXED</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Claude API:</strong> ${claudeStatus}</p>
              <p><strong>Statut:</strong> PRODUCTION READY</p>
              <p><strong>Corrections:</strong> Boucle + Voix + Mémoire</p>
            </div>
          </div>
          
          <div class="card">
            <h3>Endpoints API</h3>
            <div class="endpoint">
              <strong>POST /webhook/twilio</strong><br>
              <small>Webhook avec voix masculine et anti-boucle</small>
            </div>
            <div class="endpoint">
              <strong>GET /webhook/twilio/test</strong><br>
              <small>Test de connectivité Twilio</small>
            </div>
            <div class="endpoint">
              <strong>POST /test-claude</strong><br>
              <small>Test direct avec mémoire de conversation</small>
            </div>
          </div>
          
          <div class="card">
            <h3>Test Marcel</h3>
            <p><strong>Numéro:</strong> +1 (581) 710-1240</p>
            <p><strong>Corrections:</strong></p>
            <ul style="font-size: 0.9em;">
              <li>Voix masculine (Liam-Neural)</li>
              <li>Mémoire de conversation active</li>
              <li>Logique anti-boucle intelligente</li>
              <li>Conclusion automatique</li>
            </ul>
            <button class="test-button" onclick="testWebhook()">Test Webhook</button>
            <button class="test-button" onclick="testConversation()">Test Conversation</button>
            
            <div class="conversation-test">
              <h4>Test Conversation Marcel:</h4>
              <input type="text" class="test-input" id="testMessage" placeholder="Tapez votre message à Marcel..." />
              <button class="test-button" onclick="sendTestMessage()">Envoyer à Marcel</button>
            </div>
            
            <div id="test-results" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; display: none;"></div>
          </div>
        </div>
      </div>
      
      <script>
        let sessionId = 'test-' + Date.now();
        
        function testWebhook() {
          showTestResult('Test webhook en cours...', 'info');
          fetch('/webhook/twilio/test')
            .then(response => response.json())
            .then(data => showTestResult('Webhook OK: ' + data.message, 'success'))
            .catch(error => showTestResult('Erreur: ' + error.message, 'error'));
        }
        
        function testConversation() {
          showTestResult('Test conversation complète...', 'info');
          const messages = [
            'Bonjour Marcel',
            'Je voudrais un rendez-vous',
            'Une coupe homme',
            'Demain à 14h30'
          ];
          
          let results = [];
          messages.reduce((promise, message, index) => {
            return promise.then(() => {
              return fetch('/test-claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, sessionId: sessionId + '_test' })
              })
              .then(response => response.json())
              .then(data => {
                results.push((index + 1) + '. "' + message + '" → "' + data.response + '"');
                if (index === messages.length - 1) {
                  showTestResult('Test Conversation:\\n' + results.join('\\n'), 'success');
                }
              });
            });
          }, Promise.resolve());
        }
        
        function sendTestMessage() {
          const message = document.getElementById('testMessage').value;
          if (!message.trim()) return;
          
          showTestResult('Marcel répond...', 'info');
          fetch('/test-claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, sessionId: sessionId })
          })
          .then(response => response.json())
          .then(data => {
            showTestResult('Marcel: "' + data.response + '"', 'success');
            document.getElementById('testMessage').value = '';
          })
          .catch(error => showTestResult('Erreur: ' + error.message, 'error'));
        }
        
        // Permettre Enter pour envoyer
        document.getElementById('testMessage').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') sendTestMessage();
        });
        
        function showTestResult(message, type) {
          const div = document.getElementById('test-results');
          div.style.display = 'block';
          div.innerHTML = message.replace(/\\n/g, '<br>');
          div.style.background = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
          div.style.color = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
        }
      </script>
    </body>
    </html>
  `);
});

// WEBHOOK TWILIO - Version finale optimisée SANS BOUCLE
app.post("/webhook/twilio", async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;

    console.log("Phone: Webhook Twilio:", { From, CallSid, SpeechResult });

    // Utiliser CallSid comme sessionId pour la mémoire
    const sessionId = `twilio_${CallSid}`;

    // Nouvel appel
    if (!SpeechResult) {
      // Vérifier si c'est un client connu pour personnaliser l'accueil
      let greeting = "Bonjour! Ici Marcel d'Académie Précision. Comment puis-je vous aider aujourd'hui?";
      
      if (knownClients.has(From)) {
        greeting = `Bonjour! Ici Marcel d'Académie Précision. À qui ai-je le plaisir de parler?`;
      }

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Liam-Neural" language="fr-CA">${greeting}</Say>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="3" timeout="6">
    </Gather>
    <Say voice="Polly.Liam-Neural" language="fr-CA">Désolé, je n'ai pas bien entendu. Rappellez-nous! Au revoir.</Say>
    <Hangup/>
</Response>`;

      return res.type("text/xml").send(twiml);
    }

    // Traiter la réponse vocale avec mémoire
    if (SpeechResult) {
      console.log("Mic: Parole reçue:", SpeechResult);
      console.log("Debug: SessionId utilisé:", sessionId);
      console.log("Debug: Sessions actives:", Array.from(sessions.keys()));
      
      if (sessions.has(sessionId)) {
        console.log("Debug: Session trouvée avec", sessions.get(sessionId).messages.length, "messages");
      } else {
        console.log("Debug: Nouvelle session créée");
      }

      const response = await generateMarcelResponse(SpeechResult, sessionId, From);

      // Vérifier si la conversation doit se terminer - SEULEMENT si rendez-vous COMPLET
      const hasAllInfo = sessionId && sessions.has(sessionId) && (() => {
        const session = sessions.get(sessionId);
        const context = session.messages.map(m => m.content).join(' ').toLowerCase();
        const hasService = context.includes('coupe') || context.includes('barbe') || context.includes('coloration');
        const hasDate = context.includes('demain') || context.includes('lundi') || context.includes('mardi') || context.includes('mercredi') || context.includes('jeudi') || context.includes('vendredi') || context.includes('samedi');
        const hasTime = context.includes('14') || context.includes('15') || context.includes('16') || context.includes('heure') || context.includes('h');
        const hasBarber = availableBarbers.some(barber => context.includes(barber.toLowerCase()));
        const hasClient = knownClients.has(From) && (context.includes('françois') || context.includes('jean') || context.includes('michel') || context.includes('alexandre') || context.includes('david'));
        return hasService && hasDate && hasTime && hasBarber && hasClient;
      })();
      
      const shouldEnd = hasAllInfo && (
        response.toLowerCase().includes('rendez-vous confirmé') || 
        response.toLowerCase().includes('tout est confirmé') ||
        response.toLowerCase().includes('à bientôt')
      );

      if (shouldEnd) {
        // Messages de fin variés et professionnels
        const endings = [
          "On vous attend avec un bon café!",
          "Au plaisir de vous accueillir!",
          "Marco sera ravi de s'occuper de vous!",
          "On a hâte de vous voir!",
          "Merci de votre confiance!"
        ];
        const randomEnding = endings[Math.floor(Math.random() * endings.length)];
        
        // Terminer la conversation sans demander autre chose
        const finalTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Liam-Neural" language="fr-CA">${response}</Say>
    <Pause length="1"/>
    <Say voice="Polly.Liam-Neural" language="fr-CA">${randomEnding} Au revoir!</Say>
    <Hangup/>
</Response>`;
        
        // Nettoyer la session
        if (sessions.has(sessionId)) {
          sessions.delete(sessionId);
        }
        
        return res.type("text/xml").send(finalTwiml);
      }

      // Continuer la conversation seulement si nécessaire
      const continueTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Liam-Neural" language="fr-CA">${response}</Say>
    <Pause length="1"/>
    <Gather input="speech" action="/webhook/twilio" method="POST" language="fr-CA" speechTimeout="3" timeout="5">
    </Gather>
    <Say voice="Polly.Liam-Neural" language="fr-CA">Parfait! Merci de votre appel. Au revoir!</Say>
    <Hangup/>
</Response>`;

      return res.type("text/xml").send(continueTwiml);
    }
  } catch (error) {
    console.error("Error: Erreur webhook Twilio:", error);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Liam-Neural" language="fr-CA">Désolé, problème technique. Rappellez dans quelques minutes.</Say>
    <Hangup/>
</Response>`;

    res.type("text/xml").send(errorTwiml);
  }
});

// Test endpoint Twilio
app.get("/webhook/twilio/test", (req, res) => {
  res.json({
    status: "Marcel V8.0 Ultimate Final - Twilio Webhook Ready",
    version: "8.0.0-final-fixed",
    timestamp: new Date().toISOString(),
    message: "Webhook Twilio fonctionnel - Version Finale Corrigée!",
    fixes: [
      "Voix masculine (Polly.Liam-Neural)",
      "Anti-boucle intelligent", 
      "Mémoire de conversation",
      "Conclusion automatique"
    ],
    endpoints: {
      voice: "POST /webhook/twilio",
      test: "GET /webhook/twilio/test",
      dashboard: "GET /test-marcel",
      claude_test: "POST /test-claude"
    },
  });
});

// Test endpoint Claude avec mémoire (nouveau)
app.post("/test-claude", async (req, res) => {
  try {
    const { message, sessionId, phoneNumber } = req.body;
    const response = await generateMarcelResponse(message || "Test", sessionId, phoneNumber);
    res.json({
      status: "success",
      input: message,
      response: response,
      sessionId: sessionId,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "8.0.0-final-fixed",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    claude: anthropic ? "connected" : "fallback",
    sessions: sessions.size,
    fixes: [
      "Voice: Polly.Liam-Neural (masculine)",
      "Anti-loop logic implemented",
      "Session memory active",
      "Auto-conclusion enabled"
    ]
  });
});

// Nettoyage automatique des sessions (éviter memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    // Supprimer les sessions de plus de 1 heure
    if (now - session.createdAt > 3600000) {
      sessions.delete(sessionId);
    }
  }
}, 300000); // Vérifier toutes les 5 minutes

// Start server
app.listen(PORT, () => {
  console.log(`Rocket: Marcel V8.0 Ultimate Final démarré sur le port ${PORT}`);
  console.log(`Phone: Endpoint Twilio ready: /webhook/twilio`);
  console.log(`Web: Dashboard: /test-marcel`);
  console.log(`Health: Health check: /health`);
  console.log(`Test: Test Claude: /test-claude`);
  console.log(`Success: Quebec-IA-Labs V8.0 FINAL READY - FIXED!`);
  console.log(`Tools: Corrections: Voix masculine + Anti-boucle + Mémoire`);
});