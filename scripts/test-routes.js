const { testRoutes } = require('../utils/route-tester');

async function runTests() {
  console.log('🧪 Starting route tests...\n');
  
  try {
    const results = await testRoutes();
    
    let passed = 0;
    let failed = 0;
    
    results.forEach(result => {
      if (result.passed) {
        console.log(`✅ ${result.method} ${result.path} - ${result.actualStatus}`);
        passed++;
      } else {
        console.log(`❌ ${result.method} ${result.path} - Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        failed++;
      }
    });
    
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

runTests();