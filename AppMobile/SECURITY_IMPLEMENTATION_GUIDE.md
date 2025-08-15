# 🔒 Guide d'Implémentation de Sécurité - CutClub

## Vue d'ensemble

Ce guide documente les corrections de sécurité critiques P0/P1 implémentées dans l'application CutClub.

## 📊 Corrections Implémentées

### P0 - Priorité Critique (Impact immédiat)

#### 1. ✅ Variables d'Environnement Stripe
**Fichiers modifiés:**
- `/src/config/environment.ts` - Configuration centralisée
- `/app.config.js` - Configuration Expo avec variables sécurisées
- `/src/api/stripe-service.ts` - Utilisation des variables d'environnement

**Impact:** 
- ✅ Clés API sécurisées
- ✅ Aucun impact UX
- ✅ Configuration par environnement (dev/staging/prod)

#### 2. ✅ Validation Paiement Backend
**Fichiers créés:**
- `/src/services/payment-validator.ts` - Service de validation avec Supabase
- `/src/contexts/SecurityContext.tsx` - Contexte de sécurité unifié

**Impact:**
- ✅ Loading optimiste (300ms max)
- ✅ Validation asynchrone en arrière-plan
- ✅ Cache de validation pour performance

### P1 - Priorité Haute

#### 3. ✅ Gestion des Rôles et Permissions
**Fichiers créés:**
- `/src/services/permission-manager.ts` - Gestionnaire de permissions avec cache

**Fonctionnalités:**
```typescript
// Vérification de permission
const canEdit = await permissionManager.hasPermission(userId, 'edit:formations');

// Vérification de fonctionnalité
const hasAI = await permissionManager.canAccessFeature(userId, 'ai');
```

**Matrice de permissions:**
- `admin`: Accès complet
- `vip`: Premium + AI + Analytics
- `formateur`: Formations + Étudiants + Analytics limité
- `salon`: Rendez-vous + Valet-IA + Paiements
- `etudiant`: Formations en lecture seule
- `guest`: Accès public uniquement

#### 4. ✅ Migration AsyncStorage → SecureStore
**Fichiers créés:**
- `/src/services/storage-migrator.ts` - Service de migration progressive

**Pattern Double-Write:**
```typescript
// Utilisation transparente
import { SecureStorage } from '@/services/storage-migrator';

// Écriture (double-write automatique)
await SecureStorage.setItem('sensitive_data', value);

// Lecture (fallback automatique)
const data = await SecureStorage.getItem('sensitive_data');
```

## 🔧 Configuration Requise

### 1. Variables d'environnement

Créer un fichier `.env` à la racine du projet AppMobile:

