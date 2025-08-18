const { query } = require('../utils/database.js');

async function initializeAchievements() {
  try {
    console.log('🔄 Initializing Achievements...\n');

    // Define default achievements
    const achievements = [
      {
        achievement_type: 'speed_reader',
        title: 'Speed Reader',
        description: 'Read 5 books in a month',
        icon: 'ri-flashlight-line',
        condition_type: 'books_in_month',
        condition_value: 5,
        priority: 1
      },
      {
        achievement_type: 'diverse_reader',
        title: 'Diverse Reader',
        description: 'Read 5 different genres',
        icon: 'ri-book-line',
        condition_type: 'unique_genres',
        condition_value: 5,
        priority: 2
      },
      {
        achievement_type: 'consistent_reader',
        title: 'Consistent Reader',
        description: 'Read for 30 days straight',
        icon: 'ri-calendar-line',
        condition_type: 'reading_streak',
        condition_value: 30,
        priority: 3
      },
      {
        achievement_type: 'social_reader',
        title: 'Social Reader',
        description: 'Write 20 reviews',
        icon: 'ri-chat-1-line',
        condition_type: 'reviews_written',
        condition_value: 20,
        priority: 4
      },
      {
        achievement_type: 'bookworm',
        title: 'Bookworm',
        description: 'Read 100 books total',
        icon: 'ri-book-open-line',
        condition_type: 'total_books',
        condition_value: 100,
        priority: 5
      },
      {
        achievement_type: 'marathon_reader',
        title: 'Marathon Reader',
        description: 'Read for 5 hours in a single day',
        icon: 'ri-time-line',
        condition_type: 'hours_in_day',
        condition_value: 5,
        priority: 6
      },
      {
        achievement_type: 'reviewer_expert',
        title: 'Review Expert',
        description: 'Get 50 helpful votes on reviews',
        icon: 'ri-star-line',
        condition_type: 'helpful_votes',
        condition_value: 50,
        priority: 7
      },
      {
        achievement_type: 'genre_explorer',
        title: 'Genre Explorer',
        description: 'Read books from 10 different genres',
        icon: 'ri-compass-line',
        condition_type: 'unique_genres',
        condition_value: 10,
        priority: 8
      },
      {
        achievement_type: 'early_bird',
        title: 'Early Bird',
        description: 'Read for 7 consecutive days',
        icon: 'ri-sun-line',
        condition_type: 'reading_streak',
        condition_value: 7,
        priority: 9
      },
      {
        achievement_type: 'page_turner',
        title: 'Page Turner',
        description: 'Read 1000 pages in a month',
        icon: 'ri-file-text-line',
        condition_type: 'pages_in_month',
        condition_value: 1000,
        priority: 10
      }
    ];

    // Insert achievements
    for (const achievement of achievements) {
      await query(`
        INSERT INTO achievements (
          achievement_type, title, description, icon, 
          condition_type, condition_value, priority
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (achievement_type) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          condition_type = EXCLUDED.condition_type,
          condition_value = EXCLUDED.condition_value,
          priority = EXCLUDED.priority
      `, [
        achievement.achievement_type,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.condition_type,
        achievement.condition_value,
        achievement.priority
      ]);
    }

    console.log('✅ Achievements initialized successfully!');
    console.log(`   Created ${achievements.length} achievements`);

  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeAchievements()
    .then(() => {
      console.log('\n🎉 Achievement initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Achievement initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeAchievements };
