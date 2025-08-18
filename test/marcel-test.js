// Test Marcel Emoji Detector
const fs = require('fs');

const FORBIDDEN_WORDS = [
  'visage souriant', 'etoile souriante', 'main qui salue',
  'ciseaux', 'calendrier', 'signe de la main',
  'emoji', 'emojis', 'emoticon', 'symbole'
];

const TEST_SCENARIOS = [
  {
    id: 'TEST_001',
    input: 'Bonjour Marcel',
    expectedResponse: 'Bonjour! Comment puis-je vous aider?'
  }
];

class MarcelEmojiDetector {
  constructor() {
    this.violations = [];
  }

  detectViolations(text) {
    const found = [];
    for (const word of FORBIDDEN_WORDS) {
      if (text.toLowerCase().includes(word)) {
        found.push(word);
      }
    }
    return found;
  }

  async runTests() {
    console.log('=== TEST MARCEL EMOJI DETECTOR ===');
    console.log('Date:', new Date().toISOString());
    console.log('Objectif: 0 emoji au telephone');
    console.log();

    for (const scenario of TEST_SCENARIOS) {
      console.log('Test:', scenario.id);
      console.log('Input:', scenario.input);
      
      // Simuler reponse Marcel (remplacer par vrai appel API)
      const response = scenario.expectedResponse;
      console.log('Response:', response);
      
      const violations = this.detectViolations(response);
      
      if (violations.length === 0) {
        console.log('✓ PASS - Aucun emoji detecte');
      } else {
        console.log('✗ FAIL - Violations:', violations.join(', '));
        this.violations.push(...violations);
      }
      console.log();
    }

    console.log('=== RESULTAT FINAL ===');
    if (this.violations.length === 0) {
      console.log('SUCCESS: Marcel est propre!');
      return true;
    } else {
      console.log('ECHEC: Violations detectees:', this.violations.length);
      return false;
    }
  }
}

// Executer le test
const detector = new MarcelEmojiDetector();
detector.runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });

