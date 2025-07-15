/*
  # Fix Officers RLS and Admin Setup

  1. Security Updates
    - Fix RLS policies for officers table
    - Ensure admin users can manage officers
    - Set up proper authentication flow

  2. Admin User Setup
    - Create admin user entry for authentication
    - Link admin authentication with officers management

  3. Officers Table Updates
    - Ensure proper RLS policies
    - Fix any missing constraints or indexes
*/

-- First, let's ensure we have the admin user in the admin_users table
-- This should match the user from your AuthContext
INSERT INTO admin_users (id, name, email, password_hash, role, created_at)
VALUES (
  '1',
  'Admin User',
  'admin@pickme.intel',
  '$2b$10$defaulthash', -- In production, this should be properly hashed
  'admin',
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can delete officers" ON officers;
DROP POLICY IF EXISTS "Admins can insert officers" ON officers;
DROP POLICY IF EXISTS "Admins can select officers" ON officers;
DROP POLICY IF EXISTS "Admins can update officers" ON officers;
DROP POLICY IF EXISTS "Officers can read own data" ON officers;
DROP POLICY IF EXISTS "Officers can update own data" ON officers;

-- Create comprehensive RLS policies for officers table
-- Admin policies (full CRUD access)
CREATE POLICY "Admins can select all officers"
  ON officers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert officers"
  ON officers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update officers"
  ON officers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete officers"
  ON officers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
      AND admin_users.role = 'admin'
    )
  );

-- Officer self-management policies
CREATE POLICY "Officers can read own data"
  ON officers
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Officers can update own data"
  ON officers
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Ensure RLS is enabled
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

-- Create a function to handle admin authentication
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.role = 'admin'
  );
END;
$$;

-- Update other tables to use the same admin check pattern
-- Credit transactions
DROP POLICY IF EXISTS "Admins can manage credit transactions" ON credit_transactions;
CREATE POLICY "Admins can manage credit transactions"
  ON credit_transactions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- API keys
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;
CREATE POLICY "Admins can manage API keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Queries (admins can view all, officers can view own)
DROP POLICY IF EXISTS "Admins can view all queries" ON queries;
DROP POLICY IF EXISTS "Officers can insert own queries" ON queries;
DROP POLICY IF EXISTS "Officers can view own queries" ON queries;

CREATE POLICY "Admins can manage all queries"
  ON queries
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Officers can insert own queries"
  ON queries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = (SELECT email FROM officers WHERE id = officer_id));

CREATE POLICY "Officers can view own queries"
  ON queries
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = (SELECT email FROM officers WHERE id = officer_id));

-- Ensure all tables have RLS enabled
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());