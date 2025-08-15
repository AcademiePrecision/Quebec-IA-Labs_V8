#!/usr/bin/env node
/**
 * 🚀 SCRIPT DE DÉPLOIEMENT MARCEL V8.0 ULTIMATE POUR REPLIT
 * Ce script prépare Marcel pour fonctionner sans conflits React sur Replit
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Déploiement Marcel V8.0 Ultimate pour Replit...');

// 1. Backup du package.json principal s'il existe
const mainPackageJson = path.join(__dirname, 'package.json');
const backupPackageJson = path.join(__dirname, 'package.json.app-backup');

if (fs.existsSync(mainPackageJson)) {
  console.log('📦 Sauvegarde du package.json principal...');
  fs.renameSync(mainPackageJson, backupPackageJson);
}

// 2. Créer un package.json minimaliste pour Replit
const replitPackageJson = {
  "name": "marcel-v8-replit-production",
  "version": "8.0.0",
  "description": "Marcel V8.0 Ultimate - Production Replit (sans React)",
  "main": "quebec-ia-labs-fresh/main.js",
  "scripts": {
    "start": "cd quebec-ia-labs-fresh && npm install && node main.js",
    "dev": "cd quebec-ia-labs-fresh && node main.js",
    "marcel": "node quebec-ia-labs-fresh/main.js"
  },
  "dependencies": {},
  "engines": {
    "node": ">=18.0.0"
  },
  "private": true
};

fs.writeFileSync(mainPackageJson, JSON.stringify(replitPackageJson, null, 2));
console.log('✅ Package.json Replit créé');

// 3. Mettre à jour le .replit pour Marcel
const replitConfig = `entrypoint = "quebec-ia-labs-fresh/main.js"
modules = ["nodejs-22"]

run = "cd quebec-ia-labs-fresh && npm install && node main.js"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "cd quebec-ia-labs-fresh && npm install && node main.js"]
deploymentTarget = "cloudrun"
ignorePorts = false

[env]
NODE_ENV = "production"
PORT = "9000"
ANTHROPIC_API_KEY = "sk-ant-api03-gu2gohc4sha1Thohpeep7ro9vie1ikai-n0tr3al"

[[ports]]
localPort = 9000
externalPort = 80
`;

fs.writeFileSync(path.join(__dirname, '.replit'), replitConfig);
console.log('✅ Configuration .replit mise à jour');

// 4. Créer .replitignore pour éviter les conflits
const replitIgnore = `# Ignore tout ce qui peut causer des conflits React
node_modules/
*.backup
*.old
App.tsx
src/
android/
ios/
web/
assets/images/
.expo/
expo.json
babel.config.js
metro.config.js
tailwind.config.js
patches/

# Garder seulement Marcel
!quebec-ia-labs-fresh/
!quebec-ia-labs-fresh/**

# Ignorer les logs
*.log
.DS_Store
.env.local
dist/
build/
`;

fs.writeFileSync(path.join(__dirname, '.replitignore'), replitIgnore);
console.log('✅ .replitignore créé');

// 5. Vérifier que Marcel a tout ce qu'il faut
const marcelDir = path.join(__dirname, 'quebec-ia-labs-fresh');
if (!fs.existsSync(marcelDir)) {
  console.error('❌ Dossier quebec-ia-labs-fresh manquant!');
  process.exit(1);
}

const marcelPackageJson = path.join(marcelDir, 'package.json');
const marcelMainJs = path.join(marcelDir, 'main.js');

if (!fs.existsSync(marcelPackageJson)) {
  console.error('❌ package.json de Marcel manquant!');
  process.exit(1);
}

if (!fs.existsSync(marcelMainJs)) {
  console.error('❌ main.js de Marcel manquant!');
  process.exit(1);
}

console.log('✅ Marcel V8.0 Ultimate prêt pour Replit');
console.log('');
console.log('📝 Prochaines étapes:');
console.log('1. Commit et push ces changements vers GitHub');
console.log('2. Sur Replit, pull les changements depuis GitHub');  
console.log('3. Cliquer Run - Marcel devrait démarrer sans erreur!');
console.log('');
console.log('🔗 Marcel sera accessible sur: https://ton-repl.replit.dev:9000');
console.log('📞 Webhook Twilio: https://ton-repl.replit.dev:9000/webhook/twilio');
console.log('');
console.log('🎉 Marcel V8.0 Ultimate avec Claude AI sera opérationnel!');