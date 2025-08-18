const { query } = require('../utils/database');

// This script is no longer needed as we're using database-only blog posts
// All blog posts should be managed through the admin interface or database directly

async function checkBlogPosts() {
  try {
    console.log('🔄 Checking Blog Posts in Database...\n');

    // Check if blog_posts table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ blog_posts table does not exist.');
      console.log('💡 Please create the blog_posts table first using the blog schema.');
      return;
    }

    // Check existing posts
    const existingCount = await query('SELECT COUNT(*) FROM blog_posts');
    console.log(`📊 Found ${existingCount.rows[0].count} blog posts in database.`);
    
    if (parseInt(existingCount.rows[0].count) === 0) {
      console.log('💡 No blog posts found. Add posts through the admin interface.');
    } else {
      console.log('✅ Blog posts are available and ready to use.');
    }

  } catch (error) {
    console.error('❌ Error checking blog posts:', error);
    throw error;
  }
}

// Run the check
if (require.main === module) {
  checkBlogPosts()
    .then(() => {
      console.log('\n✅ Blog posts check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Blog posts check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkBlogPosts }; 