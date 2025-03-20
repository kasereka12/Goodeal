/*
  # Add admin policies and functions

  1. Changes
    - Add admin role check function
    - Add admin policies for users and listings management
    - Update existing policies to include admin access

  2. Security
    - Only admins can manage users and update/delete any listing
    - Regular users can still manage their own content
    - Public read access remains unchanged
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update listings policies to include admin access
CREATE POLICY "Admins can manage all listings"
ON public.listings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Update requests policies to include admin access
CREATE POLICY "Admins can manage all requests"
ON public.requests
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add admin access to users view
CREATE POLICY "Admins can view all user data"
ON auth.users
FOR SELECT
TO authenticated
USING (is_admin());

-- Add admin access to modify user metadata
CREATE POLICY "Admins can modify user metadata"
ON auth.users
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add admin access to delete users
CREATE POLICY "Admins can delete users"
ON auth.users
FOR DELETE
TO authenticated
USING (is_admin());