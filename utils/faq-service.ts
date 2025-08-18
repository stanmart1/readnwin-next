// FAQ Service Layer
// ReadnWin Next.js Application

import { Pool } from 'pg';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  priority: number;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface FAQWithCategory extends FAQ {
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

interface FAQSearchParams {
  query?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface FAQSearchResponse {
  faqs: FAQWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class FAQService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: false,
    });
  }

  async getAllFAQs(params: FAQSearchParams = {}): Promise<FAQSearchResponse> {
    const client = await this.pool.connect();
    try {
      const {
        query = '',
        category = '',
        featured = false,
        limit = 20,
        offset = 0,
        sortBy = 'priority',
        sortOrder = 'desc'
      } = params;

      let whereConditions = ['f.is_active = true'];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (query.trim()) {
        whereConditions.push(`(f.question ILIKE $${paramIndex} OR f.answer ILIKE $${paramIndex})`);
        queryParams.push(`%${query}%`);
        paramIndex++;
      }

      if (category) {
        whereConditions.push(`f.category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }

      if (featured) {
        whereConditions.push('f.is_featured = true');
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const orderClause = `ORDER BY f.${sortBy} ${sortOrder.toUpperCase()}`;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM faqs f
        LEFT JOIN faq_categories fc ON f.category = fc.name
        ${whereClause}
      `;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      const dataQuery = `
        SELECT 
          f.id,
          f.question,
          f.answer,
          f.category,
          f.priority,
          f.is_active,
          f.is_featured,
          f.view_count,
          f.created_at,
          f.updated_at,
          fc.name as category_name,
          fc.icon as category_icon,
          fc.color as category_color
        FROM faqs f
        LEFT JOIN faq_categories fc ON f.category = fc.name
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);
      
      const dataResult = await client.query(dataQuery, queryParams);
      const faqs = dataResult.rows as FAQWithCategory[];

      return {
        faqs,
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } finally {
      client.release();
    }
  }

  async createFAQ(data: any, userId: number): Promise<FAQ> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO faqs (question, answer, category, priority, is_active, is_featured, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        data.question,
        data.answer,
        data.category,
        data.priority || 0,
        data.is_active !== false,
        data.is_featured || false,
        userId
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getFeaturedFAQs(limit: number = 5): Promise<FAQWithCategory[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT 
          f.id,
          f.question,
          f.answer,
          f.category,
          f.priority,
          f.is_active,
          f.is_featured,
          f.view_count,
          f.created_at,
          f.updated_at,
          fc.name as category_name,
          fc.icon as category_icon,
          fc.color as category_color
        FROM faqs f
        LEFT JOIN faq_categories fc ON f.category = fc.name
        WHERE f.is_active = true AND f.is_featured = true
        ORDER BY f.priority DESC, f.created_at DESC
        LIMIT $1
      `;
      
      const result = await client.query(query, [limit]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getFAQById(id: number): Promise<FAQWithCategory | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT 
          f.id,
          f.question,
          f.answer,
          f.category,
          f.priority,
          f.is_active,
          f.is_featured,
          f.view_count,
          f.created_at,
          f.updated_at,
          fc.name as category_name,
          fc.icon as category_icon,
          fc.color as category_color
        FROM faqs f
        LEFT JOIN faq_categories fc ON f.category = fc.name
        WHERE f.id = $1
      `;
      
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateFAQ(id: number, data: any, userId: number): Promise<FAQ> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE faqs 
        SET 
          question = $1,
          answer = $2,
          category = $3,
          priority = $4,
          is_active = $5,
          is_featured = $6,
          updated_by = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      
      const values = [
        data.question,
        data.answer,
        data.category,
        data.priority || 0,
        data.is_active !== undefined ? data.is_active : true,
        data.is_featured !== undefined ? data.is_featured : false,
        userId,
        id
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteFAQ(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM faqs WHERE id = $1';
      const result = await client.query(query, [id]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async bulkDeleteFAQs(ids: number[]): Promise<number> {
    const client = await this.pool.connect();
    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
      const query = `DELETE FROM faqs WHERE id IN (${placeholders})`;
      const result = await client.query(query, ids);
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }

  async bulkUpdateFAQs(ids: number[], updates: any): Promise<number> {
    const client = await this.pool.connect();
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic SET clause
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      // Add updated_at
      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add IDs to values
      ids.forEach(id => {
        values.push(id);
      });

      const placeholders = ids.map((_, index) => `$${paramIndex + index}`).join(',');
      const query = `
        UPDATE faqs 
        SET ${setClauses.join(', ')}
        WHERE id IN (${placeholders})
      `;

      const result = await client.query(query, values);
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }
}

export const faqService = new FAQService(); 