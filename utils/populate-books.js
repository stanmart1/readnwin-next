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

const publicDomainBooks = [
  {
    title: "Pride and Prejudice",
    subtitle: "A Novel",
    author: "Jane Austen",
    author_email: "jane.austen@classic.com",
    author_bio: "Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.",
    category: "Romance",
    description: "Pride and Prejudice follows the emotional development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
    price: 9.99,
    format: "ebook",
    language: "en",
    pages: 432,
    publication_date: "1813-01-28",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 1000
  },
  {
    title: "The Great Gatsby",
    subtitle: "A Novel",
    author: "F. Scott Fitzgerald",
    author_email: "fitzgerald@classic.com",
    author_bio: "F. Scott Fitzgerald was an American novelist, essayist, screenwriter, and short-story writer, best known for his novels depicting the flamboyance and excess of the Jazz Age.",
    category: "Fiction",
    description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    price: 12.99,
    format: "ebook",
    language: "en",
    pages: 180,
    publication_date: "1925-04-10",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 1500
  },
  {
    title: "To Kill a Mockingbird",
    subtitle: "A Novel",
    author: "Harper Lee",
    author_email: "harper.lee@classic.com",
    author_bio: "Harper Lee was an American novelist best known for her 1960 novel To Kill a Mockingbird. It won the 1961 Pulitzer Prize and has become a classic of modern American literature.",
    category: "Fiction",
    description: "To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.",
    price: 11.99,
    format: "ebook",
    language: "en",
    pages: 281,
    publication_date: "1960-07-11",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 1200
  },
  {
    title: "1984",
    subtitle: "A Novel",
    author: "George Orwell",
    author_email: "george.orwell@classic.com",
    author_bio: "George Orwell was an English novelist, essayist, journalist and critic. His work is characterised by lucid prose, biting social criticism, opposition to totalitarianism, and outspoken support of democratic socialism.",
    category: "Science Fiction",
    description: "Nineteen Eighty-Four: A Novel, often published as 1984, is a dystopian social science fiction novel by English novelist George Orwell. It was published on 8 June 1949 by Secker & Warburg as Orwell's ninth and final book completed in his lifetime.",
    price: 10.99,
    format: "ebook",
    language: "en",
    pages: 328,
    publication_date: "1949-06-08",
    is_featured: true,
    is_bestseller: false,
    cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 800
  },
  {
    title: "The Hobbit",
    subtitle: "There and Back Again",
    author: "J.R.R. Tolkien",
    author_email: "tolkien@classic.com",
    author_bio: "J.R.R. Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works The Hobbit and The Lord of the Rings.",
    category: "Science Fiction",
    description: "The Hobbit, or There and Back Again is a children's fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for best juvenile fiction.",
    price: 14.99,
    format: "ebook",
    language: "en",
    pages: 310,
    publication_date: "1937-09-21",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 2000
  },
  {
    title: "The Art of War",
    subtitle: "Ancient Chinese Military Treatise",
    author: "Sun Tzu",
    author_email: "sun.tzu@classic.com",
    author_bio: "Sun Tzu was a Chinese general, military strategist, writer, and philosopher who lived in the Eastern Zhou period of ancient China.",
    category: "Non-Fiction",
    description: "The Art of War is an ancient Chinese military treatise dating from the 5th century BC. The work, which is attributed to the ancient Chinese military strategist Sun Tzu, is composed of 13 chapters.",
    price: 8.99,
    format: "ebook",
    language: "en",
    pages: 96,
    publication_date: "1900-01-01",
    is_featured: false,
    is_bestseller: false,
    cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 500
  },
  {
    title: "The Psychology of Money",
    subtitle: "Timeless Lessons on Wealth, Greed, and Happiness",
    author: "Morgan Housel",
    author_email: "morgan.housel@finance.com",
    author_bio: "Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal.",
    category: "Business",
    description: "The Psychology of Money explores the strange ways people think about money and teaches you how to make better sense of one of life's most important topics.",
    price: 19.99,
    format: "ebook",
    language: "en",
    pages: 256,
    publication_date: "2020-09-08",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 3000
  },
  {
    title: "Atomic Habits",
    subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    author: "James Clear",
    author_email: "james.clear@selfhelp.com",
    author_bio: "James Clear is an American author, entrepreneur, and photographer. He is the author of the #1 New York Times bestseller Atomic Habits.",
    category: "Self-Help",
    description: "Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    price: 16.99,
    format: "ebook",
    language: "en",
    pages: 320,
    publication_date: "2018-10-16",
    is_featured: true,
    is_bestseller: true,
    cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 2500
  },
  {
    title: "The Midnight Library",
    subtitle: "A Novel",
    author: "Matt Haig",
    author_email: "matt.haig@fiction.com",
    author_bio: "Matt Haig is an English novelist and journalist. He has written both fiction and non-fiction books for children and adults, often in the speculative fiction genre.",
    category: "Fiction",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    price: 14.99,
    format: "ebook",
    language: "en",
    pages: 288,
    publication_date: "2020-08-13",
    is_featured: false,
    is_bestseller: false,
    cover_image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 1000
  },
  {
    title: "Dune",
    subtitle: "A Novel",
    author: "Frank Herbert",
    author_email: "frank.herbert@scifi.com",
    author_bio: "Franklin Patrick Herbert Jr. was an American science-fiction author best known for his 1965 novel Dune and its five sequels.",
    category: "Science Fiction",
    description: "Dune is a 1965 science-fiction novel by American author Frank Herbert, originally published as two separate serials in Analog magazine. It tied with Roger Zelazny's This Immortal for the Hugo Award in 1966, and it won the inaugural Nebula Award for Best Novel.",
    price: 18.99,
    format: "ebook",
    language: "en",
    pages: 688,
    publication_date: "1965-08-01",
    is_featured: false,
    is_bestseller: false,
    cover_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
    stock_quantity: 1500
  }
];

