const fs = require('fs');
const path = require('path');

// Find the latest dump file
function findLatestDump() {
  const dumpDir = 'database-dumps';
  if (!fs.existsSync(dumpDir)) {
    throw new Error('Database dumps directory not found');
  }
  
  const files = fs.readdirSync(dumpDir)
    .filter(file => file.startsWith('full_dump_') && file.endsWith('.sql'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    throw new Error('No dump files found');
  }
  
  return path.join(dumpDir, files[0]);
}

function fixDumpOrder() {
  console.log('🔧 Fixing dump file order...');
  
  const originalDump = findLatestDump();
  console.log(`📁 Reading: ${originalDump}`);
  
  const content = fs.readFileSync(originalDump, 'utf8');
  const lines = content.split('\n');
  
  const createStatements = [];
  const insertStatements = [];
  const otherStatements = [];
  
  let currentStatement = '';
  let inStatement = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (trimmedLine.startsWith('--') || trimmedLine === '') {
      continue;
    }
    
    currentStatement += line + '\n';
    
    // If line ends with semicolon, it's the end of a statement
    if (trimmedLine.endsWith(';')) {
      const fullStatement = currentStatement.trim();
      
      if (fullStatement.toUpperCase().includes('CREATE TABLE')) {
        createStatements.push(fullStatement);
      } else if (fullStatement.toUpperCase().includes('INSERT INTO')) {
        insertStatements.push(fullStatement);
      } else {
        otherStatements.push(fullStatement);
      }
      
      currentStatement = '';
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    const fullStatement = currentStatement.trim();
    if (fullStatement.toUpperCase().includes('CREATE TABLE')) {
      createStatements.push(fullStatement);
    } else if (fullStatement.toUpperCase().includes('INSERT INTO')) {
      insertStatements.push(fullStatement);
    } else {
      otherStatements.push(fullStatement);
    }
  }
  
  console.log(`📊 Found ${createStatements.length} CREATE TABLE statements`);
  console.log(`📊 Found ${insertStatements.length} INSERT statements`);
  console.log(`📊 Found ${otherStatements.length} other statements`);
  
  // Create the fixed dump content
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const fixedDump = path.join('database-dumps', `fixed_dump_${timestamp}.sql`);
  
  let fixedContent = `-- Fixed Database Dump\n`;
  fixedContent += `-- Generated: ${new Date().toISOString()}\n`;
  fixedContent += `-- Original: ${path.basename(originalDump)}\n`;
  fixedContent += `-- Fixed order: CREATE TABLE statements first, then INSERT statements\n\n`;
  
  // Add CREATE TABLE statements first
  fixedContent += `-- =====================================================\n`;
  fixedContent += `-- CREATE TABLE STATEMENTS\n`;
  fixedContent += `-- =====================================================\n\n`;
  
  createStatements.forEach(statement => {
    fixedContent += statement + '\n\n';
  });
  
  // Add other statements (indexes, constraints, etc.)
  if (otherStatements.length > 0) {
    fixedContent += `-- =====================================================\n`;
    fixedContent += `-- OTHER STATEMENTS (INDEXES, CONSTRAINTS, ETC.)\n`;
    fixedContent += `-- =====================================================\n\n`;
    
    otherStatements.forEach(statement => {
      fixedContent += statement + '\n\n';
    });
  }
  
  // Add INSERT statements last
  fixedContent += `-- =====================================================\n`;
  fixedContent += `-- INSERT STATEMENTS\n`;
  fixedContent += `-- =====================================================\n\n`;
  
  insertStatements.forEach(statement => {
    fixedContent += statement + '\n\n';
  });
  
  // Write the fixed dump file
  fs.writeFileSync(fixedDump, fixedContent);
  
  const stats = fs.statSync(fixedDump);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Fixed dump created: ${fixedDump} (${sizeInMB} MB)`);
  console.log(`📁 File saved in: database-dumps/`);
  
  return fixedDump;
}

// Run the script
if (require.main === module) {
  try {
    const fixedDump = fixDumpOrder();
    console.log('\n🎉 Dump file order fixed successfully!');
    console.log(`📋 Next step: Use ${path.basename(fixedDump)} for database restoration`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { fixDumpOrder }; 