// 🧠 MARCEL TRAINER - FORMATEUR IA AUTOMATISÉ
// Système d'entraînement intelligent pour Valet-IA Marcel
// Version: 1.0.0 - Québécois Pro

const fs = require('fs');
const path = require('path');

class MarcelTrainer {
  constructor() {
    this.trainingResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      errors: [],
      improvements: [],
      testHistory: []
    };
    
    this.conversationMemory = new Map(); // Mémoire des conversations
    this.currentBookingData = {}; // Données RDV en cours
    
    console.log('🧠 Marcel Trainer initialisé - Prêt à former notre Valet-IA!');
  }

  // 🎯 SCÉNARIOS DE TEST EN FRANÇAIS QUÉBÉCOIS
  getTestScenarios() {
    return [
      // 👋 SALUTATIONS BASIQUES
      {
        id: 'greeting_1',
        category: 'salutations',
        input: 'Bonjour',
        expectedKeywords: ['bonjour', 'aider', 'rendez-vous', 'prix', 'horaires'],
        description: 'Salutation simple'
      },
      {
        id: 'greeting_2', 
        category: 'salutations',
        input: 'Allô, c\'est-tu ouvert?',
        expectedKeywords: ['ouvert', 'horaires', 'oui'],
        description: 'Question d\'ouverture québécoise'
      },
      {
        id: 'greeting_3',
        category: 'salutations', 
        input: 'Salut, j\'aimerais savoir vos prix',
        expectedKeywords: ['prix', 'coupe', 'barbe', 'dollars'],
        description: 'Demande de prix directe'
      },

      // 📅 DEMANDES DE RENDEZ-VOUS
      {
        id: 'booking_1',
        category: 'rendez_vous',
        input: 'J\'aimerais prendre un rendez-vous',
        expectedKeywords: ['rendez-vous', 'type', 'service', 'coupe', 'barbe'],
        description: 'Demande RDV basique - doit demander le type'
      },
      {
        id: 'booking_2',
        category: 'rendez_vous',
        input: 'Je veux un rdv pour une coupe homme',
        expectedKeywords: ['coupe homme', 'date', 'quand', 'disponible'],
        description: 'Type spécifié - doit demander date'
      },
      {
        id: 'booking_3',
        category: 'rendez_vous',
        input: 'Rdv coupe et barbe mercredi après-midi',
        expectedKeywords: ['coupe', 'barbe', 'mercredi', 'heure', 'précise'],
        description: 'Service + jour - doit demander heure précise'
      },

      // 🎯 TYPES DE SERVICES SPÉCIFIQUES
      {
        id: 'service_1',
        category: 'types_services',
        input: 'Une coupe pour femme',
        expectedKeywords: ['coupe femme', 'date', 'disponible'],
        description: 'Coupe femme - ne doit plus redemander le type'
      },
      {
        id: 'service_2',
        category: 'types_services', 
        input: 'Juste une barbe s\'il vous plaît',
        expectedKeywords: ['barbe', 'taille', 'date', 'quand'],
        description: 'Service barbe seulement'
      },
      {
        id: 'service_3',
        category: 'types_services',
        input: 'Coloration pour ma blonde',
        expectedKeywords: ['coloration', 'femme', 'date', 'disponible'],
        description: 'Service coloration'
      },

      // 💰 QUESTIONS DE PRIX
      {
        id: 'price_1',
        category: 'prix',
        input: 'Combien ça coûte une coupe?',
        expectedKeywords: ['35 dollars', 'coupe homme', 'rendez-vous'],
        description: 'Prix coupe basique'
      },
      {
        id: 'price_2',
        category: 'prix',
        input: 'Vos tarifs pour coupe et barbe?',
        expectedKeywords: ['55 dollars', 'coupe et barbe', 'rendez-vous'],
        description: 'Prix service complet'
      },

      // 🔄 ÉVITER LES BOUCLES - CAS CRITIQUES
      {
        id: 'loop_1',
        category: 'anti_boucles',
        conversationFlow: [
          { input: 'Rendez-vous coupe homme', expected: 'date' },
          { input: 'Mardi matin', expected: 'heure' },
          { input: 'Coupe homme', expected: 'pas_redemander_type' }
        ],
        description: 'Ne doit PAS redemander le type après l\'avoir su'
      },
      
      // ✅ GESTION DU "OUI"
      {
        id: 'yes_context_1',
        category: 'gestion_oui',
        conversationFlow: [
          { input: 'Prix coupe barbe?', expected: '55 dollars' },
          { input: 'Oui', expected: 'rendez_vous' }
        ],
        description: 'Oui après prix = veut RDV'
      },

      // 😵 CAS DIFFICILES
      {
        id: 'difficult_1',
        category: 'cas_difficiles',
        input: 'Euh... ben... j\'sais pas trop... peut-être un truc pour mes cheveux?',
        expectedKeywords: ['type', 'coupe', 'barbe', 'homme', 'femme'],
        description: 'Client confus - doit clarifier le besoin'
      },
      {
        id: 'difficult_2',
        category: 'cas_difficiles',
        input: 'Moi j\'veux d\'quoi de bin beau pour ma tête là',
        expectedKeywords: ['service', 'coupe', 'type', 'homme', 'femme'],
        description: 'Accent fort québécois - doit comprendre'
      },

      // 📋 VALIDATION FINALE
      {
        id: 'final_validation',
        category: 'validation',
        conversationFlow: [
          { input: 'RDV coupe homme', expected: 'date' },
          { input: 'Jeudi 14h', expected: 'nom' },
          { input: 'Jean Tremblay', expected: 'résumé_complet' }
        ],
        description: 'Doit résumer: Service + Date + Heure + Nom'
      }
    ];
  }

  // 🧪 TESTER UN SCÉNARIO SIMPLE
  async testScenario(scenario) {
    console.log(`\n🧪 Test: ${scenario.id} - ${scenario.description}`);
    
    try {
      // Simuler l'appel à Marcel (ici on mocke la réponse)
      const marcelResponse = await this.simulateMarcelResponse(scenario.input);
      
      // Analyser la réponse
      const analysis = this.analyzeResponse(marcelResponse, scenario);
      
      // Enregistrer résultat
      this.recordTestResult(scenario, marcelResponse, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error(`❌ Erreur test ${scenario.id}:`, error.message);
      this.trainingResults.failedTests++;
      return { passed: false, error: error.message };
    }
  }

  // 🔄 TESTER UN FLUX DE CONVERSATION
  async testConversationFlow(scenario) {
    console.log(`\n🔄 Test Conversation: ${scenario.id} - ${scenario.description}`);
    
    const conversationResults = [];
    this.currentBookingData = {}; // Reset données RDV
    
    for (let i = 0; i < scenario.conversationFlow.length; i++) {
      const step = scenario.conversationFlow[i];
      console.log(`  📢 Étape ${i + 1}: "${step.input}"`);
      
      const response = await this.simulateMarcelResponse(step.input, this.currentBookingData);
      const analysis = this.analyzeConversationStep(response, step, this.currentBookingData);
      
      conversationResults.push({
        step: i + 1,
        input: step.input,
        response: response.text,
        analysis: analysis,
        bookingData: { ...this.currentBookingData }
      });
      
      // Mettre à jour les données de conversation
      this.updateBookingData(response, step.input);
    }
    
    return this.evaluateConversationFlow(scenario, conversationResults);
  }

  // 🤖 SIMULER LA RÉPONSE DE MARCEL
  async simulateMarcelResponse(input, bookingData = {}) {
    // Pour l'instant on simule, plus tard on appellera la vraie fonction
    const intent = this.analyzeIntent(input);
    const response = this.processIntent(intent, input, bookingData);
    
    console.log(`  🤖 Marcel: "${response.text.substring(0, 100)}..."`);
    return response;
  }

  // 📊 ANALYSER LA RÉPONSE
  analyzeResponse(response, scenario) {
    const responseText = response.text.toLowerCase();
    const analysis = {
      passed: true,
      score: 0,
      issues: [],
      strengths: []
    };

    // Vérifier mots-clés attendus
    const foundKeywords = scenario.expectedKeywords.filter(keyword => 
      responseText.includes(keyword.toLowerCase())
    );
    
    analysis.score = (foundKeywords.length / scenario.expectedKeywords.length) * 100;
    
    if (analysis.score >= 70) {
      analysis.strengths.push(`Contient ${foundKeywords.length}/${scenario.expectedKeywords.length} mots-clés attendus`);
    } else {
      analysis.passed = false;
      analysis.issues.push(`Manque des mots-clés: ${scenario.expectedKeywords.filter(k => !foundKeywords.includes(k)).join(', ')}`);
    }

    // Vérifications spécifiques selon la catégorie
    switch (scenario.category) {
      case 'anti_boucles':
        if (responseText.includes('type') && bookingData.serviceType) {
          analysis.passed = false;
          analysis.issues.push('BOUCLE DÉTECTÉE: Redemande le type alors qu\'il le connaît déjà');
        }
        break;
        
      case 'validation':
        if (!responseText.includes('résumé') && !responseText.includes('confirmer')) {
          analysis.issues.push('Manque la validation finale/résumé');
        }
        break;
    }

    return analysis;
  }

  // 🔍 ANALYSER ÉTAPE DE CONVERSATION
  analyzeConversationStep(response, step, bookingData) {
    const analysis = { passed: true, issues: [] };
    
    // Vérifier que Marcel ne redemande pas ce qu'il sait déjà
    if (step.expected === 'pas_redemander_type' && response.text.toLowerCase().includes('type')) {
      analysis.passed = false;
      analysis.issues.push('BOUCLE: Redemande le type service');
    }
    
    return analysis;
  }

  // 📝 METTRE À JOUR DONNÉES DE RÉSERVATION
  updateBookingData(response, input) {
    const inputLower = input.toLowerCase();
    
    // Détecter le type de service
    if (inputLower.includes('coupe homme')) {
      this.currentBookingData.serviceType = 'coupe_homme';
    } else if (inputLower.includes('coupe femme')) {
      this.currentBookingData.serviceType = 'coupe_femme';  
    } else if (inputLower.includes('barbe')) {
      this.currentBookingData.serviceType = 'barbe';
    } else if (inputLower.includes('coloration')) {
      this.currentBookingData.serviceType = 'coloration';
    }
    
    // Détecter date/heure
    if (inputLower.includes('mardi') || inputLower.includes('jeudi')) {
      this.currentBookingData.date = inputLower.includes('mardi') ? 'mardi' : 'jeudi';
    }
    
    if (inputLower.includes('14h') || inputLower.includes('16h')) {
      this.currentBookingData.time = inputLower.includes('14h') ? '14h' : '16h';
    }
    
    console.log(`  📋 Données RDV mises à jour:`, this.currentBookingData);
  }

  // 🎯 ANALYSER L'INTENTION (copie simplifiée)
  analyzeIntent(speechResult) {
    const text = speechResult.toLowerCase();

    if (text.includes("rendez-vous") || text.includes("rdv") || text.includes("appointment")) {
      return { intent: "booking_request", confidence: 0.9 };
    } else if (text.includes("prix") || text.includes("coût") || text.includes("tarif")) {
      return { intent: "pricing_inquiry", confidence: 0.8 };
    } else if (text.includes("horaire") || text.includes("ouvert")) {
      return { intent: "hours_inquiry", confidence: 0.8 };
    } else if (text.includes("service") || text.includes("coupe") || text.includes("barbe")) {
      return { intent: "service_inquiry", confidence: 0.7 };
    } else {
      return { intent: "general", confidence: 0.3 };
    }
  }

  // 🤖 TRAITER L'INTENTION (version améliorée)
  processIntent(intent, speechResult, bookingData = {}) {
    const text = speechResult.toLowerCase();

    switch (intent.intent) {
      case "booking_request":
        // Vérifier ce qui manque dans les données de RDV
        if (!bookingData.serviceType) {
          return {
            text: "Parfait! Quel type de service voulez-vous? Coupe pour homme, coupe pour femme, taille de barbe, ou coloration?",
            needsFollowUp: true,
            action: "/webhook/twilio/speech"
          };
        } else if (!bookingData.date) {
          return {
            text: "Excellent! Quand souhaitez-vous votre rendez-vous? Je peux vous proposer cette semaine.",
            needsFollowUp: true,
            action: "/webhook/twilio/speech"
          };
        }
        break;
        
      case "pricing_inquiry":
        return {
          text: "Nos prix: coupe homme 35 dollars, coupe et barbe 55 dollars, coupe femme 40 dollars, coloration à partir de 80 dollars. Voulez-vous prendre rendez-vous?",
          needsFollowUp: true,
          action: "/webhook/twilio/speech"
        };
        
      default:
        return {
          text: "Je peux vous aider avec les rendez-vous, prix et horaires. Que souhaitez-vous?",
          needsFollowUp: true,
          action: "/webhook/twilio/speech"
        };
    }
  }

  // 📊 ENREGISTRER RÉSULTAT DE TEST
  recordTestResult(scenario, response, analysis) {
    this.trainingResults.totalTests++;
    
    if (analysis.passed) {
      this.trainingResults.passedTests++;
      console.log(`  ✅ SUCCÈS (${Math.round(analysis.score)}%)`);
    } else {
      this.trainingResults.failedTests++;
      console.log(`  ❌ ÉCHEC (${Math.round(analysis.score)}%)`);
      console.log(`     Issues: ${analysis.issues.join(', ')}`);
      
      // Enregistrer l'erreur pour amélioration
      this.trainingResults.errors.push({
        scenarioId: scenario.id,
        input: scenario.input,
        issues: analysis.issues,
        response: response.text,
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculer taux de succès
    this.trainingResults.successRate = 
      (this.trainingResults.passedTests / this.trainingResults.totalTests) * 100;
  }

  // 🚀 LANCER FORMATION COMPLÈTE
  async runFullTraining() {
    console.log('\n🚀 FORMATION MARCEL - DÉMARRAGE');
    console.log('=====================================');
    
    const scenarios = this.getTestScenarios();
    const startTime = Date.now();
    
    // Reset résultats
    this.trainingResults = {
      totalTests: 0,
      passedTests: 0, 
      failedTests: 0,
      successRate: 0,
      errors: [],
      improvements: [],
      testHistory: []
    };

    // Tester tous les scénarios
    for (const scenario of scenarios) {
      if (scenario.conversationFlow) {
        await this.testConversationFlow(scenario);
      } else {
        await this.testScenario(scenario);
      }
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const duration = Date.now() - startTime; 
    
    // Générer rapport final
    const report = this.generateTrainingReport(duration);
    
    // Sauvegarder résultats
    await this.saveTrainingResults(report);
    
    console.log('\n🎉 FORMATION TERMINÉE!');
    console.log(`📊 Taux de succès: ${Math.round(this.trainingResults.successRate)}%`);
    console.log(`⏱️ Durée: ${duration}ms`);
    
    return report;
  }

  // 📋 GÉNÉRER RAPPORT DE FORMATION
  generateTrainingReport(duration) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      summary: {
        totalTests: this.trainingResults.totalTests,
        passed: this.trainingResults.passedTests,
        failed: this.trainingResults.failedTests,
        successRate: `${Math.round(this.trainingResults.successRate)}%`
      },
      errors: this.trainingResults.errors,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // 💡 GÉNÉRER RECOMMANDATIONS D'AMÉLIORATION
  generateRecommendations() {
    const recommendations = [];
    
    // Analyser les erreurs communes
    const errorTypes = {};
    this.trainingResults.errors.forEach(error => {
      error.issues.forEach(issue => {
        errorTypes[issue] = (errorTypes[issue] || 0) + 1;
      });
    });
    
    // Générer recommandations basées sur les erreurs
    Object.entries(errorTypes).forEach(([errorType, count]) => {
      if (count >= 2) {
        recommendations.push({
          priority: 'high',
          issue: errorType,
          occurrences: count,
          suggestion: this.getSuggestionForError(errorType)
        });
      }
    });
    
    return recommendations;
  }

  // 🔧 SUGGESTIONS D'AMÉLIORATION
  getSuggestionForError(errorType) {
    const suggestions = {
      'BOUCLE DÉTECTÉE': 'Ajouter mémoire de conversation pour éviter de redemander les infos déjà connues',
      'Manque des mots-clés': 'Enrichir le vocabulaire de réponse avec plus de variantes',
      'Manque la validation finale': 'Ajouter systématiquement un résumé de confirmation avant finalisation'
    };
    
    return suggestions[errorType] || 'Améliorer la logique de traitement pour ce cas';
  }

  // 💾 SAUVEGARDER RÉSULTATS
  async saveTrainingResults(report) {
    try {
      const trainingDir = path.join(__dirname, 'training-data');
      if (!fs.existsSync(trainingDir)) {
        fs.mkdirSync(trainingDir, { recursive: true });
      }
      
      const filename = `training-report-${Date.now()}.json`;
      const filepath = path.join(trainingDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📁 Rapport sauvegardé: ${filepath}`);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error.message);
    }
  }

  // 📊 OBTENIR STATISTIQUES
  getStats() {
    return {
      ...this.trainingResults,
      lastUpdate: new Date().toISOString()
    };
  }
}

// 🚀 EXPORT ET AUTO-TEST
module.exports = MarcelTrainer;

// Auto-test si exécuté directement
if (require.main === module) {
  const trainer = new MarcelTrainer();
  
  console.log('🧪 MODE TEST - Marcel Trainer');
  
  // Test rapide
  trainer.runFullTraining().then(report => {
    console.log('\n📋 RAPPORT FINAL:');
    console.log(JSON.stringify(report.summary, null, 2));
  });
}