// Stripe Setup Script for Académie Précision
// This script creates all products, prices, and coupons automatically
// Run with: node stripe-setup-script.js

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupAcademiePrecision() {
  console.log('🎯 Setting up Académie Précision Stripe Configuration...\n');

  try {
    // Step 1: Create Products and Prices
    console.log('📦 Creating subscription products...');
    
    // Plan Base ($29 CAD)
    const baseProduct = await stripe.products.create({
      name: 'Académie Précision - Plan Base',
      description: 'Plan d\'entrée pour académiciens barbiers. 5 formations par mois, support email, certificats de base.',
      metadata: {
        tier: 'base',
        formations_limit: '5',
        support: 'email',
        certificates: 'basic'
      }
    });

    const basePrice = await stripe.prices.create({
      unit_amount: 2900, // $29.00 in cents
      currency: 'cad',
      recurring: { interval: 'month' },
      product: baseProduct.id,
      metadata: {
        plan_name: 'base',
        target_users: '1407',
        annual_revenue: '489816'
      }
    });

    // Plan Pro ($79 CAD)
    const proProduct = await stripe.products.create({
      name: 'Académie Précision - Plan Pro',
      description: 'Plan professionnel complet. Formations illimitées, support prioritaire, 10 ateliers pratiques, suivi personnel.',
      metadata: {
        tier: 'pro',
        formations_limit: 'unlimited',
        workshops_limit: '10',
        support: 'priority',
        certificates: 'professional'
      }
    });

    const proPrice = await stripe.prices.create({
      unit_amount: 7900, // $79.00 in cents
      currency: 'cad',
      recurring: { interval: 'month' },
      product: proProduct.id,
      metadata: {
        plan_name: 'pro',
        target_users: '550',
        annual_revenue: '521400',
        most_popular: 'true'
      }
    });

    // Plan Académie ($199 CAD)
    const academieProduct = await stripe.products.create({
      name: 'Académie Précision - Plan Académie',
      description: 'Plan élite pour professionnels avancés. Tout du Pro + ateliers illimités, support 24/7, mentorat personnel, accès exclusif.',
      metadata: {
        tier: 'academie',
        formations_limit: 'unlimited',
        workshops_limit: 'unlimited',
        support: '24_7_dedicated',
        mentoring: 'personal',
        certificates: 'elite'
      }
    });

    const academiePrice = await stripe.prices.create({
      unit_amount: 19900, // $199.00 in cents
      currency: 'cad',
      recurring: { interval: 'month' },
      product: academieProduct.id,
      metadata: {
        plan_name: 'academie',
        target_users: '105',
        annual_revenue: '250740'
      }
    });

    console.log('✅ Products created successfully!');
    console.log(`   Base Plan: ${basePrice.id}`);
    console.log(`   Pro Plan: ${proPrice.id}`);
    console.log(`   Académie Plan: ${academiePrice.id}\n`);

    // Step 2: Create Strategic Coupons
    console.log('🎫 Creating strategic promotional coupons...');

    // ESSAI7JOURS - 7-day free trial (100% off)
    const essaiCoupon = await stripe.coupons.create({
      id: 'ESSAI7JOURS',
      name: 'Essai gratuit 7 jours',
      percent_off: 100,
      duration: 'once',
      max_redemptions: 1000,
      metadata: {
        campaign: 'free_trial',
        target_conversion: '30-45%',
        description: 'Premier essai gratuit pour nouveaux utilisateurs'
      }
    });

    // LANCEMENT30 - Launch promotion (30% off first month)
    const lancement30Coupon = await stripe.coupons.create({
      id: 'LANCEMENT30',
      name: 'Lancement - 30% rabais',
      percent_off: 30,
      duration: 'once',
      max_redemptions: 500,
      metadata: {
        campaign: 'launch_promotion',
        target_conversion: '25-35%',
        description: 'Promotion de lancement pour audience générale'
      }
    });

    // EARLY50 - Early adopter (50% off for 3 months)
    const early50Coupon = await stripe.coupons.create({
      id: 'EARLY50',
      name: 'Early Bird - 50% rabais x3 mois',
      percent_off: 50,
      duration: 'repeating',
      duration_in_months: 3,
      max_redemptions: 100,
      metadata: {
        campaign: 'early_adopter',
        target_conversion: '40-60%',
        description: 'Exclusif pour les 100 premiers utilisateurs'
      }
    });

    // ETUDIANT20 - Student discount (20% off forever)
    const etudiantCoupon = await stripe.coupons.create({
      id: 'ETUDIANT20',
      name: 'Rabais étudiant permanent - 20%',
      percent_off: 20,
      duration: 'forever',
      metadata: {
        campaign: 'student_discount',
        target_conversion: '15-25%',
        description: 'Rabais permanent pour étudiants en coiffure'
      }
    });

    // PARRAIN25 - Referral bonus (25% off)
    const parrainCoupon = await stripe.coupons.create({
      id: 'PARRAIN25',
      name: 'Bonus parrainage - 25% rabais',
      percent_off: 25,
      duration: 'once',
      metadata: {
        campaign: 'referral_program',
        target_conversion: '20-30%',
        description: 'Bonus pour parrainage d\'un nouvel utilisateur'
      }
    });

    console.log('✅ Coupons created successfully!');
    console.log(`   ESSAI7JOURS: 100% off (${essaiCoupon.max_redemptions} redemptions)`);
    console.log(`   LANCEMENT30: 30% off (${lancement30Coupon.max_redemptions} redemptions)`);
    console.log(`   EARLY50: 50% off x3 months (${early50Coupon.max_redemptions} redemptions)`);
    console.log(`   ETUDIANT20: 20% off forever (unlimited)`);
    console.log(`   PARRAIN25: 25% off (unlimited)\n`);

    // Step 3: Create webhook endpoint (for reference)
    console.log('🔗 Webhook endpoint configuration:');
    console.log('   URL: https://academieprecision.supabase.co/functions/v1/stripe-webhook');
    console.log('   Required events: customer.*, payment_method.*, invoice.*, payment_intent.*\n');

    // Step 4: Generate environment variables
    console.log('📝 Add these to your .env file:');
    console.log(`STRIPE_PLAN_BASE_MONTHLY=${basePrice.id}`);
    console.log(`STRIPE_PLAN_PRO_MONTHLY=${proPrice.id}`);
    console.log(`STRIPE_PLAN_ACADEMIE_MONTHLY=${academiePrice.id}`);
    console.log('');
    console.log('STRIPE_COUPON_ESSAI7JOURS=ESSAI7JOURS');
    console.log('STRIPE_COUPON_LANCEMENT30=LANCEMENT30');
    console.log('STRIPE_COUPON_EARLY50=EARLY50');
    console.log('STRIPE_COUPON_ETUDIANT20=ETUDIANT20');
    console.log('STRIPE_COUPON_PARRAIN25=PARRAIN25\n');

    // Step 5: Revenue projection summary
    console.log('💰 Revenue Projection Summary:');
    console.log('   Plan Base ($29): 1,407 users = $489,816 annually');
    console.log('   Plan Pro ($79): 550 users = $521,400 annually');
    console.log('   Plan Académie ($199): 105 users = $250,740 annually');
    console.log('   TOTAL POTENTIAL: $1,261,956 annually\n');

    console.log('🎉 Académie Précision Stripe setup complete!');
    console.log('   Ready for $1.22M revenue generation with strategic coupons');
    console.log('   Conversion rate expected: 25-40% (vs 5-10% without coupons)');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Please check your STRIPE_SECRET_KEY environment variable');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupAcademiePrecision();
}

module.exports = { setupAcademiePrecision };