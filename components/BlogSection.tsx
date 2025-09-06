
'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_name: string;
  status: string;
  featured: boolean;
  category: string;
  tags: string[];
  read_time: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  images?: any[];
}

export default function BlogSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch recent published posts with images
      const response = await fetch('/api/blog?limit=6&include_images=true');
      const data = await response.json();
      
      if (data.success) {
        setBlogPosts(data.posts);
      } else {
        setError(data.error || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Error loading blog posts');
    } finally {
      setLoading(false);
    }
  };

  const scrollToNext = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8; // Scroll 80% of container width
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToPrev = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'technology': '#3B82F6',
      'self-improvement': '#10B981', 
      'literature': '#8B5CF6',
      'psychology': '#F59E0B',
      'reviews': '#EF4444',
      'reading-tips': '#06B6D4',
      'author-interviews': '#84CC16',
      'industry-news': '#6366F1',
      'general': '#6B7280'
    };
    return colors[category] || '#3B82F6';
  };

  const getCategoryDisplayName = (category: string) => {
    const names: { [key: string]: string } = {
      'technology': 'Technology',
      'self-improvement': 'Self-Improvement',
      'literature': 'Literature', 
      'psychology': 'Psychology',
      'reviews': 'Reviews',
      'reading-tips': 'Reading Tips',
      'author-interviews': 'Author Interviews',
      'industry-news': 'Industry News',
      'general': 'General'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  };

  const getUniqueImageForPost = (category: string, postId: number) => {
    const categoryImages: { [key: string]: string } = {
      'reading-tips': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format',
      'technology': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=400&fit=crop&auto=format',
      'self-improvement': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&auto=format',
      'psychology': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop&auto=format',
      'literature': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&auto=format',
      'general': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&auto=format'
    };
    return categoryImages[category] || `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&auto=format&sig=${postId}`;
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Reading Insights & Stories
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends, tips, and insights from the world of reading. 
            Our blog covers everything from book recommendations to reading psychology.
          </p>
        </div>
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollToPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
            aria-label="Previous articles"
          >
            <i className="ri-arrow-left-s-line text-2xl text-gray-700"></i>
          </button>
          
          <button
            onClick={scrollToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
            aria-label="Next articles"
          >
            <i className="ri-arrow-right-s-line text-2xl text-gray-700"></i>
          </button>
          
          {/* Blog Posts Carousel */}
          {loading ? (
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80 md:w-96">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse min-h-[520px]">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-6 flex flex-col h-[272px]">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="flex justify-between mt-auto">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load blog posts</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchBlogPosts}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                <i className="ri-refresh-line"></i>
                <span>Try Again</span>
              </button>
            </div>
          ) : blogPosts.length > 0 ? (
            <div 
              ref={carouselRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group cursor-pointer flex-shrink-0 w-80 md:w-96">
                  <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full min-h-[520px] flex flex-col">
                    <div className="relative">
                      <img
                        src={(post.images && post.images.length > 0) ? post.images[0].file_path : getUniqueImageForPost(post.category, post.id)}
                        alt={post.images && post.images.length > 0 ? post.images[0].alt_text || post.title : post.title}
                        className="w-full h-48 object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getUniqueImageForPost(post.category, post.id);
                        }}
                      />
                      <div 
                        className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: getCategoryColor(post.category) }}
                      >
                        {getCategoryDisplayName(post.category)}
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base flex-1">
                        {post.excerpt || 'Read this insightful article about reading and literature.'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-2">
                          <i className="ri-user-line"></i>
                          <span className="text-xs md:text-sm">{post.author_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="ri-time-line"></i>
                          <span className="text-xs md:text-sm">{post.read_time} min read</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs md:text-sm text-gray-500">
                          {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at || '')}
                        </span>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <i className="ri-eye-line"></i>
                            <span>{post.views_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <i className="ri-heart-line"></i>
                            <span>{post.likes_count}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors text-sm md:text-base">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-article-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No blog posts available</h3>
              <p className="text-gray-600">Check back soon for new articles and insights.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 cursor-pointer whitespace-nowrap text-sm md:text-base"
          >
            <span>View All Articles</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
      
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
