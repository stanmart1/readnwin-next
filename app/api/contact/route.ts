import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safeSystemSettingsQuery, safeSystemSettingsUpdate } from '@/utils/safe-query';
import { query } from '@/utils/database';

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

// Default contact data structure
const defaultContactData = {
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

export async function GET() {
  try {
    // Get contact page content from system_settings
    const result = await safeSystemSettingsQuery('contact_page_content');

    if (result.success && result.value) {
      try {
        const contactData = JSON.parse(result.value);
        return NextResponse.json({
          success: true,
          data: contactData
        });
      } catch (parseError) {
        console.error('Error parsing contact page content:', parseError);
        // Continue to return default content
      }
    } else {
      console.log('Contact page content not found or error:', result.error);
    }
    
    // Return default content if not found
    return NextResponse.json({
      success: true,
      data: defaultContactData
    });
  } catch (error) {
    console.error('Error fetching contact data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contactMethods, faqs, officeInfo, contactSubjects } = body;

    // Validate required fields
    if (!contactMethods || !faqs || !officeInfo || !contactSubjects) {
      return NextResponse.json(
        { success: false, error: 'Missing required contact data sections' },
        { status: 400 }
      );
    }

    // Prepare contact data
    const contactData = {
      contactMethods,
      faqs,
      officeInfo,
      contactSubjects
    };

    // Save content to system_settings
    try {
      await safeSystemSettingsUpdate('contact_page_content', JSON.stringify(contactData));
    } catch (dbError) {
      console.error('Database error saving contact content:', dbError);
      // Try to create the table if it doesn't exist
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS system_settings (
            id SERIAL PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Try the insert again
        await safeSystemSettingsUpdate('contact_page_content', JSON.stringify(contactData));
      } catch (createError) {
        console.error('Failed to create system_settings table:', createError);
        throw new Error('Database setup failed');
      }
    }

    // Log the action (with error handling)
    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [
          session.user.id,
          'UPDATE',
          'contact_page_content',
          JSON.stringify({ message: 'Updated contact page content' }),
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (auditError) {
      console.error('Audit logging failed, but content was saved:', auditError);
      // Try to create the audit_logs table if it doesn't exist
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(50),
            resource_id INTEGER,
            details JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Try the insert again
        await query(
          'INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
          [
            session.user.id,
            'UPDATE',
            'contact_page_content',
            JSON.stringify({ message: 'Updated contact page content' }),
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          ]
        );
      } catch (createAuditError) {
        console.error('Failed to create audit_logs table:', createAuditError);
        // Don't fail the entire request if audit logging fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contact data updated successfully',
      data: contactData
    });
  } catch (error) {
    console.error('Error updating contact data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact data' },
      { status: 500 }
    );
  }
} 