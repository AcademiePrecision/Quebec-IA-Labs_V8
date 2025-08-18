// Script de correction automatique pour Marcel
const fs = require('fs');
const path = require('path');

function removeAllEmojisForPhone(text) {
  if (!text) return '';
  
  // Supprimer emojis Unicode
  let cleaned = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '');
  
  // Supprimer descriptions
  const descriptions = [
    'visage souriant', 'etoile souriante', 'main qui salue',
    'ciseaux', 'calendrier', 'emoji', 'symbole'
  ];
  
  descriptions.forEach(desc => {
    const regex = new RegExp('\b' + desc + '\b', 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Nettoyer espaces
  return cleaned.replace(/\s+/g, ' ').trim();
}

async function fixMarcelServer() {
  console.log('=== CORRECTION MARCEL EMOJIS ===');
  console.log('Date:', new Date().toISOString());
  
  const serverPath = path.join(__dirname, '..', 'server.js');
  console.log('Fichier:', serverPath);
  
  try {
    let content = fs.readFileSync(serverPath, 'utf8');
    
    // Verifier si deja patche
    if (content.includes('removeAllEmojisForPhone')) {
      console.log('✓ Patch deja applique');
      return true;
    }
    
    // Ajouter fonction au debut
    const functionCode = removeAllEmojisForPhone.toString();
    const insertPoint = content.indexOf('const app = express();');
    
    if (insertPoint \!== -1) {
      const newContent = content.slice(0, insertPoint) + 
        '\n// PATCH ANTI-EMOJI POUR TELEPHONE\n' +
        functionCode + '\n\n' +
        content.slice(insertPoint);
      
      // Sauvegarder
      const backupPath = serverPath + '.backup-' + Date.now();
      fs.writeFileSync(backupPath, content);
      fs.writeFileSync(serverPath, newContent);
      
      console.log('✓ Patch applique avec succes');
      console.log('✓ Backup cree:', backupPath);
      return true;
    } else {
      console.log('✗ Point d\'insertion non trouve');
      return false;
    }
  } catch (error) {
    console.error('Erreur:', error.message);
    return false;
  }
}

// Executer
fixMarcelServer()
  .then(success => {
    if (success) {
      console.log('\n=== PROCHAINES ETAPES ===');
      console.log('1. Redemarrer le serveur Marcel');
      console.log('2. Tester avec node marcel-test.js');
      console.log('3. Valider sur Replit');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Erreur fatale:', err);
    process.exit(1);
  });

