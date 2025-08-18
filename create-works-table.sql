-- Create works table for "Some Of Our Works" carousel
CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_works_order ON works(order_index ASC, created_at DESC);

-- Create index for active works
CREATE INDEX IF NOT EXISTS idx_works_active ON works(is_active) WHERE is_active = true;

-- Insert some sample data using the existing carousel images
INSERT INTO works (title, description, image_path, alt_text, order_index, is_active) VALUES
('Digital Library Innovation', 'Revolutionary digital library platform that transforms how readers discover and engage with books.', '/carousel/one.jpeg', 'Digital library interface with modern design', 1, true),
('Reading Experience Design', 'User-centered design approach that creates immersive and intuitive reading experiences.', '/carousel/two.jpeg', 'Modern reading interface with clean design', 2, true),
('E-Book Platform Development', 'Advanced e-book platform with seamless reading across all devices and formats.', '/carousel/three.jpeg', 'E-book platform with multiple device support', 3, true),
('User Interface Excellence', 'Beautiful and functional user interfaces that enhance the reading journey.', '/carousel/four.jpeg', 'Polished user interface design', 4, true),
('Technology Integration', 'Seamless integration of cutting-edge technology to enhance the reading experience.', '/carousel/five.jpeg', 'Technology integration showcase', 5, true)
ON CONFLICT DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_works_updated_at 
    BEFORE UPDATE ON works 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 