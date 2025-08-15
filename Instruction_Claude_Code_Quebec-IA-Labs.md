# 🎯 Instructions Claude Code - Projet Quebec-IA-Labs
**Version**: 2025-08-12  
**Projet**: Marcel AI Receptionist System  
**Repository**: https://github.com/AcademiePrecision/Quebec-IA-Labs_V8  

## 📁 Architecture du Projet

### Structure des Répertoires
```
C:\Users\franc\.claude\projects\SavageCo\
├── Quebec-IA-Labs-V8-Replit_Dev_20250812\     # 🎯 RÉPERTOIRE MAÎTRE DEV
├── Quebec-IA-Labs-V8-Final\                   # Archive - Version finale
└── Instruction_Claude_Code_Quebec-IA-Labs.md  # Ce fichier
```

### 🔄 Pipeline de Développement OBLIGATOIRE
1. **Développement Local**: `C:\Users\franc\.claude\projects\SavageCo\Quebec-IA-Labs-V8-Replit_Dev_20250812\`
2. **Version Control**: GitHub `AcademiePrecision/Quebec-IA-Labs_V8`
3. **Testing**: Replit DEV environment 
4. **Sync DEV → GitHub → Replit**: Toujours suivre ce flux
5. **Production**: Replit PROD (déployé manuellement après validation)

### 📋 COMMANDES PIPELINE OBLIGATOIRES:

#### 🔧 Pour Claude Code (Développement):
```bash
# Toujours développer dans ce répertoire:
cd "C:\Users\franc\.claude\projects\SavageCo\Quebec-IA-Labs-V8-Replit_Dev_20250812\"

# Après développement et tests locaux:
git add .
git commit -m "Description des changements"
git push origin main
```

#### 🔄 Pour Replit (Récupération):
```bash
# Dans le Shell Replit, exécuter:
git pull origin main

