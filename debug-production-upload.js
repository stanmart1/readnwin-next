require('dotenv').config({ path: '.env.local' });

async function debugProductionUpload() {
  console.log('🔍 Debugging Production Upload Issue');
  console.log('=' .repeat(50));
  
  // Test 1: Check if we can access the production server
  console.log('\n🌐 Test 1: Production Server Access');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://readnwin.com/');
    console.log(`✅ Production server accessible (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ Cannot access production server: ${error.message}`);
    return;
  }
  
  // Test 2: Check API endpoint
  console.log('\n📚 Test 2: API Endpoint Status');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://readnwin.com/api/admin/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    const result = await response.json();
    console.log(`📚 API response status: ${response.status}`);
    console.log(`📚 API response:`, result);
    
    if (response.status === 401) {
      console.log('✅ API endpoint working (authentication required)');
    } else if (response.status === 500) {
      console.log('❌ API endpoint returning 500 error');
    } else {
      console.log(`⚠️ Unexpected API response: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ API request failed: ${error.message}`);
  }
  
  // Test 3: Check debug endpoint
  console.log('\n🔍 Test 3: Debug Endpoint');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://readnwin.com/api/debug/images');
    if (response.ok) {
      const debugData = await response.json();
      console.log('✅ Debug endpoint accessible');
      console.log('📊 Upload directory status:');
      console.log(`  📁 Covers: ${debugData.covers} files`);
      console.log(`  📁 Ebooks: ${debugData.ebooks} files`);
      console.log(`  📁 Blog: ${debugData.blog} files`);
      console.log(`  📁 Payment proofs: ${debugData.paymentProofs} files`);
      
      if (debugData.uploadDirs) {
        console.log('📁 Upload directory paths:');
        Object.entries(debugData.uploadDirs).forEach(([type, path]) => {
          console.log(`  ${type}: ${path}`);
        });
      }
    } else {
      console.log(`❌ Debug endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Debug endpoint error: ${error.message}`);
  }
  
  // Test 4: Check file serving
  console.log('\n📄 Test 4: File Serving Test');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://readnwin.com/uploads/test-file.txt');
    console.log(`📄 File serving test: ${response.status}`);
    
    if (response.status === 404) {
      console.log('✅ File serving working (404 expected for non-existent file)');
    } else if (response.status === 500) {
      console.log('❌ File serving returning 500 error');
    } else {
      console.log(`⚠️ Unexpected file serving response: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ File serving test failed: ${error.message}`);
  }
  
  console.log('\n🔍 Potential Issues Analysis');
  console.log('-'.repeat(40));
  console.log('Based on the 500 error, here are the most likely causes:');
  console.log('');
  console.log('1. 📁 Directory Issues:');
  console.log('   - /app/media_root directory does not exist on production server');
  console.log('   - Directory permissions are incorrect');
  console.log('   - Application user cannot write to the directory');
  console.log('');
  console.log('2. 🔧 Configuration Issues:');
  console.log('   - Environment variables not set correctly');
  console.log('   - File upload service not using correct paths');
  console.log('   - API routes not properly configured');
  console.log('');
  console.log('3. 🛡️ Permission Issues:');
  console.log('   - SELinux/AppArmor blocking file access');
  console.log('   - File system permissions too restrictive');
  console.log('   - Application running as wrong user');
  console.log('');
  console.log('4. 💾 Storage Issues:');
  console.log('   - Disk space full');
  console.log('   - File system read-only');
  console.log('   - Storage quota exceeded');
  console.log('');
  console.log('💡 Immediate Actions:');
  console.log('1. SSH into the production server');
  console.log('2. Check if /app/media_root exists: ls -la /app/media_root/');
  console.log('3. Check permissions: ls -ld /app/media_root/');
  console.log('4. Check disk space: df -h');
  console.log('5. Check application logs for detailed error messages');
  console.log('6. Run the setup script: sudo ./scripts/setup-media-root.sh');
  console.log('');
  console.log('🔧 Quick Fix Commands:');
  console.log('sudo mkdir -p /app/media_root/{covers,ebooks,blog,payment-proofs,about-images}');
  console.log('sudo chown -R node:node /app/media_root  # Adjust user as needed');
  console.log('sudo chmod -R 755 /app/media_root');
  console.log('sudo chmod -R 775 /app/media_root/*/');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Check server logs for detailed error messages');
  console.log('2. Verify directory structure and permissions');
  console.log('3. Test file upload with a simple test file');
  console.log('4. Monitor application logs during upload attempts');
}

debugProductionUpload().catch(console.error); 