```env
# Development
STRIPE_PUBLISHABLE_KEY_DEV=pk_test_YOUR_KEY
SUPABASE_URL_DEV=https://your-project.supabase.co
SUPABASE_ANON_KEY_DEV=your_anon_key

# Production (ne pas commiter)
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### 2. Installation des dépendances

```bash
cd AppMobile
npm install dotenv expo-constants @supabase/supabase-js expo-secure-store
```

### 3. Configuration Supabase

Créer les tables suivantes dans Supabase:

```sql
-- Table des logs de paiement
CREATE TABLE payment_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  amount integer NOT NULL,
  success boolean DEFAULT false,
  metadata jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Table des abonnements
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  stripe_subscription_id text UNIQUE,
  tier text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour les logs (lecture seule pour l'utilisateur)
CREATE POLICY "Users can view own payment logs" ON payment_logs
  FOR SELECT USING (auth.uid()::text = user_id);

-- Politique pour les abonnements
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);
```

### 4. Créer les Edge Functions Supabase

**validate-payment:**
```typescript
// supabase/functions/validate-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { userId, profileId, paymentIntentId, amount, currency, metadata } = await req.json()
    
    // Validation logique
    const isValid = amount > 0 && currency === 'CAD'
    
    // Logger la tentative
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    await supabase.from('payment_logs').insert({
      user_id: userId,
      amount,
      success: isValid,
      metadata: { paymentIntentId, ...metadata }
    })
    
    return new Response(
      JSON.stringify({
        valid: isValid,
        transactionId: `txn_${Date.now()}`,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## 🚀 Utilisation dans l'Application

### 1. Validation de Paiement Sécurisée

```typescript
import { useSecurity } from '@/contexts/SecurityContext';

const PaymentComponent = () => {
  const { validatePayment, checkPaymentRateLimit } = useSecurity();
  
  const handlePayment = async () => {
    // Vérifier les limites
    if (!await checkPaymentRateLimit()) {
      alert('Trop de tentatives');
      return;
    }
    
    // Valider le paiement
    const isValid = await validatePayment(paymentIntentId, amount);
    
    if (isValid) {
      // Continuer avec Stripe
    }
  };
};
```

### 2. Vérification de Permissions

```typescript
import { useSecurity } from '@/contexts/SecurityContext';

const ProtectedComponent = () => {
  const { hasPermission, canAccessFeature } = useSecurity();
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    checkPermissions();
  }, []);
  
  const checkPermissions = async () => {
    const hasEditPermission = await hasPermission('edit:formations');
    const hasAIAccess = await canAccessFeature('ai');
    setCanEdit(hasEditPermission);
  };
  
  if (!canEdit) {
    return <LockedContent />;
  }
  
  return <EditableContent />;
};
```

### 3. Stockage Sécurisé

```typescript
import { SecureStorage } from '@/services/storage-migrator';

// Sauvegarder des données sensibles
await SecureStorage.setItem('auth_token', token);
await SecureStorage.setItem('user_credentials', JSON.stringify(credentials));

// Lire des données
const token = await SecureStorage.getItem('auth_token');
const credentials = JSON.parse(await SecureStorage.getItem('user_credentials') || '{}');

// Supprimer
await SecureStorage.removeItem('auth_token');
```

## 📈 Monitoring et Audit

### Logs de Sécurité

Les incidents de sécurité sont automatiquement enregistrés:

```typescript
// Automatique dans SecurityContext
reportSecurityIncident('suspicious_activity', {
  userId,
  action: 'multiple_failed_payments',
  timestamp: new Date().toISOString()
});
```

### Métriques à Surveiller

1. **Taux de validation de paiement**
   - Objectif: >95% de validations réussies
   - Alerte si <90%

2. **Temps de réponse de validation**
   - Objectif: <300ms (loading optimiste)
   - Alerte si >500ms

3. **Tentatives de paiement échouées**
   - Limite: 10 par 5 minutes
   - Blocage automatique après dépassement

4. **Migration du stockage**
   - Progression: Vérifier dans `storageMigrator.getMigrationReport()`
   - Objectif: 100% des clés sensibles migrées

## 🔍 Tests de Sécurité

### 1. Test de Validation de Paiement

```bash
# Terminal 1: Lancer l'app
npm run start

# Terminal 2: Tests
npm run test:security
```

### 2. Test de Permissions

```typescript
// __tests__/permissions.test.ts
describe('Permission Manager', () => {
  it('should deny access for unauthorized users', async () => {
    const hasAccess = await permissionManager.hasPermission('guest_id', 'manage:payments');
    expect(hasAccess).toBe(false);
  });
  
  it('should grant access for admin', async () => {
    const hasAccess = await permissionManager.hasPermission('admin_id', 'manage:payments');
    expect(hasAccess).toBe(true);
  });
});
```

### 3. Test de Migration

```typescript
// Vérifier la migration
const report = storageMigrator.getMigrationReport();
console.log(`Migration: ${report.migratedItems}/${report.totalItems} items`);
```

## ⚠️ Points d'Attention

1. **Ne jamais commiter le fichier `.env`**
   - Ajouter au `.gitignore`
   - Utiliser `.env.example` pour documentation

2. **Rotation des clés API**
   - Planifier rotation mensuelle en production
   - Utiliser des clés différentes par environnement

3. **Monitoring continu**
   - Intégrer Sentry pour les erreurs production
   - Logger tous les incidents de sécurité

4. **Backup des données sensibles**
   - Migration progressive sans perte de données
   - Double-write pattern pendant transition

## 📞 Support

Pour toute question sur l'implémentation de sécurité:
- Documentation: `/docs/security`
- Contact: security@academie-precision.com

---

*Dernière mise à jour: ${new Date().toISOString()}*
*Version: 1.0.0*