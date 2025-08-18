const { query } = require('./database.ts');
const { emailTemplateService } = require('./email-template-service.ts');

async function initializeEmailTemplates() {
  try {
    console.log('🔄 Initializing Email Templates System...\n');

    // Step 1: Create email template tables
    console.log('1. Creating database tables...');
    
    // Email templates table
    await query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        subject VARCHAR(500) NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT,
        description TEXT,
        variables JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        category VARCHAR(100) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ email_templates table created');

    // Email template variables table
    await query(`
      CREATE TABLE IF NOT EXISTS email_template_variables (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
        variable_name VARCHAR(100) NOT NULL,
        variable_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        is_required BOOLEAN DEFAULT false,
        default_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ email_template_variables table created');

    // Email template categories table
    await query(`
      CREATE TABLE IF NOT EXISTS email_template_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ email_template_categories table created');

    // Step 2: Insert default categories
    console.log('\n2. Creating default categories...');
    
    const categories = [
      { name: 'authentication', description: 'User authentication emails', color: '#EF4444', icon: 'ri-shield-user-line' },
      { name: 'orders', description: 'Order-related emails', color: '#10B981', icon: 'ri-shopping-cart-line' },
      { name: 'marketing', description: 'Marketing and promotional emails', color: '#8B5CF6', icon: 'ri-mail-line' },
      { name: 'notifications', description: 'System notifications', color: '#F59E0B', icon: 'ri-notification-line' },
      { name: 'support', description: 'Customer support emails', color: '#3B82F6', icon: 'ri-customer-service-line' },
      { name: 'general', description: 'General purpose emails', color: '#6B7280', icon: 'ri-mail-line' }
    ];

    for (const category of categories) {
      await query(`
        INSERT INTO email_template_categories (name, description, color, icon)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.color, category.icon]);
    }
    console.log('   ✅ Default categories created');

    // Step 3: Create indexes
    console.log('\n3. Creating database indexes...');
    
    await query('CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_template_variables_template_id ON email_template_variables(template_id)');
    console.log('   ✅ Database indexes created');

    // Step 4: Create trigger for updated_at
    console.log('\n4. Creating database triggers...');
    
    await query(`
      CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates
    `);

    await query(`
      CREATE TRIGGER update_email_templates_updated_at
          BEFORE UPDATE ON email_templates
          FOR EACH ROW
          EXECUTE FUNCTION update_email_templates_updated_at()
    `);
    console.log('   ✅ Database triggers created');

    // Step 5: Initialize default templates
    console.log('\n5. Creating default email templates...');
    
    await emailTemplateService.initializeDefaultTemplates();
    console.log('   ✅ Default templates created');

    // Step 6: Verify setup
    console.log('\n6. Verifying setup...');
    
    const templateCount = await query('SELECT COUNT(*) as count FROM email_templates');
    const categoryCount = await query('SELECT COUNT(*) as count FROM email_template_categories');
    
    console.log(`   ✅ ${templateCount.rows[0].count} email templates created`);
    console.log(`   ✅ ${categoryCount.rows[0].count} categories created`);

    console.log('\n✅ Email Templates System Initialized Successfully!');
    console.log('\n📋 What was created:');
    console.log('- Database tables for email template management');
    console.log('- Default email template categories');
    console.log('- 10 default email templates');
    console.log('- Database indexes for performance');
    console.log('- Automatic timestamp updates');
    console.log('\n🎯 Next steps:');
    console.log('- Access the Email Templates tab in the admin dashboard');
    console.log('- Customize templates to match your brand');
    console.log('- Test email sending functionality');

  } catch (error) {
    console.error('❌ Error initializing email templates:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializeEmailTemplates(); 