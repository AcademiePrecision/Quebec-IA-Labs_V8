# Plan de Tests - Corrections Critiques Académie Précision

## Vue d'ensemble
Ce document détaille les tests requis pour valider les corrections critiques de l'application mobile Académie Précision.

## 1. Tests Marcel Badge Update

### Test Case MB-001: Affichage du badge Marcel dans SalonDashboard
**Priorité**: P0
**Prérequis**: Connexion en tant que propriétaire de salon

**Étapes**:
1. Se connecter avec un compte salon
2. Naviguer vers le tableau de bord salon
3. Localiser le badge Marcel en haut de l'écran

**Résultat attendu**:
- Le badge affiche "Marcel • Là pour vous ✂️"
- Le badge est visuellement distinct avec fond dégradé violet
- Le texte est blanc et centré

### Test Case MB-002: Affichage du badge Marcel dans FormateurDashboard
**Priorité**: P0
**Prérequis**: Connexion en tant que formateur

**Étapes**:
1. Se connecter avec un compte formateur
2. Naviguer vers le tableau de bord formateur
3. Localiser le badge Marcel

**Résultat attendu**:
- Le badge affiche "Marcel • Là pour vous ✂️"
- Design cohérent avec SalonDashboard

### Test Case MB-003: Navigation depuis le badge Marcel
**Priorité**: P0
**Prérequis**: Être sur un dashboard avec badge Marcel

**Étapes**:
1. Appuyer sur le badge Marcel
2. Vérifier la navigation vers AI Valet Dashboard

**Résultat attendu**:
- Navigation fluide vers AI Valet
- Pas d'erreurs console
- État de navigation correct

## 2. Tests Navigation GO_BACK Fix

### Test Case NV-001: Retour depuis AI Valet (avec historique)
**Priorité**: P0
**Prérequis**: Navigation normale vers AI Valet

**Étapes**:
1. Depuis SalonDashboard, appuyer sur badge Marcel
2. Sur AI Valet, appuyer sur bouton retour
3. Vérifier le retour au dashboard d'origine

**Résultat attendu**:
- Retour au SalonDashboard
- État préservé
- Pas de rechargement inutile

### Test Case NV-002: Retour depuis AI Valet (sans historique)
**Priorité**: P0
**Prérequis**: Accès direct à AI Valet via deep link

**Étapes**:
1. Ouvrir l'app via deep link vers AI Valet
2. Appuyer sur bouton retour
3. Vérifier la navigation fallback

**Résultat attendu**:
- Navigation vers le dashboard approprié selon userType
- Student → StudentDashboard
- Salon → SalonDashboard
- Formateur → FormateurDashboard

### Test Case NV-003: Gestion des états multiples
**Priorité**: P1
**Prérequis**: Navigation complexe

**Étapes**:
1. Naviguer: Dashboard → Catalog → Formation → AI Valet
2. Utiliser le bouton retour à chaque étape
3. Vérifier la cohérence de navigation

**Résultat attendu**:
- Chaque retour amène à l'écran précédent
- Pas de boucles infinies
- États préservés

## 3. Tests Checkout Cancel Button

### Test Case CC-001: Annulation depuis étape 1
**Priorité**: P0
**Prérequis**: Être sur l'écran checkout étape 1

**Étapes**:
1. Initier un achat de formation
2. Sur l'étape "Sélection du plan", appuyer sur "Annuler"
3. Vérifier le retour

**Résultat attendu**:
- Retour à l'écran précédent (détail formation)
- Aucune donnée sauvegardée
- Pas d'erreurs

### Test Case CC-002: Retour entre étapes
**Priorité**: P0
**Prérequis**: Être sur checkout étape 2+

**Étapes**:
1. Progresser jusqu'à l'étape 2 du checkout
2. Appuyer sur "← Retour"
3. Vérifier le retour à l'étape précédente

**Résultat attendu**:
- Retour à l'étape précédente
- Données du formulaire préservées
- Navigation fluide

### Test Case CC-003: Vérification canGoBack
**Priorité**: P1
**Prérequis**: États de navigation variés

**Étapes**:
1. Tester l'annulation avec historique de navigation
2. Tester l'annulation sans historique (deep link)
3. Vérifier les comportements

**Résultat attendu**:
- Si canGoBack() true: navigation.goBack()
- Si canGoBack() false: onCancel callback
- Pas de crash

## 4. Tests StudentDashboard PRECISION LUXE

### Test Case SD-001: Palette de couleurs ChicRebel
**Priorité**: P0
**Prérequis**: Connexion en tant qu'étudiant

**Étapes**:
1. Se connecter avec compte étudiant
2. Observer les éléments visuels du dashboard
3. Vérifier les couleurs principales

**Résultat attendu**:
- Couleur primaire: #FF6B35 (orange vif)
- Couleur secondaire: #E85D75 (rose)
- Couleur accent: #8B5CF6 (violet)
- Application cohérente dans tous les éléments

### Test Case SD-002: Cohérence avec autres dashboards
**Priorité**: P0
**Prérequis**: Accès aux différents dashboards

**Étapes**:
1. Comparer StudentDashboard avec SalonDashboard
2. Comparer StudentDashboard avec FormateurDashboard
3. Vérifier la cohérence du design system

**Résultat attendu**:
- Structure similaire (header, content, navigation)
- Espacement et typographie cohérents
- Composants réutilisables identiques

