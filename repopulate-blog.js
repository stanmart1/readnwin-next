#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const blogPosts = [
  {
    title: "The Science Behind Speed Reading: Fact vs Fiction",
    slug: "science-behind-speed-reading-fact-vs-fiction",
    excerpt: "Discover what research actually says about speed reading techniques and whether they can truly help you read faster without sacrificing comprehension.",
    content: `<p>Speed reading has been a popular topic for decades, with countless courses and apps promising to help you read thousands of words per minute. But what does the science actually say?</p>

<h2>The Reality of Reading Speed</h2>
<p>The average adult reads between 200-300 words per minute. While it's possible to increase this speed through practice, the claims of reading 1000+ words per minute while maintaining comprehension are largely unsupported by research.</p>

<h2>Effective Techniques That Actually Work</h2>
<ul>
<li><strong>Eliminating subvocalization:</strong> Reducing the inner voice can help increase reading speed</li>
<li><strong>Improving vocabulary:</strong> A larger vocabulary reduces the time spent decoding unfamiliar words</li>
<li><strong>Practicing regularly:</strong> Like any skill, reading speed improves with consistent practice</li>
<li><strong>Skimming strategically:</strong> Learning when and how to skim can be more valuable than trying to speed-read everything</li>
</ul>

<h2>The Comprehension Trade-off</h2>
<p>Research consistently shows that as reading speed increases, comprehension decreases. The key is finding the right balance for your purpose - whether you're reading for pleasure, studying, or gathering information.</p>

<p>Instead of chasing unrealistic speed goals, focus on becoming a more efficient reader through better techniques and regular practice.</p>`,
    author_name: "Dr. Sarah Chen",
    status: "published",
    featured: true,
    category: "reading-tips",
    tags: ["speed reading", "comprehension", "reading techniques", "science"],
    read_time: 4
  },
  {
    title: "Building Your Personal Library: A Beginner's Guide",
    slug: "building-personal-library-beginners-guide",
    excerpt: "Learn how to curate a meaningful personal library that reflects your interests and supports your reading journey, whether physical or digital.",
    content: `<p>Building a personal library is one of life's great pleasures. It's not just about collecting books – it's about creating a curated space that reflects your interests, supports your learning, and provides endless opportunities for discovery.</p>

<h2>Start with Your Interests</h2>
<p>Begin by identifying the genres and topics that genuinely interest you. Don't feel pressured to include "important" books that don't appeal to you. Your library should be a reflection of your curiosity and passions.</p>

<h2>Quality Over Quantity</h2>
<p>It's better to have 50 books you love and will revisit than 500 books gathering dust. Consider each addition carefully:</p>
<ul>
<li>Will you read this book again?</li>
<li>Does it offer lasting value or reference material?</li>
<li>Does it complement your existing collection?</li>
</ul>

<h2>Mix Formats Strategically</h2>
<p>Modern libraries can include physical books, e-books, and audiobooks. Each format has its advantages:</p>
<ul>
<li><strong>Physical books:</strong> Great for reference, note-taking, and the tactile reading experience</li>
<li><strong>E-books:</strong> Portable, searchable, and often less expensive</li>
<li><strong>Audiobooks:</strong> Perfect for multitasking and experiencing different narration styles</li>
</ul>

<h2>Organization Systems</h2>
<p>Whether you organize by genre, author, color, or size, having a system makes your library more functional and enjoyable to browse.</p>

<p>Remember, your library will evolve with you. What matters most is that it serves your reading goals and brings you joy.</p>`,
    author_name: "Marcus Thompson",
    status: "published",
    featured: false,
    category: "general",
    tags: ["personal library", "book collecting", "organization", "reading habits"],
    read_time: 5
  },
  {
    title: "The Psychology of Reading: Why We Connect with Stories",
    slug: "psychology-of-reading-why-we-connect-with-stories",
    excerpt: "Explore the fascinating psychological mechanisms that make reading such a powerful and transformative experience for humans.",
    content: `<p>Reading is far more than decoding symbols on a page. It's a complex psychological process that engages our emotions, memories, and imagination in profound ways.</p>

<h2>The Neuroscience of Reading</h2>
<p>When we read, our brains create a rich simulation of the story world. Neuroscientists have discovered that reading about actions activates the same brain regions as actually performing those actions. This is why a well-written chase scene can make your heart race.</p>

<h2>Empathy and Perspective-Taking</h2>
<p>Research shows that people who read fiction score higher on empathy tests. By experiencing life through different characters' perspectives, we develop a greater understanding of human nature and emotional complexity.</p>

<h2>The Transportation Phenomenon</h2>
<p>Psychologists use the term "transportation" to describe the experience of being fully absorbed in a story. When we're transported:</p>
<ul>
<li>We lose track of time and our surroundings</li>
<li>We form emotional connections with characters</li>
<li>We may even adopt attitudes and beliefs from the story</li>
<li>We experience genuine emotions in response to fictional events</li>
</ul>

<h2>Memory and Identity Formation</h2>
<p>The stories we read become part of our personal narrative. They provide frameworks for understanding our own experiences and can influence our decision-making and worldview.</p>

<h2>The Therapeutic Power of Reading</h2>
<p>Bibliotherapy – the use of books for healing – has been practiced for centuries. Reading can help us process difficult emotions, gain new perspectives on our problems, and feel less alone in our struggles.</p>

<p>Understanding these psychological mechanisms can help us become more intentional readers and appreciate the profound impact that books have on our minds and lives.</p>`,
    author_name: "Dr. Elena Rodriguez",
    status: "published",
    featured: false,
    category: "psychology",
    tags: ["psychology", "neuroscience", "empathy", "reading benefits"],
    read_time: 6
  },
  {
    title: "Digital vs Physical Books: The Great Reading Debate",
    slug: "digital-vs-physical-books-great-reading-debate",
    excerpt: "An objective look at the pros and cons of digital and physical books, helping you choose the best format for your reading needs.",
    content: `<p>The debate between digital and physical books has been raging since e-readers first appeared. Both formats have their merits, and the best choice often depends on your personal preferences and reading habits.</p>

<h2>The Case for Physical Books</h2>
<p>Physical books offer several unique advantages:</p>
<ul>
<li><strong>Tactile experience:</strong> The feel of paper, the smell of books, and the satisfaction of turning pages</li>
<li><strong>Better retention:</strong> Studies suggest better comprehension and memory with physical books</li>
<li><strong>No battery required:</strong> Always accessible, no charging needed</li>
<li><strong>Easier navigation:</strong> Flipping through pages and bookmarking is intuitive</li>
<li><strong>Collectible value:</strong> Books can be displayed, shared, and passed down</li>
</ul>

<h2>The Digital Advantage</h2>
<p>E-books and digital reading platforms provide their own benefits:</p>
<ul>
<li><strong>Portability:</strong> Thousands of books in one device</li>
<li><strong>Adjustable text:</strong> Font size, brightness, and background can be customized</li>
<li><strong>Instant access:</strong> Download books immediately, anywhere with internet</li>
<li><strong>Search functionality:</strong> Find specific passages or information quickly</li>
<li><strong>Cost-effective:</strong> Often cheaper than physical books</li>
<li><strong>Environmental impact:</strong> No paper, printing, or shipping required</li>
</ul>

<h2>The Hybrid Approach</h2>
<p>Many readers find success in using both formats strategically:</p>
<ul>
<li>Physical books for deep reading and reference materials</li>
<li>E-books for travel and casual reading</li>
<li>Audiobooks for commuting and multitasking</li>
</ul>

<h2>Research Findings</h2>
<p>Studies show mixed results, with some indicating better comprehension with physical books, while others find no significant difference. The key factors seem to be:</p>
<ul>
<li>Familiarity with the format</li>
<li>Type of content being read</li>
<li>Individual learning preferences</li>
<li>Reading environment and context</li>
</ul>

<p>Ultimately, the best format is the one that encourages you to read more. Don't let format preferences become a barrier to enjoying great literature.</p>`,
    author_name: "James Mitchell",
    status: "published",
    featured: false,
    category: "technology",
    tags: ["e-books", "physical books", "reading technology", "book formats"],
    read_time: 5
  },
  {
    title: "Classic Literature in the Modern Age: Why Old Books Still Matter",
    slug: "classic-literature-modern-age-why-old-books-still-matter",
    excerpt: "Discover why classic literature remains relevant today and how these timeless works can enrich your understanding of the human experience.",
    content: `<p>In our fast-paced digital world, it's easy to dismiss classic literature as outdated or irrelevant. However, these enduring works continue to offer profound insights into the human condition that remain as relevant today as when they were first written.</p>

<h2>Timeless Themes</h2>
<p>Classic literature explores universal themes that transcend time and culture:</p>
<ul>
<li><strong>Love and loss:</strong> From Shakespeare's sonnets to Tolstoy's novels</li>
<li><strong>Power and corruption:</strong> Orwell's warnings remain chillingly relevant</li>
<li><strong>Identity and belonging:</strong> Questions explored by authors like James Baldwin and Virginia Woolf</li>
<li><strong>Justice and morality:</strong> Dickens' social critiques still resonate today</li>
</ul>

<h2>Literary Craftsmanship</h2>
<p>Classic authors were masters of their craft, offering lessons in:</p>
<ul>
<li>Character development and psychological depth</li>
<li>Narrative structure and storytelling techniques</li>
<li>Language use and stylistic innovation</li>
<li>Symbolism and thematic complexity</li>
</ul>

<h2>Historical Context and Understanding</h2>
<p>Reading classics provides insight into different historical periods, helping us understand:</p>
<ul>
<li>How societies have evolved</li>
<li>The origins of contemporary issues</li>
<li>Different cultural perspectives and values</li>
<li>The progression of human thought and philosophy</li>
</ul>

<h2>Making Classics Accessible</h2>
<p>If you find classics intimidating, try these approaches:</p>
<ul>
<li><strong>Start with shorter works:</strong> Novellas and short stories are less daunting</li>
<li><strong>Use study guides:</strong> Context can enhance understanding and enjoyment</li>
<li><strong>Join a book club:</strong> Discussion makes difficult passages clearer</li>
<li><strong>Try different formats:</strong> Audiobooks can bring classics to life</li>
<li><strong>Don't force it:</strong> If one classic doesn't work, try another</li>
</ul>

<h2>Modern Relevance</h2>
<p>Consider how these classic themes appear in contemporary life:</p>
<ul>
<li>Orwell's "1984" and modern surveillance concerns</li>
<li>Austen's social commentary and current class issues</li>
<li>Kafka's bureaucratic nightmares and modern institutions</li>
<li>Steinbeck's economic struggles and today's inequality</li>
</ul>

<p>Classic literature doesn't just belong in dusty libraries – it belongs in the hands of modern readers seeking to understand themselves and their world more deeply.</p>`,
    author_name: "Professor Amanda Clarke",
    status: "published",
    featured: false,
    category: "literature",
    tags: ["classic literature", "literary analysis", "timeless themes", "reading recommendations"],
    read_time: 7
  },
  {
    title: "Creating the Perfect Reading Environment at Home",
    slug: "creating-perfect-reading-environment-at-home",
    excerpt: "Transform any space in your home into a reading sanctuary with these practical tips for lighting, seating, organization, and ambiance.",
    content: `<p>Your reading environment can significantly impact your enjoyment and comprehension. Creating a dedicated reading space doesn't require a mansion – just thoughtful attention to a few key elements.</p>

<h2>Lighting: The Foundation of Good Reading</h2>
<p>Proper lighting is crucial for comfortable reading:</p>
<ul>
<li><strong>Natural light:</strong> Position your reading chair near a window for daytime reading</li>
<li><strong>Task lighting:</strong> Use adjustable lamps that direct light over your shoulder onto the page</li>
<li><strong>Avoid glare:</strong> Prevent light from reflecting off the page or screen</li>
<li><strong>Warm vs cool light:</strong> Warmer tones are easier on the eyes for extended reading</li>
</ul>

<h2>Seating and Posture</h2>
<p>Comfort is key for long reading sessions:</p>
<ul>
<li><strong>Supportive chair:</strong> Good back support prevents fatigue</li>
<li><strong>Proper height:</strong> Feet should rest flat on the floor</li>
<li><strong>Arm support:</strong> Armrests reduce strain when holding books</li>
<li><strong>Multiple options:</strong> Sometimes a change of position refreshes focus</li>
</ul>

<h2>Organization and Accessibility</h2>
<p>Keep your reading materials organized and within reach:</p>
<ul>
<li><strong>Book storage:</strong> Shelves, baskets, or side tables for current reads</li>
<li><strong>Reading accessories:</strong> Bookmarks, reading glasses, notebooks</li>
<li><strong>Beverages:</strong> A stable surface for your coffee or tea</li>
<li><strong>Technology:</strong> Charging stations for e-readers and tablets</li>
</ul>

<h2>Creating Ambiance</h2>
<p>The right atmosphere enhances the reading experience:</p>
<ul>
<li><strong>Minimize distractions:</strong> Choose a quiet area away from high-traffic zones</li>
<li><strong>Temperature control:</strong> Ensure the space is comfortable year-round</li>
<li><strong>Personal touches:</strong> Add plants, artwork, or meaningful objects</li>
<li><strong>Scent:</strong> Candles or diffusers can create a calming atmosphere</li>
</ul>

<h2>Small Space Solutions</h2>
<p>Don't have a spare room? Try these ideas:</p>
<ul>
<li><strong>Reading nook:</strong> Transform a corner with a comfortable chair and good lighting</li>
<li><strong>Bedroom setup:</strong> Create a reading area separate from your sleep space</li>
<li><strong>Outdoor space:</strong> A patio or balcony can become a seasonal reading retreat</li>
<li><strong>Portable setup:</strong> A reading basket with essentials you can move around</li>
</ul>

<h2>Digital Considerations</h2>
<p>For digital reading, consider:</p>
<ul>
<li>Blue light filters for evening reading</li>
<li>Adjustable screen brightness</li>
<li>Comfortable viewing angles</li>
<li>Minimizing notifications and distractions</li>
</ul>

<p>Remember, the perfect reading environment is personal. Experiment with different setups until you find what works best for your habits and preferences.</p>`,
    author_name: "Lisa Park",
    status: "published",
    featured: false,
    category: "reading-tips",
    tags: ["reading environment", "home organization", "reading comfort", "productivity"],
    read_time: 5
  },
  {
    title: "The Rise of Audiobooks: Changing How We Consume Literature",
    slug: "rise-of-audiobooks-changing-how-we-consume-literature",
    excerpt: "Explore the growing popularity of audiobooks and how this format is transforming reading habits, accessibility, and literary culture.",
    content: `<p>Audiobooks have experienced explosive growth in recent years, fundamentally changing how many people consume literature. This isn't just a trend – it's a transformation of reading culture itself.</p>

<h2>The Numbers Don't Lie</h2>
<p>Audiobook sales have grown consistently for over a decade:</p>
<ul>
<li>Double-digit growth year over year</li>
<li>Younger demographics driving adoption</li>
<li>Increased production and variety of titles</li>
<li>Integration with streaming and subscription services</li>
</ul>

<h2>Why Audiobooks Are Thriving</h2>
<p>Several factors contribute to their popularity:</p>
<ul>
<li><strong>Multitasking capability:</strong> Listen while commuting, exercising, or doing chores</li>
<li><strong>Accessibility:</strong> Great for people with dyslexia, visual impairments, or reading difficulties</li>
<li><strong>Performance element:</strong> Professional narrators bring characters to life</li>
<li><strong>Convenience:</strong> No need for good lighting or comfortable seating</li>
<li><strong>Speed control:</strong> Adjust playback speed to match your preference</li>
</ul>

<h2>The Narration Advantage</h2>
<p>Professional narrators add a unique dimension to literature:</p>
<ul>
<li><strong>Character voices:</strong> Distinct voices help differentiate characters</li>
<li><strong>Emotional delivery:</strong> Tone and pacing enhance dramatic moments</li>
<li><strong>Pronunciation guide:</strong> Hear difficult names and words correctly</li>
<li><strong>Author narration:</strong> Some authors read their own works, adding personal insight</li>
</ul>

<h2>Addressing the Skeptics</h2>
<p>Common concerns about audiobooks include:</p>
<ul>
<li><strong>"Is listening really reading?"</strong> Research shows similar comprehension and retention</li>
<li><strong>"I get distracted easily":</strong> This improves with practice, like any skill</li>
<li><strong>"It's too passive":</strong> Active listening requires focus and engagement</li>
<li><strong>"I miss the visual element":</strong> Different, not inferior – each format has unique benefits</li>
</ul>

<h2>Maximizing Your Audiobook Experience</h2>
<p>Tips for getting the most from audiobooks:</p>
<ul>
<li><strong>Choose the right narrator:</strong> Sample different voices to find what you enjoy</li>
<li><strong>Start with familiar genres:</strong> Begin with types of books you already love</li>
<li><strong>Use quality headphones:</strong> Good audio equipment enhances the experience</li>
<li><strong>Take notes:</strong> Use apps or voice memos to capture important thoughts</li>
<li><strong>Adjust speed gradually:</strong> Start at normal speed, then experiment</li>
</ul>

<h2>The Future of Audio Literature</h2>
<p>Emerging trends in audiobooks include:</p>
<ul>
<li>Enhanced audio with sound effects and music</li>
<li>Full-cast productions for dramatic works</li>
<li>Interactive elements and companion materials</li>
<li>AI-generated narration for niche titles</li>
<li>Integration with smart home devices</li>
</ul>

<h2>Impact on Reading Culture</h2>
<p>Audiobooks are changing how we think about literacy and literature:</p>
<ul>
<li>Expanding access to books for busy lifestyles</li>
<li>Introducing new audiences to classic literature</li>
<li>Creating new opportunities for performers and voice actors</li>
<li>Influencing how authors write, considering audio delivery</li>
</ul>

<p>Whether you're a longtime audiobook fan or curious newcomer, this format offers a unique and valuable way to experience literature. The key is finding what works for your lifestyle and preferences.</p>`,
    author_name: "David Kim",
    status: "published",
    featured: true,
    category: "technology",
    tags: ["audiobooks", "digital reading", "accessibility", "reading trends"],
    read_time: 6
  },
  {
    title: "Book Clubs in the Digital Age: Building Reading Communities Online",
    slug: "book-clubs-digital-age-building-reading-communities-online",
    excerpt: "Discover how book clubs have evolved in the digital era and learn how to start or join online reading communities that enhance your literary journey.",
    content: `<p>Book clubs have been bringing readers together for centuries, but the digital age has revolutionized how these communities form, interact, and share their love of literature.</p>

<h2>The Evolution of Book Clubs</h2>
<p>Traditional book clubs met in living rooms and libraries, but today's reading communities span the globe:</p>
<ul>
<li><strong>Virtual meetings:</strong> Video calls connect readers across time zones</li>
<li><strong>Social media groups:</strong> Facebook, Reddit, and Discord host active discussions</li>
<li><strong>Reading apps:</strong> Platforms like Goodreads facilitate book discovery and discussion</li>
<li><strong>Hybrid models:</strong> Combining in-person and online elements</li>
</ul>

<h2>Benefits of Online Book Communities</h2>
<p>Digital book clubs offer unique advantages:</p>
<ul>
<li><strong>Diverse perspectives:</strong> Connect with readers from different backgrounds and cultures</li>
<li><strong>Flexible scheduling:</strong> Asynchronous discussions accommodate busy lifestyles</li>
<li><strong>Specialized interests:</strong> Find communities focused on specific genres or themes</li>
<li><strong>Resource sharing:</strong> Easy access to reviews, author interviews, and supplementary materials</li>
<li><strong>Accessibility:</strong> Participate regardless of location or mobility</li>
</ul>

<h2>Popular Online Platforms</h2>
<p>Where to find or create book communities:</p>
<ul>
<li><strong>Goodreads:</strong> The largest online reading community with built-in club features</li>
<li><strong>Reddit:</strong> Subreddits for every genre and reading interest</li>
<li><strong>Facebook Groups:</strong> Local and interest-based reading communities</li>
<li><strong>Discord Servers:</strong> Real-time chat for active discussions</li>
<li><strong>BookClub.com:</strong> Dedicated platform for online book clubs</li>
<li><strong>Zoom/Google Meet:</strong> For live video discussions</li>
</ul>

<h2>Starting Your Own Online Book Club</h2>
<p>Steps to create a successful digital reading community:</p>
<ol>
<li><strong>Define your focus:</strong> Genre, reading level, meeting frequency</li>
<li><strong>Choose a platform:</strong> Consider your target audience's preferences</li>
<li><strong>Set clear guidelines:</strong> Rules for discussion, book selection, and behavior</li>
<li><strong>Start small:</strong> Begin with friends or a small group and grow organically</li>
<li><strong>Plan engaging activities:</strong> Author Q&As, themed discussions, reading challenges</li>
</ol>

<h2>Making Virtual Discussions Engaging</h2>
<p>Tips for lively online book discussions:</p>
<ul>
<li><strong>Prepare discussion questions:</strong> Go beyond "Did you like it?"</li>
<li><strong>Use multimedia:</strong> Share relevant videos, articles, or images</li>
<li><strong>Encourage participation:</strong> Create space for different discussion styles</li>
<li><strong>Respect spoilers:</strong> Use clear warnings and formatting</li>
<li><strong>Celebrate milestones:</strong> Acknowledge member achievements and anniversaries</li>
</ul>

<h2>Overcoming Digital Challenges</h2>
<p>Common issues and solutions:</p>
<ul>
<li><strong>Screen fatigue:</strong> Mix video calls with text-based discussions</li>
<li><strong>Time zone differences:</strong> Record sessions or use asynchronous formats</li>
<li><strong>Technology barriers:</strong> Provide tutorials and patient support</li>
<li><strong>Maintaining engagement:</strong> Regular check-ins and varied content</li>
</ul>

<h2>The Future of Reading Communities</h2>
<p>Emerging trends in digital book clubs:</p>
<ul>
<li>Virtual reality book discussions</li>
<li>AI-powered reading recommendations</li>
<li>Integration with e-reading platforms</li>
<li>Gamification of reading challenges</li>
<li>Author-led community experiences</li>
</ul>

<h2>Finding Your Reading Tribe</h2>
<p>Whether you prefer intimate discussions or large community events, there's an online book club for you. The key is finding a community that matches your reading interests, discussion style, and schedule.</p>

<p>Digital book clubs prove that technology doesn't isolate us – it can bring us together around our shared love of literature, creating connections that transcend geographical boundaries.</p>`,
    author_name: "Rachel Green",
    status: "published",
    featured: false,
    category: "general",
    tags: ["book clubs", "online communities", "digital reading", "social reading"],
    read_time: 6
  }
];

