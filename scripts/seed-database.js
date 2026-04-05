// Seed database with sample template
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://znkptkfipmqjotmikflt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua3B0a2ZpcG1xam90bWlrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODQyMTgsImV4cCI6MjA5MDk2MDIxOH0.atJdGWMeCBk0W7lWYwiorDVJgjo9A_FcTDdVmvyI-P8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedDatabase() {
    console.log('Seeding database...');

    // Insert sample template
    const { data, error } = await supabase
        .from('templates')
        .upsert({
            id: 'candle-basic',
            name: 'Candle Basic',
            description: 'A beautiful candle template for special occasions',
            thumbnail_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
            category: 'candle',
            is_premium: false,
            is_active: true,
            github_path: 'templates/candle-basic/full.html'
        }, { onConflict: 'id' });

    if (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }

    console.log('✅ Database seeded successfully!');

    // Verify insertion
    const { data: templates, error: fetchError } = await supabase
        .from('templates')
        .select('*');

    if (fetchError) {
        console.error('Error fetching templates:', fetchError);
        process.exit(1);
    }

    console.log('\nTemplates in database:');
    console.table(templates);
}

seedDatabase();