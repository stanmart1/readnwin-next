import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { safeSystemSettingsQuery, safeSystemSettingsUpdate } from '@/utils/safe-query';
import { query } from '@/utils/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get about page content from system_settings using safe query
    let result;
    try {
      result = await safeSystemSettingsQuery('about_page_content');
    } catch (dbError) {
      console.warn('Database error when fetching about page content:', dbError);
      // Continue with default content if database is unavailable
      result = { success: false, error: 'Database unavailable' };
    }

    if (result.success && result.value) {
      try {
        return NextResponse.json(JSON.parse(result.value));
      } catch (parseError) {
        logger.error('Error parsing about page content:', parseError);
        // Continue to return default content
      }
    } else {
      logger.info('About page content not found or error:', result.error);
    }
    
    // Return default content if not found
    return NextResponse.json({
      hero: {
        title: 'About ReadnWin',
        subtitle: 'Revolutionizing the way people read, learn, and grow through technology'
      },
      aboutSection: {
        image: '/images/about.png',
        imageAlt: 'ReadnWin about section - Empowering minds through reading',
        overlayTitle: 'About ReadnWin',
        overlayDescription: 'Empowering minds through reading and technology'
      },
      mission: {
        title: 'Our Mission',
        description: 'At ReadnWin, we believe that reading is the foundation of personal growth and societal progress. Our mission is to make quality literature accessible to everyone, everywhere.',
        features: ['Unlimited Access', 'AI-Powered Recommendations', 'Global Community']
      },
      missionGrid: [
        {
          icon: 'ri-book-line',
          title: 'Digital Library',
          description: 'Access millions of books instantly',
          color: 'text-blue-600'
        },
        {
          icon: 'ri-brain-line',
          title: 'Smart Learning',
          description: 'AI-powered reading insights',
          color: 'text-purple-600'
        },
        {
          icon: 'ri-group-line',
          title: 'Reader Community',
          description: 'Connect with fellow readers',
          color: 'text-cyan-600'
        },
        {
          icon: 'ri-device-line',
          title: 'Multi-Platform',
          description: 'Read anywhere, anytime',
          color: 'text-green-600'
        }
      ],
      stats: [
        { number: '50K+', label: 'Active Readers' },
        { number: '100K+', label: 'Books Available' },
        { number: '95%', label: 'Reader Satisfaction' },
        { number: '24/7', label: 'Support Available' }
      ],
      values: [
        {
          icon: 'ri-book-open-line',
          title: 'Accessibility',
          description: 'Making reading accessible to everyone, regardless of background or ability.'
        },
        {
          icon: 'ri-lightbulb-line',
          title: 'Innovation',
          description: 'Continuously innovating to enhance the reading experience with cutting-edge technology.'
        },
        {
          icon: 'ri-heart-line',
          title: 'Community',
          description: 'Building a global community of readers who share knowledge and inspire each other.'
        },
        {
          icon: 'ri-shield-check-line',
          title: 'Quality',
          description: 'Maintaining the highest standards in content curation and platform reliability.'
        }
      ],
      story: {
        title: 'Our Story',
        description: 'ReadnWin was born from a simple observation: while technology was advancing rapidly, the way we read and access literature remained largely unchanged.',
        timeline: [
          { year: '2019', title: 'Founded', description: 'Started with a vision to democratize reading' },
          { year: '2021', title: 'Growth', description: 'Reached 10,000 active readers' },
          { year: '2023', title: 'Innovation', description: 'Launched AI-powered reading recommendations' },
          { year: '2024', title: 'Expansion', description: 'Expanded to serve readers worldwide' }
        ]
      },
      team: [
        {
          name: 'Sarah Johnson',
          role: 'CEO & Founder',
          image: '/images/team/sarah-johnson.jpg',
          bio: 'Former librarian with 15+ years in digital education',
          linkedin: '#',
          twitter: '#'
        },
        {
          name: 'Dr. Michael Chen',
          role: 'CTO',
          image: '/images/team/michael-chen.jpg',
          bio: 'AI researcher with expertise in natural language processing',
          linkedin: '#',
          twitter: '#'
        },
        {
          name: 'Emma Rodriguez',
          role: 'Head of Content',
          image: '/images/team/emma-rodriguez.jpg',
          bio: 'Former publishing executive passionate about accessibility',
          linkedin: '#',
          twitter: '#'
        },
        {
          name: 'David Wilson',
          role: 'Head of Community',
          image: '/images/team/david-wilson.jpg',
          bio: 'Community builder with experience in educational platforms',
          linkedin: '#',
          twitter: '#'
        }
      ],
      cta: {
        title: 'Join the Reading Revolution',
        description: 'Start your journey with ReadnWin and discover a world of knowledge, imagination, and growth.',
        primaryButton: 'Get Started Free',
        secondaryButton: 'Learn More'
      }
    });
  } catch (error) {
    logger.error('Error in admin about page API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await request.json();

    // Validate required fields
    if (!content.hero || !content.mission) {
      return NextResponse.json({ error: 'Missing required content sections' }, { status: 400 });
    }

    // Save content to system_settings
    try {
      await safeSystemSettingsUpdate('about_page_content', JSON.stringify(content));
    } catch (dbError) {
      logger.error('Database error saving about content:', dbError);
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
        await safeSystemSettingsUpdate('about_page_content', JSON.stringify(content));
      } catch (createError) {
        logger.error('Failed to create system_settings table:', createError);
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
          'about_page_content',
          JSON.stringify({ message: 'Updated about page content' }),
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (auditError) {
      logger.error('Audit logging failed, but content was saved:', auditError);
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
            'about_page_content',
            JSON.stringify({ message: 'Updated about page content' }),
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          ]
        );
      } catch (createAuditError) {
        logger.error('Failed to create audit_logs table:', createAuditError);
        // Don't fail the entire request if audit logging fails
      }
    }

    // Return success response with cache-busting headers and sync trigger
    return NextResponse.json({ 
      message: 'About page content saved successfully',
      timestamp: new Date().toISOString(),
      syncTrigger: true // Signal for frontend to trigger sync
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Updated': 'about-page',
        'X-Update-Timestamp': Date.now().toString()
      }
    });
  } catch (error) {
    logger.error('Error saving about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 