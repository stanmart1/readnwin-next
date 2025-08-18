require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function initializeContactPageContent() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing contact page content in database...');
    
    // Default contact data
    const contactData = {
      contactMethods: [
        {
          id: 'email',
          icon: 'ri-mail-line',
          title: 'Email Us',
          description: 'Get in touch with our support team',
          contact: 'hello@readnwin.com',
          action: 'mailto:hello@readnwin.com',
          isActive: true
        },
        {
          id: 'phone',
          icon: 'ri-phone-line',
          title: 'Call Us',
          description: 'Speak with our customer service',
          contact: '+1 (555) 123-4567',
          action: 'tel:+15551234567',
          isActive: true
        },
        {
          id: 'chat',
          icon: 'ri-message-3-line',
          title: 'Live Chat',
          description: 'Chat with us in real-time',
          contact: 'Available 24/7',
          action: '#',
          isActive: true
        },
        {
          id: 'visit',
          icon: 'ri-map-pin-line',
          title: 'Visit Us',
          description: 'Our headquarters location',
          contact: '123 Reading Street, Book City, BC 12345',
          action: '#',
          isActive: true
        }
      ],
      faqs: [
        {
          id: '1',
          question: 'How do I get started with ReadnWin?',
          answer: 'Simply sign up for a free account and start exploring our vast library of books. You can read on any device and sync your progress across platforms.',
          isActive: true,
          order: 1
        },
        {
          id: '2',
          question: 'What types of books are available?',
          answer: 'We offer a comprehensive collection including fiction, non-fiction, academic texts, self-help books, and much more. Our library is constantly growing with new releases.',
          isActive: true,
          order: 2
        },
        {
          id: '3',
          question: 'Can I read offline?',
          answer: 'Yes! You can download books to read offline. Simply tap the download button on any book and it will be available for offline reading.',
          isActive: true,
          order: 3
        },
        {
          id: '4',
          question: 'How much does ReadnWin cost?',
          answer: 'We offer both free and premium plans. The free plan includes access to thousands of books, while premium unlocks our entire library and advanced features.',
          isActive: true,
          order: 4
        },
        {
          id: '5',
          question: 'How do I cancel my subscription?',
          answer: 'You can cancel your subscription anytime from your account settings. There are no cancellation fees and you\'ll continue to have access until the end of your billing period.',
          isActive: true,
          order: 5
        },
        {
          id: '6',
          question: 'Is my reading data private?',
          answer: 'Absolutely. We take your privacy seriously. Your reading history and personal data are encrypted and never shared with third parties without your explicit consent.',
          isActive: true,
          order: 6
        }
      ],
      officeInfo: {
        address: '123 Reading Street, Book City, BC 12345',
        hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
        parking: 'Free parking available in our building',
        isActive: true
      },
      contactSubjects: [
        { id: '1', name: 'General Inquiry', isActive: true, order: 1 },
        { id: '2', name: 'Technical Support', isActive: true, order: 2 },
        { id: '3', name: 'Account Issues', isActive: true, order: 3 },
        { id: '4', name: 'Billing Questions', isActive: true, order: 4 },
        { id: '5', name: 'Feature Request', isActive: true, order: 5 },
        { id: '6', name: 'Partnership', isActive: true, order: 6 },
        { id: '7', name: 'Press/Media', isActive: true, order: 7 },
        { id: '8', name: 'Other', isActive: true, order: 8 }
      ]
    };
    
    // Check if contact page content already exists
    const existingResult = await client.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = $1',
      ['contact_page_content']
    );
    
    if (existingResult.rows.length > 0) {
      console.log('📋 Contact page content already exists in database');
      console.log('✅ Contact page content is ready for management');
    } else {
      console.log('📝 Creating contact page content in database...');
      
      // Insert contact page content
      await client.query(
        'INSERT INTO system_settings (setting_key, setting_value, description) VALUES ($1, $2, $3)',
        [
          'contact_page_content',
          JSON.stringify(contactData),
          'Contact page content including contact methods, FAQs, office info, and contact subjects'
        ]
      );
      
      console.log('✅ Contact page content initialized successfully!');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

initializeContactPageContent().catch(console.error); 