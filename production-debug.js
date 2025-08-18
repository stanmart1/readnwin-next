#!/usr/bin/env node

/**
 * Production Deployment Debug Script
 * Helps identify why API routes work locally but not in production
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Production-Debug-Script/1.0',
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(url, method = 'GET', expectedStatus = 200) {
  try {
    logInfo(`Testing ${method} ${url}`);
    
    const response = await makeRequest(url, method);
    
    logInfo(`Response: ${response.status} ${response.statusText}`);
    
    if (response.status === expectedStatus) {
      logSuccess(`${method} ${url} - ${response.status} ${response.statusText}`);
      return { success: true, status: response.status, statusText: response.statusText };
    } else {
      logWarning(`${method} ${url} - Expected ${expectedStatus}, got ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        logInfo('This is expected for unauthenticated requests');
        return { success: true, status: response.status, statusText: response.statusText };
      }
      
      return { success: false, status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    logError(`${method} ${url} - Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  log('🔍 Production Deployment Debug', 'bright');
  log('');

  const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://readnwin.com';
  log(`Testing production: ${PRODUCTION_URL}`, 'cyan');
  log('');

  // Test basic connectivity
  log('📋 Testing Basic Connectivity:', 'bright');
  
  const connectivityTests = [
    { url: `${PRODUCTION_URL}/`, method: 'GET', expectedStatus: 200 },
    { url: `${PRODUCTION_URL}/api/health`, method: 'GET', expectedStatus: 200 },
    { url: `${PRODUCTION_URL}/api/debug/database`, method: 'GET', expectedStatus: 200 },
  ];

  for (const test of connectivityTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Test API routes
  log('📋 Testing API Routes:', 'bright');
  
  const apiTests = [
    { url: `${PRODUCTION_URL}/api/admin/books`, method: 'GET', expectedStatus: 401 },
    { url: `${PRODUCTION_URL}/api/admin/books/1`, method: 'GET', expectedStatus: 401 },
    { url: `${PRODUCTION_URL}/api/admin/books/1`, method: 'DELETE', expectedStatus: 401 },
    { url: `${PRODUCTION_URL}/api/admin/books?ids=1,2,3`, method: 'DELETE', expectedStatus: 401 },
  ];

  for (const test of apiTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Test problematic book IDs
  log('📋 Testing Problematic Book IDs:', 'bright');
  
  const problematicIds = [57, 87, 2];
  
  for (const id of problematicIds) {
    await testEndpoint(`${PRODUCTION_URL}/api/admin/books/${id}`, 'DELETE', 401);
    log('');
  }

  // Test non-existent routes
  log('📋 Testing Non-existent Routes:', 'bright');
  
  const nonExistentTests = [
    { url: `${PRODUCTION_URL}/api/admin/nonexistent`, method: 'GET', expectedStatus: 404 },
    { url: `${PRODUCTION_URL}/api/admin/books/999999`, method: 'DELETE', expectedStatus: 401 },
  ];

  for (const test of nonExistentTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Summary and recommendations
  log('📊 Production Debug Summary', 'bright');
  log('');
  
  log('🔍 Expected Results:', 'bright');
  log('✅ 200: Homepage and health endpoints working');
  log('✅ 401: API routes exist but need authentication');
  log('❌ 404: API routes not deployed or not found');
  log('❌ 500: Server error (database, environment, etc.)');
  log('❌ Network errors: Server not running or DNS issues');
  log('');
  
  log('💡 Common Production Issues:', 'bright');
  log('1. API routes not included in production build');
  log('2. Missing environment variables (NEXTAUTH_SECRET, DB_*)');
  log('3. Database connection issues');
  log('4. Wrong Node.js version or missing dependencies');
  log('5. Server not started with correct command');
  log('6. Firewall or network blocking requests');
  log('');
  
  log('🔧 Quick Fixes to Try:', 'bright');
  log('1. Rebuild and redeploy: npm run build && npm start');
  log('2. Check environment variables in production');
  log('3. Verify database connectivity');
  log('4. Check server logs for errors');
  log('5. Ensure all dependencies are installed');
  log('6. Test with a simple API endpoint first');
}

main().catch(error => {
  logError(`Debug failed: ${error.message}`);
  process.exit(1);
}); 