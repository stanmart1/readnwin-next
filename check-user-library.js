const { query } = require('./utils/database');

async function checkUserLibrary() {
  try {
    console.log('🔍 Checking user library...\n');
    
    // First, let's see what users exist
    const usersResult = await query(`
      SELECT id, email 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('👥 Available users:');
    console.table(usersResult.rows);
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const userId = usersResult.rows[0].id;
    console.log(`\n🔍 Checking library for user: ${usersResult.rows[0].email} (ID: ${userId})`);
    
    // Check if the book is in the user's library
    const libraryResult = await query(`
      SELECT ul.*, b.title, b.format
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1 AND ul.book_id = 110
    `, [userId]);
    
    console.log('\n📚 Book in user library:');
    console.table(libraryResult.rows);
    
    if (libraryResult.rows.length === 0) {
      console.log('\n➕ Book not in library, adding it...');
      
      // Add the book to the user's library
      const addResult = await query(`
        INSERT INTO user_library (user_id, book_id)
        VALUES ($1, $2)
        RETURNING *
      `, [userId, 110]);
      
      console.log('✅ Book added to library:');
      console.table(addResult.rows);
    } else {
      console.log('✅ Book is already in user library');
    }
    
  } catch (error) {
    console.error('❌ Error checking user library:', error);
  }
}

checkUserLibrary(); 