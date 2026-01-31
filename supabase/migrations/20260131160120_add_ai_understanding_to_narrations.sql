-- Add AI understanding columns to raw_narrations
ALTER TABLE public.raw_narrations 
ADD COLUMN IF NOT EXISTS listener_response TEXT,
ADD COLUMN IF NOT EXISTS extracted JSONB DEFAULT '{}'::jsonb;

-- Update RLS if necessary (usually not needed for column additions if table policy exists)
