-- FAQ System Database Schema
-- ReadnWin Next.js Application

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_priority ON faqs(priority DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_featured ON faqs(is_featured);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC);

-- Insert default categories
INSERT INTO faq_categories (name, description, icon, color) VALUES
('General', 'General questions about ReadnWin', 'ri-question-line', '#3B82F6'),
('Registration', 'Questions about registration and enrollment', 'ri-user-add-line', '#10B981'),
('Competition', 'Competition rules and procedures', 'ri-trophy-line', '#F59E0B'),
('Technical', 'Technical support and platform questions', 'ri-tools-line', '#8B5CF6'),
('Payment', 'Payment and billing questions', 'ri-bank-card-line', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Insert initial FAQ content
INSERT INTO faqs (question, answer, category, priority, is_featured) VALUES
(
    'Is this competition strictly for this school?',
    'Yes, absolutely! READnWIN.com visit campuses to conduct these programs which is why if you do not have a matriculation number, you are not eligible to enroll',
    'General',
    100,
    true
),
(
    'How do I register for the competition?',
    'To register for the competition, you need to create an account on our platform using your valid matriculation number. Once registered, you can enroll in available competitions through your dashboard.',
    'Registration',
    90,
    true
),
(
    'What documents do I need for registration?',
    'You will need your valid matriculation number and a valid email address. Additional documents may be required depending on the specific competition requirements.',
    'Registration',
    85,
    false
),
(
    'What are the competition rules?',
    'Competition rules vary by event. Please check the specific competition page for detailed rules and guidelines. All participants must follow academic integrity policies.',
    'Competition',
    95,
    true
),
(
    'How long does the competition last?',
    'Competition duration varies by event. Some competitions are single-day events, while others may span multiple weeks. Check individual competition details for specific timelines.',
    'Competition',
    80,
    false
),
(
    'How do I access my account?',
    'You can access your account by logging in with your email address and password. If you forget your password, use the "Forgot Password" feature to reset it.',
    'Technical',
    90,
    true
),
(
    'What if I forget my password?',
    'If you forget your password, click on the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email to reset your password.',
    'Technical',
    85,
    false
),
(
    'What payment methods are accepted?',
    'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. Payment options may vary by region.',
    'Payment',
    90,
    true
),
(
    'Is there a registration fee?',
    'Registration fees vary by competition. Some competitions are free to enter, while others may have a nominal fee. Check individual competition details for specific pricing.',
    'Payment',
    85,
    false
)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faqs_updated_at 
    BEFORE UPDATE ON faqs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for active FAQs with category info
CREATE OR REPLACE VIEW active_faqs AS
SELECT 
    f.id,
    f.question,
    f.answer,
    f.category,
    f.priority,
    f.is_featured,
    f.view_count,
    f.created_at,
    f.updated_at,
    fc.name as category_name,
    fc.icon as category_icon,
    fc.color as category_color
FROM faqs f
LEFT JOIN faq_categories fc ON f.category = fc.name
WHERE f.is_active = true
ORDER BY f.priority DESC, f.created_at DESC; 