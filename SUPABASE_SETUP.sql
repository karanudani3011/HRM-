-- ============================================================
-- HRM Privilege Cards — Supabase Setup SQL
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.privilege_cards (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT,
  role        TEXT DEFAULT 'user',
  id_no       TEXT UNIQUE,
  join_date   TEXT,
  expire_date TEXT,
  city        TEXT,
  mobile      TEXT,
  email       TEXT,
  card_status TEXT DEFAULT 'PENDING_ACTIVATION',
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If table already exists, add missing email column
ALTER TABLE public.privilege_cards 
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Disable Row Level Security so admin (anon key) can read all rows
ALTER TABLE public.privilege_cards DISABLE ROW LEVEL SECURITY;

-- 4. Grant full access to anon role (used by Supabase JS client)
GRANT ALL ON public.privilege_cards TO anon;
GRANT ALL ON public.privilege_cards TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.privilege_cards_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.privilege_cards_id_seq TO authenticated;

-- Done! The admin dashboard should now show all submitted cards.
