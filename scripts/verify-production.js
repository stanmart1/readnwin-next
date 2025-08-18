require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');
const fs = require('fs');
const path = require('path');

async function verifyProduction() {
  console.log('🔍 Production Verification for Book Upload System V2\n');
  
  const results = {
    database: { status: false, details: '' },
    fileSystem: { status: false, details: '' },
    apiEndpoints: { status: false, details: '' },
    schema: { status: false, details: '' }
  };

  // 1. Database Connection Test
  console.log('1️⃣ Testing Database Connection...');
  try {
    const dbResult = await query('SELECT NOW() as current_time, version() as version');
    results.database.status = true;
    results.database.details = `Connected to PostgreSQL ${dbResult.rows[0].version}`;
    console.log('✅ Database connection successful');
  } catch (error) {
    results.database.details = error.message;
    console.log('❌ Database connection failed:', error.message);
  }

  // 2. Database Schema Verification
  console.log('\n2️⃣ Verifying Database Schema...');
  try {
    const schemaResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      AND column_name IN ('html_file_path', 'processing_status')
      ORDER BY column_name
    `);
    
    const requiredColumns = ['html_file_path', 'processing_status'];
    const foundColumns = schemaResult.rows.map(row => row.column_name);
    
    if (foundColumns.length === requiredColumns.length) {
      results.schema.status = true;
      results.schema.details = `Found ${foundColumns.length} required columns`;
      console.log('✅ Database schema verification successful');
      console.log('   Found columns:', foundColumns.join(', '));
    } else {
      results.schema.details = `Missing columns. Found: ${foundColumns.join(', ')}`;
      console.log('❌ Database schema verification failed');
      console.log('   Missing columns:', requiredColumns.filter(col => !foundColumns.includes(col)).join(', '));
    }
  } catch (error) {
    results.schema.details = error.message;
    console.log('❌ Database schema verification failed:', error.message);
  }

  // 3. File System Verification
  console.log('\n3️⃣ Verifying File System Structure...');
  try {
    const mediaRoot = path.join(process.cwd(), 'media_root');
    const requiredDirs = [
      path.join(mediaRoot, 'books', 'html'),
      path.join(mediaRoot, 'books', 'originals'),
      path.join(mediaRoot, 'books', 'assets', 'images'),
      path.join(mediaRoot, 'books', 'assets', 'fonts'),
      path.join(mediaRoot, 'temp')
    ];

    const existingDirs = requiredDirs.filter(dir => fs.existsSync(dir));
    
    if (existingDirs.length === requiredDirs.length) {
      results.fileSystem.status = true;
      results.fileSystem.details = `All ${existingDirs.length} directories exist`;
      console.log('✅ File system structure verification successful');
      
      // Test write permissions
      const testFile = path.join(mediaRoot, 'temp', 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Write permissions verified');
    } else {
      results.fileSystem.details = `Missing directories. Found: ${existingDirs.length}/${requiredDirs.length}`;
      console.log('❌ File system structure verification failed');
      console.log('   Missing directories:', requiredDirs.filter(dir => !fs.existsSync(dir)).map(dir => path.relative(process.cwd(), dir)).join(', '));
    }
  } catch (error) {
    results.fileSystem.details = error.message;
    console.log('❌ File system verification failed:', error.message);
  }

  // 4. API Endpoints Test
  console.log('\n4️⃣ Testing API Endpoints...');
  try {
    const http = require('http');
    
    // Test health endpoint
    const healthResponse = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:3000/api/health/production', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });

    if (healthResponse.status === 'healthy') {
      results.apiEndpoints.status = true;
      results.apiEndpoints.details = 'Health endpoint responding correctly';
      console.log('✅ API endpoints verification successful');
      console.log('   Health check status:', healthResponse.status);
      console.log('   All checks passed:', Object.values(healthResponse.checks).every(check => check === true));
    } else {
      results.apiEndpoints.details = `Health endpoint returned: ${healthResponse.status}`;
      console.log('❌ API endpoints verification failed');
      console.log('   Health check status:', healthResponse.status);
      if (healthResponse.errors && healthResponse.errors.length > 0) {
        console.log('   Errors:', healthResponse.errors.join(', '));
      }
    }
  } catch (error) {
    results.apiEndpoints.details = error.message;
    console.log('❌ API endpoints verification failed:', error.message);
  }

  // 5. Summary Report
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('========================');
  
  const allPassed = Object.values(results).every(result => result.status);
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.status ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.toUpperCase()}: ${result.details}`);
  });

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('✅ Your book upload system is production-ready!');
  } else {
    console.log('⚠️  SOME VERIFICATIONS FAILED');
    console.log('Please fix the issues above before deploying to production.');
  }
  console.log('='.repeat(50));

  // 6. Production Readiness Score
  const passedTests = Object.values(results).filter(result => result.status).length;
  const totalTests = Object.keys(results).length;
  const readinessScore = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n📈 Production Readiness Score: ${readinessScore}% (${passedTests}/${totalTests} tests passed)`);
  
  if (readinessScore === 100) {
    console.log('🚀 Ready for production deployment!');
  } else if (readinessScore >= 75) {
    console.log('⚠️  Mostly ready, but some issues need attention.');
  } else {
    console.log('❌ Not ready for production. Please fix all issues.');
  }

  process.exit(allPassed ? 0 : 1);
}

verifyProduction().catch(error => {
  console.error('❌ Verification failed with error:', error);
  process.exit(1);
}); 