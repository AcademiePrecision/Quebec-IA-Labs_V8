# MARCEL V7.0 - QA VALIDATION CHECKLIST
## Zero Regression Policy - $1.22M Revenue Protection

---

## EXECUTIVE SUMMARY

**Version**: Marcel V7.0  
**QA Lead**: Test Automation Suite  
**Objective**: ZERO REGRESSION avant production  
**Revenue at Risk**: $1.22M annuel  
**Critical Pass Rate Required**: 95%  

---

## TEST COVERAGE MATRIX

### 1. CORE FUNCTIONALITY (CRITICAL - 100% Required)

#### Marcel AI Intelligence
- [ ] Conversation contextuelle maintenue
- [ ] Extraction correcte des informations (service, date, heure, nom)
- [ ] Anti-boucle fonctionnel (ne redemande pas les infos connues)
- [ ] Gestion multi-étapes de réservation
- [ ] Réponses en français québécois naturel

#### Payment System Integration
- [ ] Stripe sandbox fonctionnel
- [ ] Gestion des états de paiement
- [ ] Sécurité des transactions
- [ ] Webhooks Stripe actifs
- [ ] Stockage sécurisé dans Supabase

#### Voice System (ElevenLabs)
- [ ] Génération audio fonctionnelle
- [ ] Qualité vocale acceptable
- [ ] Latence < 2 secondes
- [ ] Gestion des erreurs API
- [ ] Cache audio efficace

### 2. INTEGRATIONS (HIGH - 95% Required)

#### Claude AI (Opus 4.1)
- [ ] API key configurée et valide
- [ ] Réponses générées correctement
- [ ] Gestion des tokens optimisée
- [ ] Fallback si Claude indisponible
- [ ] Temps de réponse < 3 secondes

#### Relationship Data System
- [ ] Reconnaissance clients par téléphone
- [ ] Historique client accessible
- [ ] Préférences barbier respectées
- [ ] Suggestions personnalisées
- [ ] Protection des données personnelles

#### Twilio Webhooks
- [ ] Réception des SMS
- [ ] Parsing des messages
- [ ] Réponses automatiques
- [ ] Gestion des erreurs
- [ ] Logs des interactions

### 3. PERFORMANCE (MEDIUM - 85% Required)

#### Response Time
- [ ] API responses < 2000ms (P95)
- [ ] Dashboard load < 3000ms
- [ ] Concurrent requests handled (20+)
- [ ] Memory usage < 200MB
- [ ] CPU usage stable

#### Scalability
- [ ] 100 sessions simultanées
- [ ] 1000 requêtes/minute
- [ ] Pas de memory leaks
- [ ] Garbage collection efficace
- [ ] Database connections pooling

### 4. SECURITY (CRITICAL - 100% Required)

#### Input Validation
- [ ] XSS prevention
- [ ] SQL injection protection
- [ ] Path traversal blocking
- [ ] Buffer overflow handling
- [ ] Command injection prevention

#### Data Protection
- [ ] API keys sécurisées
- [ ] Données clients chiffrées
- [ ] Sessions sécurisées
- [ ] HTTPS enforced
- [ ] Rate limiting actif

### 5. LANGUAGE & LOCALIZATION (HIGH - 90% Required)

#### Quebec French Support
- [ ] "à matin" → ce matin
- [ ] "à soir" → ce soir
- [ ] "tantôt" → bientôt
- [ ] "c'est-tu" → est-ce que
- [ ] Expressions locales comprises

---

## TEST EXECUTION PLAN

### Phase 1: Unit Tests (Automated)
```bash
# Run Jest unit tests
npm test

# With coverage report
npm run test:coverage

# Expected: >80% coverage
```

### Phase 2: Integration Tests (Automated)
```bash
# Run full test suite
npm run test:suite

# Expected output:
# - Critical tests: 100% pass
# - High priority: >95% pass
# - Performance: <2000ms avg
```

### Phase 3: E2E Tests (Semi-Automated)
```bash
# Run E2E scenarios
npm run test:e2e

# Validates:
# - Complete booking flow
# - Anti-loop prevention
# - Client recognition
# - Error handling
```

### Phase 4: Smoke Tests (Post-Deployment)
```bash
# Quick validation after deployment
npm run test:smoke

# Checks:
# - Server health
# - Core APIs
# - Critical paths
# - Basic functionality
```

### Phase 5: Manual Testing
1. **Booking Flow**
   - New client booking
   - Returning client booking
   - Modification requests
   - Cancellation flow

