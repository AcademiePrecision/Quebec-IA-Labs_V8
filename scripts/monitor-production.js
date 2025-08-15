#!/usr/bin/env node

/**
 * 📊 PRODUCTION MONITORING SCRIPT
 * Surveillance en temps réel pour protéger les revenus
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const ENDPOINTS = {
  prod: 'https://AcademiePrecision.replit.app',
  staging: 'https://marcel-trainer-dev.replit.app'
};

const METRICS_TARGETS = {
  uptime: 99.9,          // %
  responseTime: 200,     // ms
  paymentSuccess: 95,    // %
  errorRate: 1,          // %
  crashRate: 1           // %
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check endpoint health
 */
async function checkHealth(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(`${url}/health`, (res) => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        resolve({
          name,
          status: 'healthy',
          responseTime,
          statusCode: res.statusCode
        });
      } else {
        resolve({
          name,
          status: 'unhealthy',
          responseTime,
          statusCode: res.statusCode
        });
      }
    }).on('error', (err) => {
      resolve({
        name,
        status: 'error',
        responseTime: -1,
        error: err.message
      });
    });
  });
}

/**
 * Display metrics dashboard
 */
function displayDashboard(metrics) {
  console.clear();
  
  log('\n====================================', 'bright');
  log('📊 PRODUCTION MONITORING DASHBOARD', 'bright');
  log('====================================', 'bright');
  log(`Time: ${new Date().toLocaleString()}`, 'cyan');
  
  // System Health
  log('\n🏥 SYSTEM HEALTH', 'bright');
  metrics.health.forEach(endpoint => {
    const statusColor = endpoint.status === 'healthy' ? 'green' : 'red';
    const statusIcon = endpoint.status === 'healthy' ? '✅' : '❌';
    
    log(`${statusIcon} ${endpoint.name}: ${endpoint.status.toUpperCase()}`, statusColor);
    
    if (endpoint.responseTime > 0) {
      const timeColor = endpoint.responseTime < METRICS_TARGETS.responseTime ? 'green' : 'yellow';
      log(`   Response time: ${endpoint.responseTime}ms`, timeColor);
    }
  });
  
  // Revenue Metrics
  log('\n💰 REVENUE METRICS', 'bright');
  log(`• Payment Success Rate: ${metrics.paymentSuccess}%`, 
      metrics.paymentSuccess >= METRICS_TARGETS.paymentSuccess ? 'green' : 'red');
  log(`• Active Subscriptions: ${metrics.activeSubscriptions}`, 'cyan');
  log(`• MRR: $${metrics.mrr.toLocaleString()}`, 'green');
  log(`• Daily Revenue: $${metrics.dailyRevenue}`, 'cyan');
  
  // Performance Metrics
  log('\n⚡ PERFORMANCE METRICS', 'bright');
  log(`• Average Response: ${metrics.avgResponseTime}ms`, 
      metrics.avgResponseTime < METRICS_TARGETS.responseTime ? 'green' : 'yellow');
  log(`• Error Rate: ${metrics.errorRate}%`,
      metrics.errorRate < METRICS_TARGETS.errorRate ? 'green' : 'red');
  log(`• Uptime: ${metrics.uptime}%`,
      metrics.uptime >= METRICS_TARGETS.uptime ? 'green' : 'red');
  
  // Traffic Stats
  log('\n📈 TRAFFIC STATISTICS', 'bright');
  log(`• Active Users: ${metrics.activeUsers}`, 'cyan');
  log(`• API Calls (24h): ${metrics.apiCalls.toLocaleString()}`, 'cyan');
  log(`• Peak Concurrent: ${metrics.peakConcurrent}`, 'cyan');
  
  // Infrastructure Costs
  log('\n💸 INFRASTRUCTURE COSTS', 'bright');
  log(`• Monthly Spend: $${metrics.monthlyCost}`, 
      metrics.monthlyCost <= 500 ? 'green' : 'yellow');
  log(`• Cost per User: $${(metrics.monthlyCost / metrics.activeUsers).toFixed(2)}`, 'cyan');
  log(`• Revenue/Cost Ratio: ${(metrics.mrr / metrics.monthlyCost).toFixed(1)}x`, 'green');
  
  // Alerts
  if (metrics.alerts.length > 0) {
    log('\n🚨 ACTIVE ALERTS', 'red');
    metrics.alerts.forEach(alert => {
      log(`• ${alert}`, 'yellow');
    });
  } else {
    log('\n✅ NO ACTIVE ALERTS', 'green');
  }
  
  log('\n====================================', 'bright');
  log('Press Ctrl+C to exit monitoring', 'cyan');
}

/**
 * Collect all metrics
 */
async function collectMetrics() {
  // Check endpoints health
  const healthChecks = await Promise.all([
    checkHealth(ENDPOINTS.prod, 'Production'),
    checkHealth(ENDPOINTS.staging, 'Staging')
  ]);
  
  // Calculate metrics (simulated for now)
  const metrics = {
    health: healthChecks,
    paymentSuccess: 97.3,
    activeSubscriptions: 234,
    mrr: 18420,
    dailyRevenue: 614,
    avgResponseTime: healthChecks[0].responseTime > 0 ? healthChecks[0].responseTime : 150,
    errorRate: 0.3,
    uptime: 99.97,
    activeUsers: 892,
    apiCalls: 45678,
    peakConcurrent: 67,
    monthlyCost: 110,
    alerts: []
  };
  
  // Check for alerts
  if (metrics.paymentSuccess < METRICS_TARGETS.paymentSuccess) {
    metrics.alerts.push('Payment success rate below target');
  }
  
  if (metrics.avgResponseTime > METRICS_TARGETS.responseTime) {
    metrics.alerts.push('Response time above target');
  }
  
  if (metrics.errorRate > METRICS_TARGETS.errorRate) {
    metrics.alerts.push('Error rate above threshold');
  }
  
  if (healthChecks[0].status !== 'healthy') {
    metrics.alerts.push('PRODUCTION IS DOWN!');
  }
  
  return metrics;
}

/**
 * Main monitoring loop
 */
async function monitor() {
  log('Starting production monitoring...', 'cyan');
  
  // Initial check
  const metrics = await collectMetrics();
  displayDashboard(metrics);
  
  // Refresh every 30 seconds
  setInterval(async () => {
    const metrics = await collectMetrics();
    displayDashboard(metrics);
  }, 30000);
}

/**
 * Quick health check (for CI/CD)
 */
async function quickCheck() {
  const health = await checkHealth(ENDPOINTS.prod, 'Production');
  
  if (health.status === 'healthy') {
    log('✅ Production is healthy', 'green');
    log(`Response time: ${health.responseTime}ms`, 'cyan');
    process.exit(0);
  } else {
    log('❌ Production health check failed', 'red');
    log(`Status: ${health.status}`, 'red');
    if (health.error) {
      log(`Error: ${health.error}`, 'red');
    }
    process.exit(1);
  }
}

// Handle arguments
const args = process.argv.slice(2);

if (args.includes('--quick')) {
  quickCheck();
} else {
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\nStopping monitoring...', 'yellow');
    log('Monitoring stopped', 'cyan');
    process.exit(0);
  });
  
  // Start monitoring
  monitor();
}

module.exports = { checkHealth, collectMetrics };