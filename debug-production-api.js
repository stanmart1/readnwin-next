#!/usr/bin/env node

/**
 * Production API Debug Script
 * This script helps diagnose HTTP 500 errors in production
 */

const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Production API Debug Script');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('--------------------------------');
const requiredEnvVars = [
  'NODE_ENV',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_PORT'
];

let envIssues = false;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    envIssues = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
      ? '*'.repeat(8) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

if (envIssues) {
  console.log('\n⚠️  Environment variables missing! This will cause API failures.');
} else {
  console.log('\n✅ All required environment variables are set.');
}

// Test database connection
console.log('\n🗄️  Database Connection Test:');
console.log('-----------------------------');

async function testDatabaseConnection() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log('🔌 Attempting database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('📊 Testing database query...');
    const result = await client.query('SELECT COUNT(*) as book_count FROM books WHERE status = $1', ['published']);
    console.log(`✅ Query successful! Found ${result.rows[0].book_count} published books.`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('Error details:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 This suggests the database server is not accessible.');
      console.log('   Check if the database is running and the host/port are correct.');
    } else if (error.code === '28P01') {
      console.log('💡 Authentication failed. Check DB_USER and DB_PASSWORD.');
    } else if (error.code === '3D000') {
      console.log('💡 Database does not exist. Check DB_NAME.');
    }
  }
}

// Test API endpoint simulation
console.log('\n🌐 API Endpoint Test:');
console.log('---------------------');

async function testApiEndpoint() {
  try {
    console.log('🔌 Testing API endpoint simulation...');
    
    // Simulate the API route logic
    const { ecommerceService } = require('./utils/ecommerce-service');
    
    console.log('📊 Testing ecommerceService.getBooks...');
    const result = await ecommerceService.getBooks({}, 1, 12, false);
    
    console.log(`✅ API simulation successful!`);
    console.log(`   - Books found: ${result.books.length}`);
    console.log(`   - Total books: ${result.total}`);
    console.log(`   - Pages: ${result.pages}`);
    
  } catch (error) {
    console.log('❌ API simulation failed!');
    console.log('Error details:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Check file permissions and dependencies
console.log('\n📁 File System Check:');
console.log('---------------------');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'utils/database.ts',
  'utils/ecommerce-service.ts',
  'app/api/books/route.ts',
  'server.js'
];

requiredFiles.forEach(file => {
  try {
    fs.accessSync(file, fs.constants.R_OK);
    console.log(`✅ ${file}: Readable`);
  } catch (error) {
    console.log(`❌ ${file}: Not readable or missing`);
  }
});

// Check Node.js version
console.log('\n🟢 Node.js Environment:');
console.log('----------------------');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);

// Check memory usage
console.log('\n💾 Memory Usage:');
console.log('----------------');
const memUsage = process.memoryUsage();
console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);

// Run tests
async function runTests() {
  await testDatabaseConnection();
  await testApiEndpoint();
  
  console.log('\n🎯 Summary:');
  console.log('===========');
  if (envIssues) {
    console.log('❌ Environment variables need to be configured.');
  } else {
    console.log('✅ Environment looks good.');
  }
  console.log('\n📝 Next steps:');
  console.log('1. Check your production server logs for detailed error messages');
  console.log('2. Verify environment variables are set correctly on your server');
  console.log('3. Ensure database is accessible from your production server');
  console.log('4. Check if all dependencies are installed in production');
}

runTests().catch(console.error); 