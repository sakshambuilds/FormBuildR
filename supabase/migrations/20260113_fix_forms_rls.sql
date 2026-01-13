-- Enable RLS on forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "insert own forms" ON forms;
DROP POLICY IF EXISTS "select own forms" ON forms;
DROP POLICY IF EXISTS "update own forms" ON forms;
DROP POLICY IF EXISTS "delete own forms" ON forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON forms;
DROP POLICY IF EXISTS "Public can view published forms" ON forms;

-- Policy: Users can insert their own forms
CREATE POLICY "insert own forms"
ON forms
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can select their own forms
CREATE POLICY "select own forms"
ON forms
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own forms
CREATE POLICY "update own forms"
ON forms
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own forms
CREATE POLICY "delete own forms"
ON forms
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Public can view published forms (for gallery)
CREATE POLICY "public view published forms"
ON forms
FOR SELECT
USING (is_published = true);
