import { NextRequest, NextResponse } from 'next/server';
import { safeSystemSettingsQuery } from '@/utils/safe-query';

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get about page content from system_settings using safe query
    const result = await safeSystemSettingsQuery('about_page_content');
    
    console.log('About API called at:', new Date().toISOString());
    console.log('Query result:', result);

    if (result.success && result.value) {
      try {
        const content = JSON.parse(result.value);
        // Ensure missionGrid exists, add default if missing
        if (!content.missionGrid) {
          content.missionGrid = [
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
          ];
        }
        // Add timestamp and version for cache busting and sync verification
        const contentWithTimestamp = {
          ...content,
          _lastUpdated: new Date().toISOString(),
          _version: Date.now(),
          _syncId: `about-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        return NextResponse.json(contentWithTimestamp, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString()
          }
        });
      } catch (parseError) {
        console.error('Error parsing about page content:', parseError);
        // Return default content if parsing fails
      }
    } else {
      console.log('About page content not found or error:', result.error);
    }

    // Return default content if not found or on error
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
      cta: {
        title: 'Join the Reading Revolution',
        description: 'Start your journey with ReadnWin and discover a world of knowledge, imagination, and growth.',
        primaryButton: 'Get Started Free',
        secondaryButton: 'Learn More'
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
      contact: {
        title: 'Get in Touch',
        description: 'Have questions or suggestions? We\'d love to hear from you.',
        email: 'hello@readnwin.com',
        phone: '+1 (555) 123-4567',
        address: '123 Reading Street, Book City, BC 12345'
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in about page API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 