#!/usr/bin/env node

/**
 * 🧹 CLEANUP SCRIPT - SAVAGECO PROJECT
 * Nettoie automatiquement les fichiers inutilisés
 * Archive tout dans _archives/2025-08-12
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = 'C:\\Users\\franc\\.claude\\projects\\SavageCo';
const ARCHIVE_DIR = path.join(PROJECT_ROOT, '_archives', '2025-08-12');
const LOG_FILE = path.join(ARCHIVE_DIR, 'cleanup-log.json');

// Fichiers et dossiers à archiver
const TO_ARCHIVE = [
  // Archives et Backups complets
  'Marcel-Trainer-Dev-BACKUP',
  'Marcel-Trainer-Prod-Replit', 
  'Quebec-IA-Labs-Prod-Replit',
  'Quebec-IA-Labs-Replit',
  'Quebec-IA-Labs.zip',
  'Quebec-IA-Labs_2025-08-11-13h32',
  'Quebec-IA-Labs_2025-08-11-15h26',
  'deploy-v8-quebec',

  // Fichiers obsolètes
  '2025-08-01-code_Claude_PipeLine.txt',
  'App.tsx',
  'TestApp.tsx', 
  'Clefs.txt',
  'Hey Franky! I V7.0.txt',
  'ReadMeKen.md',
  'Capture d\'écran 2025-08-10 221734.jpg',
  'Capture d\'écran 2025-08-10 222023.jpg',
  'Capture d\'écran 2025-08-10 222107.jpg',
  'Capture d\'écran 2025-08-11 143240.jpg',

  // Configuration React Native inutilisée
  'babel.config.js',
  'metro.config.js', 
  'tailwind.config.js',
  'tsconfig.json',
  'global.css',
  'bun.lock',
  'app.json',

  // Dossiers React Native complets
  'src',
  'assets',
  'patches',

  // Tests non critiques
  'test-claude-api.js',
  'test-all-apis.js',
  'test-env.sh',
  'simple-test-server.js',

  // Utilitaires non essentiels
  'consolidate-savageco.js',
  'generate-asset-script.ts',
  'ngrok-tool',
  'quebec-ia-labs',

  // Fichiers de configuration dupliqués
  'package-lock.json.backup',
  'package.json.app-backup',
  'package.json.backup',
  'package-lock2.json',
  'package-replit-ready.json',
  'package-replit.json',
  'package-stripe-setup.json',
  'package-unified-quebec-ia-labs.json',

  // Serveurs obsolètes
  'server-marcel-final-corrige.js',
  'server-marcel-final-fixed.js',
  'server-simple.js', 
  'server-unified-quebec-ia-labs.js',
  'replit-main.js',
  'replit-server-fixed.js',
  'replit-server.js',

  // Dossiers de backup HTML
  'public/test-marcel-backup.html',
  'public/test-marcel-upgrade.html',

  // Fichiers bizarres
  'deploy-v8-quebec && mkdir CUsersfranc.claudeprojectsSavageCodeploy-v8-quebecpublic && cp CUsersfranc.claudeprojectsSavageCopublictest-marcel.html CUsersfranc.claudeprojectsSavageCodeploy-v8-quebecpublic',
  'exclude.txt',
  'nul',

  // Scripts et utilitaires de dev
  'start-all.bat',
  'start-all.sh',
  'structure.txt'
];

// Fichiers critiques à CONSERVER
const KEEP_ACTIVE = [
  'Quebec-IA-Labs-V8-Replit_Dev_20250812', // Version active
  'Quebec-IA-Labs-V8-Final',              // Version de référence
  'scripts',                               // Scripts CI/CD
  'Instruction_Claude_Code_Quebec-IA-Labs.md',
  '_archives',
  'Marcel-Trainer-Dev',                    // Version dev active
  'server',                                // Serveur principal
  'main.js',                              // Point d'entrée
  'index.js',                             // Point d'entrée alternatif
  'package.json',                         // Package principal
  'package-lock.json',                    // Lock principal
  'node_modules',                         // Dependencies
  'supabase',                             // Base de données
  'training-data'                         // Données d'entraînement
];

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Calculer la taille d'un fichier/dossier
 */
function getSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      return stats.size;
    } else if (stats.isDirectory()) {
      let size = 0;
      const files = fs.readdirSync(filePath);
      
      files.forEach(file => {
        const fullPath = path.join(filePath, file);
        size += getSize(fullPath);
      });
      
      return size;
    }
  } catch (error) {
    return 0;
  }
  
  return 0;
}

/**
 * Formater la taille en lisible
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Créer le répertoire d'archive
 */
function createArchiveDir() {
  log('\n📁 Creating archive directory...', 'cyan');
  
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    log(`✅ Created: ${ARCHIVE_DIR}`, 'green');
  } else {
    log(`✅ Archive directory exists: ${ARCHIVE_DIR}`, 'green');
  }
}

