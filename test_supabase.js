import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Fetching from deversh_matrimony_profiles...');
  const { data, error } = await supabase.from('deversh_matrimony_profiles').select('*');
  console.log('Error:', error);
  console.log('Data:', data);
}

testFetch();
