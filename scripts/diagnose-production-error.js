require('dotenv').config({ path: '.env.local' });

async function diagnoseProductionError() {
  console.log('🔍 Diagnosing Production 500 Error');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Common Causes of 500 Error in Production:');
  console.log('-'.repeat(40));
  console.log('1. File system permissions');
  console.log('2. Missing upload directories');
  console.log('3. Database connection issues');
  console.log('4. Environment variable problems');
  console.log('5. File upload size limits');
  console.log('6. Memory/disk space issues');
  console.log('7. Server configuration problems');
  
  console.log('\n🔧 Immediate Solutions to Try:');
  console.log('-'.repeat(40));
  console.log('1. Check server logs for detailed error messages');
  console.log('2. Verify file upload permissions on production server');
  console.log('3. Ensure upload directories exist and are writable');
  console.log('4. Check database connectivity and permissions');
  console.log('5. Verify all environment variables are set correctly');
  console.log('6. Check server disk space and memory usage');
  
  console.log('\n📝 Debugging Steps:');
  console.log('-'.repeat(40));
  console.log('1. SSH into your production server');
  console.log('2. Check application logs:');
  console.log('   - Next.js logs');
  console.log('   - Server error logs');
  console.log('   - Database connection logs');
  console.log('3. Verify file system permissions:');
  console.log('   - ls -la public/uploads/');
  console.log('   - ls -la public/uploads/covers/');
  console.log('   - ls -la public/uploads/ebooks/');
  console.log('4. Test database connection');
  console.log('5. Check environment variables');
  
  console.log('\n🚨 Most Likely Issues:');
  console.log('-'.repeat(40));
  console.log('❌ File upload permissions - Production server cannot write to upload directories');
  console.log('❌ Missing upload directories - Directories don\'t exist on production server');
  console.log('❌ Database constraints - Foreign key violations or missing data');
  console.log('❌ Environment variables - Missing DB credentials or other config');
  
  console.log('\n💡 Quick Fixes to Try:');
  console.log('-'.repeat(40));
  console.log('1. Create upload directories manually on production:');
  console.log('   mkdir -p public/uploads/covers');
  console.log('   mkdir -p public/uploads/ebooks');
  console.log('   chmod 755 public/uploads/covers');
  console.log('   chmod 755 public/uploads/ebooks');
  console.log('');
  console.log('2. Check if the production server has the same database schema');
  console.log('3. Verify all environment variables are set in production');
  console.log('4. Check server logs for the exact error message');
  
  console.log('\n📞 If you need help:');
  console.log('-'.repeat(40));
  console.log('1. Share the exact error message from server logs');
  console.log('2. Provide the production server environment details');
  console.log('3. Share the database schema differences if any');
  console.log('4. Check if the issue occurs with smaller files');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('-'.repeat(40));
  console.log('The 500 error indicates a server-side issue that needs to be');
  console.log('investigated on the production server. I cannot directly access');
  console.log('your production environment, so you\'ll need to check the logs');
  console.log('and file system permissions manually.');
  
  console.log('\n🎯 Next Steps:');
  console.log('-'.repeat(40));
  console.log('1. Check production server logs for the exact error');
  console.log('2. Verify file system permissions and directories');
  console.log('3. Test with a smaller file to see if it\'s a size issue');
  console.log('4. Check database connectivity and constraints');
  console.log('5. Share the specific error message for further diagnosis');
}

diagnoseProductionError().catch(console.error); 