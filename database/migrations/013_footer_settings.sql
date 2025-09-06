-- Footer Settings Management
CREATE TABLE IF NOT EXISTS footer_settings (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Insert default footer data
INSERT INTO footer_settings (section, content) VALUES
('company', '{
    "name": "ReadnWin",
    "description": "Discover, read, and enjoy books in digital and physical formats",
    "tagline": "Your Digital Bookstore"
}'),
('contact', '{
    "address": "Lagos, Nigeria",
    "phone": "+234 XXX XXX XXXX",
    "email": "info@readnwin.com"
}'),
('social', '{
    "facebook": "",
    "twitter": "",
    "instagram": "",
    "linkedin": ""
}'),
('links', '{
    "quick_links": [
        {"name": "About Us", "url": "/about"},
        {"name": "Contact", "url": "/contact"},
        {"name": "FAQ", "url": "/faq"},
        {"name": "Privacy Policy", "url": "/privacy"},
        {"name": "Terms of Service", "url": "/terms"}
    ],
    "categories": [
        {"name": "Fiction", "url": "/books?category=fiction"},
        {"name": "Non-Fiction", "url": "/books?category=non-fiction"},
        {"name": "Educational", "url": "/books?category=educational"}
    ]
}'),
('newsletter', '{
    "enabled": true,
    "title": "Stay Updated",
    "description": "Get the latest books and offers"
}')
ON CONFLICT (section) DO NOTHING;

-- Update trigger
CREATE OR REPLACE FUNCTION update_footer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER footer_settings_updated_at
    BEFORE UPDATE ON footer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_footer_timestamp();