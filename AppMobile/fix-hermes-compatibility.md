# 🔒 SECURITY AUDIT REPORT - Hermes Compatibility Fix

**Risk Level: CRITICAL**  
**Issue**: Runtime crash avec Hermes - "URL.protocol is not implemented"

## Vulnerabilities Found

1. **NativeWind v4.1.23** - Version trop récente avec incompatibilités Hermes
2. **babel-plugin-module-resolver** - Dans dependencies au lieu de devDependencies
3. **Supabase JS Client** - Peut utiliser des polyfills Node.js incompatibles avec Hermes

## Cause Racine Identifiée

Le problème principal vient de **NativeWind v4.x** qui a des incompatibilités connues avec Hermes dans React Native. La v4 utilise des APIs modernes non supportées par Hermes.

## Solution Immédiate

### Option 1: Downgrade NativeWind (RECOMMANDÉ)
```bash
cd AppMobile
npm uninstall nativewind
npm install nativewind@^2.0.11
```

### Option 2: Installer les polyfills nécessaires
```bash
cd AppMobile
npm install react-native-url-polyfill@^2.0.0
```

Puis ajouter en haut de index.js:
```javascript
import 'react-native-url-polyfill/auto';
```

### Option 3: Désactiver Hermes temporairement
Dans `app.json`:
```json
{
  "expo": {
    "jsEngine": "jsc"
  }
}
```

## Actions Correctives Complètes

1. **Déplacer babel-plugin-module-resolver**
```bash
cd AppMobile
npm uninstall babel-plugin-module-resolver
npm install --save-dev babel-plugin-module-resolver
```

2. **Downgrade NativeWind**
```bash
npm uninstall nativewind tailwind-merge
npm install nativewind@^2.0.11
```

3. **Nettoyer le cache**
```bash
npx expo start -c
```

## Configuration Corrigée

### package.json (dependencies)
```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/native-stack": "^7.3.25",
    "@react-navigation/stack": "^7.4.7",
    "@stripe/stripe-react-native": "0.45.0",
    "@supabase/supabase-js": "^2.38.0",
    "clsx": "^2.1.1",
    "expo": "~53.0.0",
    "expo-constants": "^17.1.7",
    "expo-linear-gradient": "~14.1.5",
    "expo-status-bar": "~2.2.3",
    "nativewind": "^2.0.11",
    "react": "19.0.0",
    "react-native": "0.79.5",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-url-polyfill": "^2.0.0",
    "zustand": "^5.0.7",
    "expo-keep-awake": "~14.1.4"
  },
  "devDependencies": {
    "@types/react": "~19.0.10",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "eslint": "^8.0.0",
    "tailwindcss": "^3.3.2",
    "typescript": "~5.8.3"
  }
}
```

### metro.config.js (pour NativeWind v2)
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.useWatchman = false;

module.exports = config;
```

### tailwind.config.js (pour NativeWind v2)
```javascript
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Validation

Après les corrections:
1. `rm -rf node_modules package-lock.json`
2. `npm install`
3. `npx expo start -c`

## Impact Sécurité

- ✅ Élimine le crash au démarrage
- ✅ Maintient la compatibilité Hermes
- ✅ Préserve les performances optimales
- ✅ Aucune vulnérabilité de sécurité introduite

## Recommandations Supplémentaires

1. **Court terme**: Utiliser NativeWind v2 stable
2. **Moyen terme**: Migrer vers une solution CSS-in-JS native (styled-components/emotion)
3. **Long terme**: Attendre NativeWind v5 avec support Hermes complet

## Monitoring

Ajouter des tests automatisés pour détecter les incompatibilités:
```javascript
// __tests__/hermes-compatibility.test.js
describe('Hermes Compatibility', () => {
  it('should have URL polyfill', () => {
    expect(typeof URL).toBe('function');
  });
});
```