-- 1. Profiles (extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stories
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Story',
  description TEXT,
  genre TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Raw Narrations (Sacred)
CREATE TABLE IF NOT EXISTS public.raw_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  emotion_detected TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(story_id, sequence_number)
);

-- 4. Narrative Elements
CREATE TABLE IF NOT EXISTS public.narrative_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL, 
  name TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'::jsonb,
  first_mentioned_in_narration UUID REFERENCES public.raw_narrations(id),
  last_mentioned_in_narration UUID REFERENCES public.raw_narrations(id),
  user_confirmed BOOLEAN DEFAULT FALSE,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Story Moments (Timeline)
CREATE TABLE IF NOT EXISTS public.story_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timeline_position FLOAT NOT NULL CHECK (timeline_position BETWEEN 0.0 AND 1.0),
  created_from_narration UUID REFERENCES public.raw_narrations(id),
  characters_involved UUID[] DEFAULT '{}',
  location_id UUID REFERENCES public.narrative_elements(id),
  emotional_signature JSONB DEFAULT '{}'::jsonb,
  narrative_weight INTEGER DEFAULT 5,
  is_major_turning_point BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrative_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_moments ENABLE ROW LEVEL SECURITY;

-- Basic Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own profile') THEN
        CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own stories') THEN
        CREATE POLICY "Users can manage own stories" ON stories FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage narrations in own stories') THEN
        CREATE POLICY "Users can manage narrations in own stories" ON raw_narrations FOR ALL USING (
          EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage elements in own stories') THEN
        CREATE POLICY "Users can manage elements in own stories" ON narrative_elements FOR ALL USING (
          EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage moments in own stories') THEN
        CREATE POLICY "Users can manage moments in own stories" ON story_moments FOR ALL USING (
          EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
        );
    END IF;
END $$;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
