// 👁️ WATCH AND SYNC
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
      console.log(`📝 Modifié: ${file}`);
      console.log('   → Utiliser "git add . && git commit && git push" pour sync');
    });
  }
});

console.log('✅ Surveillance active sur', filesToWatch.length, 'fichiers');
console.log('Ctrl+C pour arrêter');

// Keep alive
setInterval(() => {}, 1000);
