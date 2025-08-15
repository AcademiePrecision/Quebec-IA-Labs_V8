// MARCEL V7.0 - PRODUCTION MONITORING & HEALTH CHECKS
// =============================================
// Monitoring continu et alertes pour production
// =============================================

const fs = require('fs');
const path = require('path');

class ProductionMonitor {
  constructor(config = {}) {
    this.config = {
      serverUrl: config.serverUrl || process.env.PRODUCTION_URL || 'http://localhost:3000',
      checkInterval: config.checkInterval || 60000, // 1 minute
      alertThresholds: {
        responseTime: config.responseTimeThreshold || 3000, // 3 seconds
        errorRate: config.errorRateThreshold || 0.05, // 5%
        memoryUsage: config.memoryThreshold || 500 * 1024 * 1024, // 500MB
        sessionSuccess: config.sessionSuccessThreshold || 0.80 // 80%
      },
      webhookUrl: config.webhookUrl || process.env.ALERT_WEBHOOK_URL,
      logFile: config.logFile || path.join(__dirname, 'monitoring.log')
    };
    
    this.metrics = {
      checks: [],
      errors: [],
      alerts: [],
      startTime: Date.now(),
      lastCheck: null
    };
    
    this.isRunning = false;
  }

  // Logging
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    // Console output
    const colors = {
      INFO: '\x1b[36m',
      SUCCESS: '\x1b[32m',
      WARNING: '\x1b[33m',
      ERROR: '\x1b[31m',
      CRITICAL: '\x1b[35m'
    };
    
    console.log(`${colors[level] || ''}[${timestamp}] ${level}: ${message}\x1b[0m`);
    if (Object.keys(data).length > 0) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
    
    // File output
    try {
      fs.appendFileSync(
        this.config.logFile,
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  // HTTP Request helper
  async makeRequest(endpoint, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default;
    const url = `${this.config.serverUrl}${endpoint}`;
    
    try {
      const startTime = Date.now();
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Marcel-Production-Monitor'
        },
        timeout: 10000
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        responseTime,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: -1
      };
    }
  }

