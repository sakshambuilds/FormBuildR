-- Drop existing webhooks table if it exists to replace with new schema
DROP TABLE IF EXISTS webhooks CASCADE;

-- Create form_webhooks table
CREATE TABLE IF NOT EXISTS form_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  headers JSONB DEFAULT '{}'::jsonb, -- Custom headers as Key-Value pairs
  payload_format TEXT DEFAULT 'json', -- 'json' or 'form-data'
  retries_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES form_webhooks(id) ON DELETE SET NULL,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'success', 'failed'
  response_code INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_form_id ON form_webhooks(form_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_form_id ON webhook_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- RLS Policies
ALTER TABLE form_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for form_webhooks
CREATE POLICY "Users can view webhooks for their forms"
ON form_webhooks FOR SELECT
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create webhooks for their forms"
ON form_webhooks FOR INSERT
WITH CHECK (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update webhooks for their forms"
ON form_webhooks FOR UPDATE
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete webhooks for their forms"
ON form_webhooks FOR DELETE
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

-- Policies for webhook_logs
CREATE POLICY "Users can view logs for their forms"
ON webhook_logs FOR SELECT
USING (
  form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  )
);

-- System/Edge Function needs to insert logs (using service role usually, but allowing insert for now if needed via client for testing, though ideally only service role)
-- For now, we'll allow authenticated users to insert logs for their own forms (in case we trigger from client side directly, but we are using Edge Function)
-- The Edge Function uses service role, which bypasses RLS.
