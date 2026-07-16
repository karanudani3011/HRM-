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
  card_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If table already exists, add missing columns
ALTER TABLE public.privilege_cards 
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.privilege_cards 
  ADD COLUMN IF NOT EXISTS card_name TEXT;

-- 3. Disable Row Level Security so admin (anon key) can read all rows
ALTER TABLE public.privilege_cards DISABLE ROW LEVEL SECURITY;

-- 4. Grant full access to anon role (used by Supabase JS client)
GRANT ALL ON public.privilege_cards TO anon;
GRANT ALL ON public.privilege_cards TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.privilege_cards_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.privilege_cards_id_seq TO authenticated;

-- Done! The admin dashboard should now show all submitted cards.

-- ============================================================
-- Patient Bills Table — Run if not already created
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patient_bills (
  id                BIGSERIAL PRIMARY KEY,
  hospital_name     TEXT,
  hospital_username TEXT,
  patient_name      TEXT,
  hrm_id            TEXT,
  bill_amount       NUMERIC(10, 2) DEFAULT 0,
  discount          NUMERIC(10, 2) DEFAULT 0,
  after_discount    NUMERIC(10, 2) DEFAULT 0,
  bill_date         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists, add new columns
ALTER TABLE public.patient_bills ADD COLUMN IF NOT EXISTS bill_amount    NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.patient_bills ADD COLUMN IF NOT EXISTS discount       NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.patient_bills ADD COLUMN IF NOT EXISTS after_discount NUMERIC(10, 2) DEFAULT 0;

-- Disable RLS so admin can read all rows
ALTER TABLE public.patient_bills DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.patient_bills TO anon;
GRANT ALL ON public.patient_bills TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.patient_bills_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.patient_bills_id_seq TO authenticated;

