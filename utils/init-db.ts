import { pool, query, testConnection } from './database';
import * as fs from 'fs';
import * as path from 'path';

async function dropAllTables() {
  console.log('🗑️  Dropping all existing tables...');
  
  try {
    // Get all table names
    const tablesResult = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    
    if (tables.length === 0) {
      console.log('✅ No existing tables found');
      return;
    }
    
    console.log(`Found ${tables.length} existing tables:`, tables);
    
    // Drop all tables with CASCADE to handle dependencies
    for (const table of tables) {
      console.log(`Dropping table: ${table}`);
      await query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    
    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error: any) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  }
}

async function verifySetup() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Check if tables were created
    const tablesResult = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log('✅ Created tables:', tablesResult.rows.map(row => row.tablename));
    
    // Check if default roles were created
    const rolesResult = await query('SELECT name, display_name FROM roles ORDER BY priority DESC');
    console.log('✅ Default roles:', rolesResult.rows);
    
    // Check if default permissions were created
    const permissionsResult = await query('SELECT COUNT(*) as count FROM permissions');
    console.log(`✅ Created ${permissionsResult.rows[0].count} permissions`);
    
    // Check if default admin user was created
    const adminResult = await query("SELECT email, username, status FROM users WHERE email = 'admin@readnwin.com'");
    if (adminResult.rows.length > 0) {
      console.log('✅ Default admin user created:', adminResult.rows[0]);
    } else {
      console.log('⚠️  Default admin user not found');
    }
    
    console.log('✅ Database setup verification completed');
  } catch (error) {
    console.error('❌ Error verifying setup:', error);
    throw error;
  }
}

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Drop all existing data
    await dropAllTables();
    
    // Run migrations
    await runMigrations();
    
    // Verify setup
    await verifySetup();
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- All existing data has been dropped');
    console.log('- Database schema has been created');
    console.log('- Default roles and permissions have been set up');
    console.log('- Default admin user has been created');
    console.log('\n🔑 Default admin credentials:');
    console.log('- Email: admin@readnwin.com');
    console.log('- Username: admin');
    console.log('- Password: Admin123!');
    console.log('\n⚠️  IMPORTANT: Change the default admin password in production!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase }; 