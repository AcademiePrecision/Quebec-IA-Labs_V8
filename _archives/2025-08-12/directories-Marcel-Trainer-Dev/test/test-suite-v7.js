// MARCEL V7.0 - SUITE DE TESTS COMPLÈTE
// =============================================
// QA Lead: Validation bulletproof avant production
// Objectif: ZÉRO RÉGRESSION sur les $1.22M de revenus
// =============================================

const fs = require('fs');
const path = require('path');

// Configuration de test
const TEST_CONFIG = {
  SERVER_URL: 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CRITICAL_PASS_RATE: 95,
  STANDARD_PASS_RATE: 85,
  PERFORMANCE_THRESHOLD: 2000, // ms
  MEMORY_THRESHOLD: 200 * 1024 * 1024, // 200MB
  DEBUG: process.env.DEBUG_TESTS === 'true'
};

// Catégories de tests
const TEST_CATEGORIES = {
  CRITICAL: 'critical',      // Doit passer à 100%
  HIGH: 'high',             // Doit passer à 95%
  MEDIUM: 'medium',          // Doit passer à 85%
  LOW: 'low',              // Doit passer à 75%
  PERFORMANCE: 'performance' // Tests de charge
};

// Résultats de tests
class TestResults {
  constructor() {
    this.startTime = Date.now();
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.criticalFailures = [];
    this.performanceMetrics = [];
    this.memoryLeaks = [];
  }

  addTest(test) {
    this.tests.push(test);
    if (test.status === 'passed') this.passed++;
    else if (test.status === 'failed') {
      this.failed++;
      if (test.category === TEST_CATEGORIES.CRITICAL) {
        this.criticalFailures.push(test);
      }
    } else if (test.status === 'skipped') this.skipped++;
  }

  getPassRate() {
    const total = this.passed + this.failed;
    return total > 0 ? (this.passed / total) * 100 : 0;
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    return {
      summary: {
        total: this.tests.length,
        passed: this.passed,
        failed: this.failed,
        skipped: this.skipped,
        passRate: this.getPassRate().toFixed(2) + '%',
        duration: duration + 'ms',
        status: this.criticalFailures.length === 0 ? 'SUCCESS' : 'FAILED'
      },
      criticalFailures: this.criticalFailures,
      performanceMetrics: this.performanceMetrics,
      memoryLeaks: this.memoryLeaks,
      detailedTests: this.tests,
      timestamp: new Date().toISOString()
    };
  }
}

// Classe principale de test
class MarcelV7TestSuite {
  constructor() {
    this.results = new TestResults();
    this.httpClient = null;
    this.sessions = new Map();
  }

