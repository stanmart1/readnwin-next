const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addProfileColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding missing profile columns to users table...');
    
    // Add bio column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT
      `);
      console.log('✅ Added bio column');
    } catch (error) {
      console.log('ℹ️ Bio column already exists or error:', error.message);
    }
    
    // Add profile_image column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT
      `);
      console.log('✅ Added profile_image column');
    } catch (error) {
      console.log('ℹ️ Profile_image column already exists or error:', error.message);
    }
    
    // Add is_student column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_student column');
    } catch (error) {
      console.log('ℹ️ Is_student column already exists or error:', error.message);
    }
    
    // Create student_info table if it doesn't exist
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS student_info (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          school_name VARCHAR(255),
          matriculation_number VARCHAR(100),
          department VARCHAR(255),
          course VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        )
      `);
      console.log('✅ Created student_info table');
    } catch (error) {
      console.log('ℹ️ Student_info table already exists or error:', error.message);
    }
    
    // Create reading_progress table if it doesn't exist
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS reading_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER,
          pages_read INTEGER DEFAULT 0,
          reading_time INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          read_date DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created reading_progress table');
    } catch (error) {
      console.log('ℹ️ Reading_progress table already exists or error:', error.message);
    }
    
    // Create genres table if it doesn't exist
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS genres (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created genres table');
    } catch (error) {
      console.log('ℹ️ Genres table already exists or error:', error.message);
    }
    
    // Create book_genres table if it doesn't exist
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS book_genres (
          id SERIAL PRIMARY KEY,
          book_id INTEGER,
          genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
          UNIQUE(book_id, genre_id)
        )
      `);
      console.log('✅ Created book_genres table');
    } catch (error) {
      console.log('ℹ️ Book_genres table already exists or error:', error.message);
    }
    
    console.log('🎉 Profile columns and tables setup completed');
    
  } catch (error) {
    console.error('❌ Error adding profile columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addProfileColumns()
    .then(() => {
      console.log('✅ Profile setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to setup profile:', error);
      process.exit(1);
    });
}

module.exports = { addProfileColumns };