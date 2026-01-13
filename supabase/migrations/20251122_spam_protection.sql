-- Create tables for spam protection and rate limiting

-- Table to log all form submissions for rate limiting
CREATE TABLE IF NOT EXISTS form_submissions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  user_agent TEXT
);

-- Index for fast rate limit queries
CREATE INDEX IF NOT EXISTS idx_submissions_ip_time 
ON form_submissions_log(ip_address, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_form_time 
ON form_submissions_log(form_id, submitted_at DESC);

-- Table to log spam attempts
CREATE TABLE IF NOT EXISTS spam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  user_agent TEXT,
  attempted_data JSONB,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_spam_attempts_time 
ON spam_attempts(attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_spam_attempts_reason 
ON spam_attempts(reason);

-- Enable RLS on both tables
ALTER TABLE form_submissions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Only authenticated users (form owners) can view submission logs for their forms
CREATE POLICY "Users can view their own form submission logs"
ON form_submissions_log FOR SELECT
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

-- Only authenticated users can view spam attempts for their forms
CREATE POLICY "Users can view spam attempts for their forms"
ON spam_attempts FOR SELECT
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ) OR form_id IS NULL
);

-- System can insert into both tables (no user restriction)
CREATE POLICY "Allow system inserts to submission logs"
ON form_submissions_log FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow system inserts to spam attempts"
ON spam_attempts FOR INSERT
WITH CHECK (true);
