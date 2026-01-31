-- AI Suggestions table: The bridge between AI perception and User Truth
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  narration_id UUID REFERENCES public.raw_narrations(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL, -- 'element', 'moment', 'connection'
  suggested_data JSONB NOT NULL, -- The draft attributes/names
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  user_feedback TEXT, -- Optional notes on why it was rejected/modified
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup of pending items
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_pending ON public.ai_suggestions(story_id, status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage suggestions in own stories" ON ai_suggestions FOR ALL USING (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);
