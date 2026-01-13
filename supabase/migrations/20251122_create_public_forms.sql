-- Create public_forms table for the form gallery
CREATE TABLE IF NOT EXISTS public_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  form_schema JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id) -- Each form can only be published once
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_public_forms_category ON public_forms(category);
CREATE INDEX IF NOT EXISTS idx_public_forms_created_at ON public_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_forms_user_id ON public_forms(user_id);

-- Enable RLS
ALTER TABLE public_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view public forms
CREATE POLICY "Public forms are viewable by everyone"
ON public_forms FOR SELECT
USING (true);

-- Only authenticated users can publish
CREATE POLICY "Users can publish their own forms"
ON public_forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only owners can update their published forms
CREATE POLICY "Users can update their own published forms"
ON public_forms FOR UPDATE
USING (auth.uid() = user_id);

-- Only owners can unpublish (delete)
CREATE POLICY "Users can unpublish their own forms"
ON public_forms FOR DELETE
USING (auth.uid() = user_id);
