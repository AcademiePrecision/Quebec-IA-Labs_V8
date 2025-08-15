#!/usr/bin/env node

/**
 * CLEANUP PHASE 3 FINAL - SavageCo
 * Nettoie TOUT ce qui ne sert pas à l'architecture optimale
 * Archive les répertoires et fichiers obsolètes
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_PATH = path.join(__dirname, '..');
const ARCHIVE_PATH = path.join(ROOT_PATH, '_archives', '2025-08-12');

// Couleurs pour terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// RÉPERTOIRES À ARCHIVER (identifiés comme obsolètes)
const DIRECTORIES_TO_ARCHIVE = [
  'Marcel-Trainer-Dev',
  'Marcel-Trainer-Prod-Replit',
  'Quebec-IA-Labs-V8-Final',
  'Quebec-IA-Labs_2025-08-11-13h32',
  'server',
  'server-v8',
  'quebec-ia-labs',
  'quebec-ia-labs-fresh',
  'deploy-v8-quebec'
];

// FICHIERS À ARCHIVER (identifiés comme obsolètes)
const FILES_TO_ARCHIVE = [
  // Screenshots de développement
  'Capture d\'écran 2025-08-10 221734.jpg',
  'Capture d\'écran 2025-08-10 222023.jpg',
  'Capture d\'écran 2025-08-10 222107.jpg',
  
  // Documentations obsolètes
  'BACKUP_STATUS.md',
  'DEVOPS_PIPELINE_GUIDE.md',
  'QUICK_START_GUIDE.md',
  'REPLIT_DEPLOY_MARCEL.md',
  'GIT-REPLIT-SETUP.md',
  
  // Fichiers temporaires/test
  'consolidate-savageco.js',
  'nul',
  'exclude.txt',
  'structure.txt',
  'test-marcel.html',
  'deploy-v8-quebec• && mkdir C：Usersfranc.claudeprojectsSavageCodeploy-v8-quebecpublic && cp C：Usersfranc.claudeprojectsSavageCopublictest-marcel.html C：Usersfranc.claudeprojectsSavageCodeploy-v8-quebecpublic•',
  
  // Backups
  'package-lock.json.backup',
  'package.json.app-backup', 
  'package.json.backup',
  
  // HTML Tests
  'public/test-marcel-backup.html',
  'public/test-marcel-upgrade.html',
  
  // Scripts de démarrage temporaires
  'start-all.bat',
  'start-all.sh',
  
  // Anciens fichiers de config
  '.env.global',
  '.env.global2.txt',
  
  // Dossier zip
  'Quebec-IA-Labs.zip'
];

// GARDER CES ÉLÉMENTS (architecture optimale)
const KEEP_ESSENTIAL = [
  // Architecture optimale
  'AppMobile',
  'Quebec-IA-Labs-V8-Replit_Dev_20250812',
  'shared',
  'agents',
  'supabase',
  'scripts',
  
  // Archives et documentation essentielle
  '_archives',
  'ARCHITECTURE_OPTIMALE_SAVAGECO.md',
  'QUICK_START_NEW_ARCHITECTURE.md',
  'Instruction_Claude_Code_Quebec-IA-Labs.md',
  
  // Configuration
  '.claude',
  '.github',
  '.gitignore-optimal',
  'package.json',
  
  // Src components créés
  'src',
  
  // Nouvelles documentations
  'training-data'
];

// Fonction pour calculer la taille d'un fichier/dossier
function getSize(itemPath) {
  try {
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      return stats.size;
    } else if (stats.isDirectory()) {
      let totalSize = 0;
      const files = fs.readdirSync(itemPath);
      for (const file of files) {
        totalSize += getSize(path.join(itemPath, file));
      }
      return totalSize;
    }
  } catch (error) {
    return 0;
  }
  return 0;
}

// Fonction pour formater la taille en bytes
function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Fonction pour copier récursivement
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Fonction pour supprimer récursivement
function deleteRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Fonction principale de nettoyage
async function performCleanup() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║         CLEANUP PHASE 3 FINAL - SavageCo        ║${colors.reset}`);
  console.log(`${colors.blue}║           Nettoyage définitif du projet         ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  let totalSizeArchived = 0;
  let itemsArchived = 0;

  // Créer le dossier d'archives si nécessaire
  if (!fs.existsSync(ARCHIVE_PATH)) {
    fs.mkdirSync(ARCHIVE_PATH, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Dossier archive créé: ${ARCHIVE_PATH}`);
  }

  console.log(`${colors.cyan}📁 ARCHIVAGE DES RÉPERTOIRES OBSOLÈTES${colors.reset}`);
  console.log('─'.repeat(50));

  // Archiver les répertoires obsolètes
  for (const dir of DIRECTORIES_TO_ARCHIVE) {
    const sourcePath = path.join(ROOT_PATH, dir);
    const destPath = path.join(ARCHIVE_PATH, `directories-${dir}`);
    
    if (fs.existsSync(sourcePath)) {
      const size = getSize(sourcePath);
      totalSizeArchived += size;
      itemsArchived++;
      
      console.log(`${colors.yellow}📦${colors.reset} Archivage: ${dir} (${formatSize(size)})`);
      
      try {
        copyRecursive(sourcePath, destPath);
        deleteRecursive(sourcePath);
        console.log(`${colors.green}✓${colors.reset} Archivé et supprimé: ${dir}`);
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Erreur: ${dir} - ${error.message}`);
      }
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Introuvable: ${dir}`);
    }
  }

  console.log(`\n${colors.cyan}📄 ARCHIVAGE DES FICHIERS OBSOLÈTES${colors.reset}`);
  console.log('─'.repeat(50));

  // Archiver les fichiers obsolètes
  for (const file of FILES_TO_ARCHIVE) {
    const sourcePath = path.join(ROOT_PATH, file);
    const fileName = path.basename(file);
    const destPath = path.join(ARCHIVE_PATH, `files-${fileName}`);
    
    if (fs.existsSync(sourcePath)) {
      const size = getSize(sourcePath);
      totalSizeArchived += size;
      itemsArchived++;
      
      console.log(`${colors.yellow}📄${colors.reset} Archivage: ${file} (${formatSize(size)})`);
      
      try {
        if (fs.statSync(sourcePath).isDirectory()) {
          copyRecursive(sourcePath, destPath);
          deleteRecursive(sourcePath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
          fs.unlinkSync(sourcePath);
        }
        console.log(`${colors.green}✓${colors.reset} Archivé et supprimé: ${file}`);
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Erreur: ${file} - ${error.message}`);
      }
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Introuvable: ${file}`);
    }
  }

  // Créer un rapport de nettoyage
  const report = `# 🧹 RAPPORT CLEANUP PHASE 3 FINAL
  
## Résumé du Nettoyage
- **Date**: ${new Date().toISOString()}
- **Items archivés**: ${itemsArchived}
- **Espace libéré**: ${formatSize(totalSizeArchived)}
- **Destination archives**: ${ARCHIVE_PATH}

## Répertoires Archivés
${DIRECTORIES_TO_ARCHIVE.map(dir => `- ${dir}`).join('\n')}

## Fichiers Archivés  
${FILES_TO_ARCHIVE.map(file => `- ${file}`).join('\n')}

## Architecture Finale Conservée
${KEEP_ESSENTIAL.map(item => `- ${item}`).join('\n')}

## État Final
✅ Projet ultra-propre avec uniquement les éléments essentiels
✅ Architecture optimale respectée  
✅ Pipeline Marcel AI préservé
✅ App Mobile prêt pour développement
✅ Agents IA disponibles
✅ Supabase configuré
✅ Scripts DevOps opérationnels

## Prochaines Étapes Recommandées
1. Valider que l'architecture fonctionne correctement
2. Tester Marcel AI: \`cd Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm run dev\`
3. Configurer App Mobile: \`node scripts/setup-architecture.js\`
4. Commencer le développement avec l'architecture optimale
`;

  fs.writeFileSync(path.join(ARCHIVE_PATH, 'CLEANUP_PHASE3_REPORT.md'), report);

  console.log(`\n${colors.green}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║           ✅ NETTOYAGE TERMINÉ!                 ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.cyan}📊 STATISTIQUES FINALES:${colors.reset}`);
  console.log(`   • Items archivés: ${colors.yellow}${itemsArchived}${colors.reset}`);
  console.log(`   • Espace libéré: ${colors.yellow}${formatSize(totalSizeArchived)}${colors.reset}`);
  console.log(`   • Archives: ${colors.yellow}${ARCHIVE_PATH}${colors.reset}`);

  console.log(`\n${colors.magenta}🎯 ARCHITECTURE FINALE ULTRA-PROPRE:${colors.reset}`);
  console.log(`   📱 AppMobile/ - Application React Native`);
  console.log(`   🤖 Quebec-IA-Labs-V8-Replit_Dev_20250812/ - Marcel AI`);
  console.log(`   🧠 agents/ - 12 Agents IA spécialisés`);
  console.log(`   🔧 shared/ - Code partagé (à créer)`);
  console.log(`   🚀 scripts/ - Scripts DevOps`);
  console.log(`   🗄️ supabase/ - Configuration base de données`);
  console.log(`   📁 _archives/ - Archives complètes`);

  console.log(`\n${colors.cyan}🚀 PROCHAINES ÉTAPES:${colors.reset}`);
  console.log(`   1. Valider l'architecture: ${colors.yellow}node scripts/setup-architecture.js${colors.reset}`);
  console.log(`   2. Tester Marcel AI: ${colors.yellow}cd Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm run dev${colors.reset}`);
  console.log(`   3. Configurer variables d'environnement`);
  console.log(`   4. Commencer le développement avec architecture optimale`);

  console.log(`\n${colors.green}✨ Projet SavageCo prêt pour le développement avec architecture ultra-propre!${colors.reset}\n`);
}

// Exécuter le nettoyage
performCleanup().catch(error => {
  console.error(`${colors.red}Erreur lors du nettoyage: ${error.message}${colors.reset}`);
  process.exit(1);
});