async function populateBooks() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting book population...');
    
    // First, let's get or create categories
    const categories = {};
    const categoryNames = [...new Set(publicDomainBooks.map(book => book.category))];
    
    for (const categoryName of categoryNames) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if category exists
      let result = await client.query('SELECT id FROM categories WHERE slug = $1', [slug]);
      
      if (result.rows.length === 0) {
        // Create category
        result = await client.query(`
          INSERT INTO categories (name, slug, description, sort_order)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [categoryName, slug, `${categoryName} books`, Object.keys(categories).length + 1]);
      }
      
      categories[categoryName] = result.rows[0].id;
    }
    
    console.log('✅ Categories processed');
    
    // Now process authors
    const authors = {};
    const authorNames = [...new Set(publicDomainBooks.map(book => book.author))];
    
    for (const authorName of authorNames) {
      const book = publicDomainBooks.find(b => b.author === authorName);
      
      // Check if author exists
      let result = await client.query('SELECT id FROM authors WHERE name = $1', [authorName]);
      
      if (result.rows.length === 0) {
        // Create author
        result = await client.query(`
          INSERT INTO authors (name, email, bio, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [authorName, book.author_email, book.author_bio, 'active']);
      }
      
      authors[authorName] = result.rows[0].id;
    }
    
    console.log('✅ Authors processed');
    
    // Now add books
    for (const bookData of publicDomainBooks) {
      // Check if book already exists
      const existingBook = await client.query('SELECT id FROM books WHERE title = $1 AND author_id = $2', [
        bookData.title, 
        authors[bookData.author]
      ]);
      
      if (existingBook.rows.length === 0) {
        await client.query(`
          INSERT INTO books (
            title, subtitle, author_id, category_id, description, price, format, 
            language, pages, publication_date, is_featured, is_bestseller, 
            cover_image_url, stock_quantity, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          bookData.title,
          bookData.subtitle,
          authors[bookData.author],
          categories[bookData.category],
          bookData.description,
          bookData.price,
          bookData.format,
          bookData.language,
          bookData.pages,
          bookData.publication_date,
          bookData.is_featured,
          bookData.is_bestseller,
          bookData.cover_image_url,
          bookData.stock_quantity,
          'published'
        ]);
        
        console.log(`✅ Added book: ${bookData.title}`);
      } else {
        console.log(`⚠️  Book already exists: ${bookData.title}`);
      }
    }
    
    // Get final counts
    const bookCount = await client.query('SELECT COUNT(*) as count FROM books');
    const authorCount = await client.query('SELECT COUNT(*) as count FROM authors');
    const categoryCount = await client.query('SELECT COUNT(*) as count FROM categories');
    
    console.log('\n🎉 Book population completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   Books: ${bookCount.rows[0].count}`);
    console.log(`   Authors: ${authorCount.rows[0].count}`);
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error populating books:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the population if this file is executed directly
if (require.main === module) {
  populateBooks()
    .then(() => {
      console.log('✅ Book population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Book population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateBooks }; 