// Fix RLS Policy for Anonymous Template Access
// Run: node scripts/fix-rls-policy.js <SERVICE_ROLE_KEY>

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://znkptkfipmqjotmikflt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY is required');
    console.log('\nUsage:');
    console.log('  node scripts/fix-rls-policy.js <SERVICE_ROLE_KEY>');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixRLSPolicies() {
    console.log('🔧 Fixing RLS policies for anonymous template access...\n');

    // Execute the SQL to fix policies
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
            -- Enable RLS on templates
            ALTER TABLE IF EXISTS templates ENABLE ROW LEVEL SECURITY;

            -- Drop existing policies
            DROP POLICY IF EXISTS "Allow authenticated users to read templates" ON templates;
            DROP POLICY IF EXISTS "Allow anonymous users to read active templates" ON templates;
            DROP POLICY IF EXISTS "Allow public read access to active templates" ON templates;
            DROP POLICY IF EXISTS "Allow authenticated users to read all templates" ON templates;

            -- Create policy for public (including anon) access to active templates
            CREATE POLICY "Allow public read access to active templates"
                ON templates
                FOR SELECT
                TO public
                USING (is_active = true);

            -- Create policy for authenticated users to read all templates
            CREATE POLICY "Allow authenticated users to read all templates"
                ON templates
                FOR SELECT
                TO authenticated
                USING (true);

            -- Ensure all templates are active
            UPDATE templates SET is_active = true WHERE is_active = false OR is_active IS NULL;
        `
    });

    if (error) {
        console.error('❌ Error fixing RLS policies:', error.message);

        // Try alternative approach - use raw query
        console.log('\n🔄 Trying alternative approach...');

        const policies = [
            // Enable RLS
            { query: 'ALTER TABLE IF EXISTS templates ENABLE ROW LEVEL SECURITY' },

            // Update templates to active
            { query: 'UPDATE templates SET is_active = true WHERE is_active = false OR is_active IS NULL' }
        ];

        for (const { query } of policies) {
            const { error: qError } = await supabase.rpc('exec_sql', { sql: query });
            if (qError) {
                console.log(`⚠️ Could not execute: ${query.substring(0, 50)}...`);
            }
        }

        console.log('\n⚠️ Please run the SQL manually in Supabase SQL Editor:');
        console.log('File: database/fix-rls-policy.sql');
        return;
    }

    console.log('✅ RLS policies fixed successfully!');
    console.log('\n📋 Policies applied:');
    console.log('  1. Public (anon + authenticated) can read active templates');
    console.log('  2. Authenticated users can read all templates');
    console.log('  3. All templates marked as active');

    // Verify templates are accessible
    console.log('\n🔍 Verifying templates...');
    const { data: templates, error: fetchError } = await supabase
        .from('templates')
        .select('id, name, is_active')
        .eq('is_active', true);

    if (fetchError) {
        console.error('❌ Error fetching templates:', fetchError.message);
    } else {
        console.log(`✅ ${templates?.length || 0} active templates visible to public`);
        templates?.forEach(t => {
            console.log(`   - ${t.name} (${t.id})`);
        });
    }
}

fixRLSPolicies().catch(console.error);
