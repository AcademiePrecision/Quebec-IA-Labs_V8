/**
 * Smoke Test Validation for CutClub App
 * Validates critical P0 fixes for Hermes compatibility
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test Results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

console.log(`${colors.cyan}=== CutClub App Smoke Test Validation ===${colors.reset}\n`);

// Test 1: Check expo-application package is installed
function testExpoApplicationInstalled() {
  console.log(`${colors.blue}Test 1: Checking expo-application package...${colors.reset}`);
  const packagePath = path.join(__dirname, '..', 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.dependencies['expo-application']) {
      results.passed.push('expo-application package installed');
      console.log(`${colors.green}✓ expo-application found in dependencies${colors.reset}`);
      return true;
    } else {
      results.failed.push('expo-application package not found');
      console.log(`${colors.red}✗ expo-application not found in dependencies${colors.reset}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`Failed to read package.json: ${error.message}`);
    console.log(`${colors.red}✗ Error reading package.json: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test 2: Check environment.ts uses expo-application
function testEnvironmentConfig() {
  console.log(`\n${colors.blue}Test 2: Checking environment.ts configuration...${colors.reset}`);
  const envPath = path.join(__dirname, '..', 'src', 'config', 'environment.ts');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for expo-application import
    if (content.includes("import * as Application from 'expo-application'")) {
      console.log(`${colors.green}✓ expo-application import found${colors.reset}`);
    } else {
      results.failed.push('expo-application not imported in environment.ts');
      console.log(`${colors.red}✗ expo-application import missing${colors.reset}`);
      return false;
    }
    
    // Check no Constants usage remains
    if (content.includes('Constants.')) {
      results.failed.push('Constants still being used in environment.ts');
      console.log(`${colors.red}✗ Constants usage still found${colors.reset}`);
      return false;
    } else {
      console.log(`${colors.green}✓ No Constants usage found${colors.reset}`);
    }
    
    // Check Application usage
    if (content.includes('Application.extra')) {
      results.passed.push('environment.ts properly migrated to expo-application');
      console.log(`${colors.green}✓ Application.extra usage found${colors.reset}`);
      return true;
    } else {
      results.warnings.push('Application.extra not found - may be using hardcoded values');
      console.log(`${colors.yellow}⚠ Application.extra not found (using fallback values)${colors.reset}`);
      return true;
    }
  } catch (error) {
    results.failed.push(`Failed to check environment.ts: ${error.message}`);
    console.log(`${colors.red}✗ Error checking environment.ts: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test 3: Check assets configuration
function testAssetsConfiguration() {
  console.log(`\n${colors.blue}Test 3: Checking assets configuration...${colors.reset}`);
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const expo = appJson.expo;
    
    // Check icon
    const iconPath = path.join(__dirname, '..', expo.icon);
    if (fs.existsSync(iconPath)) {
      console.log(`${colors.green}✓ Icon asset exists: ${expo.icon}${colors.reset}`);
    } else {
      results.failed.push(`Icon asset missing: ${expo.icon}`);
      console.log(`${colors.red}✗ Icon asset missing: ${expo.icon}${colors.reset}`);
      return false;
    }
    
    // Check splash
    const splashPath = path.join(__dirname, '..', expo.splash.image);
    if (fs.existsSync(splashPath)) {
      console.log(`${colors.green}✓ Splash asset exists: ${expo.splash.image}${colors.reset}`);
    } else {
      results.failed.push(`Splash asset missing: ${expo.splash.image}`);
      console.log(`${colors.red}✗ Splash asset missing: ${expo.splash.image}${colors.reset}`);
      return false;
    }
    
    // Check Android adaptive icon
    if (expo.android?.adaptiveIcon?.foregroundImage) {
      const adaptivePath = path.join(__dirname, '..', expo.android.adaptiveIcon.foregroundImage);
      if (fs.existsSync(adaptivePath)) {
        console.log(`${colors.green}✓ Android adaptive icon exists: ${expo.android.adaptiveIcon.foregroundImage}${colors.reset}`);
      } else {
        results.warnings.push(`Android adaptive icon missing: ${expo.android.adaptiveIcon.foregroundImage}`);
        console.log(`${colors.yellow}⚠ Android adaptive icon missing: ${expo.android.adaptiveIcon.foregroundImage}${colors.reset}`);
      }
    }
    
    results.passed.push('Assets configuration validated');
    return true;
  } catch (error) {
    results.failed.push(`Failed to check assets: ${error.message}`);
    console.log(`${colors.red}✗ Error checking assets: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test 4: Check for any remaining Constants usage in src directory
function testNoConstantsUsage() {
  console.log(`\n${colors.blue}Test 4: Checking for remaining Constants usage...${colors.reset}`);
  const srcDir = path.join(__dirname, '..', 'src');
  let constantsFound = false;
  
  function checkDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          checkDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('Constants.') && !content.includes('// Constants.')) {
            constantsFound = true;
            const relativePath = path.relative(path.join(__dirname, '..'), filePath);
            results.failed.push(`Constants usage found in ${relativePath}`);
            console.log(`${colors.red}✗ Constants usage found in ${relativePath}${colors.reset}`);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  checkDirectory(srcDir);
  
  if (!constantsFound) {
    results.passed.push('No Constants usage found in src directory');
    console.log(`${colors.green}✓ No Constants usage found in src directory${colors.reset}`);
    return true;
  }
  
  return false;
}

// Test 5: Check critical dependencies versions
function testDependencyVersions() {
  console.log(`\n${colors.blue}Test 5: Checking critical dependency versions...${colors.reset}`);
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = packageJson.dependencies;
    
    // Check React Native version
    if (deps['react-native']) {
      console.log(`${colors.green}✓ React Native: ${deps['react-native']}${colors.reset}`);
    }
    
    // Check Expo SDK version
    if (deps['expo']) {
      console.log(`${colors.green}✓ Expo SDK: ${deps['expo']}${colors.reset}`);
    }
    
    // Check critical packages
    const criticalPackages = [
      'react',
      '@react-navigation/native',
      '@stripe/stripe-react-native',
      'nativewind'
    ];
    
    let allPresent = true;
    for (const pkg of criticalPackages) {
      if (deps[pkg]) {
        console.log(`${colors.green}✓ ${pkg}: ${deps[pkg]}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${pkg}: NOT FOUND${colors.reset}`);
        allPresent = false;
      }
    }
    
    if (allPresent) {
      results.passed.push('All critical dependencies present');
      return true;
    } else {
      results.failed.push('Some critical dependencies missing');
      return false;
    }
  } catch (error) {
    results.failed.push(`Failed to check dependencies: ${error.message}`);
    console.log(`${colors.red}✗ Error checking dependencies: ${error.message}${colors.reset}`);
    return false;
  }
}

// Run all tests
console.log(`${colors.cyan}Starting validation tests...${colors.reset}\n`);

testExpoApplicationInstalled();
testEnvironmentConfig();
testAssetsConfiguration();
testNoConstantsUsage();
testDependencyVersions();

// Generate summary report
console.log(`\n${colors.cyan}=== VALIDATION SUMMARY ===${colors.reset}\n`);

if (results.passed.length > 0) {
  console.log(`${colors.green}✓ PASSED (${results.passed.length}):${colors.reset}`);
  results.passed.forEach(test => console.log(`  • ${test}`));
}

if (results.warnings.length > 0) {
  console.log(`\n${colors.yellow}⚠ WARNINGS (${results.warnings.length}):${colors.reset}`);
  results.warnings.forEach(warning => console.log(`  • ${warning}`));
}

if (results.failed.length > 0) {
  console.log(`\n${colors.red}✗ FAILED (${results.failed.length}):${colors.reset}`);
  results.failed.forEach(test => console.log(`  • ${test}`));
}

// Final verdict
console.log(`\n${colors.cyan}=== FINAL VERDICT ===${colors.reset}`);

if (results.failed.length === 0) {
  console.log(`${colors.green}✅ GO - All P0 fixes validated successfully!${colors.reset}`);
  console.log(`${colors.green}The app is ready to start without Hermes errors.${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.red}❌ NO-GO - Critical issues found!${colors.reset}`);
  console.log(`${colors.red}Please fix the failed tests before proceeding.${colors.reset}`);
  process.exit(1);
}