import { query } from './database';
import sharp from 'sharp';

export interface ImageUpload {
  filename: string;
  originalFilename: string;
  mimeType: string;
  buffer: Buffer;
  category: string;
  entityType?: string;
  entityId?: number;
  altText?: string;
  uploadedBy?: number;
}

export interface ImageVariant {
  type: string;
  width?: number;
  height?: number;
  quality?: number;
}

class ImageStorageService {
  private readonly CACHE_EXPIRY_HOURS = 24;
  private readonly MAX_CACHE_SIZE_MB = 100;

  async uploadImage(imageData: ImageUpload): Promise<number> {
    const metadata = await sharp(imageData.buffer).metadata();
    
    const result = await query(`
      INSERT INTO images (
        filename, original_filename, mime_type, file_size, width, height,
        image_data, category, entity_type, entity_id, alt_text, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      imageData.filename,
      imageData.originalFilename,
      imageData.mimeType,
      imageData.buffer.length,
      metadata.width,
      metadata.height,
      imageData.buffer,
      imageData.category,
      imageData.entityType,
      imageData.entityId,
      imageData.altText,
      imageData.uploadedBy
    ]);

    const imageId = result.rows[0].id;

    // Generate variants
    await this.generateVariants(imageId, imageData.buffer);

    return imageId;
  }

  async getImage(imageId: number): Promise<{ data: Buffer; contentType: string; filename: string } | null> {
    const cacheKey = `image_${imageId}`;
    
    // Try cache first
    const cached = await this.getCachedImage(cacheKey);
    if (cached) {
      await this.updateCacheStats('hit');
      return cached;
    }

    // Get from database
    const result = await query(`
      SELECT image_data, mime_type, filename FROM images WHERE id = $1 AND is_active = true
    `, [imageId]);

    if (result.rows.length === 0) {
      await this.updateCacheStats('miss');
      return null;
    }

    const image = result.rows[0];
    const imageData = {
      data: image.image_data,
      contentType: image.mime_type,
      filename: image.filename
    };

    // Cache the image
    await this.cacheImage(cacheKey, imageData);
    await this.updateCacheStats('miss');

    return imageData;
  }

  async getImageByFilename(filename: string, category?: string): Promise<{ data: Buffer; contentType: string; filename: string } | null> {
    const cacheKey = `filename_${filename}_${category || 'any'}`;
    
    // Try cache first
    const cached = await this.getCachedImage(cacheKey);
    if (cached) {
      await this.updateCacheStats('hit');
      return cached;
    }

    let queryStr = 'SELECT image_data, mime_type, filename FROM images WHERE filename = $1 AND is_active = true';
    const params = [filename];

    if (category) {
      queryStr += ' AND category = $2';
      params.push(category);
    }

    const result = await query(queryStr, params);

    if (result.rows.length === 0) {
      await this.updateCacheStats('miss');
      return null;
    }

    const image = result.rows[0];
    const imageData = {
      data: image.image_data,
      contentType: image.mime_type,
      filename: image.filename
    };

    // Cache the image
    await this.cacheImage(cacheKey, imageData);
    await this.updateCacheStats('miss');

    return imageData;
  }

  async getImageVariant(imageId: number, variantType: string): Promise<{ data: Buffer; contentType: string } | null> {
    const cacheKey = `variant_${imageId}_${variantType}`;
    
    // Try cache first
    const cached = await this.getCachedImage(cacheKey);
    if (cached) {
      await this.updateCacheStats('hit');
      return { data: cached.data, contentType: cached.contentType };
    }

    const result = await query(`
      SELECT iv.image_data, i.mime_type
      FROM image_variants iv
      JOIN images i ON iv.image_id = i.id
      WHERE iv.image_id = $1 AND iv.variant_type = $2 AND i.is_active = true
    `, [imageId, variantType]);

    if (result.rows.length === 0) {
      await this.updateCacheStats('miss');
      return null;
    }

    const variant = result.rows[0];
    const imageData = {
      data: variant.image_data,
      contentType: variant.mime_type,
      filename: `${imageId}_${variantType}`
    };

    // Cache the variant
    await this.cacheImage(cacheKey, imageData);
    await this.updateCacheStats('miss');

    return { data: imageData.data, contentType: imageData.contentType };
  }

  private async generateVariants(imageId: number, originalBuffer: Buffer): Promise<void> {
    const variants: ImageVariant[] = [
      { type: 'thumbnail', width: 150, height: 150 },
      { type: 'small', width: 300, height: 300 },
      { type: 'medium', width: 600, height: 600 },
      { type: 'large', width: 1200, height: 1200 }
    ];

    for (const variant of variants) {
      try {
        const processed = await sharp(originalBuffer)
          .resize(variant.width, variant.height, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: variant.quality || 85 })
          .toBuffer();

        await query(`
          INSERT INTO image_variants (image_id, variant_type, width, height, file_size, image_data)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [imageId, variant.type, variant.width, variant.height, processed.length, processed]);
      } catch (error) {
        console.error(`Failed to generate ${variant.type} variant for image ${imageId}:`, error);
      }
    }
  }

  private async getCachedImage(cacheKey: string): Promise<{ data: Buffer; contentType: string; filename: string } | null> {
    const result = await query(`
      SELECT cached_data, content_type, cache_key
      FROM image_cache 
      WHERE cache_key = $1 AND (expires_at IS NULL OR expires_at > NOW())
    `, [cacheKey]);

    if (result.rows.length === 0) {
      return null;
    }

    // Update access count and last accessed
    await query(`
      UPDATE image_cache 
      SET access_count = access_count + 1, last_accessed = NOW()
      WHERE cache_key = $1
    `, [cacheKey]);

    const cached = result.rows[0];
    return {
      data: cached.cached_data,
      contentType: cached.content_type,
      filename: cached.cache_key
    };
  }

  private async cacheImage(cacheKey: string, imageData: { data: Buffer; contentType: string; filename: string }): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.CACHE_EXPIRY_HOURS);

    await query(`
      INSERT INTO image_cache (cache_key, cached_data, content_type, cache_size, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (cache_key) DO UPDATE SET
        cached_data = EXCLUDED.cached_data,
        content_type = EXCLUDED.content_type,
        cache_size = EXCLUDED.cache_size,
        expires_at = EXCLUDED.expires_at,
        access_count = 0,
        last_accessed = NOW()
    `, [cacheKey, imageData.data, imageData.contentType, imageData.data.length, expiresAt]);

    // Clean up old cache entries if needed
    await this.cleanupCache();
  }

  private async updateCacheStats(type: 'hit' | 'miss'): Promise<void> {
    try {
      const field = type === 'hit' ? 'cache_hits' : 'cache_misses';
      
      // Ensure table exists and has data
      await query(`
        INSERT INTO cache_statistics (cache_hits, cache_misses, total_requests, cache_size_bytes)
        SELECT 0, 0, 0, 0
        WHERE NOT EXISTS (SELECT 1 FROM cache_statistics)
      `);
      
      await query(`
        UPDATE cache_statistics 
        SET ${field} = ${field} + 1, total_requests = total_requests + 1, updated_at = NOW()
      `);
    } catch (error) {
      console.error('Error updating cache stats:', error);
      // Don't throw error, just log it to avoid breaking image serving
    }
  }

  async clearCache(): Promise<{ cleared: number; sizeMB: number }> {
    try {
      // Create image_cache table if it doesn't exist
      await query(`
        CREATE TABLE IF NOT EXISTS image_cache (
          id SERIAL PRIMARY KEY,
          image_id INTEGER,
          cache_key VARCHAR(255) UNIQUE NOT NULL,
          cached_data BYTEA NOT NULL,
          content_type VARCHAR(100) NOT NULL,
          cache_size INTEGER NOT NULL,
          access_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const sizeResult = await query(`
        SELECT COALESCE(SUM(cache_size), 0) as total_size FROM image_cache
      `);
      
      const countResult = await query(`DELETE FROM image_cache RETURNING id`);
      
      const sizeMB = Math.round(sizeResult.rows[0].total_size / (1024 * 1024) * 100) / 100;
      
      // Ensure cache_statistics table exists and has data
      await query(`
        INSERT INTO cache_statistics (cache_hits, cache_misses, total_requests, cache_size_bytes)
        SELECT 0, 0, 0, 0
        WHERE NOT EXISTS (SELECT 1 FROM cache_statistics)
      `);
      
      await query(`
        UPDATE cache_statistics 
        SET cache_hits = 0, cache_misses = 0, total_requests = 0, 
            cache_size_bytes = 0, last_cleared = NOW(), updated_at = NOW()
      `);

      return {
        cleared: countResult.rows.length,
        sizeMB
      };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return {
        cleared: 0,
        sizeMB: 0
      };
    }
  }

  private async cleanupCache(): Promise<void> {
    // Remove expired entries
    await query(`DELETE FROM image_cache WHERE expires_at < NOW()`);

    // Check total cache size
    const sizeResult = await query(`
      SELECT COALESCE(SUM(cache_size), 0) as total_size FROM image_cache
    `);
    
    const totalSizeMB = sizeResult.rows[0].total_size / (1024 * 1024);
    
    if (totalSizeMB > this.MAX_CACHE_SIZE_MB) {
      // Remove least recently accessed entries
      await query(`
        DELETE FROM image_cache 
        WHERE id IN (
          SELECT id FROM image_cache 
          ORDER BY last_accessed ASC 
          LIMIT (SELECT COUNT(*) / 4 FROM image_cache)
        )
      `);
    }
  }

  async getCacheStats(): Promise<any> {
    try {
      // First ensure cache_statistics table exists and has data
      await query(`
        CREATE TABLE IF NOT EXISTS cache_statistics (
          id SERIAL PRIMARY KEY,
          cache_hits INTEGER DEFAULT 0,
          cache_misses INTEGER DEFAULT 0,
          total_requests INTEGER DEFAULT 0,
          cache_size_bytes BIGINT DEFAULT 0,
          last_cleared TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert initial record if none exists
      await query(`
        INSERT INTO cache_statistics (cache_hits, cache_misses, total_requests, cache_size_bytes)
        SELECT 0, 0, 0, 0
        WHERE NOT EXISTS (SELECT 1 FROM cache_statistics)
      `);

      const result = await query(`
        SELECT 
          cache_hits,
          cache_misses,
          total_requests,
          CASE WHEN total_requests > 0 THEN ROUND((cache_hits::float / total_requests * 100), 2) ELSE 0 END as hit_rate,
          cache_size_bytes,
          ROUND(cache_size_bytes / (1024.0 * 1024.0), 2) as cache_size_mb,
          last_cleared,
          (SELECT COUNT(*) FROM image_cache WHERE image_cache.id IS NOT NULL) as cached_items,
          (SELECT COUNT(*) FROM images WHERE images.id IS NOT NULL) as total_images
        FROM cache_statistics
        LIMIT 1
      `);

      return result.rows[0] || {
        cache_hits: 0,
        cache_misses: 0,
        total_requests: 0,
        hit_rate: 0,
        cache_size_bytes: 0,
        cache_size_mb: 0,
        last_cleared: null,
        cached_items: 0,
        total_images: 0
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      // Return default stats if there's an error
      return {
        cache_hits: 0,
        cache_misses: 0,
        total_requests: 0,
        hit_rate: 0,
        cache_size_bytes: 0,
        cache_size_mb: 0,
        last_cleared: null,
        cached_items: 0,
        total_images: 0
      };
    }
  }

  async deleteImage(imageId: number): Promise<boolean> {
    const result = await query(`
      UPDATE images SET is_active = false WHERE id = $1 RETURNING id
    `, [imageId]);

    if (result.rows.length > 0) {
      // Remove from cache
      await query(`
        DELETE FROM image_cache 
        WHERE cache_key LIKE $1 OR cache_key LIKE $2
      `, [`image_${imageId}`, `variant_${imageId}_%`]);
      
      return true;
    }
    
    return false;
  }
}

export const imageStorageService = new ImageStorageService();