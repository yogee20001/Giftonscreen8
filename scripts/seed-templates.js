// Seed Templates to Supabase
// Run: node scripts/seed-templates.js <SERVICE_ROLE_KEY>
// Or: set SUPABASE_SERVICE_KEY=your_key && node scripts/seed-templates.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://znkptkfipmqjotmikflt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY is required');
    console.log('\nUsage:');
    console.log('  node scripts/seed-templates.js <SERVICE_ROLE_KEY>');
    console.log('\nOr set environment variable:');
    console.log('  set SUPABASE_SERVICE_KEY=your_key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const templates = [
    {
        id: 'candle-basic',
        name: 'Romantic Candle',
        description: 'A warm, romantic candle-lit atmosphere perfect for expressing love and affection',
        thumbnail_url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=300&fit=crop',
        category: 'romance',
        is_premium: false,
        is_active: true,
        github_path: 'templates/candle-basic/full.html'
    },
    {
        id: 'birthday-celebration',
        name: 'Birthday Celebration',
        description: 'Colorful birthday theme with balloons and festive decorations',
        thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
        category: 'birthday',
        is_premium: false,
        is_active: true,
        github_path: 'templates/birthday/index.html'
    },
    {
        id: 'golden-anniversary',
        name: 'Golden Anniversary',
        description: 'Elegant golden theme for special milestones and anniversaries',
        thumbnail_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
        category: 'anniversary',
        is_premium: true,
        is_active: true,
        github_path: 'templates/anniversary/golden.html'
    },
    {
        id: 'nature-love',
        name: 'Nature Love',
        description: 'Serene nature-inspired design with flowers and gentle animations',
        thumbnail_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
        category: 'romance',
        is_premium: false,
        is_active: true,
        github_path: 'templates/nature/index.html'
    },
    {
        id: 'starry-night',
        name: 'Starry Night',
        description: 'Magical starry night theme with twinkling animations',
        thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        category: 'romance',
        is_premium: true,
        is_active: true,
        github_path: 'templates/starry/index.html'
    },
    {
        id: 'thank-you',
        name: 'Thank You',
        description: 'Simple and elegant design to express gratitude',
        thumbnail_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
        category: 'gratitude',
        is_premium: false,
        is_active: true,
        github_path: 'templates/thankyou/index.html'
    },
    {
        id: 'magic-balloon-adventure',
        name: 'Magic Balloon Wish Adventure',
        description: 'A viral-grade interactive experience! Tap balloons, build combos, trigger Fever Mode, and watch a magical surprise reveal. Highly addictive and share-worthy!',
        thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
        category: 'birthday',
        is_premium: false,
        is_active: true,
        github_path: 'templates/magic-balloon-adventure/full.html'
    }
];

async function seedTemplates() {
    console.log('🌱 Seeding templates to Supabase...\n');

    for (const template of templates) {
        const { data, error } = await supabase
            .from('templates')
            .upsert(template, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error inserting ${template.id}:`, error.message);
        } else {
            console.log(`✅ ${template.is_premium ? '💎' : '📄'} ${template.name} ${template.is_premium ? '(Premium)' : ''}`);
        }
    }

    console.log('\n✨ Done!');

    // Verify
    const { data: count } = await supabase
        .from('templates')
        .select('*', { count: 'exact' });

    console.log(`📊 Total templates in database: ${count?.length || 0}`);
}

seedTemplates().catch(console.error);
