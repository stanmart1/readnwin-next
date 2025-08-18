import { query } from './database';

export interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_id?: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  category: string;
  tags: string[];
  read_time: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BlogCategory {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at?: string;
}

export interface BlogImage {
  id?: number;
  post_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  caption?: string;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
}

export interface BlogComment {
  id?: number;
  post_id: number;
  user_id?: number;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

class BlogService {
  // Get all blog posts with filters
  async getPosts(filters: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
    author_id?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    try {
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (filters.status) {
        whereConditions.push(`status = $${paramIndex++}`);
        params.push(filters.status);
      }

      if (filters.category) {
        whereConditions.push(`category = $${paramIndex++}`);
        params.push(filters.category);
      }

      if (filters.featured !== undefined) {
        whereConditions.push(`featured = $${paramIndex++}`);
        params.push(filters.featured);
      }

      if (filters.author_id) {
        whereConditions.push(`author_id = $${paramIndex++}`);
        params.push(filters.author_id);
      }

      if (filters.search) {
        whereConditions.push(`(title ILIKE $${paramIndex++} OR excerpt ILIKE $${paramIndex++} OR content ILIKE $${paramIndex++})`);
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
      const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

      if (filters.limit) params.push(filters.limit);
      if (filters.offset) params.push(filters.offset);

      const result = await query(
        `SELECT * FROM blog_posts ${whereClause} ORDER BY created_at DESC ${limitClause} ${offsetClause}`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  // Get published posts for public display
  async getPublishedPosts(filters: {
    category?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    return this.getPosts({
      ...filters,
      status: 'published'
    });
  }

  // Get post by ID
  async getPostById(id: number): Promise<BlogPost | null> {
    try {
      const result = await query(
        'SELECT * FROM blog_posts WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching blog post by ID:', error);
      throw error;
    }
  }

  // Get post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const result = await query(
        'SELECT * FROM blog_posts WHERE slug = $1',
        [slug]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      throw error;
    }
  }

  // Create new blog post
  async createPost(post: BlogPost): Promise<BlogPost> {
    try {
      const result = await query(
        `INSERT INTO blog_posts (
          title, slug, excerpt, content, author_id, author_name, status, featured,
          category, tags, read_time, seo_title, seo_description, seo_keywords
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        RETURNING *`,
        [
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.author_id,
          post.author_name,
          post.status,
          post.featured,
          post.category,
          post.tags,
          post.read_time,
          post.seo_title,
          post.seo_description,
          post.seo_keywords
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  // Update blog post
  async updatePost(id: number, post: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (post.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(post.title);
      }

      if (post.slug !== undefined) {
        fields.push(`slug = $${paramIndex++}`);
        values.push(post.slug);
      }

      if (post.excerpt !== undefined) {
        fields.push(`excerpt = $${paramIndex++}`);
        values.push(post.excerpt);
      }

      if (post.content !== undefined) {
        fields.push(`content = $${paramIndex++}`);
        values.push(post.content);
      }

      if (post.author_name !== undefined) {
        fields.push(`author_name = $${paramIndex++}`);
        values.push(post.author_name);
      }

      if (post.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(post.status);
        
        // Set published_at when status changes to published
        if (post.status === 'published') {
          fields.push(`published_at = CURRENT_TIMESTAMP`);
        }
      }

      if (post.featured !== undefined) {
        fields.push(`featured = $${paramIndex++}`);
        values.push(post.featured);
      }

      if (post.category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(post.category);
      }

      if (post.tags !== undefined) {
        fields.push(`tags = $${paramIndex++}`);
        values.push(post.tags);
      }

      if (post.read_time !== undefined) {
        fields.push(`read_time = $${paramIndex++}`);
        values.push(post.read_time);
      }

      if (post.seo_title !== undefined) {
        fields.push(`seo_title = $${paramIndex++}`);
        values.push(post.seo_title);
      }

      if (post.seo_description !== undefined) {
        fields.push(`seo_description = $${paramIndex++}`);
        values.push(post.seo_description);
      }

      if (post.seo_keywords !== undefined) {
        fields.push(`seo_keywords = $${paramIndex++}`);
        values.push(post.seo_keywords);
      }

      if (fields.length === 0) {
        return this.getPostById(id);
      }

      values.push(id);
      const result = await query(
        `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  // Delete blog post
  async deletePost(id: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM blog_posts WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViewCount(id: number, userId?: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Update view count
      await query(
        'UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1',
        [id]
      );

      // Log view
      await query(
        `INSERT INTO blog_views (post_id, user_id, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4)`,
        [id, userId, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }

  // Toggle like
  async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likes_count: number }> {
    try {
      // Check if already liked
      const existingLike = await query(
        'SELECT id FROM blog_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      if (existingLike.rows.length > 0) {
        // Unlike
        await query(
          'DELETE FROM blog_likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
      } else {
        // Like
        await query(
          'INSERT INTO blog_likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
      }

      // Get updated like count
      const result = await query(
        'SELECT likes_count FROM blog_posts WHERE id = $1',
        [postId]
      );

      return {
        liked: existingLike.rows.length === 0,
        likes_count: result.rows[0]?.likes_count || 0
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const result = await query(
        'SELECT * FROM blog_categories WHERE is_active = true ORDER BY name'
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  // Get post images
  async getPostImages(postId: number): Promise<BlogImage[]> {
    try {
      const result = await query(
        'SELECT * FROM blog_images WHERE post_id = $1 ORDER BY sort_order, created_at',
        [postId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching post images:', error);
      throw error;
    }
  }

  // Add image to post
  async addImage(image: BlogImage): Promise<BlogImage> {
    try {
      const result = await query(
        `INSERT INTO blog_images (
          post_id, filename, original_name, file_path, file_size, mime_type,
          alt_text, caption, is_featured, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          image.post_id,
          image.filename,
          image.original_name,
          image.file_path,
          image.file_size,
          image.mime_type,
          image.alt_text,
          image.caption,
          image.is_featured,
          image.sort_order
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }

  // Delete image
  async deleteImage(imageId: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM blog_images WHERE id = $1',
        [imageId]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Get comments
  async getComments(postId: number, status: string = 'approved'): Promise<BlogComment[]> {
    try {
      const result = await query(
        'SELECT * FROM blog_comments WHERE post_id = $1 AND status = $2 ORDER BY created_at DESC',
        [postId, status]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Add comment
  async addComment(comment: BlogComment): Promise<BlogComment> {
    try {
      const result = await query(
        `INSERT INTO blog_comments (
          post_id, user_id, author_name, author_email, content, status, parent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          comment.post_id,
          comment.user_id,
          comment.author_name,
          comment.author_email,
          comment.content,
          comment.status,
          comment.parent_id
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Update comment status
  async updateCommentStatus(commentId: number, status: string): Promise<BlogComment | null> {
    try {
      const result = await query(
        'UPDATE blog_comments SET status = $1 WHERE id = $2 RETURNING *',
        [status, commentId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  }

  // Get blog statistics
  async getBlogStats(): Promise<{
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    by_category: Record<string, number>;
  }> {
    try {
      const totalPosts = await query('SELECT COUNT(*) as count FROM blog_posts');
      const publishedPosts = await query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'");
      const draftPosts = await query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'draft'");
      const totalViews = await query('SELECT SUM(views_count) as count FROM blog_posts');
      const totalLikes = await query('SELECT SUM(likes_count) as count FROM blog_posts');
      const totalComments = await query('SELECT SUM(comments_count) as count FROM blog_posts');
      const byCategory = await query(`
        SELECT category, COUNT(*) as count 
        FROM blog_posts 
        WHERE status = 'published' 
        GROUP BY category
      `);

      const categoryMap: Record<string, number> = {};
      byCategory.rows.forEach(row => {
        categoryMap[row.category] = parseInt(row.count);
      });

      return {
        total_posts: parseInt(totalPosts.rows[0].count),
        published_posts: parseInt(publishedPosts.rows[0].count),
        draft_posts: parseInt(draftPosts.rows[0].count),
        total_views: parseInt(totalViews.rows[0].count) || 0,
        total_likes: parseInt(totalLikes.rows[0].count) || 0,
        total_comments: parseInt(totalComments.rows[0].count) || 0,
        by_category: categoryMap
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  }

  // Generate slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Calculate read time from content
  calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export const blogService = new BlogService(); 