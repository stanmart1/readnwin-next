#!/usr/bin/env node

/**
 * Setup script for book assignments table and ensure proper integration
 * between admin book management and user library
 */

const { query } = require('../utils/database');

async function setupBookAssignments() {
  console.log('🔧 Setting up book assignments system...\n');

  try {
    // Create book_assignments table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS book_assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        assigned_by INTEGER NOT NULL REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'removed', 'expired')),
        reason TEXT,
        removed_at TIMESTAMP,
        removed_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);
    console.log('✅ Book assignments table created/verified');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_book_assignments_user_id ON book_assignments(user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_book_assignments_book_id ON book_assignments(book_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_book_assignments_status ON book_assignments(status);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_book_assignments_assigned_by ON book_assignments(assigned_by);
    `);
    console.log('✅ Book assignments indexes created');

    // Ensure user_library table has proper columns
    await query(`
      ALTER TABLE user_library 
      ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) DEFAULT 'purchased' 
      CHECK (access_type IN ('purchased', 'admin_assigned', 'promotional'));
    `);
    await query(`
      ALTER TABLE user_library 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
      CHECK (status IN ('active', 'inactive', 'expired'));
    `);
    await query(`
      ALTER TABLE user_library 
      ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ User library table updated with assignment support');

    // Create trigger to update updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_book_assignments_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await query(`
      DROP TRIGGER IF EXISTS trigger_update_book_assignments_updated_at ON book_assignments;
      CREATE TRIGGER trigger_update_book_assignments_updated_at
        BEFORE UPDATE ON book_assignments
        FOR EACH ROW
        EXECUTE FUNCTION update_book_assignments_updated_at();
    `);
    console.log('✅ Book assignments triggers created');

    // Check for any existing assignments that need to be synced
    const unsyncedResult = await query(`
      SELECT COUNT(*) as count
      FROM book_assignments ba
      LEFT JOIN user_library ul ON ba.user_id = ul.user_id AND ba.book_id = ul.book_id
      WHERE ba.status = 'active' AND ul.id IS NULL
    `);

    const unsyncedCount = parseInt(unsyncedResult.rows[0].count);
    if (unsyncedCount > 0) {
      console.log(`⚠️ Found ${unsyncedCount} unsynced book assignments`);
      
      // Sync them
      const { LibrarySyncService } = require('../utils/library-sync-service');
      const syncResult = await LibrarySyncService.syncAssignmentsToLibrary();
      
      console.log(`✅ Synced ${syncResult.synced} assignments`);
      if (syncResult.errors.length > 0) {
        console.log('❌ Sync errors:');
        syncResult.errors.forEach(error => console.log(`  - ${error}`));
      }
    } else {
      console.log('✅ All book assignments are properly synced');
    }

    // Verify the setup
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM book_assignments WHERE status = 'active') as active_assignments,
        (SELECT COUNT(*) FROM user_library WHERE access_type = 'admin_assigned') as assigned_books,
        (SELECT COUNT(*) FROM books WHERE format IN ('ebook', 'hybrid')) as readable_books
    `);

    const stats = statsResult.rows[0];
    console.log('\n📊 System Statistics:');
    console.log(`  - Active book assignments: ${stats.active_assignments}`);
    console.log(`  - Books in libraries via assignment: ${stats.assigned_books}`);
    console.log(`  - Readable books (ebook/hybrid): ${stats.readable_books}`);

    console.log('\n✅ Book assignments system setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Admins can now assign books to users via Book Management');
    console.log('  2. Assigned books will appear in user libraries');
    console.log('  3. Users can read assigned ebooks via the ereader');
    console.log('  4. Physical books will show as non-readable in the library');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupBookAssignments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupBookAssignments };