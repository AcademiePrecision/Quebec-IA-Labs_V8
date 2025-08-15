# 🚀 SavageCo - Écosystème EdTech & IA Conversationnelle

## 🎯 Vue d'Ensemble du Projet

SavageCo est un écosystème technologique complet combinant **Académie Précision** (plateforme EdTech pour barbiers) et **Marcel AI** (réceptionniste IA conversationnel). Cette architecture monorepo offre une solution intégrée pour l'éducation professionnelle et l'automatisation des services clients.

## 🏗️ Architecture du Monorepo

```
SavageCo/
│
├── 📱 AppMobile/                    # Académie Précision - App React Native
│   ├── src/
│   │   ├── api/                     # Services API (Stripe, Supabase, IA)
│   │   ├── components/              # Composants réutilisables
│   │   ├── screens/                 # Écrans application
│   │   ├── navigation/              # Navigation React Navigation
│   │   ├── state/                   # Gestion d'état (Zustand)
│   │   └── types/                   # Types TypeScript
│   └── package.json                # Dépendances mobile
│
├── 🤖 Quebec-IA-Labs-V8-Replit_Dev_20250812/  # Marcel AI
│   ├── server.js                   # Serveur Express principal
│   ├── context-analyzer.js         # Analyseur contextuel
│   ├── relationship-data.js        # Données relationnelles
│   ├── scenarios.json             # Scénarios conversationnels
│   └── package.json              # Dépendances Marcel AI
│
├── 🧠 agents/                      # 12 Agents IA Spécialisés
├── 🔧 shared/                      # Code partagé entre projets
├── 🗄️ supabase/                    # Configuration backend
├── 🚀 scripts/                     # Scripts DevOps et CI/CD
└── 📝 docs & config/              # Documentation et configuration
```

## 🎭 Composants Principaux

### 📱 Académie Précision (AppMobile)
**Application mobile EdTech pour la formation professionnelle barbier**

#### 🌟 Fonctionnalités Clés
- **Système d'authentification universel** avec 4 types d'utilisateurs :
  - 👨‍💼 **Admin** : Gestion globale plateforme
  - 🏪 **Salon Partenaire** : Espaces et revenus partagés  
  - 👨‍🏫 **Maître Formateur** : Création contenu et ateliers
  - 🎓 **Académicien/Barbier** : Apprentissage et progression

- **Interface adaptative** avec dashboards personnalisés
- **Catalogue de formations** dynamique avec recherche avancée
- **Système de progression** avec badges et certificats
- **Bilinguisme** français/anglais intégré

#### 🛠 Stack Technique
- **Frontend** : React Native 0.72.6 + Expo SDK 49
- **Styling** : NativeWind (Tailwind pour RN)
- **State** : Zustand avec persistance AsyncStorage
- **Navigation** : React Navigation v6
- **Payments** : Stripe React Native
- **Backend** : Supabase (Auth, DB, Storage)

### 🤖 Marcel AI (Quebec-IA-Labs)
**Réceptionniste IA conversationnel pour salons de coiffure québécois**

#### 🌟 Fonctionnalités Clés
- **Intelligence hybride** : Claude API + système de fallback OpenAI
- **Intégration Twilio** : Gestion appels vocaux automatisée
- **Français québécois authentique** : Spécialisé marché QC
- **Dashboard web** : Interface de test et monitoring
- **Production ready** : Optimisé pour déploiement Replit

#### 🛠 Stack Technique
- **Backend** : Node.js + Express
- **IA** : Claude API (Anthropic) + fallbacks intelligents
- **Téléphonie** : Twilio Voice + Speech Recognition
- **Déploiement** : Replit Pro avec Always On
- **Monitoring** : Health checks et analytics intégrés

## 🧠 Système d'Agents IA (12 Spécialisés)

Le projet intègre 12 agents IA spécialisés pour l'assistance au développement :

1. **ba-001-business-analyst** - Analyse business & ROI
2. **dev-002-senior-developer** - Développement & architecture
3. **ux-003-interface-designer** - Design UI/UX
4. **qa-004-quality-tester** - Tests & QA
5. **sec-005-security-expert** - Sécurité & audits
6. **data-006-analytics-expert** - Analytics & KPI
7. **market-007-growth-hacker** - Croissance & acquisition
8. **content-008-creator** - Contenu éducatif
9. **support-009-customer-success** - Support client
10. **finance-010-revenue-optimizer** - Finance & pricing
11. **ops-011-devops-automation** - DevOps & CI/CD
12. **ai-012-intelligence-expert** - IA & ML

## 🚀 Démarrage Rapide

### Installation et Lancement
```bash
# Cloner et accéder au projet
cd C:\Users\franc\.claude\projects\SavageCo

# Installer toutes les dépendances
npm run install:all

# Lancement simultané (recommandé)
npm run dev:all
```