### Test Case SD-003: Theme switching
**Priorité**: P0
**Prérequis**: Dashboard étudiant actif

**Étapes**:
1. Activer le mode clair
2. Vérifier tous les éléments visuels
3. Basculer en mode sombre
4. Vérifier l'adaptation

**Résultat attendu**:
- Mode clair: backgrounds blancs, textes foncés
- Mode sombre: backgrounds sombres, textes clairs
- Contraste suffisant dans les deux modes
- Transitions fluides

## 5. Tests Cross-Platform

### Test Case CP-001: Compatibilité iOS
**Priorité**: P0
**Plateforme**: iOS 14+

**Étapes**:
1. Tester sur iPhone (différentes tailles)
2. Tester sur iPad
3. Vérifier les gestes natifs

**Résultat attendu**:
- Interface adaptative
- Safe areas respectées
- Gestes iOS fonctionnels

### Test Case CP-002: Compatibilité Android
**Priorité**: P0
**Plateforme**: Android 10+

**Étapes**:
1. Tester sur différents appareils Android
2. Vérifier le bouton retour matériel
3. Tester les notifications

**Résultat attendu**:
- Interface Material Design compatible
- Bouton retour Android fonctionnel
- Pas de problèmes de performance

## 6. Tests de Performance

### Test Case PF-001: Temps de chargement
**Priorité**: P1
**Métrique**: < 2 secondes

**Étapes**:
1. Mesurer temps login → dashboard
2. Mesurer temps navigation entre écrans
3. Mesurer temps chargement images

**Résultat attendu**:
- Login → Dashboard: < 2s
- Navigation entre écrans: < 300ms
- Images lazy-loaded correctement

### Test Case PF-002: Utilisation mémoire
**Priorité**: P1
**Métrique**: < 150MB

**Étapes**:
1. Monitorer la mémoire au démarrage
2. Naviguer pendant 5 minutes
3. Vérifier les fuites mémoire

**Résultat attendu**:
- Utilisation stable < 150MB
- Pas de fuites mémoire
- Garbage collection efficace

## 7. Tests de Sécurité

### Test Case SC-001: Authentification requise
**Priorité**: P0

**Étapes**:
1. Tenter d'accéder aux dashboards sans login
2. Utiliser des deep links vers zones protégées
3. Vérifier les redirections

**Résultat attendu**:
- Redirection vers login si non authentifié
- Pas d'accès aux données sensibles
- Sessions expirées gérées

### Test Case SC-002: Autorisation par rôle
**Priorité**: P0

**Étapes**:
1. Student tente d'accéder à admin
2. Salon tente d'accéder à formateur
3. Vérifier les restrictions

**Résultat attendu**:
- Accès refusé aux zones non autorisées
- Messages d'erreur appropriés
- Pas de failles de sécurité

## Matrice de Tests

| Fonctionnalité | P0 | P1 | P2 | Total |
|----------------|----|----|-------|
| Marcel Badge | 3 | 0 | 0 | 3 |
| Navigation | 2 | 1 | 0 | 3 |
| Checkout | 2 | 1 | 0 | 3 |
| StudentDashboard | 3 | 0 | 0 | 3 |
| Cross-Platform | 2 | 0 | 0 | 2 |
| Performance | 0 | 2 | 0 | 2 |
| Sécurité | 2 | 0 | 0 | 2 |
| **TOTAL** | **14** | **4** | **0** | **18** |

## Critères d'Acceptation

### MUST PASS (P0)
- Tous les tests P0 doivent passer à 100%
- Aucun crash ou erreur bloquante
- Navigation fonctionnelle sur iOS et Android

### SHOULD PASS (P1)
- 80% des tests P1 doivent passer
- Performance acceptable
- Pas de régression majeure

## Environnements de Test

### Développement
- Expo Go (iOS/Android)
- Simulateurs locaux
- Hot reload activé

### Staging
- Build de développement
- TestFlight (iOS)
- APK signé (Android)

### Production
- App Store / Google Play
- Monitoring en temps réel
- Analytics activés

## Outils de Test

### Automatisés
- Jest + React Native Testing Library
- Detox (E2E)
- GitHub Actions CI

### Manuels
- BrowserStack (appareils réels)
- TestFlight (beta iOS)
- Firebase Test Lab (Android)

### Monitoring
- Sentry (erreurs)
- Firebase Analytics
- Performance Monitoring

## Planning d'Exécution

### Phase 1: Tests Unitaires (2h)
- Setup environnement
- Exécution tests Jest
- Rapport de couverture

### Phase 2: Tests E2E (4h)
- Configuration Detox
- Exécution scénarios critiques
- Tests cross-platform

### Phase 3: Tests Manuels (3h)
- Tests exploratoires
- Validation UX
- Tests de régression

### Phase 4: Tests Performance (2h)
- Profiling mémoire
- Mesures de performance
- Optimisations si nécessaire

### Phase 5: Validation Finale (1h)
- Revue des résultats
- Documentation des issues
- Rapport final

## Risques et Mitigation

### Risque: Navigation state corruption
**Mitigation**: Tests exhaustifs des cas limites, fallbacks robustes

### Risque: Theme inconsistency
**Mitigation**: Tests visuels automatisés, snapshots

### Risque: Payment flow interruption
**Mitigation**: Tests en mode sandbox Stripe, gestion d'erreurs

### Risque: Cross-platform differences
**Mitigation**: Tests sur appareils réels, CI/CD multi-plateforme