#!/usr/bin/env node

/**
 * Script de configuration de l'architecture optimale SavageCo
 * Ce script crée la structure de dossiers et migre les fichiers existants
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Chemin racine du projet
const ROOT_PATH = path.join(__dirname, '..');

// Structure des dossiers à créer
const DIRECTORY_STRUCTURE = {
  'AppMobile': {
    'src': {
      'api': {
        'stripe': {},
        'supabase': {},
        'ai': {},
        'shared': {}
      },
      'components': {},
      'screens': {},
      'navigation': {},
      'state': {},
      'utils': {},
      'types': {}
    },
    'assets': {
      'images': {},
      'fonts': {},
      'icons': {}
    }
  },
  'shared': {
    'services': {
      'stripe': {},
      'supabase': {},
      'auth': {},
      'analytics': {}
    },
    'types': {},
    'utils': {},
    'constants': {},
    'config': {}
  },
  'docs': {
    'architecture': {},
    'api': {},
    'deployment': {},
    'development': {}
  },
  'tests': {
    'e2e': {},
    'integration': {},
    'performance': {}
  },
  'config': {},
  'packages': {}
};

// Fonction pour créer la structure de dossiers
function createDirectoryStructure(basePath, structure) {
  Object.keys(structure).forEach(dir => {
    const dirPath = path.join(basePath, dir);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`${colors.green}✓${colors.reset} Créé: ${path.relative(ROOT_PATH, dirPath)}`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Existe déjà: ${path.relative(ROOT_PATH, dirPath)}`);
    }
    
    // Créer les sous-dossiers récursivement
    if (Object.keys(structure[dir]).length > 0) {
      createDirectoryStructure(dirPath, structure[dir]);
    }
  });
}

// Fonction pour copier les fichiers de l'archive vers AppMobile
function migrateAppMobileFiles() {
  console.log(`\n${colors.cyan}📱 Migration des fichiers App Mobile...${colors.reset}`);
  
  const archivePath = path.join(ROOT_PATH, '_archives', '2025-08-12');
  const appMobilePath = path.join(ROOT_PATH, 'AppMobile');
  
  // Liste des fichiers/dossiers à migrer
  const filesToMigrate = [
    { from: 'src', to: 'src' },
    { from: 'assets', to: 'assets' },
    { from: 'app.json', to: 'app.json' },
    { from: 'babel.config.js', to: 'babel.config.js' },
    { from: 'metro.config.js', to: 'metro.config.js' },
    { from: 'tailwind.config.js', to: 'tailwind.config.js' },
    { from: 'tsconfig.json', to: 'tsconfig.json' },
    { from: 'global.css', to: 'global.css' },
    { from: 'nativewind-env.d.ts', to: 'nativewind-env.d.ts' }
  ];
  
  filesToMigrate.forEach(file => {
    const sourcePath = path.join(archivePath, file.from);
    const destPath = path.join(appMobilePath, file.to);
    
    if (fs.existsSync(sourcePath)) {
      try {
        // Si c'est un dossier, copier récursivement
        if (fs.statSync(sourcePath).isDirectory()) {
          copyRecursive(sourcePath, destPath);
        } else {
          // Si c'est un fichier, copier directement
          fs.copyFileSync(sourcePath, destPath);
        }
        console.log(`${colors.green}✓${colors.reset} Migré: ${file.from} → AppMobile/${file.to}`);
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Erreur migration: ${file.from} - ${error.message}`);
      }
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Source non trouvée: ${file.from}`);
    }
  });
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

// Fonction pour créer le package.json racine avec workspaces
function createRootPackageJson() {
  console.log(`\n${colors.cyan}📦 Configuration du workspace racine...${colors.reset}`);
  
  const packageJson = {
    name: "savageco-monorepo",
    private: true,
    version: "1.0.0",
    description: "SavageCo - Plateforme EdTech pour la formation professionnelle",
    workspaces: [
      "AppMobile",
      "Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812",
      "shared"
    ],
    scripts: {
      "dev:mobile": "cd AppMobile && npm run dev",
      "dev:marcel": "cd Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm run dev",
      "test:all": "npm run test:mobile && npm run test:marcel",
      "test:mobile": "cd AppMobile && npm test",
      "test:marcel": "cd Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm test",
      "build:mobile": "cd AppMobile && npm run build",
      "build:marcel": "cd Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm run build",
      "deploy:mobile:staging": "cd scripts && node deploy-mobile-staging.js",
      "deploy:marcel:staging": "cd scripts && node deploy-to-replit.js",
      "setup": "node scripts/setup-architecture.js",
      "clean": "rm -rf node_modules **/node_modules",
      "install:all": "npm install && npm run install:mobile && npm run install:marcel",
      "install:mobile": "cd AppMobile && npm install",
      "install:marcel": "cd Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812 && npm install"
    },
    devDependencies: {
      "eslint": "^8.50.0",
      "prettier": "^3.0.0",
      "typescript": "^5.0.0"
    },
    engines: {
      "node": ">=18.0.0",
      "npm": ">=9.0.0"
    }
  };
  
  const packagePath = path.join(ROOT_PATH, 'package-workspace.json');
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`${colors.green}✓${colors.reset} Créé: package-workspace.json (à renommer en package.json si souhaité)`);
}

