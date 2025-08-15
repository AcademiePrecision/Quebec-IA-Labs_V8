// 🔄 SYNC TO REPLIT
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
        console.log(`✅ Prêt pour sync: ${file}`);
      }
    });
    
    // Sauvegarder le rapport
    if (!fs.existsSync('.sync')) {
      fs.mkdirSync('.sync');
    }
    fs.writeFileSync('.sync/last-sync.json', JSON.stringify(syncData, null, 2));
    
    console.log(`✅ ${syncData.files.length} fichiers prêts pour sync`);
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