/**
 * Déplacer un fichier/dossier
 */
function moveToArchive(itemName) {
  const sourcePath = path.join(PROJECT_ROOT, itemName);
  const targetPath = path.join(ARCHIVE_DIR, itemName);
  
  if (!fs.existsSync(sourcePath)) {
    log(`  ⚠️  Not found: ${itemName}`, 'yellow');
    return { moved: false, size: 0, reason: 'not_found' };
  }
  
  // Calculer la taille avant déplacement
  const size = getSize(sourcePath);
  
  try {
    // Créer le dossier parent si nécessaire
    const targetParent = path.dirname(targetPath);
    if (!fs.existsSync(targetParent)) {
      fs.mkdirSync(targetParent, { recursive: true });
    }
    
    // Déplacer (renommer)
    fs.renameSync(sourcePath, targetPath);
    
    log(`  ✅ Moved: ${itemName} (${formatSize(size)})`, 'green');
    return { moved: true, size, reason: 'success' };
    
  } catch (error) {
    log(`  ❌ Failed to move ${itemName}: ${error.message}`, 'red');
    return { moved: false, size: 0, reason: error.message };
  }
}

/**
 * Créer le rapport de nettoyage
 */
function createCleanupReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalItemsProcessed: results.length,
      itemsMovedSuccessfully: results.filter(r => r.moved).length,
      itemsNotFound: results.filter(r => r.reason === 'not_found').length,
      itemsFailed: results.filter(r => !r.moved && r.reason !== 'not_found').length,
      totalSizeFreed: results.reduce((sum, r) => sum + r.size, 0),
      totalSizeFreedFormatted: formatSize(results.reduce((sum, r) => sum + r.size, 0))
    },
    details: results,
    activeFilesKept: KEEP_ACTIVE,
    notes: [
      'Tous les fichiers ont été archivés dans _archives/2025-08-12',
      'Les fichiers actifs du projet Marcel AI ont été conservés',
      'Ce nettoyage libère de l\'espace et organise le projet',
      'Les archives peuvent être supprimées après vérification'
    ]
  };
  
  fs.writeFileSync(LOG_FILE, JSON.stringify(report, null, 2));
  return report;
}

/**
 * Fonction principale
 */
async function main() {
  log('\n====================================', 'bright');
  log('🧹 CLEANUP SCRIPT - SAVAGECO PROJECT', 'bright');  
  log('====================================', 'bright');
  log(`Time: ${new Date().toLocaleString()}`, 'cyan');
  
  // Créer le répertoire d'archive
  createArchiveDir();
  
  // Calculer la taille totale avant nettoyage
  log('\n📊 Calculating current project size...', 'cyan');
  let totalSizeBefore = 0;
  
  TO_ARCHIVE.forEach(item => {
    const itemPath = path.join(PROJECT_ROOT, item);
    if (fs.existsSync(itemPath)) {
      totalSizeBefore += getSize(itemPath);
    }
  });
  
  log(`Total size to archive: ${formatSize(totalSizeBefore)}`, 'blue');
  
  // Déplacer les fichiers
  log('\n🚚 Moving files to archive...', 'cyan');
  const results = [];
  
  for (const item of TO_ARCHIVE) {
    log(`Processing: ${item}`, 'yellow');
    const result = moveToArchive(item);
    results.push({
      item,
      ...result
    });
  }
  
  // Créer le rapport
  log('\n📋 Creating cleanup report...', 'cyan');
  const report = createCleanupReport(results);
  
  // Afficher le résumé
  log('\n====================================', 'bright');
  log('✅ CLEANUP COMPLETED', 'green');
  log('====================================', 'bright');
  
  log(`\n📊 SUMMARY:`, 'cyan');
  log(`• Items processed: ${report.summary.totalItemsProcessed}`, 'blue');
  log(`• Successfully moved: ${report.summary.itemsMovedSuccessfully}`, 'green');
  log(`• Not found: ${report.summary.itemsNotFound}`, 'yellow');
  log(`• Failed: ${report.summary.itemsFailed}`, 'red');
  log(`• Space freed: ${report.summary.totalSizeFreedFormatted}`, 'green');
  
  log(`\n📁 Archive location: ${ARCHIVE_DIR}`, 'cyan');
  log(`📄 Detailed report: ${LOG_FILE}`, 'cyan');
  
  // Fichiers actifs conservés
  log(`\n✅ ACTIVE FILES KEPT:`, 'green');
  KEEP_ACTIVE.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ⚠️  ${file} (not found)`, 'yellow');
    }
  });
  
  log('\n🎉 Project cleanup complete!', 'green');
  log('Marcel AI development can continue with a clean workspace.', 'cyan');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

// Run
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { moveToArchive, createCleanupReport };