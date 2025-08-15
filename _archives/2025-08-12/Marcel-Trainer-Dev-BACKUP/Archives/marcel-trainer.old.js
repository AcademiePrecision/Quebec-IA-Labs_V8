// 🧠 MARCEL TRAINER - SYSTÈME DE FORMATION DEV
// Version optimisée pour développement et test
// Version: 1.0.0-dev

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
      testHistory: [],
      startTime: Date.now()
    };
    
    this.scenarios = this.loadScenarios();
    this.conversationMemory = new Map();
    this.devMode = true;
    
    console.log('🧠 Marcel Trainer DEV initialisé avec', this.scenarios.length, 'scénarios');
  }

  // 📋 Charger scénarios depuis JSON
  loadScenarios() {
    try {
      const scenariosPath = path.join(__dirname, 'scenarios.json');
      if (fs.existsSync(scenariosPath)) {
        const data = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
        return data.scenarios || this.getDefaultScenarios();
      } else {
        console.log('📋 Fichier scenarios.json non trouvé, utilisation des scénarios par défaut');
        return this.getDefaultScenarios();
      }
    } catch (error) {
      console.error('❌ Erreur chargement scénarios:', error);
      return this.getDefaultScenarios();
    }
  }

  // 🎯 Scénarios par défaut (si JSON manquant)
  getDefaultScenarios() {
    return [
      {
        id: 'greeting_basic',
        category: 'salutations',
        input: 'Bonjour',
        expected_response_contains: ['bonjour', 'aider'],
        description: 'Salutation basique'
      },
      {
        id: 'booking_simple',
        category: 'rendez_vous',
        input: 'Je veux un rendez-vous',
        expected_response_contains: ['service', 'coupe', 'barbe'],
        description: 'Demande RDV simple'
      },
      {
        id: 'price_inquiry',
        category: 'prix',
        input: 'Combien ça coûte?',
        expected_response_contains: ['35 dollars', 'prix'],
        description: 'Question prix'
      },
      {
        id: 'quebec_style',
        category: 'quebec',
        input: 'Allô, c\'est-tu ouvert?',
        expected_response_contains: ['ouvert', 'horaires'],
        description: 'Style québécois'
      },
      {
        id: 'complete_booking',
        category: 'rendez_vous',
        input: 'Coupe homme mardi 14h',
        expected_response_contains: ['marco', 'confirme'],
        description: 'RDV complet'
      }
    ];
  }

  // 🧪 Tester un scénario individuel
  async testScenario(scenario, context = {}) {
    console.log(`\n🧪 Test: ${scenario.id} - ${scenario.description}`);
    
    const testStart = Date.now();
    
    try {
      // Simuler réponse Marcel
      const marcelResponse = await this.simulateMarcelResponse(scenario.input, context);
      
      // Analyser la réponse
      const analysis = this.analyzeResponse(marcelResponse, scenario);
      
      // Enregistrer résultat
      this.recordTestResult(scenario, marcelResponse, analysis, Date.now() - testStart);
      
      return {
        scenario: scenario,
        response: marcelResponse,
        analysis: analysis,
        passed: analysis.passed,
        duration: Date.now() - testStart
      };
      
    } catch (error) {
      console.error(`❌ Erreur test ${scenario.id}:`, error.message);
      this.trainingResults.failedTests++;
      return { 
        scenario: scenario,
        passed: false, 
        error: error.message,
        duration: Date.now() - testStart
      };
    }
  }

  // 🤖 Simuler la réponse de Marcel (DEV)
  async simulateMarcelResponse(input, context = {}) {
    // Analyser l'entrée
    const intent = this.analyzeIntent(input);
    const extractedInfo = this.extractInformation(input, context);
    
    // Générer réponse selon la logique Marcel
    const response = this.generateMarcelResponse(intent, extractedInfo, input);
    
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    
    return response;
  }

  // 🔍 Analyser l'intention (version DEV)
  analyzeIntent(input) {
    const text = input.toLowerCase();
    
    // Intentions avec scores de confiance
    const intentions = [
      {
        name: 'booking_request',
        keywords: ['rendez-vous', 'rdv', 'réserver', 'prendre', 'booker', 'appointment'],
        confidence: 0
      },
      {
        name: 'pricing_inquiry',
        keywords: ['prix', 'coût', 'combien', 'tarif', '$', 'coûte'],
        confidence: 0
      },
      {
        name: 'hours_inquiry',
        keywords: ['horaires', 'ouvert', 'fermé', 'heures', 'disponible'],
        confidence: 0
      },
      {
        name: 'greeting',
        keywords: ['bonjour', 'salut', 'allô', 'hello', 'hi'],
        confidence: 0
      }
    ];

    // Calculer scores
    intentions.forEach(intent => {
      intent.confidence = intent.keywords.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0) / intent.keywords.length;
    });

    // Retourner meilleure intention
    const bestIntent = intentions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return {
      intent: bestIntent.confidence > 0 ? bestIntent.name : 'general',
      confidence: bestIntent.confidence
    };
  }

  // 📊 Extraire informations du texte
  extractInformation(input, context = {}) {
    const text = input.toLowerCase();
    const info = { ...context };

    // Services
    if (text.includes('coupe homme')) info.service = 'coupe_homme';
    else if (text.includes('coupe femme')) info.service = 'coupe_femme';
    else if (text.includes('coupe') && text.includes('barbe')) info.service = 'coupe_barbe';
    else if (text.includes('barbe')) info.service = 'barbe';
    else if (text.includes('coloration')) info.service = 'coloration';

    // Dates
    if (text.includes('mardi')) info.date = 'mardi';
    else if (text.includes('jeudi')) info.date = 'jeudi';
    else if (text.includes('aujourd\'hui') || text.includes('à matin')) info.date = 'aujourd_hui';

    // Heures
    if (text.includes('14h') || text.includes('2h')) info.time = '14h';
    else if (text.includes('16h') || text.includes('4h')) info.time = '16h';
    else if (text.includes('matin')) info.time = 'matin';
    else if (text.includes('après-midi')) info.time = 'apres_midi';

    // Barbiers
    if (text.includes('marco')) info.barbier = 'Marco';
    else if (text.includes('jessica')) info.barbier = 'Jessica';

    return info;
  }

  // 💬 Générer réponse Marcel
  generateMarcelResponse(intent, info, originalInput) {
    switch (intent.intent) {
      case 'greeting':
        return {
          text: "Bonjour! Je peux vous aider avec les rendez-vous, prix et horaires. Que souhaitez-vous?",
          nextStep: 'listen'
        };

      case 'booking_request':
        if (!info.service) {
          return {
            text: "Parfait! Quel type de service voulez-vous? Coupe homme, coupe femme, barbe ou coloration?",
            nextStep: 'ask_service'
          };
        } else if (!info.date) {
          return {
            text: `Excellent pour votre ${this.getServiceName(info.service)}! Quand souhaitez-vous votre rendez-vous?`,
            nextStep: 'ask_date'
          };
        } else if (!info.time) {
          return {
            text: `Parfait pour ${info.date}! Quelle heure vous convient? 14h avec Marco ou 16h avec Jessica?`,
            nextStep: 'ask_time'
          };
        } else {
          const barbier = info.time === '14h' ? 'Marco' : 'Jessica';
          return {
            text: `Excellent! Je confirme ${this.getServiceName(info.service)} ${info.date} ${info.time} avec ${barbier}. Votre nom?`,
            nextStep: 'ask_name'
          };
        }

      case 'pricing_inquiry':
        return {
          text: "Nos prix: coupe homme 35$, coupe femme 40$, coupe+barbe 55$, coloration 80$+. Voulez-vous un rendez-vous?",
          nextStep: 'offer_booking'
        };

      case 'hours_inquiry':
        return {
          text: "Nous sommes ouverts mardi-vendredi 9h-18h, samedi 8h-16h. Fermé dimanche-lundi. Un rendez-vous?",
          nextStep: 'offer_booking'
        };

      default:
        return {
          text: "Je peux vous aider avec les rendez-vous, prix et horaires. Que souhaitez-vous?",
          nextStep: 'clarify'
        };
    }
  }

  // 📝 Noms de services
  getServiceName(service) {
    const names = {
      coupe_homme: 'coupe homme',
      coupe_femme: 'coupe femme',
      coupe_barbe: 'coupe et barbe',
      barbe: 'taille barbe',
      coloration: 'coloration'
    };
    return names[service] || service;
  }

  // 📊 Analyser la réponse vs attentes
  analyzeResponse(response, scenario) {
    const responseText = response.text.toLowerCase();
    const analysis = {
      passed: true,
      score: 0,
      issues: [],
      strengths: [],
      details: {}
    };

    // Vérifier mots-clés attendus
    const expectedKeywords = scenario.expected_response_contains || [];
    const foundKeywords = expectedKeywords.filter(keyword => 
      responseText.includes(keyword.toLowerCase())
    );
    
    analysis.score = expectedKeywords.length > 0 ? 
      (foundKeywords.length / expectedKeywords.length) * 100 : 50;
    
    if (analysis.score >= 70) {
      analysis.strengths.push(`Contient ${foundKeywords.length}/${expectedKeywords.length} mots-clés`);
    } else {
      analysis.passed = false;
      const missing = expectedKeywords.filter(k => !foundKeywords.includes(k));
      analysis.issues.push(`Mots-clés manquants: ${missing.join(', ')}`);
    }

    // Vérifications spécifiques par catégorie
    if (scenario.category === 'quebec' && !this.hasQuebecFlavor(responseText)) {
      analysis.issues.push('Réponse pas assez québécoise');
    }

    if (scenario.category === 'rendez_vous' && !responseText.includes('service')) {
      analysis.issues.push('Devrait demander le type de service');
    }

    // Détails pour debug
    analysis.details = {
      expectedKeywords: expectedKeywords,
      foundKeywords: foundKeywords,
      responseLength: response.text.length,
      hasNextStep: !!response.nextStep
    };

    return analysis;
  }

  // 🇨🇦 Vérifier saveur québécoise
  hasQuebecFlavor(text) {
    const quebecisms = ['à matin', 'à soir', 'c\'est-tu', 'peux-tu', 'bin'];
    return quebecisms.some(q => text.includes(q));
  }

  // 📝 Enregistrer résultat de test
  recordTestResult(scenario, response, analysis, duration) {
    this.trainingResults.totalTests++;
    
    const result = {
      scenarioId: scenario.id,
      category: scenario.category,
      input: scenario.input,
      response: response.text,
      passed: analysis.passed,
      score: analysis.score,
      issues: analysis.issues,
      duration: duration,
      timestamp: new Date().toISOString()
    };

    this.trainingResults.testHistory.push(result);
    
    if (analysis.passed) {
      this.trainingResults.passedTests++;
      console.log(`  ✅ SUCCÈS (${Math.round(analysis.score)}%) en ${duration}ms`);
    } else {
      this.trainingResults.failedTests++;
      console.log(`  ❌ ÉCHEC (${Math.round(analysis.score)}%) en ${duration}ms`);
      console.log(`     Issues: ${analysis.issues.join(', ')}`);
      
      this.trainingResults.errors.push(result);
    }
    
    // Calculer taux de succès
    this.trainingResults.successRate = 
      (this.trainingResults.passedTests / this.trainingResults.totalTests) * 100;
  }

  // 🚀 Formation complète
  async runFullTraining() {
    console.log('\n🚀 FORMATION MARCEL DEV - DÉMARRAGE');
    console.log('=====================================');
    
    const startTime = Date.now();
    
    // Reset résultats
    this.trainingResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      errors: [],
      improvements: [],
      testHistory: [],
      startTime: startTime
    };

    // Tester tous les scénarios
    const results = [];
    for (const scenario of this.scenarios) {
      const result = await this.testScenario(scenario);
      results.push(result);
      
      // Pause entre tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const duration = Date.now() - startTime;
    
    // Générer rapport
    const report = this.generateTrainingReport(duration, results);
    
    console.log('\n🎉 FORMATION DEV TERMINÉE!');
    console.log(`📊 Résultats: ${this.trainingResults.passedTests}/${this.trainingResults.totalTests} (${Math.round(this.trainingResults.successRate)}%)`);
    console.log(`⏱️ Durée totale: ${duration}ms`);
    
    return report;
  }

  // 📋 Générer rapport détaillé
  generateTrainingReport(duration, results = []) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        totalTests: this.trainingResults.totalTests,
        passed: this.trainingResults.passedTests,
        failed: this.trainingResults.failedTests,
        successRate: `${Math.round(this.trainingResults.successRate)}%`
      },
      performance: {
        averageResponseTime: results.length > 0 ? 
          Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length) : 0,
        fastestTest: results.length > 0 ? Math.min(...results.map(r => r.duration || 999)) : 0,
        slowestTest: results.length > 0 ? Math.max(...results.map(r => r.duration || 0)) : 0
      },
      categoryResults: this.getCategoryResults(),
      errors: this.trainingResults.errors.slice(0, 10), // Top 10 erreurs
      recommendations: this.generateRecommendations(),
      devInfo: {
        mode: 'DEVELOPMENT',
        scenariosLoaded: this.scenarios.length,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };
    
    return report;
  }

  // 📊 Résultats par catégorie
  getCategoryResults() {
    const categories = {};
    
    this.trainingResults.testHistory.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { total: 0, passed: 0, failed: 0 };
      }
      
      categories[test.category].total++;
      if (test.passed) {
        categories[test.category].passed++;
      } else {
        categories[test.category].failed++;
      }
    });

    // Ajouter taux de succès
    Object.keys(categories).forEach(cat => {
      const data = categories[cat];
      data.successRate = Math.round((data.passed / data.total) * 100);
    });

    return categories;
  }

  // 💡 Générer recommandations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.trainingResults.successRate < 80) {
      recommendations.push({
        type: 'warning',
        message: 'Taux de succès < 80% - Révision nécessaire',
        priority: 'high'
      });
    }

    if (this.trainingResults.errors.length > 5) {
      recommendations.push({
        type: 'error',
        message: `${this.trainingResults.errors.length} erreurs détectées`,
        priority: 'high'
      });
    }

    // Analyser erreurs communes
    const errorTypes = {};
    this.trainingResults.errors.forEach(error => {
      error.issues.forEach(issue => {
        errorTypes[issue] = (errorTypes[issue] || 0) + 1;
      });
    });

    Object.entries(errorTypes).forEach(([error, count]) => {
      if (count >= 2) {
        recommendations.push({
          type: 'improvement',
          message: `Problème récurrent: ${error} (${count}x)`,
          priority: 'medium'
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: '🎉 Marcel fonctionne parfaitement!',
        priority: 'info'
      });
    }

    return recommendations;
  }

  // 📊 Obtenir statistiques
  getStats() {
    return {
      ...this.trainingResults,
      uptime: Date.now() - this.trainingResults.startTime,
      scenariosTotal: this.scenarios.length,
      lastUpdate: new Date().toISOString(),
      devMode: this.devMode
    };
  }

  // 🎯 Obtenir scénarios pour l'API
  getTestScenarios() {
    return this.scenarios;
  }
}

// 🧪 Auto-test si exécuté directement
if (require.main === module) {
  console.log('🧪 MODE TEST - Marcel Trainer DEV');
  
  const trainer = new MarcelTrainer();
  
  // Test rapide
  trainer.runFullTraining().then(report => {
    console.log('\n📋 RAPPORT FINAL DEV:');
    console.log('Summary:', report.summary);
    console.log('Performance:', report.performance);
    console.log('Recommendations:', report.recommendations.length);
  });
}

module.exports = MarcelTrainer;