// 🔍 CONTEXT ANALYZER - Analyseur de Contexte Marcel
// Analyse intelligente des entrées utilisateur pour extraire informations
// Version: 1.0.0-dev

class ContextAnalyzer {
  constructor() {
    this.patterns = this.initializePatterns();
    this.contextHistory = new Map();
    console.log('🔍 Context Analyzer initialisé');
  }

  // 🎯 Patterns de reconnaissance québécoise
  initializePatterns() {
    return {
      services: {
        coupe_homme: [
          'coupe homme', 'coupe pour homme', 'coupe masculine',
          'trim homme', 'coupe de cheveux homme'
        ],
        coupe_femme: [
          'coupe femme', 'coupe pour femme', 'coupe féminine',
          'coupe de cheveux femme', 'coupe dame'
        ],
        coupe_barbe: [
          'coupe et barbe', 'coupe barbe', 'coupe + barbe',
          'package complet', 'cheveux et barbe'
        ],
        barbe: [
          'barbe', 'taille barbe', 'trim barbe', 'rasage',
          'juste la barbe', 'seulement barbe'
        ],
        coloration: [
          'coloration', 'couleur', 'teinture', 'mèches',
          'highlights', 'balayage'
        ]
      },

      dates: {
        mardi: ['mardi', 'mar', 'tuesday'],
        mercredi: ['mercredi', 'mer', 'wednesday'],
        jeudi: ['jeudi', 'jeu', 'thursday'],
        vendredi: ['vendredi', 'ven', 'friday'],
        samedi: ['samedi', 'sam', 'saturday'],
        aujourd_hui: ['aujourd\'hui', 'à matin', 'this morning', 'ce matin'],
        demain: ['demain', 'tomorrow', 'à soir', 'ce soir']
      },

      heures: {
        matin: ['matin', 'à matin', 'morning', '9h', '10h', '11h'],
        midi: ['midi', 'dîner', 'lunch', '12h', '13h'],
        apres_midi: ['après-midi', 'afternoon', '14h', '15h', '16h', '17h'],
        soir: ['soir', 'à soir', 'evening', '18h', '19h'],
        specifique: ['14h', '16h', '2h', '4h', '14h00', '16h00']
      },

      intentions: {
        booking: [
          'rendez-vous', 'rdv', 'appointment', 'réserver',
          'prendre', 'booker', 'j\'aimerais', 'je veux',
          'j\'ai besoin', 'peux-tu', 'pourrais-tu'
        ],
        pricing: [
          'prix', 'coût', 'combien', 'tarif', 'price',
          'ça coûte', 'c\'est combien', '$'
        ],
        hours: [
          'horaires', 'ouvert', 'fermé', 'heures',
          'quand êtes-vous', 'disponible quand'
        ],
        cancel_modify: [
          'annuler', 'changer', 'modifier', 'déplacer',
          'reporter', 'cancel', 'reschedule'
        ]
      },

      expressions_quebec: [
        'c\'est-tu', 'peux-tu', 'pourrais-tu', 'j\'aimerais ça',
        'ça fait-tu', 'à matin', 'à soir', 'bin correct',
        'pas pire', 'en masse', 'right away'
      ],

      barbiers: {
        marco: ['marco', 'Marc'],
        jessica: ['jessica', 'Jess'],
        alex: ['alex', 'alexandre', 'dubois']
      },

      salons: {
        tony: ['salon tony', 'tony', 'avec marco'],
        gustave: ['salon gustave', 'gustave', 'avec jessica'],
        independent: ['independent barber', 'independent', 'avec alex']
      }
    };
  }

