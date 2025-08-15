# 🤖 DÉPLOIEMENT VALET IA MARCEL - Guide Replit Pro

## 🚨 IMPORTANT: Configuration Duale

Ce projet contient **2 applications distinctes** :

1. **📱 App Mobile** - React Native/Expo (local development)
2. **🤖 Valet IA Marcel** - Node.js/Express (Replit Pro production)

## 🔧 FICHIERS À COPIER DANS REPLIT

Pour déployer Marcel sur Replit Pro, copiez EXACTEMENT ces fichiers :

### Fichiers Principaux
```
replit-server.js        ← SERVEUR PRINCIPAL (Marcel v4.1.0)
package.json           ← Dépendances Node.js
.replit                ← Configuration Replit
```

### Fichiers de Configuration  
```
.env                   ← Variables environnement (secrets)
```

## 📋 CHECKLIST DÉPLOIEMENT

### ✅ 1. Vérifier package.json dans Replit
```json
{
  "name": "valet-ia-marcel",
  "version": "4.1.0", 
  "main": "replit-server.js",
  "scripts": {
    "start": "node replit-server.js"
  }
}
```

### ✅ 2. Vérifier .replit
```
entrypoint = "replit-server.js"
modules = ["nodejs-22"]

[deployment]
run = ["node", "replit-server.js"]
```

### ✅ 3. Configurer les Secrets Replit
Dans Replit, panneau **Secrets** (🔒):
```
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15817101240
ELEVENLABS_API_KEY=...
```

### ✅ 4. Tester le Déploiement
1. **Run** sur Replit
2. Vérifier URL: `https://AcademiePrecision.replit.app`
3. Test webhook: `/webhook/twilio/voice`
4. Appel test: **+1 (581) 710-1240**

## 🎯 COMMANDES LOCALES

Sur votre machine locale, utilisez ces commandes :

```bash
# Lancer l'app mobile React Native
npm run mobile

# Tester Marcel localement  
npm run marcel

# Tester les services
npm run test:services

# Voir toutes les commandes
npm run help
```

## 🔄 WORKFLOW DÉVELOPPEMENT

### Développement Local
```bash
cd C:\Users\franc\.claude\projects\SavageCo
npm run mobile          # App mobile sur iPad/iPhone
npm run marcel          # Test Marcel local
```

### Déploiement Production
```bash
# 1. Tester localement
npm run marcel

# 2. Copier sur Replit
#    - Copier replit-server.js
#    - Vérifier package.json 
#    - Configurer secrets

# 3. Déployer sur Replit Pro
#    - Click "Run"
#    - Always On activé
```

## 🚨 ERREURS FRÉQUENTES

### "MODULE_NOT_FOUND"
➜ **Solution**: Vérifier que `.replit` pointe vers `replit-server.js`

### "Variables environnement manquantes"
➜ **Solution**: Configurer tous les Secrets dans Replit

### "Port occupé"
➜ **Solution**: Replit utilise automatiquement le port 3000

### "Twilio webhook timeout"
➜ **Solution**: Vérifier Always On est activé

## 📞 NUMÉRO PRODUCTION
**Valet IA Marcel**: **+1 (581) 710-1240**

## 🔗 URLS IMPORTANTES
- **Production**: https://AcademiePrecision.replit.app
- **Webhook**: https://AcademiePrecision.replit.app/webhook/twilio/voice
- **Status**: https://AcademiePrecision.replit.app/

---

**🎯 RÉSUMÉ**: L'app mobile reste sur votre machine, Marcel vit sur Replit Pro. Les deux coexistent parfaitement! 🚀