2. **Edge Cases**
   - Confused client
   - Multiple services
   - Urgent requests
   - Time conflicts

3. **Performance**
   - Peak hours simulation
   - Stress testing
   - Memory monitoring
   - Response time tracking

---

## REGRESSION TEST SCENARIOS

### Critical Scenarios (MUST PASS)

#### Scenario 1: Anti-Loop Test
```
User: "Rendez-vous coupe homme"
Marcel: "Quand souhaitez-vous votre rendez-vous?"
User: "Mardi après-midi"
Marcel: "Quelle heure vous convient?"
User: "Coupe homme"  // CRITICAL: Should NOT ask for service again
Marcel: "Je sais déjà que vous voulez une coupe homme. Quelle heure préférez-vous?"
```

#### Scenario 2: Complete Booking
```
User: "Bonjour, c'est Jean Tremblay"
Marcel: "Bonjour M. Tremblay! Comment puis-je vous aider?"
User: "Coupe et barbe pour demain"
Marcel: "Parfait! Quelle heure vous convient?"
User: "14h"
Marcel: "Je confirme: coupe et barbe demain à 14h pour Jean Tremblay."
```

#### Scenario 3: Known Client
```
Phone: +15145551234 (existing client)
User: "Salut, c'est pour un rendez-vous"
Marcel: "Bonjour M. Tremblay! Content de vous revoir. Comme d'habitude avec Marco?"
User: "Oui parfait"
Marcel: "Quand souhaitez-vous venir?"
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All critical tests passing (100%)
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Code review approved
- [ ] Documentation updated

### Deployment
- [ ] Backup current version
- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Run smoke tests on production

### Post-Deployment
- [ ] Monitor error rates (first 24h)
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Validate payment processing
- [ ] Confirm no regressions

---

## ROLLBACK TRIGGERS

Immediate rollback if:
- Critical test failure rate >5%
- Response time >5 seconds (P95)
- Payment processing errors >1%
- Memory usage >500MB sustained
- Error rate >10% over 5 minutes

---

## MONITORING & ALERTS

### Key Metrics to Monitor
- API response times (target: <2s)
- Error rates (target: <1%)
- Session success rate (target: >85%)
- Memory usage (target: <200MB)
- CPU usage (target: <70%)

### Alert Thresholds
- CRITICAL: Any payment failure
- HIGH: Response time >3s
- MEDIUM: Error rate >5%
- LOW: Memory >300MB

---

## TEST REPORT TEMPLATE

```
TEST EXECUTION REPORT - Marcel V7.0
====================================
Date: [DATE]
Environment: [STAGING/PRODUCTION]
Build: [BUILD_NUMBER]

SUMMARY
-------
Total Tests: X
Passed: X (X%)
Failed: X
Skipped: X

CRITICAL TESTS: [PASS/FAIL]
- Marcel AI: [STATUS]
- Payment System: [STATUS]
- Security: [STATUS]

PERFORMANCE
-----------
Avg Response Time: Xms
Max Response Time: Xms
Memory Usage: XMB
Concurrent Users: X

ISSUES FOUND
------------
1. [Issue description, severity, impact]
2. [Issue description, severity, impact]

RECOMMENDATION
--------------
[READY FOR PRODUCTION / NEEDS FIXES]

Signed: [QA Lead]
```

---

## CONTACT & ESCALATION

**QA Issues**: Report immediately if:
- Critical test failures
- Security vulnerabilities
- Payment system issues
- Data loss risks

**Escalation Path**:
1. Dev Team Lead
2. Product Owner
3. CTO
4. CEO (for revenue-impacting issues)

---

## APPENDIX: TEST COMMANDS REFERENCE

```bash
# Development
npm start              # Start server
npm run dev           # Start in dev mode

# Testing
npm test              # Run Jest tests
npm run test:suite    # Run full test suite
npm run test:e2e      # Run E2E tests
npm run test:smoke    # Run smoke tests
npm run test:all      # Run all tests
npm run test:coverage # Generate coverage report

# CI/CD
npm run test:ci       # Run tests for CI pipeline

# Analysis
npm run analyze       # Run context analyzer
```

---

**FINAL VALIDATION**: This checklist must be 100% complete before production deployment. Any deviation requires written approval from the CTO.

**Revenue Protection**: Remember, every bug in production potentially impacts $1.22M in annual revenue. Test thoroughly, deploy carefully.