  // 🧠 Analyse principale d'entrée utilisateur
  analyzeUserInput(input, previousContext = {}) {
    const analysis = {
      originalInput: input,
      normalizedInput: this.normalizeInput(input),
      extractedFields: {},
      detectedIntent: 'general',
      confidence: 0,
      missingFields: [],
      nextAction: 'ask_clarification',
      contextUpdates: {},
      recommendations: []
    };

    try {
      // 1. Extraire les champs
      analysis.extractedFields = this.extractFields(input, previousContext);
      
      // 2. Détecter l'intention
      analysis.detectedIntent = this.detectIntent(input);
      
      // 3. Calculer confidence
      analysis.confidence = this.calculateConfidence(analysis);
      
      // 4. Identifier champs manquants
      analysis.missingFields = this.identifyMissingFields(analysis.extractedFields, analysis.detectedIntent);
      
      // 5. Déterminer prochaine action
      analysis.nextAction = this.determineNextAction(analysis);
      
      // 6. Générer recommandations
      analysis.recommendations = this.generateRecommendations(analysis);

      console.log(`[CONTEXT] Analyse: ${input} → Intent: ${analysis.detectedIntent} (${Math.round(analysis.confidence * 100)}%)`);
      
      return analysis;
      
    } catch (error) {
      console.error('[CONTEXT] Erreur analyse:', error);
      return {
        ...analysis,
        error: error.message,
        confidence: 0
      };
    }
  }

  // 🔤 Normaliser l'entrée
  normalizeInput(input) {
    return input.toLowerCase()
      .replace(/['']/g, '\'')  // Normaliser apostrophes
      .replace(/\s+/g, ' ')    // Espaces multiples
      .trim();
  }

  // 📋 Extraire les champs importants
  extractFields(input, previousContext) {
    const normalized = this.normalizeInput(input);
    const fields = { ...previousContext };

    // Service
    if (!fields.service) {
      for (const [service, patterns] of Object.entries(this.patterns.services)) {
        if (patterns.some(pattern => normalized.includes(pattern))) {
          fields.service = service;
          fields.serviceConfidence = 0.9;
          break;
        }
      }
    }

    // Date
    if (!fields.date) {
      for (const [date, patterns] of Object.entries(this.patterns.dates)) {
        if (patterns.some(pattern => normalized.includes(pattern))) {
          fields.date = date;
          fields.dateConfidence = 0.8;
          break;
        }
      }
    }

    // Heure
    if (!fields.time) {
      for (const [time, patterns] of Object.entries(this.patterns.heures)) {
        if (patterns.some(pattern => normalized.includes(pattern))) {
          fields.time = time;
          fields.timeConfidence = 0.8;
          break;
        }
      }
    }

    // Barbier préféré
    if (!fields.barbier) {
      for (const [barbier, patterns] of Object.entries(this.patterns.barbiers)) {
        if (patterns.some(pattern => normalized.includes(pattern))) {
          fields.barbier = barbier;
          fields.barbierConfidence = 0.9;
          break;
        }
      }
    }

    // Salon préféré (NOUVEAU)
    if (!fields.salon) {
      for (const [salon, patterns] of Object.entries(this.patterns.salons)) {
        if (patterns.some(pattern => normalized.includes(pattern))) {
          fields.salon = salon;
          fields.salonConfidence = 0.9;
          break;
        }
      }
    }

    // Nom (extraction basique)
    if (!fields.name && this.looksLikeName(input)) {
      fields.name = this.extractName(input);
      fields.nameConfidence = 0.6;
    }

    return fields;
  }

