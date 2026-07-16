ALTER TABLE public.players ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS phone text;
