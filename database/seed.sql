-- Seed data for GiftOnScreen
-- Run this in Supabase SQL Editor to add sample templates

-- Insert sample template
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'candle-basic',
    'Candle Basic',
    'A beautiful candle template for special occasions',
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
    'candle',
    false,
    true,
    'templates/candle-basic/full.html'
) ON CONFLICT (id) DO NOTHING;

-- Verify insertion
SELECT * FROM templates;