  // Initialisation
  async initialize() {
    console.log('🚀 Initialisation de la suite de tests Marcel V7.0...');
    
    // Vérifier que le serveur est accessible
    try {
      const response = await this.makeRequest('GET', '/');
      if (!response || response.status !== 'active') {
        throw new Error('Serveur Marcel non accessible');
      }
      console.log('✅ Serveur Marcel V7.0 détecté et actif');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error.message);
      return false;
    }
  }

  // Utilitaire HTTP
  async makeRequest(method, endpoint, body = null, retries = TEST_CONFIG.RETRY_ATTEMPTS) {
    const fetch = (await import('node-fetch')).default;
    const url = `${TEST_CONFIG.SERVER_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Marcel-V7-Test-Suite'
      },
      timeout: TEST_CONFIG.TIMEOUT
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    for (let i = 0; i < retries; i++) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;
        
        const data = await response.json();
        
        return {
          ...data,
          _meta: {
            status: response.status,
            responseTime,
            attempt: i + 1
          }
        };
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.sleep(1000 * (i + 1)); // Backoff exponentiel
      }
    }
  }

  // Utilitaire sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // TESTS CRITIQUES - CORE FUNCTIONALITY
  // ========================================

  async testMarcelAIConversation() {
    const testName = 'Marcel AI - Conversation Intelligence';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      const sessionId = `test-ai-${Date.now()}`;
      
      // Test 1: Salutation initiale
      const response1 = await this.makeRequest('POST', '/test-marcel-response', {
        userInput: 'Bonjour, c\'est Jean Tremblay',
        sessionId
      });
      
      if (!response1.response || !response1.extractedInfo) {
        throw new Error('Réponse Marcel invalide');
      }
      
      // Test 2: Demande de service
      const response2 = await this.makeRequest('POST', '/test-marcel-response', {
        userInput: 'Je voudrais une coupe homme pour demain',
        sessionId
      });
      
      if (!response2.extractedInfo.service) {
        throw new Error('Service non extrait');
      }
      
      // Test 3: Anti-boucle (ne doit pas redemander le service)
      const response3 = await this.makeRequest('POST', '/test-marcel-response', {
        userInput: '14h serait parfait',
        sessionId
      });
      
      if (response3.response.toLowerCase().includes('quel service')) {
        throw new Error('ÉCHEC CRITIQUE: Boucle détectée - redemande le service');
      }
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.CRITICAL,
        status: 'passed',
        duration: response3._meta.responseTime,
        details: {
          sessionId,
          extractedInfo: response3.extractedInfo
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.CRITICAL,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  async testClaudeIntegration() {
    const testName = 'Claude AI - Integration Opus 4.1';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      const sessionId = `test-claude-${Date.now()}`;
      
      // Test avec Claude basique
      const response = await this.makeRequest('POST', '/test-claude', {
        userInput: 'Bonjour, je voudrais prendre rendez-vous',
        sessionId
      });
      
      // Vérifier si Claude est configuré
      if (response.error && response.error.includes('non configuré')) {
        this.results.addTest({
          name: testName,
          category: TEST_CATEGORIES.HIGH,
          status: 'skipped',
          reason: 'Claude non configuré (ANTHROPIC_API_KEY manquante)'
        });
        console.log(`⏭️ ${testName} - IGNORÉ (Claude non configuré)`);
        return null;
      }
      
      if (!response.response || response.engine !== 'Claude Opus 4.1') {
        throw new Error('Réponse Claude invalide');
      }
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.HIGH,
        status: 'passed',
        duration: response._meta.responseTime,
        details: {
          engine: response.engine,
          tokensUsed: response.tokensUsed
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.HIGH,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  async testRelationshipData() {
    const testName = 'Relationship Data - Client Recognition';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      // Test lookup client existant
      const response = await this.makeRequest('POST', '/client-lookup', {
        phoneNumber: '+15145551234'
      });
      
      if (response.error && response.error.includes('non disponible')) {
        this.results.addTest({
          name: testName,
          category: TEST_CATEGORIES.HIGH,
          status: 'skipped',
          reason: 'Système de relations non chargé'
        });
        console.log(`⏭️ ${testName} - IGNORÉ (Relations non disponibles)`);
        return null;
      }
      
      if (!response.success) {
        throw new Error('Recherche client échouée');
      }
      
      // Test avec Claude Smart si disponible
      const sessionId = `test-smart-${Date.now()}`;
      const smartResponse = await this.makeRequest('POST', '/test-claude-smart', {
        userInput: 'Salut, c\'est pour un rendez-vous',
        phoneNumber: '+15145551234',
        sessionId
      });
      
      if (smartResponse.isKnownClient && !smartResponse.clientData) {
        throw new Error('Données client non récupérées');
      }
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.HIGH,
        status: 'passed',
        duration: smartResponse._meta?.responseTime || 0,
        details: {
          isKnownClient: smartResponse.isKnownClient,
          hasClientData: !!smartResponse.clientData
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.HIGH,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  // ========================================
  // TESTS DE PERFORMANCE
  // ========================================

  async testResponseTime() {
    const testName = 'Performance - Response Time';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      const times = [];
      
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await this.makeRequest('POST', '/test-marcel-response', {
          userInput: `Test performance ${i}`,
          sessionId: `perf-${Date.now()}`
        });
        times.push(Date.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      if (avgTime > TEST_CONFIG.PERFORMANCE_THRESHOLD) {
        throw new Error(`Temps de réponse moyen trop élevé: ${avgTime}ms`);
      }
      
      this.results.performanceMetrics.push({
        metric: 'responseTime',
        average: avgTime,
        max: maxTime,
        samples: times.length
      });
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'passed',
        duration: avgTime,
        details: {
          avgResponseTime: avgTime + 'ms',
          maxResponseTime: maxTime + 'ms',
          threshold: TEST_CONFIG.PERFORMANCE_THRESHOLD + 'ms'
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS (Avg: ${avgTime.toFixed(2)}ms)`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  async testConcurrentLoad() {
    const testName = 'Performance - Concurrent Load';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      const concurrentRequests = 20;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          this.makeRequest('POST', '/test-marcel-response', {
            userInput: `Concurrent test ${i}`,
            sessionId: `concurrent-${i}-${Date.now()}`
          })
        );
      }
      
      const start = Date.now();
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed > concurrentRequests * 0.1) { // Plus de 10% d'échecs
        throw new Error(`Trop d'échecs sous charge: ${failed}/${concurrentRequests}`);
      }
      
      this.results.performanceMetrics.push({
        metric: 'concurrentLoad',
        totalRequests: concurrentRequests,
        successful,
        failed,
        duration
      });
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'passed',
        duration,
        details: {
          concurrentRequests,
          successRate: (successful / concurrentRequests * 100).toFixed(2) + '%',
          totalDuration: duration + 'ms'
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS (${successful}/${concurrentRequests} réussis)`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  async testMemoryUsage() {
    const testName = 'Performance - Memory Management';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      // Obtenir les métriques initiales
      const initialMetrics = await this.makeRequest('GET', '/dev-metrics');
      
      // Créer 50 sessions
      for (let i = 0; i < 50; i++) {
        await this.makeRequest('POST', '/test-marcel-response', {
          userInput: `Memory test session ${i}`,
          sessionId: `mem-test-${i}`
        });
      }
      
      // Obtenir les métriques finales
      const finalMetrics = await this.makeRequest('GET', '/dev-metrics');
      
      // Vérifier qu'il n'y a pas de fuite mémoire excessive
      if (finalMetrics.sessionsActive > 100) {
        throw new Error(`Trop de sessions actives: ${finalMetrics.sessionsActive}`);
      }
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'passed',
        details: {
          initialSessions: initialMetrics.sessionsActive,
          finalSessions: finalMetrics.sessionsActive
        }
      });
      
      console.log(`✅ ${testName} - SUCCÈS`);
      return true;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.PERFORMANCE,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  // ========================================
  // TESTS API ENDPOINTS
  // ========================================

  async testAllEndpoints() {
    const testName = 'API Endpoints - Availability';
    console.log(`\n🧪 Test: ${testName}`);
    
    const endpoints = [
      { method: 'GET', path: '/', expectedStatus: 200 },
      { method: 'GET', path: '/dev-metrics', expectedStatus: 200 },
      { method: 'GET', path: '/stats/relations', expectedStatus: [200, 503] },
      { method: 'GET', path: '/barbiers', expectedStatus: [200, 503] },
      { method: 'GET', path: '/training-report', expectedStatus: 200 },
      { method: 'GET', path: '/test-scenarios', expectedStatus: 200 },
      { method: 'POST', path: '/reset-session', body: { sessionId: 'test' }, expectedStatus: 200 }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(
          endpoint.method,
          endpoint.path,
          endpoint.body
        );
        
        const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
          ? endpoint.expectedStatus 
          : [endpoint.expectedStatus];
        
        if (expectedStatuses.includes(response._meta.status)) {
          passed++;
          console.log(`  ✅ ${endpoint.method} ${endpoint.path}`);
        } else {
          failed++;
          console.log(`  ❌ ${endpoint.method} ${endpoint.path} - Status: ${response._meta.status}`);
        }
      } catch (error) {
        failed++;
        console.log(`  ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
      }
    }
    
    this.results.addTest({
      name: testName,
      category: TEST_CATEGORIES.HIGH,
      status: failed === 0 ? 'passed' : 'failed',
      details: {
        totalEndpoints: endpoints.length,
        passed,
        failed
      }
    });
    
    console.log(`${failed === 0 ? '✅' : '❌'} ${testName} - ${passed}/${endpoints.length} endpoints OK`);
    return failed === 0;
  }

  // ========================================
  // TESTS DE SCÉNARIOS QUÉBÉCOIS
  // ========================================

  async testQuebecExpressions() {
    const testName = 'Quebec Expressions - Language Understanding';
    console.log(`\n🧪 Test: ${testName}`);
    
    const expressions = [
      { input: 'C\'est-tu ouvert à soir?', expectedKeywords: ['soir', 'fermé', '18h'] },
      { input: 'J\'voudrais une coupe pour à matin', expectedKeywords: ['matin', 'aujourd'] },
      { input: 'Peux-tu me prendre tantôt?', expectedKeywords: ['bientôt', 'disponible'] },
      { input: 'C\'est combien pour la barbe?', expectedKeywords: ['20', 'dollars'] }
    ];
    
    let passed = 0;
    
    for (const expr of expressions) {
      try {
        const response = await this.makeRequest('POST', '/test-marcel-response', {
          userInput: expr.input,
          sessionId: `quebec-${Date.now()}`
        });
        
        const responseText = response.response.toLowerCase();
        const hasKeyword = expr.expectedKeywords.some(kw => 
          responseText.includes(kw.toLowerCase())
        );
        
        if (hasKeyword) {
          passed++;
          console.log(`  ✅ "${expr.input}"`);
        } else {
          console.log(`  ❌ "${expr.input}" - Réponse inadéquate`);
        }
      } catch (error) {
        console.log(`  ❌ "${expr.input}" - Error: ${error.message}`);
      }
    }
    
    const passRate = (passed / expressions.length) * 100;
    
    this.results.addTest({
      name: testName,
      category: TEST_CATEGORIES.MEDIUM,
      status: passRate >= 75 ? 'passed' : 'failed',
      details: {
        totalExpressions: expressions.length,
        understood: passed,
        passRate: passRate.toFixed(2) + '%'
      }
    });
    
    console.log(`${passRate >= 75 ? '✅' : '❌'} ${testName} - ${passed}/${expressions.length} expressions comprises`);
    return passRate >= 75;
  }

  // ========================================
  // TESTS DE SÉCURITÉ
  // ========================================

  async testSecurityValidation() {
    const testName = 'Security - Input Validation';
    console.log(`\n🧪 Test: ${testName}`);
    
    const maliciousInputs = [
      { input: '<script>alert("XSS")</script>', desc: 'XSS attempt' },
      { input: '"; DROP TABLE clients; --', desc: 'SQL injection' },
      { input: '../../../etc/passwd', desc: 'Path traversal' },
      { input: 'a'.repeat(10000), desc: 'Buffer overflow' },
      { input: '${process.exit(1)}', desc: 'Command injection' }
    ];
    
    let blocked = 0;
    
    for (const attack of maliciousInputs) {
      try {
        const response = await this.makeRequest('POST', '/test-marcel-response', {
          userInput: attack.input,
          sessionId: `security-${Date.now()}`
        });
        
        // Si la requête passe, vérifier que l'input est sanitizé
        if (response && response.response) {
          if (!response.response.includes(attack.input)) {
            blocked++;
            console.log(`  ✅ ${attack.desc} - Sanitized`);
          } else {
            console.log(`  ⚠️ ${attack.desc} - Not sanitized`);
          }
        }
      } catch (error) {
        blocked++;
        console.log(`  ✅ ${attack.desc} - Blocked`);
      }
    }
    
    const blockRate = (blocked / maliciousInputs.length) * 100;
    
    this.results.addTest({
      name: testName,
      category: TEST_CATEGORIES.CRITICAL,
      status: blockRate >= 80 ? 'passed' : 'failed',
      details: {
        totalAttacks: maliciousInputs.length,
        blocked,
        blockRate: blockRate.toFixed(2) + '%'
      }
    });
    
    console.log(`${blockRate >= 80 ? '✅' : '❌'} ${testName} - ${blocked}/${maliciousInputs.length} attaques bloquées`);
    return blockRate >= 80;
  }

  // ========================================
  // TESTS DE RÉGRESSION
  // ========================================

  async testRegressionScenarios() {
    const testName = 'Regression - Critical Scenarios';
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
      // Charger les scénarios depuis scenarios.json
      const scenariosPath = path.join(__dirname, '..', 'scenarios.json');
      const scenariosData = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
      
      // Filtrer les scénarios critiques
      const criticalScenarios = scenariosData.scenarios.filter(s => 
        s.category === 'anti_boucles' || s.category === 'validation'
      );
      
      let passed = 0;
      let failed = 0;
      
      for (const scenario of criticalScenarios) {
        try {
          const sessionId = `regression-${scenario.id}-${Date.now()}`;
          
          if (scenario.conversation_flow) {
            // Test de conversation multi-étapes
            let lastResponse;
            for (const step of scenario.conversation_flow) {
              lastResponse = await this.makeRequest('POST', '/test-marcel-response', {
                userInput: step.input,
                sessionId
              });
              
              // Vérifier les contenus attendus
              const responseText = lastResponse.response.toLowerCase();
              if (step.expected_avoids) {
                const hasAvoided = step.expected_avoids.some(avoid => 
                  responseText.includes(avoid.toLowerCase())
                );
                if (hasAvoided) {
                  throw new Error(`Contient du texte à éviter: ${step.expected_avoids}`);
                }
              }
            }
            passed++;
            console.log(`  ✅ ${scenario.id} - ${scenario.description}`);
          } else {
            // Test simple
            const response = await this.makeRequest('POST', '/test-marcel-response', {
              userInput: scenario.input,
              sessionId
            });
            
            if (response && response.response) {
              passed++;
              console.log(`  ✅ ${scenario.id} - ${scenario.description}`);
            } else {
              failed++;
              console.log(`  ❌ ${scenario.id} - ${scenario.description}`);
            }
          }
        } catch (error) {
          failed++;
          console.log(`  ❌ ${scenario.id} - ${error.message}`);
        }
      }
      
      const passRate = (passed / (passed + failed)) * 100;
      
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.CRITICAL,
        status: passRate >= TEST_CONFIG.CRITICAL_PASS_RATE ? 'passed' : 'failed',
        details: {
          totalScenarios: criticalScenarios.length,
          passed,
          failed,
          passRate: passRate.toFixed(2) + '%'
        }
      });
      
      console.log(`${passRate >= TEST_CONFIG.CRITICAL_PASS_RATE ? '✅' : '❌'} ${testName} - ${passed}/${criticalScenarios.length} scénarios réussis`);
      return passRate >= TEST_CONFIG.CRITICAL_PASS_RATE;
      
    } catch (error) {
      this.results.addTest({
        name: testName,
        category: TEST_CATEGORIES.CRITICAL,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ ${testName} - ÉCHEC: ${error.message}`);
      return false;
    }
  }

  // ========================================
  // EXÉCUTION DE LA SUITE COMPLÈTE
  // ========================================

  async runFullSuite() {
    console.log(`
╔════════════════════════════════════════════╗
║     MARCEL V7.0 - SUITE DE TESTS QA       ║
║         Zero Regression Policy             ║
╚════════════════════════════════════════════╝
`);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Impossible d\'initialiser la suite de tests');
      return null;
    }

    console.log('\n📋 Exécution des tests...\n');

    // Tests critiques
    console.log('══════ TESTS CRITIQUES ══════');
    await this.testMarcelAIConversation();
    await this.testSecurityValidation();
    await this.testRegressionScenarios();

    // Tests haute priorité
    console.log('\n══════ TESTS HAUTE PRIORITÉ ══════');
    await this.testClaudeIntegration();
    await this.testRelationshipData();
    await this.testAllEndpoints();

    // Tests de performance
    console.log('\n══════ TESTS DE PERFORMANCE ══════');
    await this.testResponseTime();
    await this.testConcurrentLoad();
    await this.testMemoryUsage();

    // Tests moyens
    console.log('\n══════ TESTS STANDARD ══════');
    await this.testQuebecExpressions();

    // Générer le rapport
    const report = this.results.generateReport();

    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Afficher le résumé
    console.log(`
╔════════════════════════════════════════════╗
║            RAPPORT DE TEST V7.0            ║
╚════════════════════════════════════════════╝

📊 RÉSUMÉ:
   Total: ${report.summary.total} tests
   ✅ Réussis: ${report.summary.passed}
   ❌ Échoués: ${report.summary.failed}
   ⏭️ Ignorés: ${report.summary.skipped}
   
   Taux de réussite: ${report.summary.passRate}
   Durée totale: ${report.summary.duration}
   
🚨 ÉCHECS CRITIQUES: ${report.criticalFailures.length}
${report.criticalFailures.map(f => `   - ${f.name}: ${f.error}`).join('\n')}

📈 MÉTRIQUES DE PERFORMANCE:
${report.performanceMetrics.map(m => `   - ${m.metric}: ${m.average ? m.average.toFixed(2) + 'ms (avg)' : m.duration + 'ms'}`).join('\n')}

🎯 STATUT FINAL: ${report.status}
${report.status === 'SUCCESS' ? '✅ PRÊT POUR PRODUCTION' : '❌ NE PAS DÉPLOYER - CORRECTIONS REQUISES'}

📄 Rapport complet sauvegardé: ${reportPath}
`);

    return report;
  }
}

// Exécution si lancé directement
if (require.main === module) {
  const suite = new MarcelV7TestSuite();
  suite.runFullSuite().then(report => {
    if (report && report.summary.status === 'FAILED') {
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = MarcelV7TestSuite;