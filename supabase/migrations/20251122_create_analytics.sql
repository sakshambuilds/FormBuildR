-- Create form_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS form_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for form_views
ALTER TABLE form_views ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert views (public tracking)
CREATE POLICY "Anyone can insert views" ON form_views FOR INSERT WITH CHECK (true);

-- Policy to allow form owners to view analytics
CREATE POLICY "Form owners can view analytics" ON form_views FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_views.form_id
    AND forms.user_id = auth.uid()
  )
);
