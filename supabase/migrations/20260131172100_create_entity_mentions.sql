-- Create Entity Mentions table to track the journey of characters/locations/orgs
CREATE TABLE IF NOT EXISTS public.entity_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  element_id UUID REFERENCES public.narrative_elements(id) ON DELETE CASCADE NOT NULL,
  narration_id UUID REFERENCES public.raw_narrations(id) ON DELETE CASCADE NOT NULL,
  mention_context TEXT, -- The specific phrase or snippet where the entity appeared
  emotional_state JSONB DEFAULT '{}'::jsonb, -- How the entity was feeling/portrayed in this mention
  importance_in_narration INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance when tracking journey
CREATE INDEX IF NOT EXISTS idx_entity_mentions_element_id ON public.entity_mentions(element_id);
CREATE INDEX IF NOT EXISTS idx_entity_mentions_narration_id ON public.entity_mentions(narration_id);

-- Enable RLS
ALTER TABLE public.entity_mentions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage mentions in own stories" ON entity_mentions FOR ALL USING (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);
