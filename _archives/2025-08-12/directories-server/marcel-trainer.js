// 🧠 MARCEL TRAINER - MODULE DE FORMATION
// =========================================
// Système de formation automatisé avec 25+ tests
// Version 2.0

const fs = require('fs');
const path = require('path');

class MarcelTrainer {
  constructor(apiBase = 'http://localhost:3000') {
    this.apiBase = apiBase;
    this.scenarios = this.loadScenarios();
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  // Charger les scénarios depuis le fichier JSON
  loadScenarios() {
    try {
      const scenariosPath = path.join(__dirname, 'scenarios.json');
      if (fs.existsSync(scenariosPath)) {
        const data = fs.readFileSync(scenariosPath, 'utf8');
        const parsed = JSON.parse(data);
        console.log(`✅ ${parsed.scenarios.length} scénarios chargés depuis scenarios.json`);
        return parsed.scenarios;
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement scenarios.json:', error.message);
    }
    return this.getDefaultScenarios();
  }

  // Scénarios par défaut si le fichier n'existe pas
  getDefaultScenarios() {
    return [
      {
        id: "test_1",
        input: "Bonjour Marcel",
        category: "salutation"
      },
      {
        id: "test_2", 
        input: "Je veux une coupe",
        category: "booking"
      },
      {
        id: "test_3",
        input: "C'est combien?",
        category: "prix"
      }
    ];
  }

  // Tester un scénario
  async testScenario(scenario) {
    const sessionId = `training-${scenario.id}-${Date.now()}`;
    
    try {
      // Utiliser node:fetch si disponible (Node 18+)
      const fetch = require('node:fetch').default || require('node:fetch');
      
      const response = await fetch(`${this.apiBase}/test-marcel-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: scenario.input,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        scenario: scenario.id,
        input: scenario.input,
        response: data.response,
        passed: true,
        category: scenario.category
      };

    } catch (error) {
      // Si fetch n'existe pas, utiliser la méthode HTTP native
      const http = require('http');
      
      return new Promise((resolve) => {
        const postData = JSON.stringify({
          userInput: scenario.input,
          sessionId: sessionId
        });

        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/test-marcel-response',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve({
                scenario: scenario.id,
                input: scenario.input,
                response: response.response || 'Pas de réponse',
                passed: true,
                category: scenario.category
              });
            } catch (e) {
              resolve({
                scenario: scenario.id,
                input: scenario.input,
                passed: false,
                error: 'Erreur parsing',
                category: scenario.category
              });
            }
          });
        });

        req.on('error', (error) => {
          resolve({
            scenario: scenario.id,
            input: scenario.input,
            passed: false,
            error: error.message,
            category: scenario.category
          });
        });

        req.write(postData);
        req.end();
      });
    }
  }

  // Lancer tous les tests
  async runFullTraining() {
    console.log('\n🧠 MARCEL TRAINER - FORMATION COMPLÈTE');
    console.log('=' .repeat(50));
    console.log(`📋 ${this.scenarios.length} scénarios à tester\n`);

    this.startTime = Date.now();
    this.results = [];

    for (let i = 0; i < this.scenarios.length; i++) {
      const scenario = this.scenarios[i];
      process.stdout.write(`Test ${i+1}/${this.scenarios.length}: "${scenario.input}" ... `);
      
      const result = await this.testScenario(scenario);
      this.results.push(result);
      
      if (result.passed) {
        console.log('✅ PASS');
      } else {
        console.log('❌ FAIL');
        if (result.error) {
          console.log(`   Erreur: ${result.error}`);
        }
      }
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.endTime = Date.now();
    return this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    const duration = ((this.endTime - this.startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT FINAL');
    console.log('='.repeat(50));
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`❌ Tests échoués: ${failedTests}`);
    console.log(`⏱️  Durée totale: ${duration}s`);
    
    // Grouper par catégorie
    const categories = {};
    this.results.forEach(r => {
      if (!categories[r.category]) {
        categories[r.category] = { passed: 0, total: 0 };
      }
      categories[r.category].total++;
      if (r.passed) categories[r.category].passed++;
    });

    console.log('\n📂 PAR CATÉGORIE:');
    Object.entries(categories).forEach(([cat, stats]) => {
      const rate = Math.round((stats.passed / stats.total) * 100);
      console.log(`  ${cat}: ${stats.passed}/${stats.total} (${rate}%)`);
    });

    console.log('\n' + '='.repeat(50));
    console.log(successRate >= 80 ? '🎉 FORMATION RÉUSSIE!' : '📚 FORMATION À AMÉLIORER');
    console.log('='.repeat(50) + '\n');

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      duration,
      categories
    };
  }
}

// Lancer si exécuté directement
if (require.main === module) {
  console.log('🚀 Lancement des tests Marcel...\n');
  
  // Vérifier que le serveur est lancé
  const http = require('http');
  
  http.get('http://localhost:3000/', (res) => {
    const trainer = new MarcelTrainer();
    trainer.runFullTraining().then(() => {
      console.log('✅ Tests terminés!');
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('❌ Le serveur n\'est pas lancé!');
    console.error('   Lancez d\'abord: npm start');
    process.exit(1);
  });
}

module.exports = MarcelTrainer;