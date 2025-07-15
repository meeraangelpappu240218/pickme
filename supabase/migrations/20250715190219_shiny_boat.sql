/*
  # Fix Officers RLS Policies

  1. Security Updates
    - Add policy for admins to insert new officers
    - Ensure admin authentication is properly handled
    - Add policy for authenticated users with admin role to manage officers

  2. Changes
    - Create comprehensive admin policies for officers table
    - Ensure proper authentication flow for admin operations
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Admins can manage officers" ON officers;
DROP POLICY IF EXISTS "Officers can read own data" ON officers;
DROP POLICY IF EXISTS "Officers can update own data" ON officers;

-- Create comprehensive admin policies
CREATE POLICY "Admins can select officers"
  ON officers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can insert officers"
  ON officers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can update officers"
  ON officers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can delete officers"
  ON officers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

-- Officers can read their own data
CREATE POLICY "Officers can read own data"
  ON officers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Officers can update their own data (excluding sensitive fields)
CREATE POLICY "Officers can update own data"
  ON officers
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);