async function repopulateBlog() {
  try {
    console.log('🗑️  Clearing existing blog posts...');
    
    // Clear existing posts
    await query('DELETE FROM blog_images');
    await query('DELETE FROM blog_comments');
    await query('DELETE FROM blog_likes');
    await query('DELETE FROM blog_views');
    await query('DELETE FROM blog_posts');
    
    console.log('✅ Existing blog posts cleared');
    console.log('📝 Adding new blog posts...');
    
    // Insert new posts
    for (const post of blogPosts) {
      const result = await query(
        `INSERT INTO blog_posts (
          title, slug, excerpt, content, author_id, author_name, status, featured,
          category, tags, read_time, views_count, likes_count, comments_count,
          published_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
        RETURNING id, title`,
        [
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          1, // Default admin user ID
          post.author_name,
          post.status,
          post.featured,
          post.category,
          post.tags,
          post.read_time,
          Math.floor(Math.random() * 500) + 50, // Random views between 50-550
          Math.floor(Math.random() * 25) + 5,   // Random likes between 5-30
          Math.floor(Math.random() * 10),       // Random comments between 0-10
          new Date().toISOString(), // published_at
          new Date().toISOString()  // created_at
        ]
      );
      
      console.log(`✅ Added: ${result.rows[0].title}`);
    }
    
    console.log('🎉 Blog repopulation complete!');
    console.log(`📊 Added ${blogPosts.length} new blog posts`);
    
    // Show summary
    const stats = await query(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts
      FROM blog_posts
    `);
    
    console.log('\n📈 Blog Statistics:');
    console.log(`   Total posts: ${stats.rows[0].total_posts}`);
    console.log(`   Featured posts: ${stats.rows[0].featured_posts}`);
    console.log(`   Published posts: ${stats.rows[0].published_posts}`);
    
  } catch (error) {
    console.error('❌ Error repopulating blog:', error);
    process.exit(1);
  }
}

// Run the script
repopulateBlog().then(() => {
  process.exit(0);
});