// Supabase Client Configuration
// Uses ES module import from CDN

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://znkptkfipmqjotmikflt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua3B0a2ZpcG1xam90bWlrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODQyMTgsImV4cCI6MjA5MDk2MDIxOH0.atJdGWMeCBk0W7lWYwiorDVJgjo9A_FcTDdVmvyI-P8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
