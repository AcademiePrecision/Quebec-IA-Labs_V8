# 🧠 Marcel Trainer DEV

Système d'entraînement intelligent pour Valet-IA Marcel - **Version Développement**

![Version](https://img.shields.io/badge/version-1.0.0--dev-orange)
![Langue](https://img.shields.io/badge/langue-français%20québécois-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## 🎯 **Objectif**

Serveur de développement **100% isolé** pour tester et améliorer Marcel sans affecter la production.

## ⚡ **Démarrage Rapide**

### 1. **Sur Replit (Recommandé)**

```bash
# 1. Créer nouveau Replit avec Node.js
# 2. Importer tous les fichiers de Marcel-Trainer-Dev/
# 3. Lancer
npm install
npm start
```

### 2. **En local**

```bash
git clone [votre-repo]
cd Marcel-Trainer-Dev
npm install
cp .env.example .env
npm start
```

### 3. **Accéder au Dashboard**

```
http://localhost:3000/test-marcel
# ou sur Replit:
https://marcel-trainer-dev.replit.app/test-marcel
```

## 🏗️ **Architecture**

```
Marcel-Trainer-Dev/
├── marcel-dev-server.js      # 🚀 Serveur principal DEV
├── marcel-trainer.js         # 🧠 Système de formation  
├── context-analyzer.js       # 🔍 Analyseur contexte
├── scenarios.json           # 📋 25 tests québécois
├── public/
│   └── test-marcel.html     # 🎨 Dashboard interactif
├── package.json
├── .env.example
└── README.md
```

## 🔌 **API Endpoints**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Status serveur DEV |
| `/test-marcel` | GET | Dashboard interactif |
| `/test-marcel-response` | POST | Test réponse temps réel |
| `/train-marcel` | GET | Formation complète (25 tests) |
| `/training-report` | GET | Rapport détaillé |
| `/analyze-context` | POST | Analyse contextuelle |
| `/dev-metrics` | GET | Métriques temps réel |

## 🧪 **Tests Disponibles**

### **25 Scénarios Québécois**
- ✅ **Salutations** (`"Allô, c'est-tu ouvert?"`)
- 📅 **Rendez-vous** (`"J'veux une coupe à matin"`)
- 💰 **Prix** (`"C'est combien la barbe?"`)
- 🕒 **Horaires** (`"Ouvert à soir?"`)
- 🔄 **Anti-boucles** (Marcel se souvient!)
- 😵 **Cas difficiles** (clients confus, accents)
- 📋 **Validation** (résumé final)

### **Test Critique**
```javascript
// Test anti-boucle CRITIQUE
"Rendez-vous coupe homme"     → "Quand souhaitez-vous?"
"Mardi après-midi"            → "Quelle heure?"
"Coupe homme"                 → ❌ NE DOIT PAS redemander le service!
```

## 🎨 **Dashboard Fonctionnalités**

- 💬 **Chat temps réel** avec Marcel
- 🎭 **Scénarios rapides** (1 clic)
- 🚀 **Formation automatique** (25 tests)
- 📊 **Métriques visuelles**
- 🔍 **Analyse contexte**
- 📋 **Rapport détaillé**

## 🇨🇦 **Expressions Québécoises Testées**

```javascript
"à matin" → "ce matin"
"à soir" → "ce soir" 
"c'est-tu" → "est-ce que"
"peux-tu" → "peux-tu"
"j'aimerais ça" → "j'aimerais"
"bin" → "bien"
"pas pire" → "correct"
```

## 🚀 **Utilisation**

### **Test Manuel**
1. Ouvrir `/test-marcel`
2. Taper: `"Allô, j'veux une coupe à matin"`
3. Voir réponse Marcel + analyse

### **Formation Automatique**
1. Cliquer "Formation Complète"
2. 25 tests automatiques en ~30 secondes
3. Rapport avec erreurs et recommandations

### **API Directe**
```javascript
// Test une phrase
fetch('/test-marcel-response', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    userInput: "J'veux une coupe homme mardi 14h",
    sessionId: "test-123"
  })
})
```

## 📊 **Métriques Suivies**

- 📈 **Taux de succès** (cible: >80%)
- ⏱️ **Temps de réponse** (cible: <2s)
- 🎯 **Confiance moyenne** (cible: >70%)
- 🔄 **Tests anti-boucles** (cible: 100%)
- 🇨🇦 **Reconnaissance québécoise**

## 🔧 **Configuration**

### **Variables .env**
```bash
NODE_ENV=development
MARCEL_DEV_MODE=true
DEBUG_LOGS=true
ENABLE_CONVERSATION_MEMORY=true
```

### **Seuils de Succès**
```json
{
  "minimum_pass_rate": 75,
  "critical_scenarios_pass_rate": 90,
  "performance_max_response_time": 3000
}
```

## 🚨 **Mode DEV vs PROD**

| Aspect | DEV | PROD |
|--------|-----|------|
| **Twilio** | ❌ Désactivé | ✅ Webhooks actifs |
| **Logs** | 📝 Détaillés | 📊 Métriques |
| **CORS** | 🌐 Ouvert | 🔒 Restreint |
| **Tests** | 🧪 25 scénarios | 📱 Vrais clients |
| **Données** | 🎭 Simulées | 💾 Supabase |

## 🐛 **Dépannage**

### **Serveur ne démarre pas**
```bash
# Vérifier Node.js version
node --version  # Doit être >=18

# Réinstaller dépendances
rm -rf node_modules
npm install
```

### **Dashboard ne charge pas**
1. Vérifier URL: `/test-marcel`
2. Vérifier console navigateur (F12)
3. Vérifier fichier `public/test-marcel.html` existe

### **Tests échouent**
1. Vérifier `scenarios.json` valide
2. Logs serveur pour erreurs
3. Tester API individuellement

## 📝 **Logs Utiles**

```bash
# Logs détaillés activés par défaut en DEV
[2025-08-06] [REQUEST] POST /test-marcel-response
[2025-08-06] [MARCEL] Simulation réponse: "J'veux une coupe"
[2025-08-06] [SUCCESS] Test réussi en 245ms
```

## 🚀 **Prochaines Étapes**

1. ✅ Tester les 25 scénarios
2. 📊 Analyser taux de succès 
3. 🔧 Corriger erreurs identifiées
4. 🎯 Améliorer reconnaissance québécoise
5. 📈 Optimiser temps de réponse
6. 🔄 Intégrer améliorations en PROD

## 💡 **Conseils**

- **Utilisez Ctrl+Enter** pour envoyer message
- **Utilisez Ctrl+T** pour formation complète
- **Testez expressions québécoises** variées
- **Vérifiez anti-boucles** (critique!)
- **Regardez métriques** temps réel

## 🤝 **Support**

- 📧 Email: [votre-email]
- 💬 Slack: #marcel-dev
- 📚 Doc: Voir ce README
- 🐛 Bugs: GitHub Issues

---

**🧠 Marcel Trainer DEV - Rendons Marcel encore plus intelligent!** 🇨🇦

*Projet par Franky - Académie Précision*