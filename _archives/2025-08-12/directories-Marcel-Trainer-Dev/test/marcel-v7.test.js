// MARCEL V7.0 - TESTS AUTOMATISÉS JEST
// =============================================
// Tests unitaires et d'intégration pour CI/CD
// =============================================

const request = require('supertest');
const app = require('../marcel-dev-server');

// Mock des dépendances externes
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'Bonjour! Comment puis-je vous aider aujourd\'hui?' }],
        usage: { output_tokens: 15 }
      })
    }
  }));
});

describe('Marcel V7.0 - Core API Tests', () => {
  let server;
  let testSessionId;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`Test server started on port ${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    testSessionId = `jest-test-${Date.now()}`;
  });

  // ========================================
  // TESTS DE SANTÉ
  // ========================================

  describe('Health Checks', () => {
    test('GET / should return server status', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('GET /dev-metrics should return metrics', async () => {
      const response = await request(server)
        .get('/dev-metrics')
        .expect(200);

      expect(response.body).toHaveProperty('successRate');
      expect(response.body).toHaveProperty('totalTests');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });

    test('404 handler should return proper error', async () => {
      const response = await request(server)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route non trouvée');
      expect(response.body).toHaveProperty('availableEndpoints');
    });
  });

  // ========================================
  // TESTS MARCEL AI CORE
  // ========================================

  describe('Marcel AI Conversation', () => {
    test('should handle basic greeting', async () => {
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Bonjour',
          sessionId: testSessionId
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('extractedInfo');
      expect(response.body).toHaveProperty('sessionId', testSessionId);
      expect(response.body.response).toBeTruthy();
    });

    test('should extract service from user input', async () => {
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Je voudrais une coupe homme',
          sessionId: testSessionId
        })
        .expect(200);

      expect(response.body.extractedInfo).toBeDefined();
      // Le service devrait être extrait si ContextAnalyzer est disponible
      if (response.body.engine !== 'Fallback') {
        expect(response.body.extractedInfo).toHaveProperty('service');
      }
    });

    test('should maintain session context', async () => {
      // Premier message
      await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Je veux une coupe homme',
          sessionId: testSessionId
        })
        .expect(200);

      // Deuxième message dans la même session
      const response2 = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Pour demain matin',
          sessionId: testSessionId
        })
        .expect(200);

      expect(response2.body.conversationLength).toBeGreaterThan(1);
      expect(response2.body.sessionId).toBe(testSessionId);
    });

    test('should not create infinite loops', async () => {
      // Établir le contexte
      await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Rendez-vous coupe homme',
          sessionId: testSessionId
        });

      await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Mardi après-midi',
          sessionId: testSessionId
        });

      // Test anti-boucle critique
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Coupe homme', // Répète le service déjà connu
          sessionId: testSessionId
        })
        .expect(200);

      // Vérifier que Marcel ne redemande pas le service
      const responseLower = response.body.response.toLowerCase();
      expect(responseLower).not.toMatch(/quel.*service/);
      expect(responseLower).not.toMatch(/quel.*type/);
    });
  });

  // ========================================
  // TESTS CLAUDE INTEGRATION
  // ========================================

  describe('Claude Integration', () => {
    test('should handle Claude request when configured', async () => {
      const response = await request(server)
        .post('/test-claude')
        .send({
          userInput: 'Bonjour, je voudrais un rendez-vous',
          sessionId: testSessionId
        });

      // Si Claude n'est pas configuré, le test devrait retourner une erreur 400
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error', 'Claude non configuré');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('engine', 'Claude Opus 4.1');
        expect(response.body).toHaveProperty('response');
      }
    });

    test('should handle Claude Smart with phone number', async () => {
      const response = await request(server)
        .post('/test-claude-smart')
        .send({
          userInput: 'Salut, c\'est pour un rendez-vous',
          phoneNumber: '+15145551234',
          sessionId: testSessionId
        });

      if (response.status === 400) {
        expect(response.body).toHaveProperty('error', 'Claude non configuré');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('engine', 'Claude Opus 4.1 Smart');
      }
    });
  });

  // ========================================
  // TESTS RELATIONSHIP DATA
  // ========================================

  describe('Relationship Data System', () => {
    test('should lookup client by phone', async () => {
      const response = await request(server)
        .post('/client-lookup')
        .send({
          phoneNumber: '+15145551234'
        });

      if (response.status === 503) {
        expect(response.body).toHaveProperty('error', 'Système de relations non disponible');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('phoneNumber');
      }
    });

    test('should get list of barbiers', async () => {
      const response = await request(server)
        .get('/barbiers');

      if (response.status === 503) {
        expect(response.body).toHaveProperty('error', 'Système de relations non disponible');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('barbiers');
        expect(Array.isArray(response.body.barbiers)).toBe(true);
      }
    });

    test('should check availability', async () => {
      const response = await request(server)
        .post('/check-availability')
        .send({
          barbierId: 'marco-001',
          date: '2025-08-15',
          time: '14:00'
        });

      if (response.status === 503) {
        expect(response.body).toHaveProperty('error');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('available');
        expect(typeof response.body.available).toBe('boolean');
      }
    });

    test('should get relationship statistics', async () => {
      const response = await request(server)
        .get('/stats/relations');

      if (response.status === 503) {
        expect(response.body).toHaveProperty('error');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalClients');
        expect(response.body).toHaveProperty('totalSalons');
        expect(response.body).toHaveProperty('totalBarbiers');
      }
    });
  });

  // ========================================
  // TESTS DE SÉCURITÉ
  // ========================================

  describe('Security Tests', () => {
    test('should handle XSS attempts', async () => {
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: '<script>alert("XSS")</script>',
          sessionId: testSessionId
        })
        .expect(200);

      // Vérifier que le script n'est pas dans la réponse
      expect(response.body.response).not.toContain('<script>');
      expect(response.body.response).not.toContain('alert(');
    });

    test('should handle SQL injection attempts', async () => {
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: '"; DROP TABLE clients; --',
          sessionId: testSessionId
        })
        .expect(200);

      // Le serveur devrait toujours répondre normalement
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).not.toContain('DROP TABLE');
    });

    test('should handle large payloads', async () => {
      const largeInput = 'a'.repeat(10000);
      
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: largeInput,
          sessionId: testSessionId
        });

      // Le serveur devrait gérer ou rejeter proprement
      expect([200, 413, 400]).toContain(response.status);
    });

    test('should sanitize path traversal attempts', async () => {
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: '../../../etc/passwd',
          sessionId: testSessionId
        })
        .expect(200);

      expect(response.body.response).not.toContain('/etc/passwd');
      expect(response.body.response).not.toContain('../');
    });
  });

  // ========================================
  // TESTS DE SESSION
  // ========================================

  describe('Session Management', () => {
    test('should create new session when not exists', async () => {
      const newSessionId = `new-session-${Date.now()}`;
      
      const response = await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Bonjour',
          sessionId: newSessionId
        })
        .expect(200);

      expect(response.body.sessionId).toBe(newSessionId);
      expect(response.body.conversationLength).toBe(1);
    });

    test('should reset session on demand', async () => {
      // Créer une session
      await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Test session',
          sessionId: testSessionId
        });

      // Reset la session
      const response = await request(server)
        .post('/reset-session')
        .send({
          sessionId: testSessionId
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Session réinitialisée');
    });

    test('should handle concurrent sessions', async () => {
      const sessions = [];
      const promises = [];

      // Créer 5 sessions concurrentes
      for (let i = 0; i < 5; i++) {
        const sessionId = `concurrent-${i}-${Date.now()}`;
        sessions.push(sessionId);
        
        promises.push(
          request(server)
            .post('/test-marcel-response')
            .send({
              userInput: `Session ${i}`,
              sessionId
            })
        );
      }

      const responses = await Promise.all(promises);

      // Vérifier que chaque session est indépendante
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.sessionId).toBe(sessions[index]);
      });
    });
  });

  // ========================================
  // TESTS ENDPOINTS ADDITIONNELS
  // ========================================

  describe('Additional Endpoints', () => {
    test('should get training report', async () => {
      const response = await request(server)
        .get('/training-report')
        .expect(200);

      expect(response.body).toHaveProperty('successRate');
      expect(response.body).toHaveProperty('totalTests');
      expect(response.body).toHaveProperty('scenarios');
    });

    test('should get test scenarios', async () => {
      const response = await request(server)
        .get('/test-scenarios')
        .expect(200);

      // Soit le fichier scenarios.json existe, soit on a les scénarios par défaut
      if (response.body.error) {
        expect(response.body).toHaveProperty('defaultScenarios');
        expect(Array.isArray(response.body.defaultScenarios)).toBe(true);
      } else {
        expect(response.body).toHaveProperty('scenarios');
        expect(Array.isArray(response.body.scenarios)).toBe(true);
      }
    });

    test('should analyze context', async () => {
      const response = await request(server)
        .post('/analyze-context')
        .send({
          text: 'Je voudrais une coupe homme pour demain à 14h'
        })
        .expect(200);

      if (!response.body.error) {
        expect(response.body).toHaveProperty('extracted');
        expect(response.body).toHaveProperty('patterns_found');
        expect(Array.isArray(response.body.patterns_found)).toBe(true);
      }
    });
  });

  // ========================================
  // TESTS DE PERFORMANCE
  // ========================================

  describe('Performance Tests', () => {
    test('should respond within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(server)
        .post('/test-marcel-response')
        .send({
          userInput: 'Test performance',
          sessionId: testSessionId
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // Max 3 secondes
    });

    test('should handle rapid sequential requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(server)
            .post('/test-marcel-response')
            .send({
              userInput: `Rapid test ${i}`,
              sessionId: `rapid-${i}`
            })
        );
      }

      const responses = await Promise.all(requests);
      const allSuccessful = responses.every(r => r.status === 200);
      
      expect(allSuccessful).toBe(true);
    });
  });

  // ========================================
  // TESTS EXPRESSIONS QUÉBÉCOISES
  // ========================================

  describe('Quebec Language Understanding', () => {
    const quebecExpressions = [
      { input: 'C\'est-tu ouvert à soir?', shouldContain: ['soir', '18h'] },
      { input: 'J\'voudrais une coupe pour à matin', shouldContain: ['matin'] },
      { input: 'Ça fait-tu longtemps que vous êtes ouverts?', shouldContain: ['horaires'] },
      { input: 'C\'est combien pour la barbe?', shouldContain: ['20', 'dollars'] }
    ];

    test.each(quebecExpressions)(
      'should understand: $input',
      async ({ input, shouldContain }) => {
        const response = await request(server)
          .post('/test-marcel-response')
          .send({
            userInput: input,
            sessionId: `quebec-${Date.now()}`
          })
          .expect(200);

        const responseText = response.body.response.toLowerCase();
        
        // Au moins un des mots-clés devrait être présent
        const hasKeyword = shouldContain.some(keyword => 
          responseText.includes(keyword.toLowerCase())
        );
        
        expect(hasKeyword).toBe(true);
      }
    );
  });
});

// ========================================
// TESTS D'INTÉGRATION COMPLÈTE
// ========================================

describe('Marcel V7.0 - Integration Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('Complete booking flow', async () => {
    const sessionId = `integration-${Date.now()}`;

    // Étape 1: Salutation
    const response1 = await request(server)
      .post('/test-marcel-response')
      .send({
        userInput: 'Bonjour',
        sessionId
      })
      .expect(200);

    expect(response1.body.response).toBeTruthy();

    // Étape 2: Demande de service
    const response2 = await request(server)
      .post('/test-marcel-response')
      .send({
        userInput: 'Je voudrais une coupe homme',
        sessionId
      })
      .expect(200);

    expect(response2.body.conversationLength).toBe(2);

    // Étape 3: Spécifier la date
    const response3 = await request(server)
      .post('/test-marcel-response')
      .send({
        userInput: 'Pour demain après-midi',
        sessionId
      })
      .expect(200);

    expect(response3.body.conversationLength).toBe(3);

    // Étape 4: Donner le nom
    const response4 = await request(server)
      .post('/test-marcel-response')
      .send({
        userInput: 'Jean Tremblay',
        sessionId
      })
      .expect(200);

    expect(response4.body.conversationLength).toBe(4);
    
    // Vérifier que les informations sont collectées
    const extractedInfo = response4.body.extractedInfo;
    expect(extractedInfo).toBeDefined();
  });
});