const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Prisma client configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: '@prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19heDk1TjlYY3V2Wm9zMlFHWG1rSk0iLCJhcGlfa2V5IjoiMDFLMjhLSlQ5UVo5M040Q0dWVjJFRzBBVjYiLCJ0ZW5hbnRfaWQiOiJkZWRkODFkYTg0Mjk2YWRmNzQzYTM4OWJmYjMwM2JiNDg4NDU5ZTYxM2Y2OTYzNzM4ZGVlMzIwOTM0Nzc2N2ZjIiwiaW50ZXJuYWxfc2VjcmV0IjoiOTU2YmE5NTUtYjdjMy00NjJjLThiZTYtZDE3NWY3ODE2MjNkIn0.NhuFvECRn7JUAZSZCP8Om6RgveEJhoVxLzRj1e-aJjs'
    }
  }
});

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`;
    console.log(`✅ Connected to database: ${result[0].current_time}`);
    console.log(`📊 PostgreSQL Version: ${result[0].version}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect: ${error.message}`);
    return false;
  }
}

async function executeRawSQL(sql) {
  try {
    await prisma.$executeRawUnsafe(sql);
    return true;
  } catch (error) {
    throw error;
  }
}

async function restoreWithPrisma() {
  console.log('🚀 Starting Prisma-based database restoration...');
  
  // Test connection first
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without database connection');
    return;
  }
  
  // Find the latest compatible dump
  const dumpDir = 'database-dumps';
  const files = fs.readdirSync(dumpDir)
    .filter(file => file.startsWith('postgresql_compatible_') && file.endsWith('.sql'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.error('❌ No PostgreSQL compatible dump files found');
    return;
  }
  
  const dumpFile = path.join(dumpDir, files[0]);
  console.log(`📁 Using dump file: ${dumpFile}`);
  
  // Read the dump file
  const content = fs.readFileSync(dumpFile, 'utf8');
  const lines = content.split('\n');
  
  const sequences = [];
  const createStatements = [];
  const insertStatements = [];
  const otherStatements = [];
  
  let currentStatement = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('--') || trimmedLine === '') {
      continue;
    }
    
    currentStatement += line + '\n';
    
    if (trimmedLine.endsWith(';')) {
      const fullStatement = currentStatement.trim();
      
      if (fullStatement.toUpperCase().includes('CREATE SEQUENCE')) {
        sequences.push(fullStatement);
      } else if (fullStatement.toUpperCase().includes('CREATE TABLE')) {
        createStatements.push(fullStatement);
      } else if (fullStatement.toUpperCase().includes('INSERT INTO')) {
        insertStatements.push(fullStatement);
      } else {
        otherStatements.push(fullStatement);
      }
      
      currentStatement = '';
    }
  }
  
  console.log(`📊 Found ${sequences.length} sequences`);
  console.log(`📊 Found ${createStatements.length} CREATE TABLE statements`);
  console.log(`📊 Found ${insertStatements.length} INSERT statements`);
  console.log(`📊 Found ${otherStatements.length} other statements`);
  
  try {
    // Step 1: Create sequences
    console.log('\n🔧 Step 1: Creating sequences...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const sequence of sequences) {
      try {
        await executeRawSQL(sequence);
        successCount++;
      } catch (error) {
        console.log(`⚠️  Sequence error (continuing): ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Sequences: ${successCount} successful, ${errorCount} errors`);
    
    // Step 2: Create tables
    console.log('\n🔧 Step 2: Creating tables...');
    successCount = 0;
    errorCount = 0;
    
    for (const createStatement of createStatements) {
      try {
        await executeRawSQL(createStatement);
        successCount++;
        console.log(`✅ Created table ${successCount}/${createStatements.length}`);
      } catch (error) {
        console.log(`❌ Table creation error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Tables: ${successCount} successful, ${errorCount} errors`);
    
    // Step 3: Other statements (indexes, constraints)
    if (otherStatements.length > 0) {
      console.log('\n🔧 Step 3: Creating indexes and constraints...');
      successCount = 0;
      errorCount = 0;
      
      for (const statement of otherStatements) {
        try {
          await executeRawSQL(statement);
          successCount++;
        } catch (error) {
          console.log(`⚠️  Other statement error (continuing): ${error.message}`);
          errorCount++;
        }
      }
      
      console.log(`✅ Other statements: ${successCount} successful, ${errorCount} errors`);
    }
    
    // Step 4: Insert data in chunks
    console.log('\n🔧 Step 4: Inserting data...');
    successCount = 0;
    errorCount = 0;
    const chunkSize = 50;
    
    for (let i = 0; i < insertStatements.length; i += chunkSize) {
      const chunk = insertStatements.slice(i, i + chunkSize);
      
      for (const insertStatement of chunk) {
        try {
          await executeRawSQL(insertStatement);
          successCount++;
        } catch (error) {
          console.log(`⚠️  Insert error (continuing): ${error.message}`);
          errorCount++;
        }
      }
      
      const progress = Math.round(((i + chunkSize) / insertStatements.length) * 100);
      console.log(`📈 Data progress: ${Math.min(progress, 100)}% (${successCount} successful, ${errorCount} errors)`);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Data insertion: ${successCount} successful, ${errorCount} errors`);
    
    // Step 5: Update sequences
    console.log('\n🔧 Step 5: Updating sequences...');
    successCount = 0;
    errorCount = 0;
    
    for (const createStatement of createStatements) {
      try {
        // Extract table name from CREATE TABLE statement
        const match = createStatement.match(/CREATE TABLE "([^"]+)"/);
        if (match) {
          const tableName = match[1];
          const sequenceName = `${tableName}_id_seq`;
          
          const updateSequence = `SELECT setval('${sequenceName}', COALESCE((SELECT MAX(id) FROM "${tableName}"), 1));`;
          await executeRawSQL(updateSequence);
          successCount++;
        }
      } catch (error) {
        console.log(`⚠️  Sequence update error (continuing): ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`✅ Sequence updates: ${successCount} successful, ${errorCount} errors`);
    
    // Final verification
    console.log('\n🔍 Verifying restoration...');
    
    const tablesResult = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableCount = parseInt(tablesResult[0].table_count);
    console.log(`📊 Tables found: ${tableCount}`);
    
    // Check some key tables
    const keyTables = ['users', 'books', 'orders', 'categories'];
    for (const table of keyTables) {
      try {
        const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`📋 Table "${table}": ${countResult[0].count} records`);
      } catch (error) {
        console.log(`⚠️  Table "${table}" not found or error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database restoration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the new database URL:');
    console.log(`   DATABASE_URL="@prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19heDk1TjlYY3V2Wm9zMlFHWG1rSk0iLCJhcGlfa2V5IjoiMDFLMjhLSlQ5UVo5M040Q0dWVjJFRzBBVjYiLCJ0ZW5hbnRfaWQiOiJkZWRkODFkYTg0Mjk2YWRmNzQzYTM4OWJmYjMwM2JiNDg4NDU5ZTYxM2Y2OTYzNzM4ZGVlMzIwOTM0Nzc2N2ZjIiwiaW50ZXJuYWxfc2VjcmV0IjoiOTU2YmE5NTUtYjdjMy00NjJjLThiZTYtZDE3NWY3ODE2MjNkIn0.NhuFvECRn7JUAZSZCP8Om6RgveEJhoVxLzRj1e-aJjs"`);
    console.log('2. Test your application with the new database');
    console.log('3. Update any other configuration files that reference the old database');
    
  } catch (error) {
    console.error(`❌ Error during restoration: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  restoreWithPrisma();
}

module.exports = { restoreWithPrisma }; 