# CLAUDE.md - Guide de Référence Académie Précision

## 🎯 Vue d'Ensemble du Projet

**Académie Précision** est une plateforme de formation révolutionnaire pour barbiers et coiffeurs, combinant une application mobile, des services IA avancés et une infrastructure cloud moderne.

### 🏗️ Architecture Multi-Services

```
📱 ACADÉMIE PRÉCISION (Écosystème Complet)
    │
    ├── 🎨 Frontend Mobile (React Native/Expo)
    │   ├── Interface Barbiers/Coiffeurs
    │   ├── Système de Formations Vidéo
    │   ├── Dashboard Analytics
    │   └── Intégration Valet IA
    │
    ├── 🔧 Backend Services
    │   ├── 📞 Valet IA (Node.js/Twilio sur Replit)
    │   ├── 🎤 ElevenLabs (Synthèse vocale IA)
    │   ├── 🗄️ Base de données (Supabase)
    │   ├── 💳 Paiements (Stripe)
    │   ├── 🤖 IA Services (Claude/OpenAI)
    │   └── 🔐 Authentification (Supabase Auth)
    │
    └── 🌐 Infrastructure
        ├── Version Control (GitHub)
        ├── Hosting (Supabase)
        ├── CDN & Assets
        └── Monitoring & Analytics
```

## 📍 Emplacements des Projets

### 1. **Application Mobile (Local)**
- **Chemin:** `C:\Users\franc\.claude\projects\SavageCo`
- **Tech:** React Native, Expo, TypeScript, NativeWind
- **Commande:** `npx expo start`
- **Accès:** Expo Go sur iPad/iPhone

### 2. **Service Valet IA (Replit)**
- **URL:** `https://nodejs.YOUR-USERNAME.repl.co`
- **Prod:** `https://valet-ia-salons.replit.app`
- **Tech:** Node.js, Express, Twilio
- **Fichiers:** `index.js`, `package.json`

### 3. **Backend Supabase**
- **URL:** `academie-precision.supabase.co`
- **Dashboard:** `https://app.supabase.com/project/[PROJECT-ID]`
- **Services:** PostgreSQL, Auth, Storage, Edge Functions

## 🚀 Commandes Essentielles

### Développement Local
```bash
# Navigation vers le projet
cd C:\Users\franc\.claude\projects\SavageCo

# Installation des dépendances
npm install

# Lancer l'app mobile
npx expo start

# Lancer avec nettoyage cache
npx expo start --clear

# Build de production
eas build --platform ios
eas build --platform android
```

### Synchronisation Git
```bash
# Récupérer les derniers changements
git pull origin main

# Voir le statut
git status

# Sauvegarder vos changements
git add .
git commit -m "Description des changements"
git push origin main
```

### Gestion Replit
```bash
# Dans le shell Replit
npm install
npm start

# Voir les logs
pm2 logs

# Redémarrer le service
pm2 restart all
```

## 🎨 Structure du Projet Mobile

```
academie-precision/              # Nom du projet
├── 📱 app/                    # Screens principales
│   ├── (auth)/               # Écrans authentification
│   ├── (tabs)/               # Navigation principale
│   └── _layout.tsx           # Configuration navigation
├── 🎨 components/            # Composants réutilisables
│   ├── ui/                   # Composants UI de base
│   ├── forms/                # Formulaires
│   └── shared/               # Composants partagés
├── 🔧 hooks/                 # Custom React hooks
├── 📦 lib/                   # Utilitaires et helpers
├── 🎭 assets/                # Images, fonts, etc.
├── 🌐 services/              # Appels API
└── 📋 types/                 # TypeScript definitions
```

## 🔑 Variables d'Environnement

**⚠️ IMPORTANT : Ne PAS mettre vos vraies clés dans ce fichier !**

Claude Code a déjà accès à toutes vos clés via :
- **Replit :** Secrets (panneau cadenas 🔒)
- **Local :** Fichier `.env.local` (ne jamais commit)
- **Supabase :** Variables d'environnement du projet

### Références des Clés (NE PAS REMPLIR)
```env
# Supabase (Claude Code a déjà ces clés)
EXPO_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Services API
EXPO_PUBLIC_API_URL=https://valet-ia-salons.replit.app
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Twilio (Claude Code les a dans Replit)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=[secret]
TWILIO_PHONE_NUMBER=+15817101240

# ElevenLabs (pour synthèse vocale)
ELEVENLABS_API_KEY=[secret]

# OpenAI (si utilisé)
OPENAI_API_KEY=sk-...
```

