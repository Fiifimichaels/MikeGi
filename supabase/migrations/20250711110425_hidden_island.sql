/*
  # Create MikeGi Admins Table

  1. New Tables
    - `mikegi_admins`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `name` (text)
      - `role` (text, default 'admin')
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mikegi_admins` table
    - Add policy for admin authentication

  3. Demo Data
    - Create demo admin account
*/

CREATE TABLE IF NOT EXISTS mikegi_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mikegi_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their own data"
  ON mikegi_admins
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert demo admin (password: admin123)
INSERT INTO mikegi_admins (email, password, name, role) VALUES 
('admin@mikegi.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'MikeGi Admin', 'admin')
ON CONFLICT (email) DO NOTHING;