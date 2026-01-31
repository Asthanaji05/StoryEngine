-- Add confirmed_item_id to ai_suggestions to allow for "Soft Rewind" logic
-- This will store the ID of the narrative_element, story_moment, or connection created from this suggestion.
ALTER TABLE public.ai_suggestions 
ADD COLUMN IF NOT EXISTS confirmed_item_id UUID;

-- Index for revert lookups
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confirmed_item ON public.ai_suggestions(confirmed_item_id);
