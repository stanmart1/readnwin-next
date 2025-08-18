const { query } = require('./database.ts');
const { blogService } = require('./blog-service.ts');

async function initializeBlog() {
  try {
    console.log('🔄 Initializing Blog Management System...\n');

    // Step 1: Create blog tables
    console.log('1. Creating database tables...');
    
    // Blog posts table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        featured BOOLEAN DEFAULT false,
        category VARCHAR(100) DEFAULT 'general',
        tags TEXT[] DEFAULT '{}',
        read_time INTEGER DEFAULT 5,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT[],
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ blog_posts table created');

    // Blog categories table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ blog_categories table created');

    // Blog images table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_images (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        alt_text VARCHAR(255),
        caption TEXT,
        is_featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ blog_images table created');

    // Blog comments table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
        parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ blog_comments table created');

    // Blog likes table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `);
    console.log('   ✅ blog_likes table created');

    // Blog views tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_views (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET,
        user_agent TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ blog_views table created');

    // Step 2: Create indexes
    console.log('\n2. Creating database indexes...');
    
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(post_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON blog_views(post_id)');
    console.log('   ✅ Database indexes created');

    // Step 3: Create triggers
    console.log('\n3. Creating database triggers...');
    
    await query(`
      CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts
    `);

    await query(`
      CREATE TRIGGER update_blog_posts_updated_at
          BEFORE UPDATE ON blog_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_blog_posts_updated_at()
    `);

    // Comment count trigger
    await query(`
      CREATE OR REPLACE FUNCTION update_blog_comment_count()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              UPDATE blog_posts 
              SET comments_count = comments_count + 1 
              WHERE id = NEW.post_id;
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              UPDATE blog_posts 
              SET comments_count = comments_count - 1 
              WHERE id = OLD.post_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_blog_comment_count_trigger ON blog_comments
    `);

    await query(`
      CREATE TRIGGER update_blog_comment_count_trigger
          AFTER INSERT OR DELETE ON blog_comments
          FOR EACH ROW
          EXECUTE FUNCTION update_blog_comment_count()
    `);

    // Like count trigger
    await query(`
      CREATE OR REPLACE FUNCTION update_blog_like_count()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              UPDATE blog_posts 
              SET likes_count = likes_count + 1 
              WHERE id = NEW.post_id;
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              UPDATE blog_posts 
              SET likes_count = likes_count - 1 
              WHERE id = OLD.post_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_blog_like_count_trigger ON blog_likes
    `);

    await query(`
      CREATE TRIGGER update_blog_like_count_trigger
          AFTER INSERT OR DELETE ON blog_likes
          FOR EACH ROW
          EXECUTE FUNCTION update_blog_like_count()
    `);
    console.log('   ✅ Database triggers created');

    // Step 4: Insert default categories
    console.log('\n4. Creating default categories...');
    
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Technology and digital reading trends', color: '#3B82F6', icon: 'ri-computer-line' },
      { name: 'Self-Improvement', slug: 'self-improvement', description: 'Personal development and growth', color: '#10B981', icon: 'ri-user-heart-line' },
      { name: 'Literature', slug: 'literature', description: 'Book reviews and literary discussions', color: '#8B5CF6', icon: 'ri-book-open-line' },
      { name: 'Psychology', slug: 'psychology', description: 'Psychology of reading and learning', color: '#F59E0B', icon: 'ri-brain-line' },
      { name: 'Reviews', slug: 'reviews', description: 'Book reviews and recommendations', color: '#EF4444', icon: 'ri-star-line' },
      { name: 'Reading Tips', slug: 'reading-tips', description: 'Tips for better reading habits', color: '#06B6D4', icon: 'ri-lightbulb-line' },
      { name: 'Author Interviews', slug: 'author-interviews', description: 'Interviews with authors', color: '#84CC16', icon: 'ri-user-voice-line' },
      { name: 'Industry News', slug: 'industry-news', description: 'Publishing industry updates', color: '#6366F1', icon: 'ri-newspaper-line' }
    ];

    for (const category of categories) {
      await query(`
        INSERT INTO blog_categories (name, slug, description, color, icon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.slug, category.description, category.color, category.icon]);
    }
    console.log('   ✅ Default categories created');

    // Step 5: Blog posts setup (no hardcoded posts)
    console.log('\n5. Blog posts setup...');
    console.log('   ℹ️  No hardcoded blog posts will be created.');
    console.log('   💡 Blog posts should be added through the admin interface or database directly.');

    // Step 6: Verify setup
    console.log('\n6. Verifying setup...');
    
    const postCount = await query('SELECT COUNT(*) as count FROM blog_posts');
    const categoryCount = await query('SELECT COUNT(*) as count FROM blog_categories');
    
    console.log(`   ✅ ${postCount.rows[0].count} blog posts created`);
    console.log(`   ✅ ${categoryCount.rows[0].count} categories created`);

    console.log('\n✅ Blog Management System Initialized Successfully!');
    console.log('\n📋 What was created:');
    console.log('- Database tables for blog management');
    console.log('- Default blog categories');
    console.log('- Sample blog posts');
    console.log('- Database indexes for performance');
    console.log('- Automatic triggers for counters');
    console.log('\n🎯 Next steps:');
    console.log('- Access the Blog Management tab in the admin dashboard');
    console.log('- Create and edit blog posts using the rich text editor');
    console.log('- Upload images for blog posts');
    console.log('- Test the public blog page');

  } catch (error) {
    console.error('❌ Error initializing blog system:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializeBlog(); 