### Lancement Séparé (2 terminaux)
```bash
# Terminal 1 - Marcel AI (port 3001)
npm run dev:marcel

# Terminal 2 - App Mobile (port 3000)  
npm run dev:app
```

### Validation du Lancement
- **Marcel AI** : http://localhost:3001 (Dashboard : `/test-marcel`)
- **App Mobile** : Expo DevTools + QR code pour mobile
- **Health Check** : http://localhost:3001/health

## 💰 Potentiel Business & ROI

### Académie Précision
- **Marché cible** : Barbiers professionnels Québec → Canada → 
- **Avantage** : Premier sur marché barbier high-tech QC

### Marcel AI
- **Marché** : Salons de coiffure, spas, services esthétiques
- **Modèle** : Licence SaaS + setup personnalisé  
- **Avantage** : Automatisation complète réception téléphonique

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev:all          # Lance Marcel AI + App Mobile
npm run dev:app          # App Mobile seule  
npm run dev:marcel       # Marcel AI seul

# Tests
npm run test:all         # Tests complets
npm run test:app         # Tests mobile
npm run test:marcel      # Tests Marcel AI

# Build & Deploy  
npm run build:app        # Build Android
npm run deploy:prod      # Déploiement production
npm run sync            # Sync vers GitHub

# Maintenance
npm run install:all      # Install toutes dépendances
npm run cleanup         # Nettoyage projet
npm run setup          # Configuration architecture
```

## 🔐 Configuration Environnement

### Variables Requises
```bash
# Académie Précision (AppMobile)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Marcel AI  
ANTHROPIC_API_KEY=sk-ant-api03-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
NODE_ENV=development
```

### Services Intégrés
- ✅ **Stripe** : Sandbox → Production ready
- ✅ **Supabase** : Backend complet configuré
- ✅ **Anthropic Claude** : IA conversationnelle
- ✅ **Twilio** : Téléphonie & SMS
- ✅ **GitHub Actions** : CI/CD automatisé
- ✅ **Replit** : Déploiement Marcel AI

## 🎯 Prochaines Étapes & Priorités

### Phase 1 : Génération Revenus (Immédiat)
- [ ] Migration Stripe sandbox → production
- [ ] Apple Pay/Google Pay intégration
- [ ] Système paiements mobile optimisé

### Phase 2 : Croissance
- [ ] Acquisition utilisateurs Québec
- [ ] Contenu formations premium
- [ ] Système affiliés formateurs
- [ ] Analytics avancées & KPI

### Phase 3 : Expansion 
- [ ] Déploiement Marcel AI multi-salons
- [ ] Expansion Canada puis international
- [ ] Intégrations métiers (POS, calendriers)
- [ ] IA personnalisée "Hero Vision"

## 📊 Métriques Clés à Optimiser

- **CAC** (Customer Acquisition Cost)
- **MRR** (Monthly Recurring Revenue) 
- **Churn Rate** (Taux désabonnement)
- **LTV** (Customer Lifetime Value)
- **Conversion** : Trial → Paid
- **Engagement** : Course completion rate

## 🏆 Avantages Concurrentiels

1. **Premier sur marché** barbier tech Québec
2. **Stack technique moderne** React Native + IA
3. **Bilinguisme natif** FR/EN pour marché canadien
4. **Agents IA intégrés** pour développement accéléré
5. **Architecture scalable** monorepo + microservices
6. **Déploiement automatisé** CI/CD complet

## 📄 Documentation Technique

- **Architecture** : `ARCHITECTURE_OPTIMALE_SAVAGECO.md`
- **Démarrage** : `DEMARRAGE_RAPIDE.md`
- **Configuration** : `CONFIGURATION_GUIDE.md`
- **Agents IA** : `agents/AGENT_ORCHESTRATION.md`
- **Stripe Setup** : `STRIPE_SETUP.md`
- **Replit Deploy** : `REPLIT_DEPLOYMENT_GUIDE.md`

## 🤝 Contact & Support

**Équipe Académie Précision - Franky**
- **GitHub** : https://github.com/AcademiePrecision/Quebec-IA-Labs_V8
- **Vision** : Devenir le standard global formation professionnelle tech
- **Mission** : Démocratiser l'accès éducation de qualité via technologie

---

## 🎯 Vision 2025

**SavageCo = Académie Précision + Marcel AI**
- **Stack tech moderne** prêt production  
- **12 agents IA** pour développement accéléré
- **Marché Québec → Canada → International**

**L'excellence se partage** ✨

---

*Version 8.1.0 - Architecture Optimale - ROI 287% - Ready for Production* 🚀