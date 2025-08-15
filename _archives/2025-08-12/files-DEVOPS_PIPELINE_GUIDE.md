# 🚀 GUIDE PIPELINE DEVOPS - ACADÉMIE PRÉCISION

## 📋 VUE D'ENSEMBLE

Pipeline automatisé complet pour protéger **$1.22M de revenus annuels** avec déploiement zero-downtime.

```
Local → GitHub → Tests → Staging → Production
  ↓        ↓       ↓        ↓          ↓
Sync    Actions  Validate  Replit    Replit Pro
        CI/CD    Quality    Dev       + Monitoring
```

## 🎯 OBJECTIFS PRINCIPAUX

1. **Protection des revenus**: Zero downtime pour Stripe
2. **Qualité garantie**: Tests automatisés avant production
3. **Déploiement rapide**: Push to production en < 10 minutes
4. **Rollback immédiat**: Retour en arrière en 1 clic
5. **Monitoring 24/7**: Alertes instantanées

## 🛠️ CONFIGURATION INITIALE

### 1. Secrets GitHub
Aller dans **Settings → Secrets → Actions** et ajouter:

```yaml
# Stripe (CRITICAL - Revenue)
STRIPE_SECRET_KEY=sk_test_51RqUlxE99y6eiTX6oxMgOjWq13vhl1oWvFFWAzzKox2h...
STRIPE_WEBHOOK_SECRET=whsec_T2C2vlfRGW71iQt1kG3A9XKqBVSIdbr8

# Supabase
SUPABASE_URL=https://ibryvpdzylquovcroqsi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Services
ELEVENLABS_API_KEY=sk_2c9d51ef10611b204931241c05438abda05c61e403ada022
TWILIO_ACCOUNT_SID=c0e836f6ddc50f4dd2b8
TWILIO_AUTH_TOKEN=6c8bb51915f2848fd7680e6552cdebd2

# Replit (optional - for automated deployment)
REPLIT_TOKEN=your_replit_api_token
REPLIT_PRO_TOKEN=your_replit_pro_token
```

### 2. Branches Strategy

```
main       → Production (Replit Pro)
develop    → Staging (Replit Dev)
feature/*  → Development
hotfix/*   → Emergency fixes
```

## 📦 COMMANDES ESSENTIELLES

### Synchronisation locale → GitHub

```bash
# Sync automatique avec validation
npm run sync

# Ou manuellement avec type de commit
node scripts/sync-to-github.js feat "Add Stripe subscription tiers"
node scripts/sync-to-github.js fix "Fix payment webhook"
node scripts/sync-to-github.js payment "Implement Apple Pay"
```

### Déploiement vers Replit

```bash
# Deploy to staging (Replit Dev)
npm run deploy:dev

# Deploy to production (Replit Pro) - REQUIRES CONFIRMATION
npm run deploy:prod

# Emergency rollback
npm run rollback:prod
```

### Scripts NPM ajoutés

```json
{
  "scripts": {
    "sync": "node scripts/sync-to-github.js",
    "deploy:dev": "node scripts/deploy-to-replit.js dev",
    "deploy:prod": "node scripts/deploy-to-replit.js prod",
    "rollback:prod": "node scripts/deploy-to-replit.js rollback prod",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:payment": "jest --testPathPattern=payment",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:payment",
    "monitor": "node scripts/monitor-production.js",
    "health": "curl https://AcademiePrecision.replit.app/health"
  }
}
```

## 🔄 WORKFLOW QUOTIDIEN

### Morning Routine (9h00)
```bash
# 1. Check production health
npm run health

# 2. Pull latest changes
git pull origin main

# 3. Check monitoring dashboard
npm run monitor
```

### Development Flow
```bash
# 1. Create feature branch
git checkout -b feature/new-payment-method

# 2. Develop & test locally
npm run dev
npm test

# 3. Sync to GitHub (triggers CI/CD)
npm run sync feat "Add new payment method"

# 4. Create PR for review
# GitHub automatically runs tests
```

### Deployment to Production
```bash
# 1. Ensure on main branch
git checkout main
git pull origin main

# 2. Run final tests
npm run test:all

# 3. Deploy (manual trigger on GitHub)
# Go to Actions → CI/CD Pipeline → Run workflow → Deploy to production ✓

# 4. Monitor deployment
npm run monitor
```

## 🚨 INCIDENT RESPONSE

### Payment System Down
```bash
# PRIORITY 0 - REVENUE CRITICAL

# 1. Check Stripe status
curl https://AcademiePrecision.replit.app/api/stripe/health

# 2. Rollback if needed
npm run rollback:prod

# 3. Check logs
npm run logs:prod

# 4. Emergency hotfix
git checkout -b hotfix/payment-critical
# Fix issue
npm run sync hotfix "Emergency payment fix"
```

### Performance Issues
```bash
# 1. Check metrics
npm run monitor

# 2. Scale if needed (Replit Pro auto-scales)

# 3. Optimize database
npm run db:optimize
```

## 📊 MONITORING DASHBOARD

### Key Metrics (Target)
- **Uptime**: 99.9% minimum
- **API Response**: < 200ms average
- **Payment Success**: > 95%
- **Error Rate**: < 1%
- **Crash Rate**: < 1%

### Daily Checks
```
✅ Payment processing operational
✅ Database connections healthy
✅ API endpoints responding
✅ Mobile apps stable
✅ Cost under budget ($500/month)
```

## 🔐 SECURITY CHECKLIST

Before EVERY deployment:

- [ ] No API keys in code
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Authentication working
- [ ] Payment data encrypted
- [ ] Backups completed

## 💰 REVENUE PROTECTION

### Critical Systems (Never Break)
1. **Stripe webhooks** - Process payments
2. **User authentication** - Access control
3. **Course delivery** - Content access
4. **Subscription management** - Recurring revenue

### Monitoring Alerts
```yaml
P0: Payment failures > 5% → Immediate action
P1: API errors > 2% → 15 min response
P2: Slow response > 500ms → 1 hour response
P3: UI bugs → 24 hour response
```

## 📈 DEPLOYMENT METRICS

Track for every deployment:

```
Deployment Time: _____ minutes
Tests Passed: _____ / _____
Downtime: _____ seconds
Revenue Impact: $_____
User Impact: _____ users
Rollback Needed: Yes/No
```

## 🎯 QUICK REFERENCE

### One-Click Commands

```bash
# Full sync & deploy to staging
npm run sync && npm run deploy:dev

# Emergency production fix
npm run rollback:prod && npm run sync hotfix "Emergency fix"

# Full test suite
npm run test:all

# Check everything
npm run health && npm run monitor
```

### Contact for Issues

**Revenue Critical (P0)**:
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase: https://app.supabase.com
- GitHub Actions: https://github.com/[your-repo]/actions

## ✅ SUCCESS CRITERIA

Your pipeline is working when:

1. ✅ Every push triggers automated tests
2. ✅ Staging deployments are automatic
3. ✅ Production deployments require approval
4. ✅ Rollback takes < 2 minutes
5. ✅ Monitoring alerts work
6. ✅ Zero revenue lost to downtime

---

**Remember**: Every deployment protects $1.22M in annual revenue. Test twice, deploy once!

Last Updated: 2025-08-11
Pipeline Version: 1.0.0
Revenue Protected: $1,220,000/year