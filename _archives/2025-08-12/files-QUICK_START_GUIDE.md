# 🚀 QUICK START - Académie Précision Ecosystem

## 🎯 DEUX APPLICATIONS EN UNE

Ce projet contient **2 applications distinctes** qui coexistent parfaitement:

### 📱 **APP MOBILE** (React Native + Expo)
Interface utilisateur pour barbiers, salons, formateurs, étudiants
- **Nouvelle refonte**: Thème "Professional Edge" 
- **Écrans**: Dashboard, Analytics, Valet IA, etc.
- **Plateforme**: iOS, Android, Web

### 🤖 **VALET IA MARCEL** (Node.js + Express)  
Intelligence artificielle qui gère les appels téléphoniques 24/7
- **Numéro**: +1 (581) 710-1240
- **Hébergé**: Replit Pro (Always On)
- **IA**: OpenAI GPT + ElevenLabs voices

---

## ⚡ DÉMARRAGE RAPIDE

### 🔧 Setup Initial (une fois)
```bash
cd C:\Users\franc\.claude\projects\SavageCo
npm install
```

### 📱 Lancer l'App Mobile 
```bash
npm run mobile
# Puis scanner le QR code avec Expo Go sur iPad/iPhone
```

### 🤖 Tester Marcel Localement
```bash
npm run marcel
# Marcel démarre sur http://localhost:3000
```

### 🆘 Aide Commandes
```bash
npm run help
# Affiche toutes les commandes disponibles
```

---

## 📋 COMMANDES DISPONIBLES

### 📱 App Mobile (React Native)
```bash
npm run mobile          # Lancer Expo dev server
npm run mobile:clear    # Lancer avec cache clear
npm run android         # Forcer Android
npm run ios            # Forcer iOS  
npm run web            # Version web
```

### 🤖 Valet IA Marcel (Node.js)
```bash
npm run marcel         # Démarrer Marcel production
npm run marcel:dev     # Mode développement (auto-reload)
npm run marcel:test    # Serveur test minimal
```

### 🔧 Tests & Utils
```bash
npm run test:services  # Tester tous les services
npm run test:elevenlabs # Tester ElevenLabs API
npm run check:config   # Vérifier configuration
npm run setup:env      # Setup environnement
```

### 🎯 Build & Deploy
```bash
npm run build          # Build app mobile
npm run deploy:mobile  # Deploy app mobile
npm run deploy:marcel  # Instructions Replit
```

---

## 🌐 URLS DE PRODUCTION

### 🤖 Valet IA Marcel (Live)
- **Numéro**: +1 (581) 710-1240 ☎️
- **URL**: https://AcademiePrecision.replit.app
- **Status**: https://AcademiePrecision.replit.app/health
- **Webhook**: https://AcademiePrecision.replit.app/webhook/twilio/voice

### 📱 App Mobile (Development)
- **Local**: http://localhost:19006 (Expo)
- **Mobile**: Expo Go app avec QR code

---

## 🔥 NOUVELLES FONCTIONNALITÉS

### ✨ Refonte Visuelle "Professional Edge"
- **🎨 Thème**: Dark-first avec rouge accent (#E53E3E)
- **🏆 Premium**: Or pour revenus (#D69E2E)  
- **📊 Dashboard**: Métriques visuelles immersives
- **🎯 UX**: Validé par expert pour conversion optimale

### 🤖 Valet IA Marcel v4.1.0
- **💬 Conversations**: OpenAI GPT naturelles
- **🔊 Voix**: ElevenLabs français québécois
- **📞 Appels**: Queue + analytics temps réel
- **🧠 Smart**: Détection automatique intentions

---

## 🚨 EN CAS DE PROBLÈME

### App Mobile ne démarre pas
```bash
npm run mobile:clear    # Clear cache Expo
npm install            # Réinstaller dépendances
```

### Marcel ne répond pas
```bash
npm run marcel         # Redémarrer localement
# Puis check https://AcademiePrecision.replit.app
```

### Erreurs TypeScript
```bash
npm run typecheck      # Vérifier erreurs
npm run lint          # Fix style
```

---

## 💎 STATUT ACTUEL

### ✅ COMPLETÉ
- [x] Refonte visuelle Professional Edge
- [x] Nouveaux composants professionnels
- [x] SalonDashboard redesign complet
- [x] Valet Marcel IA fonctionnel
- [x] Dual package.json setup

### 🚧 PROCHAINES ÉTAPES  
- [ ] Navigation redesign
- [ ] Autres écrans Professional Edge
- [ ] Animations subtiles
- [ ] Tests performance

---

**🎯 RÉSUMÉ**: Vous avez maintenant un écosystème dual parfaitement fonctionnel!**

**📱 APP MOBILE**: Interface rebelle professionnelle  
**🤖 VALET MARCEL**: IA qui gère vos appels 24/7

**Prêt à révolutionner l'industrie de la coiffure! 🔥**