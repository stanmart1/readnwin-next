import { query } from './database';

export interface EmailTemplate {
  id?: number;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content?: string;
  description?: string;
  variables?: Record<string, any>;
  is_active: boolean;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplateVariable {
  id?: number;
  template_id: number;
  variable_name: string;
  variable_type: string;
  description?: string;
  is_required: boolean;
  default_value?: string;
}

export interface EmailTemplateCategory {
  id?: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface EmailFunction {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  required_variables: string[];
  is_active: boolean;
  created_at?: string;
}

export interface EmailFunctionAssignment {
  id?: number;
  function_id: number;
  template_id: number;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
  // Joined data
  function_name?: string;
  function_slug?: string;
  template_name?: string;
  template_slug?: string;
}

class EmailTemplateService {
  // Get all email templates
  async getTemplates(filters: {
    category?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<EmailTemplate[]> {
    try {
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (filters.category) {
        whereConditions.push(`category = $${paramIndex++}`);
        params.push(filters.category);
      }

      if (filters.is_active !== undefined) {
        whereConditions.push(`is_active = $${paramIndex++}`);
        params.push(filters.is_active);
      }

      if (filters.search) {
        whereConditions.push(`(name ILIKE $${paramIndex++} OR subject ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`);
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await query(
        `SELECT * FROM email_templates ${whereClause} ORDER BY name ASC`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplateById(id: number): Promise<EmailTemplate | null> {
    try {
      const result = await query(
        'SELECT * FROM email_templates WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching email template by ID:', error);
      throw error;
    }
  }

  // Get template by slug
  async getTemplateBySlug(slug: string): Promise<EmailTemplate | null> {
    try {
      const result = await query(
        'SELECT * FROM email_templates WHERE slug = $1',
        [slug]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching email template by slug:', error);
      throw error;
    }
  }

  // Create new template
  async createTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    try {
      const result = await query(
        `INSERT INTO email_templates (
          name, slug, subject, html_content, text_content, 
          description, variables, is_active, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
          template.name,
          template.slug,
          template.subject,
          template.html_content,
          template.text_content,
          template.description,
          JSON.stringify(template.variables || {}),
          template.is_active,
          template.category
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  // Update template
  async updateTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (template.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(template.name);
      }

      if (template.slug !== undefined) {
        fields.push(`slug = $${paramIndex++}`);
        values.push(template.slug);
      }

      if (template.subject !== undefined) {
        fields.push(`subject = $${paramIndex++}`);
        values.push(template.subject);
      }

      if (template.html_content !== undefined) {
        fields.push(`html_content = $${paramIndex++}`);
        values.push(template.html_content);
      }

      if (template.text_content !== undefined) {
        fields.push(`text_content = $${paramIndex++}`);
        values.push(template.text_content);
      }

      if (template.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(template.description);
      }

      if (template.variables !== undefined) {
        fields.push(`variables = $${paramIndex++}`);
        values.push(JSON.stringify(template.variables));
      }

      if (template.is_active !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        values.push(template.is_active);
      }

      if (template.category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(template.category);
      }

      if (fields.length === 0) {
        return this.getTemplateById(id);
      }

      values.push(id);
      const result = await query(
        `UPDATE email_templates SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM email_templates WHERE id = $1',
        [id]
      );

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  // Get template variables
  async getTemplateVariables(templateId: number): Promise<EmailTemplateVariable[]> {
    try {
      const result = await query(
        'SELECT * FROM email_template_variables WHERE template_id = $1 ORDER BY variable_name',
        [templateId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching template variables:', error);
      throw error;
    }
  }

  // Add template variable
  async addTemplateVariable(variable: EmailTemplateVariable): Promise<EmailTemplateVariable> {
    try {
      const result = await query(
        `INSERT INTO email_template_variables (
          template_id, variable_name, variable_type, description, is_required, default_value
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          variable.template_id,
          variable.variable_name,
          variable.variable_type,
          variable.description,
          variable.is_required,
          variable.default_value
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding template variable:', error);
      throw error;
    }
  }

  // Get template categories
  async getCategories(): Promise<EmailTemplateCategory[]> {
    try {
      const result = await query(
        'SELECT * FROM email_template_categories ORDER BY name'
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }
  }

  // Render template with variables
  async renderTemplate(slug: string, variables: Record<string, any>): Promise<{
    subject: string;
    html: string;
    text?: string;
  } | null> {
    try {
      const template = await this.getTemplateBySlug(slug);
      if (!template || !template.is_active) {
        return null;
      }

      let subject = template.subject;
      let html = template.html_content;
      let text = template.text_content;

      // Replace variables in subject, html, and text
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
        html = html.replace(new RegExp(placeholder, 'g'), String(value));
        if (text) {
          text = text.replace(new RegExp(placeholder, 'g'), String(value));
        }
      });

      return { subject, html, text };
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw error;
    }
  }

  // Get template statistics
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const totalResult = await query('SELECT COUNT(*) as total FROM email_templates');
      const activeResult = await query('SELECT COUNT(*) as active FROM email_templates WHERE is_active = true');
      const categoryResult = await query(
        'SELECT category, COUNT(*) as count FROM email_templates GROUP BY category'
      );

      const byCategory: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        byCategory[row.category] = parseInt(row.count);
      });

      return {
        total: parseInt(totalResult.rows[0].total),
        active: parseInt(activeResult.rows[0].active),
        byCategory
      };
    } catch (error) {
      console.error('Error fetching template statistics:', error);
      throw error;
    }
  }

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = [
        {
          name: 'Welcome Email',
          slug: 'welcome',
          subject: 'Welcome to ReadnWin! 📚',
          category: 'authentication',
          description: 'Sent to new users when they register',
          variables: { userName: 'string', userEmail: 'string' }
        },
        {
          name: 'Password Reset',
          slug: 'password-reset',
          subject: 'Reset Your ReadnWin Password 🔐',
          category: 'authentication',
          description: 'Sent when users request password reset',
          variables: { userName: 'string', resetToken: 'string', resetUrl: 'string' }
        },
        {
          name: 'Order Confirmation',
          slug: 'order-confirmation',
          subject: 'Order Confirmed - Thank You for Your Purchase! 📦',
          category: 'orders',
          description: 'Sent when an order is confirmed',
          variables: { userName: 'string', orderNumber: 'string', orderTotal: 'string', orderItems: 'array' }
        },
        {
          name: 'Order Shipped',
          slug: 'order-shipped',
          subject: 'Your Order Has Been Shipped! 🚚',
          category: 'orders',
          description: 'Sent when an order is shipped',
          variables: { userName: 'string', orderNumber: 'string', trackingNumber: 'string', estimatedDelivery: 'string' }
        },
        {
          name: 'Account Verification',
          slug: 'account-verification',
          subject: 'Verify Your ReadnWin Account ✉️',
          category: 'authentication',
          description: 'Sent to verify user email address',
          variables: { userName: 'string', verificationToken: 'string', verificationUrl: 'string' }
        },
        {
          name: 'Email Confirmation',
          slug: 'email-confirmation',
          subject: 'Email Confirmed! Welcome to ReadnWin 🎉',
          category: 'authentication',
          description: 'Sent after successful email verification',
          variables: { userName: 'string' }
        },
        {
          name: 'Reading Reminder',
          slug: 'reading-reminder',
          subject: 'Time to Read! 📖 Your Daily Reading Reminder',
          category: 'notifications',
          description: 'Daily reading reminder for users',
          variables: { userName: 'string', readingGoal: 'string', progress: 'string', recommendedBooks: 'array' }
        },
        {
          name: 'New Book Available',
          slug: 'new-book-available',
          subject: 'New Book Alert! 📚 {{bookTitle}} is Now Available',
          category: 'marketing',
          description: 'Sent when new books are added to the library',
          variables: { userName: 'string', bookTitle: 'string', authorName: 'string', bookUrl: 'string' }
        },
        {
          name: 'Reading Achievement',
          slug: 'reading-achievement',
          subject: 'Congratulations! 🏆 You\'ve Earned a Reading Achievement',
          category: 'notifications',
          description: 'Sent when users earn reading achievements',
          variables: { userName: 'string', achievementName: 'string', achievementDescription: 'string', points: 'number' }
        },
        {
          name: 'Subscription Expiry',
          slug: 'subscription-expiry',
          subject: 'Your ReadnWin Subscription is Expiring Soon ⏰',
          category: 'notifications',
          description: 'Sent before subscription expires',
          variables: { userName: 'string', expiryDate: 'string', renewalUrl: 'string' }
        },
        {
          name: 'Support Ticket Update',
          slug: 'support-ticket-update',
          subject: 'Update on Your Support Ticket #{{ticketNumber}}',
          category: 'support',
          description: 'Sent when support ticket status changes',
          variables: { userName: 'string', ticketNumber: 'string', status: 'string', message: 'string' }
        }
      ];

      for (const template of defaultTemplates) {
        const existing = await this.getTemplateBySlug(template.slug);
        if (!existing) {
          // Create template with default content
          const htmlContent = this.getDefaultTemplateHTML(template.slug, template.name);
          const textContent = this.getDefaultTemplateText(template.slug, template.name);
          
          await this.createTemplate({
            ...template,
            html_content: htmlContent,
            text_content: textContent,
            is_active: true
          });
        }
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    }
  }

  // Get default HTML template
  private getDefaultTemplateHTML(slug: string, name: string): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${name}</title>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; }
          .content { background: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ReadnWin 📚</h1>
            <p>Your Digital Reading Companion</p>
          </div>
          <div class="content">
            <h2>Hello {{userName}}! 👋</h2>
            <p>This is a default template for ${name}. Please customize this template in the admin dashboard.</p>
            <div class="highlight">
              <strong>Template Variables Available:</strong>
              <ul>
                <li>userName - User's display name</li>
                <li>userEmail - User's email address</li>
                <li>And more specific to this template...</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/dashboard" class="button">Visit Dashboard</a>
            </div>
            <p>Best regards,<br>The ReadnWin Team</p>
          </div>
          <div class="footer">
            <p>© 2025 ReadnWin. All rights reserved.</p>
            <p>This email was sent from ReadnWin.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  // Get default text template
  private getDefaultTemplateText(slug: string, name: string): string {
    return `
      ReadnWin - ${name}
      
      Hello {{userName}}! 👋
      
      This is a default template for ${name}. Please customize this template in the admin dashboard.
      
      Template Variables Available:
      - userName - User's display name
      - userEmail - User's email address
      - And more specific to this template...
      
      Visit Dashboard: ${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/dashboard
      
      Best regards,
      The ReadnWin Team
      
      © 2025 ReadnWin. All rights reserved.
    `;
  }

  // Email Functions Methods
  async getEmailFunctions(filters: {
    category?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<EmailFunction[]> {
    try {
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (filters.category) {
        whereConditions.push(`category = $${paramIndex++}`);
        params.push(filters.category);
      }

      if (filters.is_active !== undefined) {
        whereConditions.push(`is_active = $${paramIndex++}`);
        params.push(filters.is_active);
      }

      if (filters.search) {
        whereConditions.push(`(name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`);
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const result = await query(
        `SELECT * FROM email_functions ${whereClause} ORDER BY name ASC`,
        params
      );

      return result.rows.map(row => ({
        ...row,
        required_variables: row.required_variables || []
      }));
    } catch (error) {
      console.error('Error fetching email functions:', error);
      throw error;
    }
  }

  async getEmailFunctionBySlug(slug: string): Promise<EmailFunction | null> {
    try {
      const result = await query(
        'SELECT * FROM email_functions WHERE slug = $1',
        [slug]
      );

      if (result.rows[0]) {
        return {
          ...result.rows[0],
          required_variables: result.rows[0].required_variables || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching email function by slug:', error);
      throw error;
    }
  }

  // Email Function Assignments Methods
  async getFunctionAssignments(functionId?: number): Promise<EmailFunctionAssignment[]> {
    try {
      let queryStr = `
        SELECT 
          efa.*,
          ef.name as function_name,
          ef.slug as function_slug,
          et.name as template_name,
          et.slug as template_slug
        FROM email_function_assignments efa
        JOIN email_functions ef ON efa.function_id = ef.id
        JOIN email_templates et ON efa.template_id = et.id
      `;
      
      let params = [];
      
      if (functionId) {
        queryStr += ' WHERE efa.function_id = $1';
        params.push(functionId);
      }
      
      queryStr += ' ORDER BY efa.priority ASC, efa.created_at ASC';
      
      const result = await query(queryStr, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching function assignments:', error);
      throw error;
    }
  }

  async assignTemplateToFunction(functionId: number, templateId: number, priority: number = 1): Promise<EmailFunctionAssignment> {
    try {
      const result = await query(
        `INSERT INTO email_function_assignments (function_id, template_id, priority)
         VALUES ($1, $2, $3)
         ON CONFLICT (function_id, template_id) 
         DO UPDATE SET priority = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [functionId, templateId, priority]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error assigning template to function:', error);
      throw error;
    }
  }

  async unassignTemplateFromFunction(functionId: number, templateId: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM email_function_assignments WHERE function_id = $1 AND template_id = $2',
        [functionId, templateId]
      );

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error unassigning template from function:', error);
      throw error;
    }
  }

  async updateAssignmentPriority(assignmentId: number, priority: number): Promise<EmailFunctionAssignment | null> {
    try {
      const result = await query(
        'UPDATE email_function_assignments SET priority = $1 WHERE id = $2 RETURNING *',
        [priority, assignmentId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating assignment priority:', error);
      throw error;
    }
  }

  async toggleAssignmentStatus(assignmentId: number): Promise<EmailFunctionAssignment | null> {
    try {
      const result = await query(
        'UPDATE email_function_assignments SET is_active = NOT is_active WHERE id = $1 RETURNING *',
        [assignmentId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error toggling assignment status:', error);
      throw error;
    }
  }

  // Get template for a specific function
  async getTemplateForFunction(functionSlug: string, variables: Record<string, any> = {}): Promise<{
    subject: string;
    html: string;
    text?: string;
  } | null> {
    try {
      // Get the function
      const functionData = await this.getEmailFunctionBySlug(functionSlug);
      if (!functionData || !functionData.is_active) {
        return null;
      }

      // Get active assignments for this function, ordered by priority
      const assignments = await query(
        `SELECT 
          efa.*,
          et.name as template_name,
          et.slug as template_slug,
          et.subject,
          et.html_content,
          et.text_content
        FROM email_function_assignments efa
        JOIN email_templates et ON efa.template_id = et.id
        WHERE efa.function_id = $1 
          AND efa.is_active = true 
          AND et.is_active = true
        ORDER BY efa.priority ASC, efa.created_at ASC
        LIMIT 1`,
        [functionData.id]
      );

      if (assignments.rows.length === 0) {
        return null;
      }

      const assignment = assignments.rows[0];
      
      // Render the template with variables
      return this.renderTemplate(assignment.template_slug, variables);
    } catch (error) {
      console.error('Error getting template for function:', error);
      throw error;
    }
  }
}

export const emailTemplateService = new EmailTemplateService(); 