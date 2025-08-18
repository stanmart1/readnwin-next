const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
  },
});

async function addPerformanceIndexes() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding Performance Indexes...\n');

    const indexes = [
      // Books table indexes
      {
        name: 'idx_books_category_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id)'
      },
      {
        name: 'idx_books_author_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id)'
      },
      {
        name: 'idx_books_status',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)'
      },
      {
        name: 'idx_books_price',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_price ON books(price)'
      },
      {
        name: 'idx_books_is_featured',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_is_featured ON books(is_featured)'
      },
      {
        name: 'idx_books_is_bestseller',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_is_bestseller ON books(is_bestseller)'
      },
      {
        name: 'idx_books_stock_quantity',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_stock_quantity ON books(stock_quantity)'
      },
      {
        name: 'idx_books_created_at',
        query: 'CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at)'
      },

      // Cart items table indexes
      {
        name: 'idx_cart_items_user_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)'
      },
      {
        name: 'idx_cart_items_book_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id)'
      },
      {
        name: 'idx_cart_items_added_at',
        query: 'CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON cart_items(added_at)'
      },
      {
        name: 'idx_cart_items_user_book',
        query: 'CREATE INDEX IF NOT EXISTS idx_cart_items_user_book ON cart_items(user_id, book_id)'
      },

      // Orders table indexes
      {
        name: 'idx_orders_user_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)'
      },
      {
        name: 'idx_orders_status',
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)'
      },
      {
        name: 'idx_orders_payment_status',
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)'
      },
      {
        name: 'idx_orders_created_at',
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)'
      },
      {
        name: 'idx_orders_order_number',
        query: 'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)'
      },

      // Categories table indexes
      {
        name: 'idx_categories_slug',
        query: 'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)'
      },
      {
        name: 'idx_categories_is_active',
        query: 'CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active)'
      },

      // Authors table indexes
      {
        name: 'idx_authors_status',
        query: 'CREATE INDEX IF NOT EXISTS idx_authors_status ON authors(status)'
      },
      {
        name: 'idx_authors_is_verified',
        query: 'CREATE INDEX IF NOT EXISTS idx_authors_is_verified ON authors(is_verified)'
      }
    ];

    console.log('📊 Creating performance indexes...');
    
    for (const index of indexes) {
      try {
        await client.query(index.query);
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`ℹ️  Index already exists: ${index.name}`);
        } else {
          console.error(`❌ Error creating index ${index.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Performance indexes added successfully!');
    console.log('\n📈 Performance improvements:');
    console.log('   • Faster book filtering and search');
    console.log('   • Improved cart operations');
    console.log('   • Better order management');
    console.log('   • Enhanced category and author queries');

  } catch (error) {
    console.error('❌ Error adding performance indexes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addPerformanceIndexes(); 