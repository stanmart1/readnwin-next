#!/usr/bin/env node

/**
 * Delete API Diagnostic Script
 * Helps identify the root cause of 404 errors in the book delete API
 */

const fetch = require('node-fetch').default;

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

async function testEndpoint(url, method = 'GET', expectedStatus = 200) {
  try {
    logInfo(`Testing ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    
    logInfo(`Response: ${status} ${statusText}`);
    
    if (status === expectedStatus) {
      logSuccess(`${method} ${url} - ${status} ${statusText}`);
      return { success: true, status, statusText };
    } else {
      logWarning(`${method} ${url} - Expected ${expectedStatus}, got ${status} ${statusText}`);
      
      if (status === 401) {
        logInfo('This is expected for unauthenticated requests');
        return { success: true, status, statusText };
      }
      
      return { success: false, status, statusText };
    }
  } catch (error) {
    logError(`${method} ${url} - Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  log('🔍 Diagnosing Delete API Errors', 'bright');
  log('');

  const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
  log(`Testing against: ${BASE_URL}`, 'cyan');
  log('');

  // Test basic API routes
  log('📋 Testing Basic API Routes:', 'bright');
  
  const basicTests = [
    { url: `${BASE_URL}/api/admin/books`, method: 'GET', expectedStatus: 401 },
    { url: `${BASE_URL}/api/admin/books/1`, method: 'GET', expectedStatus: 401 },
    { url: `${BASE_URL}/api/admin/books/1`, method: 'DELETE', expectedStatus: 401 },
    { url: `${BASE_URL}/api/admin/books?ids=1,2,3`, method: 'DELETE', expectedStatus: 401 },
  ];

  for (const test of basicTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Test specific problematic book IDs
  log('📋 Testing Problematic Book IDs:', 'bright');
  
  const problematicIds = [57, 87, 2];
  
  for (const id of problematicIds) {
    await testEndpoint(`${BASE_URL}/api/admin/books/${id}`, 'DELETE', 401);
    log('');
  }

  // Test non-existent routes
  log('📋 Testing Non-existent Routes:', 'bright');
  
  const nonExistentTests = [
    { url: `${BASE_URL}/api/admin/nonexistent`, method: 'GET', expectedStatus: 404 },
    { url: `${BASE_URL}/api/admin/books/999999`, method: 'DELETE', expectedStatus: 401 },
  ];

  for (const test of nonExistentTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Test Next.js specific routes
  log('📋 Testing Next.js Health:', 'bright');
  
  const healthTests = [
    { url: `${BASE_URL}/api/health`, method: 'GET', expectedStatus: 200 },
    { url: `${BASE_URL}/api/debug/database`, method: 'GET', expectedStatus: 200 },
  ];

  for (const test of healthTests) {
    await testEndpoint(test.url, test.method, test.expectedStatus);
    log('');
  }

  // Summary and recommendations
  log('📊 Diagnostic Summary', 'bright');
  log('If you see 401 responses, the API routes are working correctly.');
  log('If you see 404 responses, there may be a deployment issue.');
  log('');
  
  log('💡 Recommendations:', 'bright');
  log('1. Check if the production server is running the latest code');
  log('2. Verify that API routes are properly built and deployed');
  log('3. Check server logs for any errors');
  log('4. Ensure environment variables are set correctly');
  log('5. Test with authentication to see if the issue persists');
  log('');
  
  log('🔧 Next Steps:', 'bright');
  log('1. If 404 errors persist, check the production deployment');
  log('2. If 401 errors are seen, the API is working (authentication needed)');
  log('3. Check browser console for CORS or network errors');
  log('4. Verify that the frontend is making requests to the correct URL');
}

main().catch(error => {
  logError(`Diagnostic failed: ${error.message}`);
  process.exit(1);
}); 