**📌 Où trouver/vérifier vos clés :**
- **Replit :** Icône cadenas → Secrets
- **Local :** Fichier `.env.local` (caché)
- **Twilio :** https://console.twilio.com
- **ElevenLabs :** https://elevenlabs.io/api-keys
```

## 📋 Templates Claude Code

### 🎯 Template Général
```
Claude Code,
PROJET : Académie Précision
PARTIE : [Mobile App / Valet IA / Backend / Database]
ENVIRONNEMENT : [Local / Replit / Supabase]
FICHIER : [Chemin exact du fichier]
ACTION : [Description précise de la tâche]
CONTEXTE : [Informations supplémentaires]
CONTRAINTES : [Ce qu'il ne faut pas toucher]
```

### 📱 Travail sur Mobile
```
Claude Code,
PARTIE : Application Mobile React Native
ENVIRONNEMENT : Local (C:\Users\franc\.claude\projects\SavageCo)
SESSION : Focus Mobile uniquement
CONFIRME : Ne touche PAS aux services backend
```

### 📞 Travail sur Valet IA
```
Claude Code,
PARTIE : Service Valet IA
ENVIRONNEMENT : Replit (nodejs.repl.co)
SESSION : Backend Twilio uniquement
CONFIRME : Ne touche PAS à l'app mobile
```

## 🛠️ Workflows Courants

### 1. Ajouter une Nouvelle Fonctionnalité Mobile
```bash
1. Claude Code : "SESSION Mobile - Ajoute [fonctionnalité]"
2. Test local : npx expo start
3. Validation sur iPad/iPhone
4. Git commit et push
```

### 2. Modifier le Valet IA
```bash
1. Claude Code : "SESSION Valet IA - Modifie [comportement]"
2. Test sur Replit
3. Appel test au +15817101240
4. Validation des webhooks
```

### 3. Synchronisation Complète
```bash
1. Claude Code : "RAPPORT état complet du projet"
2. Git pull sur local
3. npm install si nouvelles dépendances
4. Relancer tous les services
```

## 🚨 Résolution de Problèmes

### Expo ne démarre pas
```bash
# Clear cache
npx expo start --clear

# Réinstaller
rm -rf node_modules
npm install
```

### Valet IA ne répond pas
```
1. Vérifier Replit est "Awake"
2. Vérifier webhooks Twilio
3. Consulter logs : pm2 logs
```

### Erreurs de synchronisation
```bash
# Forcer la synchronisation
git fetch --all
git reset --hard origin/main
```

## 📊 État du Projet

### ✅ Complété
- [x] Structure de base Mobile App
- [x] Configuration Supabase
- [x] Intégration Twilio
- [x] Navigation de base

### 🚧 En Cours
- [ ] Service Valet IA (beaucoup à faire)
- [ ] Intégration ElevenLabs pour voix IA
- [ ] Système de formations vidéo
- [ ] Dashboard analytics complet
- [ ] Intégration paiements Stripe
- [ ] Notifications push

### 📅 Prochaines Étapes
1. **PRIORITÉ ABSOLUE : Compléter le Valet IA**
   - [ ] Créer les avatars personnalisés
   - [ ] Intégrer ElevenLabs pour voix naturelles
   - [ ] Entraîner l'IA sur scénarios salons
   - [ ] Tests intensifs appels réels
   - [ ] Optimiser les réponses en français

2. **Intégration Frontend Valet IA**
   - [ ] Interface salon/barbier pour config Valet
   - [ ] Dashboard appels et analytics
   - [ ] Personnalisation par salon

3. **Nouvelle Feature : Grand Public**
   - [ ] Interface client "Trouve ta coupe"
   - [ ] Matching IA client-barbier
   - [ ] Réservation directe via Valet

4. **Système de réservations complet**
5. **Formations vidéo et certifications**

## 🔐 Informations Sensibles

**NE JAMAIS COMMIT :**
- Clés API
- Tokens d'authentification
- Mots de passe
- Numéros de téléphone clients

**Utiliser :**
- Variables d'environnement
- Fichiers .env.local
- Secrets Replit/Vercel

## 📞 Support & Contact

### Ressources Techniques
- Documentation Expo: https://docs.expo.dev
- Supabase Docs: https://supabase.com/docs
- Twilio Console: https://console.twilio.com

### Commandes d'Urgence
```
STOP Claude Code !
Claude Code ROLLBACK dernier changement
Claude Code RAPPORT erreurs actuelles
```

## 🎯 Vision du Projet

Académie Précision vise à révolutionner la formation professionnelle dans l'industrie de la beauté en combinant :
- Formation personnalisée par IA
- Gestion de salon automatisée
- Réseautage professionnel
- Certification blockchain
- Expansion internationale

---

*Dernière mise à jour : [Date]*
*Version : 1.0.0*