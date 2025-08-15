// 🧠 MARCEL TRAINER - MODULE DE FORMATION
// =========================================
// Système de formation automatisé avec 25+ tests
// Version 2.0

const fs = require("fs");
const path = require("path");

class MarcelTrainer {
  constructor(apiBase = "http://localhost:3000") {
    this.apiBase = apiBase;
    this.scenarios = this.loadScenarios();
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  // Charger les scénarios depuis le fichier JSON ou utiliser les défauts
  loadScenarios() {
    try {
      const scenariosPath = path.join(__dirname, "scenarios.json");
      if (fs.existsSync(scenariosPath)) {
        const data = fs.readFileSync(scenariosPath, "utf8");
        const parsed = JSON.parse(data);

        console.log(
          `📄 Chargement de ${parsed.scenarios.length} scénarios depuis scenarios.json`,
        );

        // Adapter le format pour être compatible avec les tests
        const scenarios = [];

        for (const s of parsed.scenarios) {
          // Si c'est un conversation_flow, créer un scénario pour chaque étape
          if (s.conversation_flow && s.conversation_flow.length > 0) {
            // Pour l'instant, on prend juste le premier input pour tester
            scenarios.push({
              id: s.id,
              input: s.conversation_flow[0].input,
              category: s.category || "general",
              critical:
                s.difficulty === "difficile" || s.critical_test !== undefined,
              expectedExtraction: this.convertExpectedToExtraction(s),
            });
          } else if (s.input) {
            // Scénario simple
            scenarios.push({
              id: s.id,
              input: s.input,
              category: s.category || "general",
              critical: s.difficulty === "difficile",
              expectedExtraction: this.convertExpectedToExtraction(s),
            });
          }
        }

        console.log(`✅ ${scenarios.length} scénarios adaptés et prêts`);
        return scenarios;
      }
    } catch (error) {
      console.warn("⚠️ Erreur chargement scenarios.json:", error.message);
    }
    return this.getDefaultScenarios();
  }

  // Nouvelle fonction pour convertir le format
  convertExpectedToExtraction(scenario) {
    const extraction = {};

    // Convertir les attentes basées sur le contenu
    if (scenario.expected_response_contains) {
      // Détecter les patterns dans les réponses attendues
      const contains = scenario.expected_response_contains
        .join(" ")
        .toLowerCase();

      if (
        contains.includes("service") ||
        contains.includes("coupe") ||
        contains.includes("barbe")
      ) {
        if (scenario.input.toLowerCase().includes("coupe"))
          extraction.service = "coupe";
        if (scenario.input.toLowerCase().includes("barbe"))
          extraction.service = "barbe";
      }

      if (contains.includes("date") || contains.includes("quand")) {
        if (scenario.input.includes("matin")) {
          extraction.date = "aujourd'hui";
          extraction.periode = "matin";
        }
        if (scenario.input.includes("demain")) extraction.date = "demain";
        if (scenario.input.includes("mardi")) extraction.date = "mardi";
        if (scenario.input.includes("mercredi")) extraction.date = "mercredi";
        if (scenario.input.includes("jeudi")) extraction.date = "jeudi";
      }

      if (contains.includes("prix") || contains.includes("combien")) {
        extraction.besoin = "prix";
      }

      if (contains.includes("horaires") || contains.includes("ouvert")) {
        extraction.besoin = "horaires";
      }
    }

    // Détecter les noms dans l'input
    const nameMatch = scenario.input.match(
      /c'est\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    );
    if (nameMatch) {
      extraction.client = nameMatch[1];
    }

    return Object.keys(extraction).length > 0 ? extraction : null;
  }

  // Scénarios par défaut (25 tests québécois)
  getDefaultScenarios() {
    return [
      // SALUTATIONS (5 tests)
      {
        id: "greeting_1",
        input: "Allô Marcel",
        expectedIntent: "greeting",
        category: "salutation",
        critical: false,
      },
      {
        id: "greeting_2",
        input: "Bonjour, c'est-tu ouvert?",
        expectedIntent: "greeting",
        expectedExtraction: { besoin: "horaires" },
        category: "salutation",
        critical: false,
      },
      {
        id: "greeting_3",
        input: "Salut, première fois que j'appelle",
        expectedIntent: "greeting",
        category: "salutation",
        critical: false,
      },
      {
        id: "greeting_4",
        input: "Hey, êtes-vous là?",
        expectedIntent: "greeting",
        category: "salutation",
        critical: false,
      },
      {
        id: "greeting_5",
        input: "Bonjour, c'est Jean Tremblay",
        expectedIntent: "greeting",
        expectedExtraction: { client: "Jean Tremblay" },
        category: "salutation",
        critical: true,
      },

      // RÉSERVATIONS SIMPLES (5 tests)
      {
        id: "booking_1",
        input: "J'voudrais une coupe",
        expectedIntent: "booking",
        expectedExtraction: { service: "coupe" },
        category: "booking",
        critical: true,
      },
      {
        id: "booking_2",
        input: "J'veux une coupe à matin",
        expectedIntent: "booking",
        expectedExtraction: {
          service: "coupe",
          date: "aujourd'hui",
          periode: "matin",
        },
        category: "booking",
        critical: true,
      },
      {
        id: "booking_3",
        input: "Coupe homme pour demain après-midi",
        expectedIntent: "booking",
        expectedExtraction: {
          service: "coupe",
          date: "demain",
          periode: "après-midi",
        },
        category: "booking",
        critical: true,
      },
      {
        id: "booking_4",
        input: "J'aimerais prendre rendez-vous pour une barbe",
        expectedIntent: "booking",
        expectedExtraction: { service: "barbe" },
        category: "booking",
        critical: true,
      },
      {
        id: "booking_5",
        input: "Disponible pour coupe et barbe samedi?",
        expectedIntent: "booking",
        expectedExtraction: {
          service: ["coupe", "barbe"],
          date: "samedi",
        },
        category: "booking",
        critical: true,
      },

      // QUESTIONS PRIX (5 tests)
      {
        id: "price_1",
        input: "C'est combien pour la barbe?",
        expectedIntent: "pricing",
        expectedExtraction: { service: "barbe" },
        category: "pricing",
        critical: false,
      },
      {
        id: "price_2",
        input: "Ça coûte quoi une coupe homme?",
        expectedIntent: "pricing",
        expectedExtraction: { service: "coupe" },
        category: "pricing",
        critical: false,
      },
      {
        id: "price_3",
        input: "C'est-tu cher pour coupe et barbe?",
        expectedIntent: "pricing",
        expectedExtraction: { service: ["coupe", "barbe"] },
        category: "pricing",
        critical: false,
      },
      {
        id: "price_4",
        input: "Vos prix svp",
        expectedIntent: "pricing",
        category: "pricing",
        critical: false,
      },
      {
        id: "price_5",
        input: "Combien pour une teinture?",
        expectedIntent: "pricing",
        expectedExtraction: { service: "teinture" },
        category: "pricing",
        critical: false,
      },

      // BARBIERS SPÉCIFIQUES (5 tests)
      {
        id: "barber_1",
        input: "Marco est-tu là aujourd'hui?",
        expectedIntent: "availability",
        expectedExtraction: {
          barbier: "Marco",
          date: "aujourd'hui",
        },
        category: "barber",
        critical: false,
      },
      {
        id: "barber_2",
        input: "J'peux-tu avoir Julie pour ma coupe?",
        expectedIntent: "booking",
        expectedExtraction: {
          barbier: "Julie",
          service: "coupe",
        },
        category: "barber",
        critical: true,
      },
      {
        id: "barber_3",
        input: "Tony fait-tu les barbes?",
        expectedIntent: "info",
        expectedExtraction: {
          barbier: "Tony",
          service: "barbe",
        },
        category: "barber",
        critical: false,
      },
      {
        id: "barber_4",
        input: "Qui coupe le mieux les cheveux longs?",
        expectedIntent: "recommendation",
        category: "barber",
        critical: false,
      },
      {
        id: "barber_5",
        input: "N'importe quel barbier demain",
        expectedIntent: "booking",
        expectedExtraction: {
          barbier: "n'importe",
          date: "demain",
        },
        category: "barber",
        critical: false,
      },

      // CAS COMPLEXES ET ANTI-BOUCLES (5 tests)
      {
        id: "complex_1",
        input:
          "Salut, c'est Pierre Gagnon, je veux une coupe mardi à 14h, j'ai pas de coiffeur préféré",
        expectedIntent: "booking",
        expectedExtraction: {
          client: "Pierre Gagnon",
          service: "coupe",
          date: "mardi",
          time: "14h",
          barbier: "n'importe",
        },
        category: "complex",
        critical: true,
      },
      {
        id: "complex_2",
        input: "J'veux annuler mon rendez-vous de demain",
        expectedIntent: "cancellation",
        expectedExtraction: {
          action: "annuler",
          date: "demain",
        },
        category: "complex",
        critical: true,
      },
      {
        id: "complex_3",
        input: "Euh... j'sais pas trop... peut-être une coupe?",
        expectedIntent: "booking",
        expectedExtraction: {
          service: "coupe",
          uncertain: true,
        },
        category: "complex",
        critical: false,
      },
      {
        id: "complex_4",
        input: "URGENT! Besoin coupe MAINTENANT!",
        expectedIntent: "booking",
        expectedExtraction: {
          service: "coupe",
          urgency: "urgent",
          date: "aujourd'hui",
        },
        category: "complex",
        critical: false,
      },
      {
        id: "antiboucle_1",
        input: "J'ai déjà dit que je veux une coupe!",
        expectedIntent: "booking",
        expectedExtraction: {
          service: "coupe",
          frustration: true,
        },
        category: "antiboucle",
        critical: true,
        note: "Ne doit PAS redemander le service",
      },
    ];
  }

  // Tester un scénario individuel
  async testScenario(scenario) {
    const sessionId = `training-${scenario.id}-${Date.now()}`;

    try {
      const response = await fetch(`${this.apiBase}/test-marcel-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: scenario.input,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Évaluer le résultat
      const evaluation = this.evaluateResponse(scenario, data);

      return {
        scenario: scenario.id,
        input: scenario.input,
        response: data.response,
        extracted: data.extractedInfo,
        passed: evaluation.passed,
        errors: evaluation.errors,
        category: scenario.category,
        critical: scenario.critical,
      };
    } catch (error) {
      return {
        scenario: scenario.id,
        input: scenario.input,
        passed: false,
        errors: [`Erreur réseau: ${error.message}`],
        category: scenario.category,
        critical: scenario.critical,
      };
    }
  }

  // Évaluer une réponse
  evaluateResponse(scenario, response) {
    const errors = [];
    let passed = true;

    // Vérifier l'extraction si attendue
    if (scenario.expectedExtraction) {
      for (const [key, expectedValue] of Object.entries(
        scenario.expectedExtraction,
      )) {
        const actualValue = response.extractedInfo?.[key];

        if (!actualValue) {
          errors.push(`Champ manquant: ${key}`);
          passed = false;
        } else if (Array.isArray(expectedValue)) {
          // Pour les arrays, vérifier que tous les éléments sont présents
          const actualArray = Array.isArray(actualValue)
            ? actualValue
            : [actualValue];
          for (const expected of expectedValue) {
            if (!actualArray.some((a) => a.includes(expected))) {
              errors.push(
                `${key}: attendu "${expected}", reçu "${actualValue}"`,
              );
              passed = false;
            }
          }
        } else if (
          typeof expectedValue === "string" &&
          !actualValue.includes(expectedValue)
        ) {
          errors.push(
            `${key}: attendu "${expectedValue}", reçu "${actualValue}"`,
          );
          passed = false;
        }
      }
    }

    // Vérifier l'anti-boucle
    if (scenario.category === "antiboucle") {
      if (
        response.response &&
        (response.response.toLowerCase().includes("quel service") ||
          response.response.toLowerCase().includes("que puis-je"))
      ) {
        errors.push(
          "ERREUR CRITIQUE: Boucle détectée - redemande une info déjà fournie",
        );
        passed = false;
      }
    }

    // Vérifier que la réponse n'est pas vide
    if (!response.response || response.response.length < 10) {
      errors.push("Réponse trop courte ou vide");
      passed = false;
    }

    return { passed, errors };
  }

  // Lancer tous les tests
  async runFullTraining() {
    console.log("\n🧠 MARCEL TRAINER - FORMATION COMPLÈTE");
    console.log("=".repeat(50));
    console.log(`📋 ${this.scenarios.length} scénarios à tester\n`);

    this.startTime = Date.now();
    this.results = [];

    // Grouper par catégorie
    const categories = {};
    this.scenarios.forEach((s) => {
      if (!categories[s.category]) categories[s.category] = [];
      categories[s.category].push(s);
    });

    // Tester par catégorie
    for (const [category, scenarios] of Object.entries(categories)) {
      console.log(
        `\n📂 Catégorie: ${category.toUpperCase()} (${scenarios.length} tests)`,
      );
      console.log("-".repeat(40));

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];

        // VÉRIFICATION AJOUTÉE ICI
        if (!scenario.input && !scenario.text) {
          console.log(
            `  Test ${i + 1}/${scenarios.length}: ❌ SKIP - Pas d'input`,
          );
          this.results.push({
            scenario: scenario.id || `test_${i}`,
            passed: false,
            errors: ["Scénario sans input"],
            category: scenario.category || "unknown",
          });
          continue;
        }

        const inputText = scenario.input || scenario.text || "";
        const displayText =
          inputText.length > 30
            ? inputText.substring(0, 30) + "..."
            : inputText;

        process.stdout.write(
          `  Test ${i + 1}/${scenarios.length}: "${displayText}" `,
        );

        const result = await this.testScenario(scenario);
        this.results.push(result);

        if (result.passed) {
          console.log("✅ PASS");
        } else {
          console.log("❌ FAIL");
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((err) => console.log(`    └─ ${err}`));
          }
        }

        // Petite pause entre les tests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    this.endTime = Date.now();

    // Générer le rapport
    return this.generateReport();
  }

  // Générer le rapport final
  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    const duration = ((this.endTime - this.startTime) / 1000).toFixed(1);

    // Stats par catégorie
    const categoryStats = {};
    this.results.forEach((r) => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = { total: 0, passed: 0, failed: 0 };
      }
      categoryStats[r.category].total++;
      if (r.passed) {
        categoryStats[r.category].passed++;
      } else {
        categoryStats[r.category].failed++;
      }
    });

    // Tests critiques échoués
    const criticalFailures = this.results.filter(
      (r) => r.critical && !r.passed,
    );

    console.log("\n" + "=".repeat(50));
    console.log("📊 RAPPORT FINAL");
    console.log("=".repeat(50));
    console.log(
      `✅ Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`,
    );
    console.log(`❌ Tests échoués: ${failedTests}`);
    console.log(`⏱️  Durée totale: ${duration}s`);
    console.log(`📈 Moyenne: ${(duration / totalTests).toFixed(2)}s par test`);

    console.log("\n📂 PAR CATÉGORIE:");
    for (const [cat, stats] of Object.entries(categoryStats)) {
      const catRate = Math.round((stats.passed / stats.total) * 100);
      console.log(`  ${cat}: ${stats.passed}/${stats.total} (${catRate}%)`);
    }

    if (criticalFailures.length > 0) {
      console.log("\n⚠️  TESTS CRITIQUES ÉCHOUÉS:");
      criticalFailures.forEach((f) => {
        console.log(`  - ${f.scenario}: "${f.input}"`);
        f.errors.forEach((e) => console.log(`    └─ ${e}`));
      });
    }

    console.log("\n💡 RECOMMANDATIONS:");
    if (successRate < 70) {
      console.log("  - ⚠️ Taux de succès faible, révision majeure nécessaire");
    }
    if (categoryStats.antiboucle && categoryStats.antiboucle.failed > 0) {
      console.log(
        "  - 🔄 Problème anti-boucle détecté, vérifier la mémoire contextuelle",
      );
    }
    if (
      categoryStats.booking &&
      categoryStats.booking.passed < categoryStats.booking.total
    ) {
      console.log("  - 📅 Améliorer l'extraction des rendez-vous");
    }
    if (
      categoryStats.complex &&
      categoryStats.complex.passed < categoryStats.complex.total
    ) {
      console.log("  - 🧩 Renforcer la gestion des cas complexes");
    }

    console.log("\n" + "=".repeat(50));
    console.log(
      successRate >= 80 ? "🎉 FORMATION RÉUSSIE!" : "📚 FORMATION À AMÉLIORER",
    );
    console.log("=".repeat(50) + "\n");

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      duration,
      categoryStats,
      criticalFailures,
      results: this.results,
    };
  }
}

// Export ou exécution directe
if (require.main === module) {
  // Si exécuté directement, lancer les tests
  const trainer = new MarcelTrainer();
  trainer
    .runFullTraining()
    .then((report) => {
      console.log("\n✅ Formation terminée!");
      process.exit(report.successRate >= 80 ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}

module.exports = MarcelTrainer;