// Fonction pour créer le package.json AppMobile
function createAppMobilePackageJson() {
  console.log(`\n${colors.cyan}📱 Configuration du package.json AppMobile...${colors.reset}`);
  
  const archivePackagePath = path.join(ROOT_PATH, '_archives', '2025-08-12', 'package.json');
  const appMobilePackagePath = path.join(ROOT_PATH, 'AppMobile', 'package.json');
  
  if (fs.existsSync(archivePackagePath) && !fs.existsSync(appMobilePackagePath)) {
    // Lire le package.json de l'archive
    const archivePackage = JSON.parse(fs.readFileSync(archivePackagePath, 'utf8'));
    
    // Adapter pour AppMobile
    archivePackage.name = "@savageco/app-mobile";
    archivePackage.description = "Académie Précision - Application mobile de formation professionnelle";
    
    // Ajouter/modifier les scripts
    archivePackage.scripts = {
      ...archivePackage.scripts,
      "dev": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web",
      "build:android": "eas build --platform android",
      "build:ios": "eas build --platform ios",
      "test": "jest",
      "lint": "eslint . --ext .ts,.tsx",
      "format": "prettier --write \"src/**/*.{ts,tsx}\""
    };
    
    fs.writeFileSync(appMobilePackagePath, JSON.stringify(archivePackage, null, 2));
    console.log(`${colors.green}✓${colors.reset} Créé: AppMobile/package.json`);
  }
}

// Fonction pour créer les fichiers de configuration
function createConfigFiles() {
  console.log(`\n${colors.cyan}⚙️ Création des fichiers de configuration...${colors.reset}`);
  
  // .env.example
  const envExample = `# Configuration Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Configuration OpenAI
OPENAI_API_KEY=your_openai_api_key

# Configuration Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Configuration ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id

# Environment
NODE_ENV=development
`;
  
  fs.writeFileSync(path.join(ROOT_PATH, 'config', '.env.example'), envExample);
  console.log(`${colors.green}✓${colors.reset} Créé: config/.env.example`);
  
  // README pour AppMobile
  const appMobileReadme = `# 📱 Académie Précision - Application Mobile

## Description
Application React Native pour la formation professionnelle des barbiers au Québec.

## Installation

\`\`\`bash
cd AppMobile
npm install
\`\`\`

## Développement

\`\`\`bash
# Démarrer le serveur de développement
npm run dev

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
\`\`\`

## Build

\`\`\`bash
# Build Android
npm run build:android

# Build iOS
npm run build:ios
\`\`\`

## Technologies
- React Native avec Expo
- TypeScript
- NativeWind (Tailwind CSS)
- Supabase
- Stripe
- React Navigation

## Structure
- \`src/api\` - Services API
- \`src/components\` - Composants réutilisables
- \`src/screens\` - Écrans de l'application
- \`src/navigation\` - Configuration de navigation
- \`src/state\` - Gestion d'état
- \`src/utils\` - Utilitaires
- \`src/types\` - Types TypeScript
`;
  
  fs.writeFileSync(path.join(ROOT_PATH, 'AppMobile', 'README.md'), appMobileReadme);
  console.log(`${colors.green}✓${colors.reset} Créé: AppMobile/README.md`);
}

// Fonction pour créer les symlinks Marcel AI
function createMarcelSymlink() {
  console.log(`\n${colors.cyan}🔗 Création du symlink Marcel-AI...${colors.reset}`);
  
  const sourcePath = path.join(ROOT_PATH, 'Quebec-IA-Labs-V8-Replit_Dev_20250812');
  const targetPath = path.join(ROOT_PATH, 'Marcel-AI', 'Quebec-IA-Labs-V8-Replit_Dev_20250812');
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
    try {
      // Créer le dossier Marcel-AI si nécessaire
      const marcelDir = path.join(ROOT_PATH, 'Marcel-AI');
      if (!fs.existsSync(marcelDir)) {
        fs.mkdirSync(marcelDir);
      }
      
      // Sur Windows, utiliser une copie au lieu d'un symlink pour éviter les problèmes de permissions
      if (process.platform === 'win32') {
        console.log(`${colors.yellow}⚠${colors.reset} Windows détecté: Copie du dossier au lieu d'un symlink`);
        copyRecursive(sourcePath, targetPath);
      } else {
        fs.symlinkSync(sourcePath, targetPath, 'dir');
      }
      
      console.log(`${colors.green}✓${colors.reset} Lien créé: Marcel-AI/Quebec-IA-Labs-V8-Replit_Dev_20250812`);
    } catch (error) {
      console.log(`${colors.yellow}⚠${colors.reset} Impossible de créer le lien: ${error.message}`);
    }
  }
}

// Fonction principale
async function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   Configuration Architecture SavageCo      ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);
  
  // 1. Créer la structure de dossiers
  console.log(`${colors.cyan}📂 Création de la structure de dossiers...${colors.reset}`);
  createDirectoryStructure(ROOT_PATH, DIRECTORY_STRUCTURE);
  
  // 2. Migrer les fichiers App Mobile
  migrateAppMobileFiles();
  
  // 3. Créer les fichiers de configuration
  createRootPackageJson();
  createAppMobilePackageJson();
  createConfigFiles();
  
  // 4. Créer le symlink Marcel AI
  createMarcelSymlink();
  
  console.log(`\n${colors.green}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║   ✅ Architecture configurée avec succès!   ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.cyan}Prochaines étapes:${colors.reset}`);
  console.log(`1. Vérifier la migration dans AppMobile/`);
  console.log(`2. Installer les dépendances: npm run install:all`);
  console.log(`3. Configurer les variables d'environnement dans config/`);
  console.log(`4. Lancer le développement:`);
  console.log(`   - Mobile: npm run dev:mobile`);
  console.log(`   - Marcel: npm run dev:marcel`);
  console.log(`\n${colors.yellow}Note: Consultez ARCHITECTURE_OPTIMALE_SAVAGECO.md pour plus de détails${colors.reset}`);
}

// Exécuter le script
main().catch(error => {
  console.error(`${colors.red}Erreur: ${error.message}${colors.reset}`);
  process.exit(1);
});