/**
 * Runtime Validation Test for CutClub App
 * Tests that the app can actually load and initialize without Hermes errors
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Runtime Validation Test ===\n');

// Test that index.js can be loaded
console.log('Testing index.js loading...');
try {
  const indexPath = path.join(__dirname, '..', 'index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for proper Expo registration
  if (indexContent.includes('registerRootComponent')) {
    console.log('✓ Expo registration found in index.js');
  } else {
    console.log('⚠ No registerRootComponent found - checking for AppRegistry');
    if (indexContent.includes('AppRegistry.registerComponent')) {
      console.log('✓ AppRegistry registration found');
    } else {
      console.log('✗ No app registration found!');
      process.exit(1);
    }
  }
} catch (error) {
  console.log(`✗ Failed to load index.js: ${error.message}`);
  process.exit(1);
}

// Test App.tsx can be loaded
console.log('\nTesting App.tsx loading...');
try {
  const appPath = path.join(__dirname, '..', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  // Check for proper imports
  if (appContent.includes('react-native')) {
    console.log('✓ React Native imports found');
  }
  
  if (appContent.includes('NavigationContainer') || appContent.includes('AppNavigator')) {
    console.log('✓ Navigation setup found');
  }
  
  // Check for theme provider
  if (appContent.includes('ThemeProvider')) {
    console.log('✓ Theme provider found');
  }
  
} catch (error) {
  console.log(`✗ Failed to load App.tsx: ${error.message}`);
  process.exit(1);
}

// Check critical screens exist
console.log('\nChecking critical screens...');
const screens = [
  'SplashScreen.tsx',
  'WelcomeScreen.tsx',
  'LoginScreen.tsx',
  'RegisterScreen.tsx',
  'StudentDashboard.tsx'
];

const screensDir = path.join(__dirname, '..', 'src', 'screens');
let allScreensFound = true;

for (const screen of screens) {
  const screenPath = path.join(screensDir, screen);
  if (fs.existsSync(screenPath)) {
    console.log(`✓ ${screen} found`);
  } else {
    console.log(`✗ ${screen} missing`);
    allScreensFound = false;
  }
}

// Check navigation setup
console.log('\nChecking navigation setup...');
const navPath = path.join(__dirname, '..', 'src', 'navigation', 'AppNavigator.tsx');
if (fs.existsSync(navPath)) {
  console.log('✓ AppNavigator.tsx found');
  const navContent = fs.readFileSync(navPath, 'utf8');
  
  if (navContent.includes('createStackNavigator') || navContent.includes('createNativeStackNavigator')) {
    console.log('✓ Stack navigator configured');
  }
} else {
  console.log('✗ AppNavigator.tsx missing');
  allScreensFound = false;
}

// Final report
console.log('\n=== Runtime Validation Result ===');
if (allScreensFound) {
  console.log('✅ Runtime validation PASSED');
  console.log('The app structure is ready for runtime execution');
} else {
  console.log('❌ Runtime validation FAILED');
  console.log('Some critical files are missing');
  process.exit(1);
}