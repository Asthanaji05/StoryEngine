-- Create Narrative Connections table
CREATE TABLE IF NOT EXISTS public.narrative_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  from_id UUID REFERENCES public.narrative_elements(id) ON DELETE CASCADE NOT NULL,
  to_id UUID REFERENCES public.narrative_elements(id) ON DELETE CASCADE NOT NULL,
  connection_type TEXT NOT NULL, -- founded, loves, hates, member_of, etc.
  description TEXT,
  weight INTEGER DEFAULT 5,
  emotional_charge INTEGER DEFAULT 0,
  created_from_narration UUID REFERENCES public.raw_narrations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.narrative_connections ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage connections in own stories" ON narrative_connections FOR ALL USING (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);
