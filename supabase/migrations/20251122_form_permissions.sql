-- Add access control columns to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add constraint for access_type values
ALTER TABLE forms 
ADD CONSTRAINT check_access_type 
CHECK (access_type IN ('public', 'password', 'auth', 'one_response'));

-- Create a secure function to verify password without exposing the hash
CREATE OR REPLACE FUNCTION verify_form_password(form_id UUID, password_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM forms
  WHERE id = form_id;
  
  -- We will actually do the comparison in the application layer for bcrypt compatibility
  -- This function is just a placeholder if we wanted to do it in SQL, but pgcrypto is needed.
  -- Since we are using bcryptjs in the client/edge, we might just need to fetch the hash securely?
  -- Actually, to be safe, we should NOT expose the hash to the client.
  -- But standard bcrypt verification happens where the hash is.
  -- If we do it in the client, we must fetch the hash. This is insecure.
  -- So we MUST do it in an Edge Function or RPC.
  -- However, Supabase doesn't have built-in bcrypt verify in PLPGSQL without extensions.
  -- Let's enable pgcrypto if available, or use an Edge Function.
  -- For this implementation, we will use a simple text comparison here for the sake of the migration file, 
  -- BUT in reality we will implement an Edge Function `verify-password` to handle the bcrypt check securely.
  
  RETURN FALSE; -- Placeholder, we will use Edge Function
END;
$$;

-- Actually, let's just use an Edge Function for verification to keep it clean and secure.
-- We don't need a specific SQL function for bcrypt if we use the Edge Function.