# Vérifier la synchronisation:
git status
```

### ⚠️ RÈGLES PIPELINE STRICTES:
1. **JAMAIS** développer directement sur Replit
2. **TOUJOURS** développer dans `Quebec-IA-Labs-V8-Replit_Dev_20250812\`
3. **OBLIGATOIRE** faire `git push` après tests locaux réussis
4. **OBLIGATOIRE** faire `git pull` sur Replit pour récupérer

## 🚀 Fonctionnalités Actuelles

### Marcel AI System v8.0
- **IA Triple Fallback**: Claude (priorité 1) → OpenAI (priorité 2) → Fallback basique
- **Reconnaissance Clients**: Base de clients connus avec préférences
- **Mémoire de Session**: Contexte persistent entre échanges Twilio
- **Voix Masculine**: Polly.Liam-Neural (français canadien)
- **Anti-Boucle**: Logique intelligente pour éviter répétitions

### Infrastructure Technique
- **Backend**: Node.js + Express
- **IA**: Anthropic Claude + OpenAI GPT
- **Téléphonie**: Twilio (+1 581-710-1240)
- **Base de Données**: Supabase
- **Déploiement**: Replit Pro

### Données Existantes
- **710 lignes** de personas dans `src/utils/mockPersonas.ts`
- **620 lignes** de données IA dans `src/utils/aiValetMockData.ts`
- **Salons établis**: Tony Moreau (Elite), Sophie Tremblay (Prestige)
- **Barbiers**: Marco, Julie, Tony, Alexandre, Marie-Claude
- **Clients test**: +14189510161 (François, Marie-Claude, Kevin)

## 🎭 Agents Spécialisés Disponibles

### 1. **ba-001-business-analyst**
**Usage**: Analyse ROI, requirements, priorités business
**Quand l'utiliser**: Avant toute fonctionnalité majeure, analyse d'impact
**Exemple**: _"Analyser l'impact business du support multi-salon"_

### 2. **dev-002-senior-developer** 
**Usage**: Architecture code, optimisation performance, review technique
**Quand l'utiliser**: Pour architecture complexe, optimisations, code review
**Exemple**: _"Revoir l'architecture IA triple fallback"_

### 3. **ux-003-interface-designer**
**Usage**: UX/UI design, expérience utilisateur voix, conversion
**Quand l'utiliser**: Amélioration expérience utilisateur, flows conversation
**Exemple**: _"Optimiser le flow de réservation téléphonique"_

### 4. **qa-004-quality-tester**
**Usage**: Tests automatisés, scenarios de test, validation qualité
**Quand l'utiliser**: Avant déploiement, création tests, debug
**Exemple**: _"Créer tests pour conversation Marcel multi-salon"_

### 5. **sec-005-security-expert**
**Usage**: Audit sécurité, vulnérabilités, PCI compliance
**Quand l'utiliser**: Review sécurité, audit avant production
**Exemple**: _"Auditer sécurité intégration Stripe"_

### 6. **data-006-analytics-expert**
**Usage**: Analytics, KPIs, tracking, insights données
**Quand l'utiliser**: Métriques performance, analytics setup
**Exemple**: _"Configurer tracking performance Marcel"_

### 7. **market-007-growth-hacker**
**Usage**: Stratégies croissance, acquisition utilisateurs, viral
**Quand l'utiliser**: Stratégies expansion, marketing viral
**Exemple**: _"Stratégie expansion multi-salon"_

### 8. **content-008-creator**
**Usage**: Contenu éducatif, documentation, copy marketing
**Quand l'utiliser**: Documentation, contenu formation, copy
**Exemple**: _"Créer documentation Marcel pour salons"_

### 9. **support-009-customer-success**
**Usage**: Support client, rétention, workflows support
**Quand l'utiliser**: Optimisation support, rétention clients
**Exemple**: _"Optimiser support clients salons partenaires"_

### 10. **finance-010-revenue-optimizer**
**Usage**: Analyse financière, pricing, optimisation revenus
**Quand l'utiliser**: Stratégie prix, analyse revenus, ROI
**Exemple**: _"Analyser pricing multi-salon"_

### 11. **ops-011-devops-automation**
**Usage**: Déploiement, CI/CD, infrastructure, monitoring
**Quand l'utiliser**: Setup déploiement, monitoring, automation
**Exemple**: _"Configurer pipeline GitHub → Replit"_

### 12. **ai-012-intelligence-expert**
**Usage**: IA avancée, ML, optimisation algorithmes IA
**Quand l'utiliser**: Optimisation IA, nouveaux modèles, intelligence
**Exemple**: _"Optimiser intelligence Marcel pour multi-salon"_

## 🔄 Workflow de Développement OBLIGATOIRE

### Phase 1: Compréhension (TOUJOURS)
1. **Poser 1-2 questions de clarification** pour comprendre la demande
2. **Attendre les réponses** avant de procéder
3. **Reformuler** la compréhension pour validation

### Phase 2: Consultation Agents (TOUJOURS)
1. **Identifier les agents pertinents** (minimum 2)
2. **Consulter avec Task tool** pour avis et améliorations
3. **Synthétiser** les recommandations des agents

### Phase 3: Proposition (TOUJOURS)
1. **Présenter plan d'action détaillé** avec:
   - Fichiers à modifier
   - Fonctionnalités ajoutées/modifiées
   - Risques identifiés
   - Ordre d'implémentation
2. **Attendre l'approbation GO** explicite

### Phase 4: Développement (Après GO seulement)
1. **Modifier les fichiers** dans `Quebec-IA-Labs-V8-Replit_Dev_20250812\`
2. **Tester localement** si possible
3. **Commit vers GitHub** avec message descriptif
4. **Informer** de la mise à jour pour test DEV

### Phase 5: Validation (Collaboratif)
1. **Test environnement DEV** sur Replit
2. **Validation fonctionnelle** avec utilisateur
3. **Déploiement PROD** (manuel par utilisateur)

## 📊 Standards de Qualité

### Code
- **Commentaires français** pour logique métier
- **Variables descriptives** 
- **Gestion d'erreurs** robuste
- **Logs structurés** pour debug

### IA/Marcel
- **Réponses < 3 secondes**
- **Personnalité joviale Quebec**
- **Mémoire contextuelle**
- **Fallback gracieux**

### Tests
- **Test numéro**: +14189510161
- **Scénarios critiques**: Réservation, reconnaissance client, multi-salon
- **Performance**: Temps réponse, taux succès

## 🚨 Points Critiques

### À NE JAMAIS faire
- Modifier directement en production
- Ignorer les agents spécialisés
- Développer sans validation utilisateur
- Oublier les commits GitHub

### À TOUJOURS faire
- Poser questions clarification
- Consulter agents pertinents
- Proposer avant développer
- Utiliser répertoire maître DEV
- Committer changements

## 🎯 Objectifs Business

### Revenue Potential
- **$1.22M** potentiel annuel identifié
- **Multi-salon** = expansion revenus
- **Automatisation** = réduction coûts

### Metrics Clés
- Taux conversion appels → réservations
- Temps moyen traitement appel
- Satisfaction client (feedback vocal)
- Adoption salons partenaires

## 📞 Configuration Actuelle

### Twilio
- **Numéro**: +1 (581) 710-1240
- **Webhook**: `/webhook/twilio`
- **Voix**: Polly.Liam-Neural (masculin, français CA)

### APIs
- **Claude**: Anthropic API (priorité 1)
- **OpenAI**: GPT-3.5-turbo (fallback 2) 
- **Supabase**: Base données
- **Stripe**: Paiements (sandbox → production)

### Environnements
- **DEV**: Quebec-IA-Labs-V8-Replit_Dev_20250812
- **PROD**: Replit production
- **GitHub**: AcademiePrecision/Quebec-IA-Labs

---

**🔥 RAPPEL CRUCIAL**: Suivre TOUJOURS le workflow en 5 phases. Aucune exception. La consultation des agents et la validation utilisateur sont OBLIGATOIRES avant tout développement.