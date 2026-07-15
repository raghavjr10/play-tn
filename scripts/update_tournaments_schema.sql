-- Run this in the Supabase SQL Editor
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Optional: Update existing tournaments to be approved so they don't disappear
UPDATE public.tournaments SET status = 'approved' WHERE status = 'pending';
