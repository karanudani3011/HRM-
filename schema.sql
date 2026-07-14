-- SQL Script to set up privilege_cards table in Supabase
-- Copy and run this script in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/qcvwbhiqrrwrxupfwsnk/sql/new

CREATE TABLE IF NOT EXISTS public.privilege_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text,
  role text DEFAULT 'user',
  id_no text UNIQUE,
  join_date text,
  expire_date text,
  city text,
  mobile text,
  card_status text DEFAULT 'PENDING_ACTIVATION',
  photo_url text,
  card_name text
);

-- Alter table to ensure card_name column exists if table is already created
ALTER TABLE public.privilege_cards ADD COLUMN IF NOT EXISTS card_name text;

-- Enable Row Level Security (RLS)
ALTER TABLE public.privilege_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS "Allow public read" ON public.privilege_cards;
DROP POLICY IF EXISTS "Allow public insert" ON public.privilege_cards;
DROP POLICY IF EXISTS "Allow public update" ON public.privilege_cards;
DROP POLICY IF EXISTS "Allow public delete" ON public.privilege_cards;

-- Create policies for public access (Anon Key)
CREATE POLICY "Allow public read" ON public.privilege_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.privilege_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.privilege_cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.privilege_cards FOR DELETE USING (true);
