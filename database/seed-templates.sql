-- GiftOnScreen Template Seed Data
-- Run this in Supabase SQL Editor to populate templates

-- ============================================
-- INSERT SAMPLE TEMPLATES
-- ============================================

-- Template 1: Candle Basic (romantic candle theme)
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'candle-basic',
    'Romantic Candle',
    'A warm, romantic candle-lit atmosphere perfect for expressing love and affection',
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=300&fit=crop',
    'romance',
    false,
    true,
    'templates/candle-basic/full.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 2: Birthday Celebration
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'birthday-celebration',
    'Birthday Celebration',
    'Colorful birthday theme with balloons and festive decorations',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
    'birthday',
    false,
    true,
    'templates/birthday/index.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 3: Golden Anniversary (Premium)
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'golden-anniversary',
    'Golden Anniversary',
    'Elegant golden theme for special milestones and anniversaries',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    'anniversary',
    true,
    true,
    'templates/anniversary/golden.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 4: Nature Love
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'nature-love',
    'Nature Love',
    'Serene nature-inspired design with flowers and gentle animations',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
    'romance',
    false,
    true,
    'templates/nature/index.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 5: Starry Night (Premium)
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'starry-night',
    'Starry Night',
    'Magical starry night theme with twinkling animations',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
    'romance',
    true,
    true,
    'templates/starry/index.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 6: Thank You
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'thank-you',
    'Thank You',
    'Simple and elegant design to express gratitude',
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
    'gratitude',
    false,
    true,
    'templates/thankyou/index.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- Template 7: Magic Balloon Wish Adventure (Viral Edition)
INSERT INTO templates (id, name, description, thumbnail_url, category, is_premium, is_active, github_path)
VALUES (
    'magic-balloon-adventure',
    'Magic Balloon Wish Adventure',
    'A viral-grade interactive experience! Tap balloons, build combos, trigger Fever Mode, and watch a magical surprise reveal. Highly addictive and share-worthy!',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
    'birthday',
    false,
    true,
    'templates/magic-balloon-adventure/full.html'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = EXCLUDED.is_active;

-- ============================================
-- VERIFY INSERTED DATA
-- ============================================
SELECT * FROM templates ORDER BY created_at DESC;