  // 🎯 Détecter l'intention principale
  detectIntent(input) {
    const normalized = this.normalizeInput(input);
    let maxScore = 0;
    let detectedIntent = 'general';

    for (const [intent, patterns] of Object.entries(this.patterns.intentions)) {
      const score = patterns.reduce((acc, pattern) => {
        return acc + (normalized.includes(pattern) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    // Logique spéciale pour "oui/non"
    if (normalized.includes('oui') || normalized.includes('yes')) {
      return 'confirmation';
    }
    
    if (normalized.includes('non') || normalized.includes('no')) {
      return 'negation';
    }

    return detectedIntent;
  }

  // 📊 Calculer niveau de confiance
  calculateConfidence(analysis) {
    let confidence = 0;
    let factors = 0;

    // Intent confidence
    if (analysis.detectedIntent !== 'general') {
      confidence += 0.3;
    }
    factors++;

    // Fields confidence
    const extractedCount = Object.keys(analysis.extractedFields).length;
    confidence += (extractedCount / 6) * 0.5; // Max 6 fields
    factors++;

    // Quebec expressions bonus
    const quebecBonus = this.patterns.expressions_quebec.some(expr => 
      analysis.normalizedInput.includes(expr)
    ) ? 0.2 : 0;
    confidence += quebecBonus;

    return Math.min(confidence, 1.0);
  }

  // ❓ Identifier champs manquants selon l'intention
  identifyMissingFields(fields, intent) {
    const missing = [];

    if (intent === 'booking') {
      if (!fields.service) missing.push('service');
      if (!fields.date) missing.push('date');
      if (!fields.time) missing.push('time');
      if (!fields.name) missing.push('name');
    }

    return missing;
  }

  // ▶️ Déterminer prochaine action (AMÉLIORER: jour avant heure)
  determineNextAction(analysis) {
    const { detectedIntent, extractedFields, missingFields } = analysis;

    if (detectedIntent === 'booking') {
      if (missingFields.includes('service')) {
        return 'ask_service';
      } else if (!extractedFields.salon && !extractedFields.barbier) {
        return 'ask_salon_selection'; // NOUVEAU: choix salon d'abord
      } else if (missingFields.includes('date')) {
        return 'ask_preferred_day'; // AMÉLIORER: demander jour préféré
      } else if (missingFields.includes('time')) {
        return 'ask_time_with_day'; // AMÉLIORER: heure selon jour choisi
      } else if (missingFields.includes('name')) {
        return 'ask_name';
      } else {
        return 'confirm_booking_complete'; // AMÉLIORER: confirmation complète
      }
    }

    if (detectedIntent === 'pricing') {
      return 'provide_prices';
    }

    if (detectedIntent === 'hours') {
      return 'provide_hours';
    }

    if (detectedIntent === 'confirmation') {
      return 'process_confirmation';
    }

    return 'ask_clarification';
  }

  // 💡 Générer recommandations
  generateRecommendations(analysis) {
    const recommendations = [];

    // Recommandations selon confiance
    if (analysis.confidence < 0.5) {
      recommendations.push("Demander clarification - confiance faible");
    }

    // Recommandations selon champs manquants
    if (analysis.missingFields.length > 0) {
      recommendations.push(`Collecter: ${analysis.missingFields.join(', ')}`);
    }

    // Recommandations selon intention
    if (analysis.detectedIntent === 'booking' && analysis.confidence > 0.8) {
      recommendations.push("Procéder avec réservation - confiance élevée");
    }

    return recommendations;
  }

  // 🤖 Générer une réponse basée sur l'analyse et l'état de session (AMÉLIORÉ)
  generateResponse(session) {
    const extractedInfo = session.extractedInfo || {};
    
    // Analyser l'état actuel pour déterminer quelle question poser
    let response = "Salut! Je peux t'aider avec nos 3 salons: Tony (Marco), Gustave (Jessica) ou Independent Barber (Alex). Lequel t'intéresse?";

    // Si on a détecté une intention de réservation
    if (extractedInfo.service || extractedInfo.intent === 'booking') {
      // Mode réservation - demander ce qui manque avec logique améliorée
      if (!extractedInfo.service) {
        response = "Super! Quel service veux-tu? 💇‍♂️ Coupe homme, 💇‍♀️ coupe femme, 🧔 barbe, 🎨 combo ou coloration?";
      } else if (!extractedInfo.salon && !extractedInfo.barbier) {
        response = `Parfait pour ${extractedInfo.service}! Quel salon préfères-tu? 🔥 Tony (Marco-expert barbe), 💫 Gustave (Jessica-colorations) ou 🎨 Independent (Alex-modernes)?`;
      } else if (!extractedInfo.date) {
        response = `Excellent! Quel jour te conviendrait le mieux? Je suggère ${extractedInfo.preferredDay || 'mardi ou jeudi'} - ça marche pour toi?`;
      } else if (!extractedInfo.time) {
        response = `Super pour ${extractedInfo.date}! Tu préfères matin (9h-12h) ou après-midi (14h-17h)? On a des bonnes places!`;
      } else if (!extractedInfo.name) {
        response = `Excellent! Je confirme ${extractedInfo.service} ${extractedInfo.date} ${extractedInfo.time}. Ton nom complet?`;
      } else {
        response = `Parfait ${extractedInfo.name}! 🎉 RDV confirmé: ${extractedInfo.service} ${extractedInfo.date} ${extractedInfo.time}. À bientôt!`;
      }
    } else if (extractedInfo.intent === 'pricing') {
      response = "Nos prix: Coupe 35$, Barbe 20$, Combo 55$, Coloration 55$+. Ça t'intéresse pour un RDV? 😊";
    } else if (extractedInfo.intent === 'hours') {
      response = "On est ouverts mardi-vendredi 9h-18h, samedi 9h-16h. Fermé weekend! Un RDV t'intéresse?";
    } else {
      response = "Salut! Marcel ici! 😄 Je peux t'aider avec les RDV, prix et horaires. Qu'est-ce que tu cherches?";
    }

    return response;
  }

  // 👤 Vérifier si ressemble à un nom
  looksLikeName(input) {
    const words = input.trim().split(' ');
    if (words.length < 1 || words.length > 4) return false;
    
    // Vérifier si contient des caractères de nom
    return words.every(word => 
      /^[A-Za-zÀ-ÿ\-'\.]{2,}$/.test(word) && 
      word[0] === word[0].toUpperCase()
    );
  }

  // 📝 Extraire nom (basique)
  extractName(input) {
    const words = input.trim().split(' ');
    return words.slice(0, 2).join(' '); // Max 2 mots pour nom
  }

  // 🧠 Obtenir recommandations pour l'UI
  getRecommendations(analysis) {
    const suggestions = [];

    switch (analysis.nextAction) {
      case 'ask_service':
        suggestions.push('Proposer: Coupe homme, Coupe femme, Barbe, Coloration');
        break;
      case 'ask_date':
        suggestions.push('Proposer: Mardi, Jeudi (disponibilités)');
        break;
      case 'ask_time':
        suggestions.push('Proposer: 14h avec Marco, 16h avec Jessica');
        break;
      case 'confirm_booking':
        suggestions.push('Résumer tous les détails avant confirmation');
        break;
    }

    return suggestions;
  }

  // 📊 Obtenir statistiques d'analyse
  getAnalysisStats() {
    return {
      totalAnalyses: this.contextHistory.size,
      successfulExtractions: Array.from(this.contextHistory.values())
        .filter(ctx => ctx.confidence > 0.7).length,
      averageConfidence: this.calculateAverageConfidence(),
      topIntents: this.getTopIntents(),
      timestamp: new Date().toISOString()
    };
  }

  // 🔢 Calculer confiance moyenne
  calculateAverageConfidence() {
    const confidences = Array.from(this.contextHistory.values())
      .map(ctx => ctx.confidence);
    
    if (confidences.length === 0) return 0;
    
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  // 🏆 Obtenir top intentions
  getTopIntents() {
    const intents = {};
    
    Array.from(this.contextHistory.values()).forEach(ctx => {
      intents[ctx.detectedIntent] = (intents[ctx.detectedIntent] || 0) + 1;
    });

    return Object.entries(intents)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  // 💾 Sauvegarder contexte
  saveContext(sessionId, analysis) {
    this.contextHistory.set(sessionId, {
      ...analysis,
      timestamp: Date.now()
    });

    // Nettoyer anciennes sessions (>1h)
    this.cleanOldSessions();
  }

  // 🧹 Nettoyer anciennes sessions
  cleanOldSessions() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [sessionId, context] of this.contextHistory.entries()) {
      if (now - context.timestamp > oneHour) {
        this.contextHistory.delete(sessionId);
      }
    }
  }
}

// 🧪 Auto-test si exécuté directement
if (require.main === module) {
  console.log('🔍 TEST Context Analyzer');
  
  const analyzer = new ContextAnalyzer();
  
  const testCases = [
    "J'aimerais une coupe homme mardi matin",
    "C'est combien pour la barbe?",
    "Êtes-vous ouverts à soir?",
    "Peux-tu me booker avec Jessica jeudi 16h?",
    "Jean Tremblay"
  ];
  
  testCases.forEach(test => {
    console.log(`\n📝 Test: "${test}"`);
    const result = analyzer.analyzeUserInput(test);
    console.log(`   Intent: ${result.detectedIntent} (${Math.round(result.confidence * 100)}%)`);
    console.log(`   Fields: ${JSON.stringify(result.extractedFields)}`);
    console.log(`   Missing: ${result.missingFields.join(', ') || 'None'}`);
    console.log(`   Action: ${result.nextAction}`);
  });
}

module.exports = ContextAnalyzer;