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

function createSequencesFirst() {
  console.log('🔧 Creating sequences-first dump...');
  
  const originalDump = findLatestDump();
  console.log(`📁 Reading: ${originalDump}`);
  
  const content = fs.readFileSync(originalDump, 'utf8');
  const lines = content.split('\n');
  
  const sequences = [];
  const createStatements = [];
  const insertStatements = [];
  const otherStatements = [];
  
  let currentStatement = '';
  
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
  
  // Extract sequence names from CREATE TABLE statements
  const sequenceNames = new Set();
  createStatements.forEach(statement => {
    const matches = statement.match(/nextval\('([^']+)'::regclass\)/g);
    if (matches) {
      matches.forEach(match => {
        const seqName = match.match(/nextval\('([^']+)'::regclass\)/)[1];
        sequenceNames.add(seqName);
      });
    }
  });
  
  console.log(`📊 Found ${createStatements.length} CREATE TABLE statements`);
  console.log(`📊 Found ${insertStatements.length} INSERT statements`);
  console.log(`📊 Found ${otherStatements.length} other statements`);
  console.log(`📊 Found ${sequenceNames.size} sequences to create`);
  
  // Create the sequences-first dump content
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sequencesDump = path.join('database-dumps', `sequences_first_${timestamp}.sql`);
  
  let dumpContent = `-- Sequences-First Database Dump\n`;
  dumpContent += `-- Generated: ${new Date().toISOString()}\n`;
  dumpContent += `-- Original: ${path.basename(originalDump)}\n`;
  dumpContent += `-- Order: Sequences -> Tables -> Data\n\n`;
  
  // Step 1: Create sequences first
  dumpContent += `-- =====================================================\n`;
  dumpContent += `-- STEP 1: CREATE SEQUENCES\n`;
  dumpContent += `-- =====================================================\n\n`;
  
  sequenceNames.forEach(seqName => {
    dumpContent += `CREATE SEQUENCE IF NOT EXISTS "${seqName}";\n`;
  });
  
  dumpContent += '\n';
  
  // Step 2: Create tables (with modified sequence references)
  dumpContent += `-- =====================================================\n`;
  dumpContent += `-- STEP 2: CREATE TABLES\n`;
  dumpContent += `-- =====================================================\n\n`;
  
  createStatements.forEach(statement => {
    // Replace sequence references to use simple nextval() without ::regclass
    const modifiedStatement = statement.replace(/nextval\('([^']+)'::regclass\)/g, "nextval('$1')");
    dumpContent += modifiedStatement + '\n\n';
  });
  
  // Step 3: Add other statements (indexes, constraints, etc.)
  if (otherStatements.length > 0) {
    dumpContent += `-- =====================================================\n`;
    dumpContent += `-- STEP 3: OTHER STATEMENTS (INDEXES, CONSTRAINTS, ETC.)\n`;
    dumpContent += `-- =====================================================\n\n`;
    
    otherStatements.forEach(statement => {
      dumpContent += statement + '\n\n';
    });
  }
  
  // Step 4: Insert data
  dumpContent += `-- =====================================================\n`;
  dumpContent += `-- STEP 4: INSERT DATA\n`;
  dumpContent += `-- =====================================================\n\n`;
  
  insertStatements.forEach(statement => {
    dumpContent += statement + '\n\n';
  });
  
  // Step 5: Set sequence values to match the data
  dumpContent += `-- =====================================================\n`;
  dumpContent += `-- STEP 5: UPDATE SEQUENCE VALUES\n`;
  dumpContent += `-- =====================================================\n\n`;
  
  sequenceNames.forEach(seqName => {
    const tableName = seqName.replace('_id_seq', '');
    dumpContent += `-- Update sequence for ${tableName}\n`;
    dumpContent += `SELECT setval('${seqName}', COALESCE((SELECT MAX(id) FROM "${tableName}"), 1));\n\n`;
  });
  
  // Write the sequences-first dump file
  fs.writeFileSync(sequencesDump, dumpContent);
  
  const stats = fs.statSync(sequencesDump);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Sequences-first dump created: ${sequencesDump} (${sizeInMB} MB)`);
  console.log(`📁 File saved in: database-dumps/`);
  
  return sequencesDump;
}

// Run the script
if (require.main === module) {
  try {
    const sequencesDump = createSequencesFirst();
    console.log('\n🎉 Sequences-first dump created successfully!');
    console.log(`📋 Next step: Use ${path.basename(sequencesDump)} for database restoration`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { createSequencesFirst }; 