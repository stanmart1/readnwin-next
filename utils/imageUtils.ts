// Utility functions for handling book cover images

export const getBookCoverImage = (bookId: string, title: string): string => {
  // Use a reliable placeholder service with consistent images
  const seed = bookId.charCodeAt(0) + bookId.charCodeAt(bookId.length - 1);
  return `https://picsum.photos/seed/${seed}/400/600`;
};

export const getBookCoverFallback = (bookId: string): string => {
  // Fallback to a simple colored background with book number
  return `https://dummyimage.com/400x600/4F46E5/FFFFFF&text=Book+${bookId}`;
};

// Generate consistent book cover URLs for all books
export const bookCoverImages = {
  '1': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  '2': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
  '3': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  '4': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
  '5': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  '6': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
  '7': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
  '8': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
  '9': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop',
  '10': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&blur=1',
  '11': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&blur=1',
  '12': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&blur=1',
  '13': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop&blur=1',
  '14': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop&blur=1',
  '15': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop&blur=1',
  '16': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&blur=1',
};

// Featured books specific images
export const featuredBookImages = {
  '1': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  '2': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
  '3': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  '4': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
  '5': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  '6': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
  '7': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
  '8': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
  '9': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop',
  '10': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&blur=1',
  '11': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&blur=1',
  '12': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&blur=1',
  '13': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop&blur=1',
  '14': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop&blur=1',
  '15': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop&blur=1',
  '16': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&blur=1',
};

// Blog post images - using reliable Picsum Photos with consistent seeds
export const blogPostImages = {
  '1': 'https://picsum.photos/seed/blog-tech-future/400/250',
  '2': 'https://picsum.photos/seed/blog-reading-habits/400/250',
  '3': 'https://picsum.photos/seed/blog-author-spotlight/400/250',
  '4': 'https://picsum.photos/seed/blog-psychology-reading/400/250',
  '5': 'https://picsum.photos/seed/blog-hidden-gems/400/250',
  '6': 'https://picsum.photos/seed/blog-digital-physical/400/250',
  '7': 'https://picsum.photos/seed/blog-audiobooks/400/250',
  '8': 'https://picsum.photos/seed/blog-mental-health/400/250',
  '9': 'https://picsum.photos/seed/blog-author-interview/400/250',
};

// Author avatars - using reliable Picsum Photos with consistent seeds
export const authorAvatars = {
  'sarah-johnson': 'https://picsum.photos/seed/author-sarah/40/40',
  'michael-chen': 'https://picsum.photos/seed/author-michael/40/40',
  'emma-rodriguez': 'https://picsum.photos/seed/author-emma/40/40',
  'david-wilson': 'https://picsum.photos/seed/author-david/40/40',
  'lisa-thompson': 'https://picsum.photos/seed/author-lisa/40/40',
  'mark-anderson': 'https://picsum.photos/seed/author-mark/40/40',
  'jennifer-park': 'https://picsum.photos/seed/author-jennifer/40/40',
  'amanda-foster': 'https://picsum.photos/seed/author-amanda/40/40',
  'robert-kim': 'https://picsum.photos/seed/author-robert/40/40',
};

// Fallback images for when external images fail
export const getBlogPostImage = (postId: string): string => {
  return blogPostImages[postId as keyof typeof blogPostImages] || 
         `https://picsum.photos/seed/blog-${postId}/400/250`;
};

export const getAuthorAvatar = (authorKey: string): string => {
  return authorAvatars[authorKey as keyof typeof authorAvatars] || 
         `https://picsum.photos/seed/author-${authorKey}/40/40`;
}; 