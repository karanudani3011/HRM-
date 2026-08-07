import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase.from('deversh_matrimony_profiles').select('*');
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Data sample:', data[0]);
  } else {
    console.log('No data or error:', error);
  }
}

testFetch();
