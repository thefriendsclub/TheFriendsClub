-- The Friends Club: Supabase PostgreSQL Schema & Security Policies
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Create Tables
-- ==============================================================================

-- Events table (Public read-only, admin editable)
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Membership applications table (Public insert-only, admin full access)
CREATE TABLE IF NOT EXISTS public.applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created TEXT NOT NULL DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter subscribers table (Public insert-only, admin read access)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created TEXT NOT NULL DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Administrators table (Private server-only, zero public access)
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Active administrative sessions (Private server-only, zero public access)
CREATE TABLE IF NOT EXISTS public.sessions (
  token TEXT PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  expires BIGINT NOT NULL
);

-- System metadata (Private server-only)
CREATE TABLE IF NOT EXISTS public.metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Indexes for Performance & High-Speed Lookups
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(lower(email));
CREATE INDEX IF NOT EXISTS idx_applications_status_created ON public.applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(lower(email));
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(lower(email));
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.sessions(expires);

-- 3. Row Level Security (RLS) - Zero Trust by Default
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata ENABLE ROW LEVEL SECURITY;

-- 4. Granular RLS Policies
-- ==============================================================================

-- EVENTS POLICIES:
-- Anyone (anon and authenticated) can view upcoming events on the website.
CREATE POLICY "Public read events"
  ON public.events
  FOR SELECT
  TO public
  USING (true);

-- Only backend server (service_role) can create, modify, or delete events.
CREATE POLICY "Service role full access on events"
  ON public.events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- APPLICATIONS POLICIES:
-- Prospective members can submit applications from the website.
CREATE POLICY "Public submit application"
  ON public.applications
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(name) > 0 AND char_length(name) <= 100 AND
    char_length(email) > 3 AND char_length(email) <= 254 AND
    char_length(phone) >= 7 AND char_length(phone) <= 30 AND
    char_length(reason) > 0 AND char_length(reason) <= 2000
  );

-- Only backend server (service_role) can view or change status of applications.
CREATE POLICY "Service role full access on applications"
  ON public.applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- SUBSCRIBERS POLICIES:
-- Website visitors can subscribe to newsletter.
CREATE POLICY "Public insert subscriber"
  ON public.subscribers
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(email) > 3 AND char_length(email) <= 254
  );

-- Only backend server (service_role) can read or manage subscribers list.
CREATE POLICY "Service role full access on subscribers"
  ON public.subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ADMINS POLICIES:
-- ZERO access for public / anon. Strictly service_role only.
CREATE POLICY "Service role full access on admins"
  ON public.admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- SESSIONS POLICIES:
-- ZERO access for public / anon. Strictly service_role only.
CREATE POLICY "Service role full access on sessions"
  ON public.sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- METADATA POLICIES:
-- ZERO access for public / anon. Strictly service_role only.
CREATE POLICY "Service role full access on metadata"
  ON public.metadata
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Initial Seed Events (if table is empty)
-- ==============================================================================
INSERT INTO public.events (title, date, time, location, description, image)
SELECT 'Bonfire Night', '2026-10-26', '5:00 PM – 10:00 PM', 'Rooftop, Bhubaneswar',
       'An evening of acoustic music, warm conversations, and stories around the fire. Bring a friend and your favourite story. Light refreshments included.',
       'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=85'
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Bonfire Night');

INSERT INTO public.events (title, date, time, location, description, image)
SELECT 'Annual Get Together', '2026-11-15', '4:00 PM – 9:00 PM', 'The Club House',
       'Our favourite tradition: a whole evening together. Meet familiar faces and new friends over dinner, games, music, and a celebration of our community.',
       'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=85'
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Annual Get Together');

INSERT INTO public.events (title, date, time, location, description, image)
SELECT 'Adventure Trip', '2026-12-05', '7:00 AM – 8:00 PM', 'Daringbadi',
       'Take the scenic route with us. A day of fresh mountain air, gentle trails, and unforgettable views. Wear comfortable shoes and bring water.',
       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85'
-- 6. Grant Permissions to Supabase Roles (controlled by RLS above)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

