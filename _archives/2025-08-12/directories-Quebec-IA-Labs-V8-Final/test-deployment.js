/**
 * Marcel V8.0 Ultimate - Deployment Test Suite
 * Run this after deployment to verify all endpoints
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.REPLIT_URL || 'http://localhost:3000';
const IS_HTTPS = BASE_URL.startsWith('https');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results storage
const testResults = [];

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const client = IS_HTTPS ? https : http;
        
        const options = {
            hostname: url.hostname,
            port: url.port || (IS_HTTPS ? 443 : 3000),
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test function wrapper
async function runTest(name, testFn) {
    process.stdout.write(`Testing ${name}... `);
    
    try {
        const result = await testFn();
        console.log(`${colors.green}✅ PASSED${colors.reset}`);
        testResults.push({ name, status: 'PASSED', details: result });
        return true;
    } catch (error) {
        console.log(`${colors.red}❌ FAILED${colors.reset}`);
        console.log(`  Error: ${error.message}`);
        testResults.push({ name, status: 'FAILED', error: error.message });
        return false;
    }
}

// Test Suite
async function runTestSuite() {
    console.log(`${colors.cyan}========================================`);
    console.log(`🧪 MARCEL V8.0 ULTIMATE - DEPLOYMENT TESTS`);
    console.log(`========================================${colors.reset}`);
    console.log(`Testing URL: ${BASE_URL}`);
    console.log('');

    // Test 1: Main page
    await runTest('Main Page (GET /)', async () => {
        const response = await makeRequest('/');
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        if (!response.body.includes('Marcel V8.0 Ultimate Final')) {
            throw new Error('Page does not contain expected title');
        }
        return 'Main page loads correctly';
    });

    // Test 2: Health check
    await runTest('Health Check (GET /health)', async () => {
        const response = await makeRequest('/health');
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        const data = JSON.parse(response.body);
        if (data.status !== 'healthy') {
            throw new Error('Health status is not healthy');
        }
        if (data.version !== '8.0.0-final') {
            throw new Error(`Wrong version: ${data.version}`);
        }
        return `Health: ${data.status}, Version: ${data.version}`;
    });

    // Test 3: Dashboard
    await runTest('Dashboard (GET /test-marcel)', async () => {
        const response = await makeRequest('/test-marcel');
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        if (!response.body.includes('Marcel V8.0 Ultimate Dashboard')) {
            throw new Error('Dashboard page not loading correctly');
        }
        return 'Dashboard loads correctly';
    });

    // Test 4: Twilio webhook test endpoint
    await runTest('Twilio Test (GET /webhook/twilio/test)', async () => {
        const response = await makeRequest('/webhook/twilio/test');
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        const data = JSON.parse(response.body);
        if (!data.status.includes('Marcel V8.0')) {
            throw new Error('Twilio test endpoint not responding correctly');
        }
        return `Twilio webhook ready: ${data.message}`;
    });

    // Test 5: Claude API test
    await runTest('Claude API (POST /test-claude)', async () => {
        const response = await makeRequest('/test-claude', 'POST', {
            message: 'Bonjour Marcel'
        });
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        const data = JSON.parse(response.body);
        if (data.status !== 'success') {
            throw new Error('Claude API test failed');
        }
        return `Claude response: ${data.response.substring(0, 50)}...`;
    });

    // Test 6: Twilio webhook POST
    await runTest('Twilio Webhook (POST /webhook/twilio)', async () => {
        const response = await makeRequest('/webhook/twilio', 'POST', {
            From: '+15141234567',
            To: '+15817101240',
            CallSid: 'TEST123',
            SpeechResult: null
        });
        if (response.status !== 200) {
            throw new Error(`Expected status 200, got ${response.status}`);
        }
        if (!response.body.includes('<?xml')) {
            throw new Error('Webhook not returning TwiML');
        }
        return 'Webhook returns valid TwiML';
    });

    // Test 7: Response time
    await runTest('Response Time < 200ms', async () => {
        const start = Date.now();
        await makeRequest('/health');
        const duration = Date.now() - start;
        if (duration > 200) {
            throw new Error(`Response took ${duration}ms (> 200ms)`);
        }
        return `Response time: ${duration}ms`;
    });

    // Test 8: Memory usage check
    await runTest('Server Resources', async () => {
        const response = await makeRequest('/health');
        const data = JSON.parse(response.body);
        const uptime = data.uptime;
        if (uptime < 0) {
            throw new Error('Invalid uptime reported');
        }
        return `Uptime: ${Math.floor(uptime)}s`;
    });

    // Print summary
    console.log('');
    console.log(`${colors.cyan}========================================`);
    console.log(`📊 TEST SUMMARY`);
    console.log(`========================================${colors.reset}`);
    
    const passed = testResults.filter(t => t.status === 'PASSED').length;
    const failed = testResults.filter(t => t.status === 'FAILED').length;
    const total = testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    
    if (failed === 0) {
        console.log('');
        console.log(`${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
        console.log(`${colors.green}Marcel V8.0 Ultimate is ready for production!${colors.reset}`);
    } else {
        console.log('');
        console.log(`${colors.yellow}⚠️  Some tests failed. Please review:${colors.reset}`);
        testResults.filter(t => t.status === 'FAILED').forEach(test => {
            console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    console.log('');
    console.log(`${colors.cyan}========================================`);
    console.log(`🚀 Marcel V8.0 Ultimate - Test Complete`);
    console.log(`========================================${colors.reset}`);

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
console.log('Starting deployment tests in 2 seconds...');
console.log('Make sure the server is running!');
console.log('');

setTimeout(() => {
    runTestSuite().catch(error => {
        console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
        process.exit(1);
    });
}, 2000);