  // Health Checks
  async performHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      checks: {},
      alerts: []
    };

    // 1. Server Status
    const serverStatus = await this.checkServerStatus();
    healthCheck.checks.server = serverStatus;
    
    // 2. API Response Time
    const apiPerformance = await this.checkAPIPerformance();
    healthCheck.checks.performance = apiPerformance;
    
    // 3. Critical Endpoints
    const endpointStatus = await this.checkCriticalEndpoints();
    healthCheck.checks.endpoints = endpointStatus;
    
    // 4. Memory and Resources
    const resourceStatus = await this.checkResources();
    healthCheck.checks.resources = resourceStatus;
    
    // 5. Error Rate
    const errorRate = await this.checkErrorRate();
    healthCheck.checks.errorRate = errorRate;
    
    // Analyze and trigger alerts
    this.analyzeHealthCheck(healthCheck);
    
    // Store metrics
    this.metrics.checks.push(healthCheck);
    this.metrics.lastCheck = healthCheck;
    
    // Keep only last 100 checks in memory
    if (this.metrics.checks.length > 100) {
      this.metrics.checks = this.metrics.checks.slice(-100);
    }
    
    return healthCheck;
  }

  async checkServerStatus() {
    const result = await this.makeRequest('/');
    
    if (!result.success) {
      this.log('CRITICAL', 'Server is DOWN!', { error: result.error });
      return {
        status: 'DOWN',
        error: result.error,
        alert: 'CRITICAL'
      };
    }
    
    return {
      status: 'UP',
      version: result.data.version,
      uptime: result.data.uptime,
      responseTime: result.responseTime
    };
  }

  async checkAPIPerformance() {
    const testRequests = [
      { endpoint: '/dev-metrics', method: 'GET' },
      { 
        endpoint: '/test-marcel-response', 
        method: 'POST',
        body: { userInput: 'Monitor test', sessionId: `monitor-${Date.now()}` }
      }
    ];
    
    const times = [];
    
    for (const req of testRequests) {
      const result = await this.makeRequest(req.endpoint, req.method, req.body);
      if (result.success) {
        times.push(result.responseTime);
      }
    }
    
    if (times.length === 0) {
      return {
        status: 'ERROR',
        alert: 'HIGH'
      };
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    const status = {
      avgResponseTime: avgTime,
      maxResponseTime: maxTime,
      status: avgTime < this.config.alertThresholds.responseTime ? 'GOOD' : 'SLOW'
    };
    
    if (avgTime > this.config.alertThresholds.responseTime) {
      status.alert = 'HIGH';
      this.log('WARNING', 'High response time detected', status);
    }
    
    return status;
  }

  async checkCriticalEndpoints() {
    const criticalEndpoints = [
      { path: '/test-marcel-response', critical: true },
      { path: '/test-claude', critical: false },
      { path: '/client-lookup', critical: false },
      { path: '/dev-metrics', critical: true }
    ];
    
    const results = {
      total: criticalEndpoints.length,
      available: 0,
      failed: [],
      status: 'GOOD'
    };
    
    for (const endpoint of criticalEndpoints) {
      const result = await this.makeRequest(endpoint.path);
      
      if (result.success || result.status === 400 || result.status === 503) {
        results.available++;
      } else {
        results.failed.push({
          endpoint: endpoint.path,
          critical: endpoint.critical,
          error: result.error || `Status: ${result.status}`
        });
        
        if (endpoint.critical) {
          results.status = 'CRITICAL';
          this.log('CRITICAL', `Critical endpoint failed: ${endpoint.path}`);
        }
      }
    }
    
    if (results.failed.length > 0 && results.status !== 'CRITICAL') {
      results.status = 'DEGRADED';
    }
    
    return results;
  }

  async checkResources() {
    const metricsResult = await this.makeRequest('/dev-metrics');
    
    if (!metricsResult.success) {
      return {
        status: 'UNKNOWN',
        error: 'Cannot fetch metrics'
      };
    }
    
    const metrics = metricsResult.data;
    const alerts = [];
    
    // Check sessions count
    if (metrics.sessionsActive > 1000) {
      alerts.push('Too many active sessions');
    }
    
    // Check uptime (restart detection)
    if (metrics.uptime < 300 && this.metrics.checks.length > 5) {
      alerts.push('Server recently restarted');
      this.log('WARNING', 'Server restart detected', { uptime: metrics.uptime });
    }
    
    return {
      status: alerts.length === 0 ? 'GOOD' : 'WARNING',
      sessionsActive: metrics.sessionsActive,
      uptime: metrics.uptime,
      alerts
    };
  }

  async checkErrorRate() {
    // Calculate error rate from recent checks
    const recentChecks = this.metrics.checks.slice(-10);
    
    if (recentChecks.length === 0) {
      return { status: 'UNKNOWN', rate: 0 };
    }
    
    let totalRequests = 0;
    let failedRequests = 0;
    
    recentChecks.forEach(check => {
      if (check.checks.endpoints) {
        totalRequests += check.checks.endpoints.total;
        failedRequests += check.checks.endpoints.failed.length;
      }
    });
    
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;
    
    const status = {
      rate: (errorRate * 100).toFixed(2) + '%',
      status: errorRate < this.config.alertThresholds.errorRate ? 'GOOD' : 'HIGH'
    };
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      status.alert = 'HIGH';
      this.log('WARNING', 'High error rate detected', status);
    }
    
    return status;
  }

  analyzeHealthCheck(healthCheck) {
    const alerts = [];
    
    // Server down
    if (healthCheck.checks.server?.status === 'DOWN') {
      alerts.push({
        level: 'CRITICAL',
        message: 'Server is DOWN',
        action: 'Immediate intervention required'
      });
    }
    
    // High response time
    if (healthCheck.checks.performance?.alert === 'HIGH') {
      alerts.push({
        level: 'HIGH',
        message: `Response time too high: ${healthCheck.checks.performance.avgResponseTime}ms`,
        action: 'Check server load and optimize'
      });
    }
    
    // Critical endpoints failing
    if (healthCheck.checks.endpoints?.status === 'CRITICAL') {
      alerts.push({
        level: 'CRITICAL',
        message: 'Critical endpoints failing',
        endpoints: healthCheck.checks.endpoints.failed,
        action: 'Check application logs'
      });
    }
    
    // High error rate
    if (healthCheck.checks.errorRate?.alert === 'HIGH') {
      alerts.push({
        level: 'HIGH',
        message: `Error rate: ${healthCheck.checks.errorRate.rate}`,
        action: 'Review recent deployments'
      });
    }
    
    // Send alerts
    if (alerts.length > 0) {
      healthCheck.alerts = alerts;
      this.sendAlerts(alerts);
    }
    
    return alerts;
  }

  async sendAlerts(alerts) {
    // Console alerts
    alerts.forEach(alert => {
      this.log(alert.level, alert.message, alert);
    });
    
    // Webhook alerts (if configured)
    if (this.config.webhookUrl) {
      try {
        const fetch = (await import('node-fetch')).default;
        
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'Marcel V7.0',
            environment: process.env.NODE_ENV || 'production',
            timestamp: new Date().toISOString(),
            alerts
          })
        });
      } catch (error) {
        this.log('ERROR', 'Failed to send webhook alert', { error: error.message });
      }
    }
    
    // Store alerts
    this.metrics.alerts.push(...alerts.map(a => ({
      ...a,
      timestamp: new Date().toISOString()
    })));
  }

  // Monitoring Loop
  async start() {
    if (this.isRunning) {
      this.log('WARNING', 'Monitor already running');
      return;
    }
    
    this.isRunning = true;
    this.log('INFO', 'Production monitor started', {
      serverUrl: this.config.serverUrl,
      checkInterval: this.config.checkInterval + 'ms'
    });
    
    // Initial check
    await this.performHealthCheck();
    
    // Schedule regular checks
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthCheck();
      }
    }, this.config.checkInterval);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.log('INFO', 'Production monitor stopped');
    this.generateReport();
  }

  // Reporting
  generateReport() {
    const uptime = Date.now() - this.metrics.startTime;
    const totalChecks = this.metrics.checks.length;
    
    let serverUptime = 0;
    let avgResponseTime = 0;
    let criticalAlerts = 0;
    let highAlerts = 0;
    
    this.metrics.checks.forEach(check => {
      if (check.checks.server?.status === 'UP') {
        serverUptime++;
      }
      
      if (check.checks.performance?.avgResponseTime) {
        avgResponseTime += check.checks.performance.avgResponseTime;
      }
    });
    
    this.metrics.alerts.forEach(alert => {
      if (alert.level === 'CRITICAL') criticalAlerts++;
      if (alert.level === 'HIGH') highAlerts++;
    });
    
    const report = {
      summary: {
        monitoringDuration: `${Math.round(uptime / 1000 / 60)} minutes`,
        totalChecks,
        serverAvailability: totalChecks > 0 ? `${((serverUptime / totalChecks) * 100).toFixed(2)}%` : 'N/A',
        avgResponseTime: totalChecks > 0 ? `${Math.round(avgResponseTime / totalChecks)}ms` : 'N/A',
        totalAlerts: this.metrics.alerts.length,
        criticalAlerts,
        highAlerts
      },
      lastCheck: this.metrics.lastCheck,
      recentAlerts: this.metrics.alerts.slice(-10),
      timestamp: new Date().toISOString()
    };
    
    // Save report
    const reportPath = path.join(__dirname, `monitor-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('INFO', 'Monitoring report generated', {
      path: reportPath,
      summary: report.summary
    });
    
    return report;
  }

  // Dashboard Data
  getDashboardData() {
    const recentChecks = this.metrics.checks.slice(-20);
    const recentAlerts = this.metrics.alerts.slice(-10);
    
    return {
      status: this.getCurrentStatus(),
      metrics: {
        uptime: this.getUptimePercentage(),
        avgResponseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate(),
        activeAlerts: this.metrics.alerts.filter(a => 
          Date.now() - new Date(a.timestamp).getTime() < 3600000 // Last hour
        ).length
      },
      recentChecks: recentChecks.map(check => ({
        timestamp: check.timestamp,
        status: this.getCheckStatus(check),
        responseTime: check.checks.performance?.avgResponseTime
      })),
      recentAlerts,
      lastUpdate: this.metrics.lastCheck?.timestamp
    };
  }

  getCurrentStatus() {
    if (!this.metrics.lastCheck) return 'UNKNOWN';
    
    const lastCheck = this.metrics.lastCheck;
    
    if (lastCheck.checks.server?.status === 'DOWN') return 'DOWN';
    if (lastCheck.alerts?.some(a => a.level === 'CRITICAL')) return 'CRITICAL';
    if (lastCheck.alerts?.some(a => a.level === 'HIGH')) return 'DEGRADED';
    
    return 'HEALTHY';
  }

  getCheckStatus(check) {
    if (check.checks.server?.status === 'DOWN') return 'DOWN';
    if (check.alerts?.length > 0) return 'ALERT';
    return 'OK';
  }

  getUptimePercentage() {
    if (this.metrics.checks.length === 0) return 100;
    
    const upChecks = this.metrics.checks.filter(c => 
      c.checks.server?.status === 'UP'
    ).length;
    
    return ((upChecks / this.metrics.checks.length) * 100).toFixed(2);
  }

  getAverageResponseTime() {
    const times = this.metrics.checks
      .map(c => c.checks.performance?.avgResponseTime)
      .filter(t => t !== undefined);
    
    if (times.length === 0) return 0;
    
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  getErrorRate() {
    const rates = this.metrics.checks
      .map(c => parseFloat(c.checks.errorRate?.rate))
      .filter(r => !isNaN(r));
    
    if (rates.length === 0) return 0;
    
    return (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2);
  }
}

// CLI Execution
if (require.main === module) {
  const monitor = new ProductionMonitor({
    serverUrl: process.argv[2] || process.env.PRODUCTION_URL || 'http://localhost:3000',
    checkInterval: parseInt(process.argv[3]) || 60000
  });
  
  console.log(`
╔════════════════════════════════════════════╗
║   MARCEL V7.0 - PRODUCTION MONITORING      ║
║         Real-time Health Checks            ║
╚════════════════════════════════════════════╝
  `);
  
  // Start monitoring
  monitor.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
  });
}

module.exports = ProductionMonitor;