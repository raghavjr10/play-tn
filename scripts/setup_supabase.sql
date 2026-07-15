-- Supabase SQL Schema for Play TN

-- Players Table
CREATE TABLE public.players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  district text NOT NULL,
  sport text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Organizers Table
CREATE TABLE public.organizers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  organization text NOT NULL,
  district text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tournaments Table
CREATE TABLE public.tournaments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sport text NOT NULL,
  district text NOT NULL,
  date date NOT NULL,
  venue text,
  organizer_id uuid REFERENCES public.organizers(id) ON DELETE SET NULL,
  organizer_name text NOT NULL,
  organizer_org text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tournament Players Junction Table
CREATE TABLE public.tournament_players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tournament_id, player_id)
);

-- Enable Row Level Security (RLS) but allow anonymous access for the Vercel API
-- Since the Vercel API is acting as the backend and using the anon key, we'll create liberal policies.
-- In a real production app with user auth, these should be locked down.

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all actions for anon users on players" ON public.players FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all actions for anon users on organizers" ON public.organizers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all actions for anon users on tournaments" ON public.tournaments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all actions for anon users on tournament_players" ON public.tournament_players FOR ALL USING (true) WITH CHECK (true);
