import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please check your .env file and RESTART the dev server.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => {
          console.error('Supabase not initialized: Missing URL or Key');
          return {
            or: () => ({ limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not initialized' } }) }),
            order: () => Promise.resolve({ data: [], error: { message: 'Supabase not initialized' } })
          };
        }
      })
    };
