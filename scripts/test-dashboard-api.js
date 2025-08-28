require('dotenv').config();

async function testDashboardAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  // Test endpoints
  const endpoints = [
    '/api/dashboard/stats',
    '/api/user/stats',
    '/api/dashboard/notifications',
    '/api/dashboard/reading-progress',
    '/api/user/library',
    '/api/dashboard/activity',
    '/api/dashboard/goals'
  ];

  console.log('🧪 Testing Dashboard API endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Cookie': 'next-auth.session-token=test' // This won't work but will test the endpoint
        }
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        console.log(`✅ ${endpoint} - Correctly returns 401 (Unauthorized)`);
      } else if (response.status === 200) {
        console.log(`✅ ${endpoint} - Returns 200 with data:`, Object.keys(data));
      } else {
        console.log(`⚠️  ${endpoint} - Returns ${response.status}:`, data);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Error:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testDashboardAPIs()
    .then(() => {
      console.log('✅ Dashboard API testing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Dashboard API testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testDashboardAPIs };