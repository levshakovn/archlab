-- =====================================================
-- Puzzle Completions Table Setup for ArchLab
-- =====================================================
-- Run this script in Supabase Dashboard > SQL Editor
-- This creates the puzzle_completions table for tracking
-- user puzzle completions and best scores
-- =====================================================

-- Create puzzle_completions table
CREATE TABLE IF NOT EXISTS public.puzzle_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  puzzle_id TEXT NOT NULL,
  score INTEGER NOT NULL, -- Latest percentage score (0-100)
  best_score INTEGER NOT NULL, -- Best score achieved for this puzzle (0-100)
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, puzzle_id) -- One record per user per puzzle (latest completion)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS puzzle_completions_user_id_idx ON public.puzzle_completions(user_id);
CREATE INDEX IF NOT EXISTS puzzle_completions_puzzle_id_idx ON public.puzzle_completions(puzzle_id);
CREATE INDEX IF NOT EXISTS puzzle_completions_user_puzzle_idx ON public.puzzle_completions(user_id, puzzle_id);

-- Enable Row Level Security
ALTER TABLE puzzle_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own completions" ON public.puzzle_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON public.puzzle_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON public.puzzle_completions;

-- Policy: Users can read their own completions
CREATE POLICY "Users can view own completions"
  ON public.puzzle_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON public.puzzle_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own completions
CREATE POLICY "Users can update own completions"
  ON public.puzzle_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_puzzle_completion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS set_puzzle_completion_updated_at ON public.puzzle_completions;

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_puzzle_completion_updated_at
  BEFORE UPDATE ON public.puzzle_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_puzzle_completion_updated_at();
