#!/usr/bin/env node

/**
 * Security Check Script for CutClub - Académie Précision
 * Validates P0/P1 security implementations
 * 
 * Run: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Security check results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Log functions
 */
function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
  results.passed.push(message);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
  results.failed.push(message);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  results.warnings.push(message);
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}═══ ${title} ═══${colors.reset}\n`);
}

/**
 * Check for hardcoded API keys in source files
 */
function checkHardcodedKeys() {
  logSection('Checking for Hardcoded API Keys');
  
  const patterns = [
    { pattern: /pk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Live Key' },
    { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Secret Key' },
    { pattern: /pk_test_[a-zA-Z0-9]{24,}(?!1234567890)/g, name: 'Real Stripe Test Key' },
    { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, name: 'Stripe Test Secret' },
    { pattern: /Bearer\s+[a-zA-Z0-9\-._~+\/]+=*/g, name: 'Bearer Token' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9\-._]+['"]/gi, name: 'Generic API Key' }
  ];
  
  const srcPath = path.join(__dirname, '..', 'src');
  const files = getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
  
  let keysFound = false;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    patterns.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        // Skip dummy keys and environment references
        const realMatches = matches.filter(match => 
          !match.includes('1234567890') && 
          !match.includes('process.env') &&
          !match.includes('Environment.') &&
          !match.includes('Application.extra')
        );
        
        if (realMatches.length > 0) {
          logError(`Found ${name} in ${path.relative(process.cwd(), file)}`);
          keysFound = true;
        }
      }
    });
  });
  
  if (!keysFound) {
    logSuccess('No hardcoded API keys found in source code');
  }
}

/**
 * Check environment configuration
 */
function checkEnvironmentConfig() {
  logSection('Checking Environment Configuration');
  
  // Check app.config.js
  const appConfigPath = path.join(__dirname, '..', 'app.config.js');
  if (fs.existsSync(appConfigPath)) {
    const content = fs.readFileSync(appConfigPath, 'utf8');
    
    if (content.includes('process.env.STRIPE_PUBLISHABLE_KEY')) {
      logSuccess('app.config.js uses environment variables for Stripe');
    } else {
      logWarning('app.config.js may not be using environment variables');
    }
    
    if (content.includes('dotenv/config')) {
      logSuccess('dotenv is properly imported in app.config.js');
    } else {
      logError('dotenv not imported in app.config.js');
    }
  } else {
    logError('app.config.js not found');
  }
  
  // Check environment.ts
  const envConfigPath = path.join(__dirname, '..', 'src', 'config', 'environment.ts');
  if (fs.existsSync(envConfigPath)) {
    const content = fs.readFileSync(envConfigPath, 'utf8');
    
    if (content.includes('Application.extra')) {
      logSuccess('environment.ts uses Application.extra for config');
    }
    
    if (content.includes('validateConfig')) {
      logSuccess('Configuration validation is implemented');
    }
    
    if (content.includes('__DEV__')) {
      logSuccess('Environment detection for dev/prod is implemented');
    }
  } else {
    logError('src/config/environment.ts not found');
  }
  
  // Check for .env files that shouldn't be committed
  const envFiles = ['.env', '.env.local', '.env.production'];
  envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      logError(`${envFile} exists and should not be committed`);
    }
  });
  
  // Check .env.example exists
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    logSuccess('.env.example template exists');
  } else {
    logWarning('.env.example not found - should be created for documentation');
  }
}

/**
 * Check NPM vulnerabilities
 */
function checkNpmVulnerabilities() {
  logSection('Checking NPM Vulnerabilities');
  
  try {
    const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    const { vulnerabilities } = audit.metadata;
    
    if (vulnerabilities.critical > 0) {
      logError(`Found ${vulnerabilities.critical} critical vulnerabilities`);
    } else {
      logSuccess('No critical vulnerabilities found');
    }
    
    if (vulnerabilities.high > 0) {
      logError(`Found ${vulnerabilities.high} high vulnerabilities`);
    } else {
      logSuccess('No high vulnerabilities found');
    }
    
    if (vulnerabilities.moderate > 0) {
      logWarning(`Found ${vulnerabilities.moderate} moderate vulnerabilities`);
    }
    
    if (vulnerabilities.low > 0) {
      logInfo(`Found ${vulnerabilities.low} low vulnerabilities`);
    }
    
    if (vulnerabilities.total === 0) {
      logSuccess('No NPM vulnerabilities detected');
    }
  } catch (error) {
    logError('Failed to run npm audit');
  }
}

/**
 * Check payment validation implementation
 */
function checkPaymentValidation() {
  logSection('Checking Payment Validation');
  
  const validatorPath = path.join(__dirname, '..', 'src', 'services', 'payment-validator.ts');
  
  if (fs.existsSync(validatorPath)) {
    const content = fs.readFileSync(validatorPath, 'utf8');
    
    // Check for required security features
    const checks = [
      { pattern: /validatePayment/g, name: 'Payment validation method' },
      { pattern: /checkRateLimit/g, name: 'Rate limiting' },
      { pattern: /logPaymentAttempt/g, name: 'Payment audit logging' },
      { pattern: /validate-payment/g, name: 'Supabase Edge Function call' },
      { pattern: /cache/gi, name: 'Caching mechanism' },
      { pattern: /timeout/gi, name: 'Timeout handling' }
    ];
    
    checks.forEach(({ pattern, name }) => {
      if (content.match(pattern)) {
        logSuccess(`${name} is implemented`);
      } else {
        logError(`${name} is missing`);
      }
    });
  } else {
    logError('payment-validator.ts not found');
  }
  
  // Check Stripe service
  const stripePath = path.join(__dirname, '..', 'src', 'api', 'stripe-service.ts');
  
  if (fs.existsSync(stripePath)) {
    const content = fs.readFileSync(stripePath, 'utf8');
    
    if (content.includes('Environment.stripe')) {
      logSuccess('Stripe service uses secure environment config');
    }
    
    if (content.includes('generateRequestId')) {
      logSuccess('Request ID generation for tracking');
    }
    
    if (content.includes('AbortController')) {
      logSuccess('Request timeout implementation');
    }
  }
}

/**
 * Check subscription tier validation
 */
function checkSubscriptionTiers() {
  logSection('Checking Subscription Tiers');
  
  const tiers = [
    { name: 'Essentiel', price: 29 },
    { name: 'Croissance', price: 79 },
    { name: 'Expert', price: 199 }
  ];
  
  // Search for tier validation
  const srcPath = path.join(__dirname, '..', 'src');
  const files = getAllFiles(srcPath, ['.ts', '.tsx']);
  
  let tierValidation = false;
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    tiers.forEach(tier => {
      if (content.includes(`${tier.price}`) && 
          (content.includes(tier.name) || content.includes(tier.name.toLowerCase()))) {
        tierValidation = true;
      }
    });
  });
  
  if (tierValidation) {
    logSuccess('Subscription tier prices are defined');
  } else {
    logWarning('Subscription tier validation may be incomplete');
  }
}

/**
 * Check RLS policies in SQL files
 */
function checkRLSPolicies() {
  logSection('Checking Row Level Security');
  
  const migrationsPath = path.join(__dirname, '..', '..', 'supabase', 'migrations');
  
  if (fs.existsSync(migrationsPath)) {
    const sqlFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'));
    
    let rlsFound = false;
    let policiesFound = false;
    
    sqlFiles.forEach(file => {
      const content = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
      
      if (content.includes('ALTER TABLE') && content.includes('ENABLE ROW LEVEL SECURITY')) {
        rlsFound = true;
      }
      
      if (content.includes('CREATE POLICY')) {
        policiesFound = true;
      }
    });
    
    if (rlsFound) {
      logSuccess('RLS is enabled on tables');
    } else {
      logWarning('RLS enablement not found in migrations');
    }
    
    if (policiesFound) {
      logSuccess('RLS policies are defined');
    } else {
      logWarning('RLS policies not found in migrations');
    }
  } else {
    logInfo('Supabase migrations directory not found locally');
  }
}

/**
 * Check security components
 */
function checkSecurityComponents() {
  logSection('Checking Security Components');
  
  const components = [
    'src/components/security/SecureErrorBoundary.tsx',
    'src/components/security/SessionMonitor.tsx',
    'src/components/security/SubscriptionValidator.tsx',
    'src/contexts/SecurityContext.tsx'
  ];
  
  components.forEach(component => {
    const componentPath = path.join(__dirname, '..', component);
    if (fs.existsSync(componentPath)) {
      logSuccess(`${path.basename(component)} exists`);
      
      // Check for specific security patterns
      const content = fs.readFileSync(componentPath, 'utf8');
      if (content.includes('try') && content.includes('catch')) {
        logSuccess(`${path.basename(component)} has error handling`);
      }
    } else {
      logWarning(`${component} not found`);
    }
  });
}

/**
 * Utility function to get all files recursively
 */
function getAllFiles(dirPath, extensions = [], arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.includes('node_modules') && !file.startsWith('.')) {
        arrayOfFiles = getAllFiles(filePath, extensions, arrayOfFiles);
      }
    } else {
      if (extensions.length === 0 || extensions.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(filePath);
      }
    }
  });
  
  return arrayOfFiles;
}

/**
 * Generate final report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}${colors.magenta}SECURITY CHECK SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`\n${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warnings.length}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed.length}${colors.reset}`);
  
  const total = results.passed.length + results.failed.length;
  const score = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;
  
  console.log(`\n${colors.bright}Security Score: ${score}%${colors.reset}`);
  
  if (results.failed.length === 0) {
    console.log(`\n${colors.green}${colors.bright}✅ ALL CRITICAL SECURITY CHECKS PASSED${colors.reset}`);
    console.log(`${colors.green}Status: GO FOR PRODUCTION${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ CRITICAL SECURITY ISSUES FOUND${colors.reset}`);
    console.log(`${colors.red}Status: NO-GO FOR PRODUCTION${colors.reset}`);
    console.log('\nFailed checks:');
    results.failed.forEach(item => {
      console.log(`  ${colors.red}• ${item}${colors.reset}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\nWarnings to address:');
    results.warnings.forEach(item => {
      console.log(`  ${colors.yellow}• ${item}${colors.reset}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with error code if critical issues found
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}🔒 CutClub Security Check v1.0${colors.reset}`);
  console.log(`${colors.cyan}Validating P0/P1 Security Implementations${colors.reset}`);
  console.log('='.repeat(60));
  
  try {
    checkHardcodedKeys();
    checkEnvironmentConfig();
    checkNpmVulnerabilities();
    checkPaymentValidation();
    checkSubscriptionTiers();
    checkRLSPolicies();
    checkSecurityComponents();
    
    generateReport();
  } catch (error) {
    console.error(`\n${colors.red}Security check failed with error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the security check
main();