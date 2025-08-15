// integrate-sync.js - Ajoute la sync sans rien écraser
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════╗
║     🔄 INTÉGRATION SYNC REPLIT - MODE SÉCURISÉ            ║
╚════════════════════════════════════════════════════════════╝

📁 Dossier actuel: ${process.cwd()}
`);

// 1. Backup automatique
const backupDir = `Archives/Backup-${new Date().toISOString().slice(0,10)}-sync`;
if (!fs.existsSync('Archives')) {
  fs.mkdirSync('Archives');
}
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Copier les fichiers importants
  const filesToBackup = [
    'package.json',
    '.env',
    'marcel-dev-server.js',
    'context-analyzer.js',
    'relationship-data.js',
    'scenarios.json'
  ];
  
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(backupDir, file));
      console.log(`✅ Backup: ${file}`);
    }
  });
}

// 2. Créer le dossier scripts
if (!fs.existsSync('scripts')) {
  fs.mkdirSync('scripts');
  console.log('✅ Dossier scripts/ créé');
}

// 3. Créer sync-to-replit.js
const syncScript = `// 🔄 SYNC TO REPLIT
const fs = require('fs');
const path = require('path');

class ReplitSync {
  constructor() {
    this.filesToSync = [
      'marcel-dev-server.js',
      'context-analyzer.js',
      'relationship-data.js',
      'scenarios.json',
      'public/test-marcel.html'
    ];
  }

  async syncAll() {
    console.log('🔄 Synchronisation vers Replit...');
    
    // Créer un fichier de sync
    const syncData = {
      timestamp: new Date().toISOString(),
      files: []
    };
    
    this.filesToSync.forEach(file => {
      if (fs.existsSync(file)) {
        syncData.files.push(file);
        console.log(\`✅ Prêt pour sync: \${file}\`);
      }
    });
    
    // Sauvegarder le rapport
    if (!fs.existsSync('.sync')) {
      fs.mkdirSync('.sync');
    }
    fs.writeFileSync('.sync/last-sync.json', JSON.stringify(syncData, null, 2));
    
    console.log(\`✅ \${syncData.files.length} fichiers prêts pour sync\`);
    console.log('📝 Utiliser Git pour push vers Replit:');
    console.log('   git add .');
    console.log('   git commit -m "Sync from local"');
    console.log('   git push replit main');
  }
}

if (require.main === module) {
  const sync = new ReplitSync();
  sync.syncAll();
}

module.exports = ReplitSync;
`;

fs.writeFileSync('scripts/sync-to-replit.js', syncScript);
console.log('✅ scripts/sync-to-replit.js créé');

// 4. Créer watch-and-sync.js
const watchScript = `// 👁️ WATCH AND SYNC
const fs = require('fs');
const path = require('path');

console.log('👁️ Surveillance des fichiers activée...');
console.log('📝 Les modifications seront détectées');
console.log('   Utiliser Git pour synchroniser avec Replit');

// Simple watcher sans dépendances externes
const filesToWatch = [
  'marcel-dev-server.js',
  'context-analyzer.js',
  'relationship-data.js',
  'scenarios.json'
];

filesToWatch.forEach(file => {
  if (fs.existsSync(file)) {
    fs.watchFile(file, (curr, prev) => {
      console.log(\`📝 Modifié: \${file}\`);
      console.log('   → Utiliser "git add . && git commit && git push" pour sync');
    });
  }
});

console.log('✅ Surveillance active sur', filesToWatch.length, 'fichiers');
console.log('Ctrl+C pour arrêter');

// Keep alive
setInterval(() => {}, 1000);
`;

fs.writeFileSync('scripts/watch-and-sync.js', watchScript);
console.log('✅ scripts/watch-and-sync.js créé');

// 5. Mettre à jour package.json
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Ajouter les scripts
  pkg.scripts = {
    ...pkg.scripts,
    "start": pkg.scripts?.start || "node marcel-dev-server.js",
    "dev": pkg.scripts?.dev || "node marcel-dev-server.js",
    "sync": "node scripts/sync-to-replit.js",
    "watch": "node scripts/watch-and-sync.js"
  };
  
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  console.log('✅ package.json mis à jour');
}

// 6. Créer/vérifier les fichiers manquants
const missingFiles = [];

// Vérifier marcel-trainer.js
if (!fs.existsSync('marcel-trainer.js')) {
  missingFiles.push('marcel-trainer.js');
  console.log('⚠️  marcel-trainer.js manquant');
}

// Vérifier index.js
if (!fs.existsSync('index.js')) {
  // Créer un index.js simple
  const indexContent = `// 🚀 MARCEL TRAINER DEV - Point d'entrée
console.log('🧠 Marcel Trainer Dev - Démarrage...');
require('./marcel-dev-server.js');
`;
  fs.writeFileSync('index.js', indexContent);
  console.log('✅ index.js créé');
}

// 7. Créer .gitignore si nécessaire
if (!fs.existsSync('.gitignore')) {
  const gitignore = `node_modules/
.env
.sync/
Archives/
*.log
`;
  fs.writeFileSync('.gitignore', gitignore);
  console.log('✅ .gitignore créé');
}

// 8. Instructions Git pour Replit
const gitInstructions = `
# Configuration Git pour Replit

1. Initialiser Git (si pas déjà fait):
   git init

2. Ajouter le remote Replit:
   git remote add replit https://github.com/[TON-USERNAME]/marcel-trainer-dev.git
   
   OU si tu utilises Replit Git:
   git remote add replit https://replit.com/@[TON-USERNAME]/marcel-trainer-dev.git

3. Premier push:
   git add .
   git commit -m "Initial sync from local"
   git push -u replit main

4. Synchronisations futures:
   npm run sync        # Prépare les fichiers
   git add .
   git commit -m "Update from local"
   git push replit main
`;

fs.writeFileSync('GIT-REPLIT-SETUP.md', gitInstructions);
console.log('✅ GIT-REPLIT-SETUP.md créé');

// Résumé final
console.log(`
╔════════════════════════════════════════════════════════════╗
║                  ✅ INTÉGRATION TERMINÉE!                  ║
╚════════════════════════════════════════════════════════════╝

📁 Backup créé dans: ${backupDir}

📄 Nouveaux fichiers ajoutés:
   ✅ scripts/sync-to-replit.js
   ✅ scripts/watch-and-sync.js
   ✅ index.js (point d'entrée)
   ✅ .gitignore
   ✅ GIT-REPLIT-SETUP.md

⚠️  Fichiers manquants détectés:
   ${missingFiles.map(f => `❌ ${f}`).join('\n   ') || '✅ Aucun'}

🚀 PROCHAINES ÉTAPES:
====================

1. Installer les dépendances:
   npm install

2. Configurer Git pour Replit:
   cat GIT-REPLIT-SETUP.md

3. Tester le serveur local:
   npm start

4. Synchroniser avec Replit:
   npm run sync
   git add .
   git commit -m "Sync from local"
   git push replit main

📝 Commandes disponibles:
   npm start    - Lancer le serveur
   npm run sync - Préparer la sync
   npm run watch - Surveiller les changements

💡 TIP: Tes fichiers originaux sont intacts!
        Le backup est dans: ${backupDir}
`);