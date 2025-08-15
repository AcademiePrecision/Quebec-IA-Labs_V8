# 🚪 Configuration des Ports - SavageCo

## 📋 Allocation des Ports

### 🔧 Développement Local
- **Port 3000** 📱 **App Mobile** (React Native + Expo)
- **Port 3001** 🤖 **Marcel AI** (Serveur Claude IA)
- **Port 54321** 🗄️ **Supabase Local** (Base de données)
- **Port 3002** 💳 **Stripe Webhooks** (Tests locaux)

### 🧪 Tests
- **Port 3100** 📱 **Tests App Mobile**
- **Port 3101** 🤖 **Tests Marcel AI**

## 🚀 Commandes de Développement

### Lancement Séparé
```bash
# Marcel AI sur port 3001
cd Quebec-IA-Labs-V8-Replit_Dev_20250812
set PORT=3001 && npm run dev

# App Mobile sur port 3000 (depuis racine projet)
npm run dev:app
```

### Lancement Simultané (recommandé)
```bash
# Lance les deux en parallèle avec ports séparés
npm run dev:all
```

## ⚠️ Résolution des Conflits de Ports

### Problème: "EADDRINUSE" 
```bash
# Identifier le processus utilisant le port
netstat -ano | findstr :3001

# Windows - Arrêter processus spécifique
taskkill /PID [PID_NUMBER] /F

# Ou arrêter tous les processus Node.js
taskkill /IM node.exe /F
```

### Vérification des Ports Actifs
```bash
# Voir tous les ports 300X utilisés
netstat -ano | findstr ":300"

# Status attendu en développement:
# Port 3000 → App Mobile (Expo)
# Port 3001 → Marcel AI (Express)
```

## 🔧 Configuration Automatique

Les scripts npm gèrent automatiquement l'attribution des ports:

**package.json (racine):**
```json
{
  "scripts": {
    "dev:app": "cd AppMobile && set PORT=3000 && npm run start",
    "dev:marcel": "cd Quebec-IA-Labs-V8-Replit_Dev_20250812 && set PORT=3001 && npm run dev",
    "dev:all": "start npm run dev:marcel && start npm run dev:app"
  }
}
```

**server.js (Marcel AI):**
```javascript
const PORT = process.env.PORT || 3001;  // Port 3001 pour Marcel AI
```

## 🌐 Production

### Marcel AI (Replit)
- Port attribué automatiquement par Replit
- Variable d'environnement: `PORT` (gérée par Replit)
- URL: `https://[replit-name].[username].repl.co`

### App Mobile
- Expo/EAS Build: Pas de port fixe (app native)
- Expo Go: Port dynamique géré par Expo CLI
- Production: App Store / Google Play

## ✅ Validation

### Test de Connectivité
```bash
# Marcel AI - Test API
curl http://localhost:3001/health

# App Mobile - Interface web (si disponible) 
curl http://localhost:3000
```

### Logs Attendus
```
Marcel AI (Port 3001):
✅ Success: Marcel V8.0 Ultimate - Serveur Production Final
✅ Serveur Marcel AI démarré sur le port 3001

App Mobile (Port 3000):
✅ Expo Dev Server running on port 3000
✅ Metro waiting on exp://192.168.x.x:3000
```

## 🔄 Pipeline Replit

Pour le déploiement sur Replit, Marcel AI utilise le port attribué automatiquement:
- **Dev Replit**: Variable PORT automatique
- **Prod Replit**: Variable PORT automatique + domaine custom
- **Local → GitHub → Replit**: Pipeline préservé

---

Cette configuration garantit qu'il n'y aura **aucun conflit de ports** lors du développement simultané de Marcel AI et de l'App Mobile. 🎯